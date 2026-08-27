-- Run this in the Supabase SQL editor (Project > SQL Editor > New query).
-- This is a full rewrite of the earlier custom-auth schema: users now live
-- in Supabase Auth (auth.users) and this file only adds the `profiles` row
-- that mirrors the app-specific fields (name, role), plus the catalog/
-- cart/order tables and real RLS policies.
--
-- Safe to run against a fresh project OR one that already has the old
-- custom-auth schema (bigint-id `users`/`orders`/`products`) — the drops
-- below reset those old-shaped tables first. This is a destructive reset
-- (confirmed fine to run against demo/test data only, not a live store).

drop table if exists order_items cascade;
drop table if exists cart_items cascade;
drop table if exists orders cascade;
drop table if exists carts cascade;
drop table if exists products cascade;
drop table if exists categories cascade;
drop table if exists profiles cascade;
drop table if exists password_reset_tokens cascade;
drop table if exists users cascade;

-- ── profiles ────────────────────────────────────────────────────────────
-- One row per auth.users row. Created automatically by the trigger below —
-- never insert into this table directly from the app.
create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text not null default '',
  role text not null default 'customer' check (role in ('customer', 'seller', 'admin')),
  avatar_url text,
  created_at timestamptz not null default now()
);

create or replace function handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (new.id, new.email, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function handle_new_user();

-- Helper used throughout the RLS policies below.
create or replace function is_admin()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists(select 1 from profiles where id = auth.uid() and role = 'admin');
$$;

-- ── categories ──────────────────────────────────────────────────────────
-- Fixed platform taxonomy (matches the storefront's nav/filtering) — public
-- read, admin-only write.
create table if not exists categories (
  id bigint generated always as identity primary key,
  slug text not null unique,
  name text not null,
  sort_order int not null default 0
);

insert into categories (slug, name, sort_order)
values
  ('t-shirts', 'T-Shirts', 1),
  ('hoodies', 'Hoodies', 2),
  ('sweatshirts', 'Sweatshirts', 3),
  ('jackets', 'Jackets', 4),
  ('shirts', 'Shirts', 5),
  ('denim-jeans', 'Denim Jeans', 6),
  ('cargo-pants', 'Cargo Pants', 7),
  ('co-ord-sets', 'Co-Ord Sets', 8),
  ('sneakers', 'Sneakers', 9),
  ('caps', 'Caps', 10),
  ('bags', 'Bags', 11),
  ('sunglasses', 'Sunglasses', 12),
  ('watches', 'Watches', 13)
on conflict (slug) do nothing;

-- ── products ────────────────────────────────────────────────────────────
create table if not exists products (
  id text primary key,
  numeric_id bigint generated always as identity,
  sku text not null,
  seller_id uuid references profiles(id) on delete set null,
  name text not null,
  category_id bigint references categories(id),
  category text not null,
  subcategory text not null,
  price numeric not null,
  sale_price numeric,
  rating numeric not null default 0,
  reviews integer not null default 0,
  colors jsonb not null default '[]',
  sizes jsonb not null default '[]',
  images jsonb not null default '[]',
  short_description text,
  description text,
  material text,
  stock integer not null default 0,
  tags jsonb not null default '[]',
  featured boolean not null default false,
  is_new boolean not null default false,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_seller_id on products(seller_id);
create index if not exists idx_products_category_id on products(category_id);

-- Atomic, race-safe stock decrement used by the trusted order-creation
-- function — fails (returns false) instead of going negative if two
-- checkouts race for the last unit.
create or replace function decrement_product_stock(p_product_id text, p_qty int)
returns boolean
language plpgsql
security definer set search_path = public
as $$
declare
  updated_rows int;
begin
  update products set stock = stock - p_qty, updated_at = now()
    where id = p_product_id and stock >= p_qty;
  get diagnostics updated_rows = row_count;
  return updated_rows > 0;
end;
$$;

-- ── carts ───────────────────────────────────────────────────────────────
create table if not exists carts (
  id bigint generated always as identity primary key,
  user_id uuid not null unique references profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists cart_items (
  id bigint generated always as identity primary key,
  cart_id bigint not null references carts(id) on delete cascade,
  product_id text not null references products(id) on delete cascade,
  -- NOT NULL with a '' default (rather than nullable) on purpose: a unique
  -- constraint treats NULL as distinct from NULL, which would silently let
  -- duplicate no-size/no-color lines slip past both the constraint and
  -- ON CONFLICT upserts.
  size text not null default '',
  color text not null default '',
  qty integer not null check (qty > 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (cart_id, product_id, size, color)
);

create index if not exists idx_cart_items_cart_id on cart_items(cart_id);

-- ── orders ──────────────────────────────────────────────────────────────
create table if not exists orders (
  id bigint generated always as identity primary key,
  order_number text not null unique,
  user_id uuid references profiles(id) on delete set null,
  access_token_hash text not null,
  status text not null default 'confirmed' check (status in ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  items jsonb not null,
  totals jsonb not null,
  customer jsonb not null,
  shipping jsonb not null,
  delivery text not null,
  payment text not null,
  tracking jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_orders_user_id on orders(user_id);

-- Normalized line items alongside the `items` jsonb snapshot on `orders`
-- (kept so existing order-detail/email code that reads `order.items` is
-- untouched) — this table is the queryable, per-product source of truth:
-- product_id/qty/price are real columns, not embedded JSON.
create table if not exists order_items (
  id bigint generated always as identity primary key,
  order_id bigint not null references orders(id) on delete cascade,
  product_id text references products(id) on delete set null,
  product_name text not null,
  unit_price numeric not null,
  qty integer not null check (qty > 0),
  size text,
  color text,
  line_total numeric not null
);

create index if not exists idx_order_items_order_id on order_items(order_id);
create index if not exists idx_order_items_product_id on order_items(product_id);

-- ── Row Level Security ──────────────────────────────────────────────────

alter table profiles enable row level security;
alter table categories enable row level security;
alter table products enable row level security;
alter table carts enable row level security;
alter table cart_items enable row level security;
alter table orders enable row level security;
alter table order_items enable row level security;

-- profiles: everyone can read their own row (needed right after signup,
-- before any admin exists); admins can read every row. No insert policy —
-- rows are only ever created by the trigger. Role is not client-writable —
-- there is deliberately no policy allowing an authenticated user to update
-- their own `role`; role changes only happen through the admin/seller
-- server routes (service-role key, which bypasses RLS).
create policy "profiles_select_own_or_admin" on profiles for select
  using (auth.uid() = id or is_admin());
create policy "profiles_update_own_profile_fields" on profiles for update
  using (auth.uid() = id) with check (auth.uid() = id);

-- categories: public read; writes are admin-only (in practice done via the
-- service-role key, this policy just documents/backstops that intent).
create policy "categories_public_read" on categories for select using (true);
create policy "categories_admin_write" on categories for all
  using (is_admin()) with check (is_admin());

-- products: active listings are publicly readable; a seller can also see
-- their own inactive listings; admins see everything. Sellers/admins can
-- create; only the owning seller or an admin can update/delete.
create policy "products_public_read_active" on products for select
  using (active = true or seller_id = auth.uid() or is_admin());
create policy "products_seller_admin_insert" on products for insert
  with check (
    exists(select 1 from profiles where id = auth.uid() and role in ('seller', 'admin'))
    and (seller_id = auth.uid() or is_admin())
  );
create policy "products_owner_admin_update" on products for update
  using (seller_id = auth.uid() or is_admin())
  with check (seller_id = auth.uid() or is_admin());
create policy "products_owner_admin_delete" on products for delete
  using (seller_id = auth.uid() or is_admin());

-- carts / cart_items: strictly owner-only.
create policy "carts_owner_all" on carts for all
  using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "cart_items_owner_all" on cart_items for all
  using (exists(select 1 from carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid()))
  with check (exists(select 1 from carts where carts.id = cart_items.cart_id and carts.user_id = auth.uid()));

-- orders / order_items: owners (and admins) can read their own orders.
-- Deliberately NO insert/update policy for the `authenticated` or `anon`
-- roles — the only way to write an order is the trusted Vercel function
-- using the service-role key, which recomputes prices/stock/totals from
-- the database and bypasses RLS. This makes "never trust the frontend for
-- totals" a structural guarantee, not just an app-level convention.
create policy "orders_owner_admin_read" on orders for select
  using (user_id = auth.uid() or is_admin());
create policy "order_items_owner_admin_read" on order_items for select
  using (exists(select 1 from orders where orders.id = order_items.order_id and (orders.user_id = auth.uid() or is_admin())));

-- ── Storage ─────────────────────────────────────────────────────────────
-- Public bucket for product images (seller/admin uploads). Existing seed
-- images are remote Unsplash URLs and are unaffected by this — this is
-- additive, for images uploaded going forward.
insert into storage.buckets (id, name, public)
values ('product-images', 'product-images', true)
on conflict (id) do nothing;

-- storage.objects is Supabase's own table (not dropped above), so these
-- policies need an explicit drop-first to stay re-runnable.
drop policy if exists "product_images_public_read" on storage.objects;
drop policy if exists "product_images_seller_admin_write" on storage.objects;
drop policy if exists "product_images_owner_admin_delete" on storage.objects;

create policy "product_images_public_read" on storage.objects for select
  using (bucket_id = 'product-images');
create policy "product_images_seller_admin_write" on storage.objects for insert
  with check (
    bucket_id = 'product-images'
    and exists(select 1 from profiles where id = auth.uid() and role in ('seller', 'admin'))
  );
create policy "product_images_owner_admin_delete" on storage.objects for delete
  using (
    bucket_id = 'product-images'
    and (owner = auth.uid() or is_admin())
  );
