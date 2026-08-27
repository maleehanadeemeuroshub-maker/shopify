// One-off: seeds the Supabase `products` table from the static catalog in
// src/data/products.js. Only runs when the table is empty, so it's safe to
// run again later — it won't duplicate or overwrite existing rows.
//
//   node server/scripts/seedProducts.mjs
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { PRODUCTS } from '../../src/data/products.js';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (see .env.example) before seeding.');
  process.exit(1);
}

const db = createClient(url, key, { auth: { persistSession: false } });

const { count, error: countError } = await db.from('products').select('*', { count: 'exact', head: true });
if (countError) {
  console.error('[db] Could not read the products table — did you run supabase/schema.sql first?', countError.message);
  process.exit(1);
}
if (count > 0) {
  console.log(`[db] products table already has ${count} row(s) — skipping seed.`);
  process.exit(0);
}

const { data: categories, error: categoriesError } = await db.from('categories').select('id,name');
if (categoriesError) {
  console.error('[db] Could not read the categories table — did you run supabase/schema.sql first?', categoriesError.message);
  process.exit(1);
}
const categoryIdByName = new Map(categories.map((c) => [c.name.toLowerCase(), c.id]));

const rows = PRODUCTS.map((p) => ({
  id: p.id,
  sku: p.sku,
  name: p.name,
  category: p.category,
  category_id: categoryIdByName.get(p.category.toLowerCase()) ?? null,
  subcategory: p.subcategory,
  price: p.price,
  sale_price: p.salePrice,
  rating: p.rating,
  reviews: p.reviews,
  colors: p.colors,
  sizes: p.sizes,
  images: p.images,
  short_description: p.shortDescription,
  description: p.description,
  material: p.material,
  stock: p.stock,
  tags: p.tags,
  featured: Boolean(p.featured),
  is_new: Boolean(p.isNew),
}));

const { error } = await db.from('products').insert(rows);
if (error) {
  console.error('[db] Seed failed:', error.message);
  process.exit(1);
}
console.log(`[db] Seeded ${rows.length} products.`);
