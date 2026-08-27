// Single function for every /api/products operation (see api/admin.js for
// why — query-string dispatch, not path segments). src/lib/api.js's
// productsApi builds these query strings.
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { getSessionUser, requireAuth, requireRole } from './_lib/auth.js';
import { rowToProduct, ownsProduct, uniqueSlug, getCategoryId } from './_lib/products.js';
import { requireFields, methodNotAllowed } from './_lib/validate.js';

async function listProducts(req, res, db) {
  const { data, error } = await db.from('products').select('*').eq('active', true).order('numeric_id', { ascending: true });
  if (error) {
    console.error('[products]', error);
    return res.status(500).json({ ok: false, error: 'Could not load products.' });
  }
  res.json({ ok: true, products: data.map(rowToProduct) });
}

async function createProduct(req, res, db) {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (!requireRole(user, res, 'seller', 'admin')) return;
  if (!requireFields(req, res, ['name', 'category', 'price', 'stock'])) return;

  const { name, category, subcategory, price, salePrice, colors, sizes, images, shortDescription, description, material, stock, tags, featured, isNew } =
    req.body;

  const id = await uniqueSlug(db, name);
  // numeric_id is a DB-generated identity column now (Supabase Auth ids are
  // uuids, so there's no per-seller numeric counter to derive a SKU from) —
  // a short random suffix is unique enough for a display SKU.
  const sku = `SLR-${crypto.randomUUID().slice(0, 8).toUpperCase()}`;
  const categoryId = await getCategoryId(db, category);

  const { data: inserted, error } = await db
    .from('products')
    .insert({
      id,
      sku,
      seller_id: user.id,
      name: name.trim(),
      category,
      category_id: categoryId,
      subcategory: subcategory || category,
      price: Number(price),
      sale_price: salePrice ? Number(salePrice) : null,
      colors: colors?.length ? colors : ['Black'],
      sizes: sizes?.length ? sizes : ['One Size'],
      images: images?.length ? images : [],
      short_description: shortDescription || '',
      description: description || '',
      material: material || '',
      stock: Number(stock) || 0,
      tags: tags ?? [],
      featured: Boolean(featured),
      is_new: Boolean(isNew),
    })
    .select('*')
    .single();
  if (error) {
    console.error('[products/create]', error);
    return res.status(500).json({ ok: false, error: 'Could not create product.' });
  }

  res.json({ ok: true, product: rowToProduct(inserted) });
}

async function mineProducts(req, res, db) {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (!requireRole(user, res, 'seller', 'admin')) return;

  const { data, error } = await db.from('products').select('*').eq('seller_id', user.id).order('created_at', { ascending: false });
  if (error) return res.status(500).json({ ok: false, error: 'Could not load products.' });

  res.json({ ok: true, products: data.map(rowToProduct) });
}

async function getProduct(req, res, db, id) {
  const { data: row } = await db.from('products').select('*').eq('id', id).maybeSingle();
  if (!row) return res.status(404).json({ ok: false, error: 'Product not found.' });

  const user = await getSessionUser(req);
  if (!row.active && !ownsProduct(user, row)) {
    return res.status(404).json({ ok: false, error: 'Product not found.' });
  }
  res.json({ ok: true, product: rowToProduct(row) });
}

async function updateProduct(req, res, db, id) {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (!requireRole(user, res, 'seller', 'admin')) return;
  if (!requireFields(req, res, ['name', 'category', 'price', 'stock'])) return;

  const { data: row } = await db.from('products').select('*').eq('id', id).maybeSingle();
  if (!row || !ownsProduct(user, row)) {
    return res.status(404).json({ ok: false, error: 'Product not found.' });
  }

  const { name, category, subcategory, price, salePrice, colors, sizes, images, shortDescription, description, material, stock, tags, featured, isNew, active } =
    req.body;

  const { data: updated, error } = await db
    .from('products')
    .update({
      name: name.trim(),
      category,
      subcategory: subcategory || category,
      price: Number(price),
      sale_price: salePrice ? Number(salePrice) : null,
      colors: colors?.length ? colors : ['Black'],
      sizes: sizes?.length ? sizes : ['One Size'],
      images: images?.length ? images : [],
      short_description: shortDescription || '',
      description: description || '',
      material: material || '',
      stock: Number(stock) || 0,
      tags: tags ?? [],
      featured: Boolean(featured),
      is_new: Boolean(isNew),
      active: active !== false,
      updated_at: new Date().toISOString(),
    })
    .eq('id', row.id)
    .select('*')
    .single();
  if (error) return res.status(500).json({ ok: false, error: 'Could not update product.' });

  res.json({ ok: true, product: rowToProduct(updated) });
}

async function deleteProduct(req, res, db, id) {
  const user = await requireAuth(req, res);
  if (!user) return;
  if (!requireRole(user, res, 'seller', 'admin')) return;

  const { data: row } = await db.from('products').select('*').eq('id', id).maybeSingle();
  if (!row || !ownsProduct(user, row)) {
    return res.status(404).json({ ok: false, error: 'Product not found.' });
  }

  await db.from('products').update({ active: false, updated_at: new Date().toISOString() }).eq('id', row.id);
  res.json({ ok: true });
}

export default async function handler(req, res) {
  const db = supabaseAdmin();
  const { id, resource } = req.query;

  if (resource === 'mine') {
    if (req.method !== 'GET') return methodNotAllowed(res, ['GET']);
    return mineProducts(req, res, db);
  }

  if (id) {
    if (req.method === 'GET') return getProduct(req, res, db, id);
    if (req.method === 'PUT') return updateProduct(req, res, db, id);
    if (req.method === 'DELETE') return deleteProduct(req, res, db, id);
    return methodNotAllowed(res, ['GET', 'PUT', 'DELETE']);
  }

  if (req.method === 'GET') return listProducts(req, res, db);
  if (req.method === 'POST') return createProduct(req, res, db);
  return methodNotAllowed(res, ['GET', 'POST']);
}
