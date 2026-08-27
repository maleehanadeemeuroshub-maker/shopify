import { supabaseAdmin } from '../_lib/supabaseAdmin.js';
import { getSessionUser, requireAuth, requireRole } from '../_lib/auth.js';
import { rowToProduct, ownsProduct } from '../_lib/products.js';
import { requireFields, methodNotAllowed } from '../_lib/validate.js';

export default async function handler(req, res) {
  const db = supabaseAdmin();
  const { id } = req.query;

  if (req.method === 'GET') {
    const { data: row } = await db.from('products').select('*').eq('id', id).maybeSingle();
    if (!row) return res.status(404).json({ ok: false, error: 'Product not found.' });

    const user = await getSessionUser(req);
    if (!row.active && !ownsProduct(user, row)) {
      return res.status(404).json({ ok: false, error: 'Product not found.' });
    }
    return res.json({ ok: true, product: rowToProduct(row) });
  }

  if (req.method === 'PUT') {
    const user = await requireAuth(req, res);
    if (!user) return;
    if (!requireRole(user, res, 'seller', 'admin')) return;
    if (!requireFields(req, res, ['name', 'category', 'price', 'stock'])) return;

    const { data: row } = await db.from('products').select('*').eq('id', id).maybeSingle();
    if (!row || !ownsProduct(user, row)) {
      return res.status(404).json({ ok: false, error: 'Product not found.' });
    }

    const {
      name,
      category,
      subcategory,
      price,
      salePrice,
      colors,
      sizes,
      images,
      shortDescription,
      description,
      material,
      stock,
      tags,
      featured,
      isNew,
      active,
    } = req.body;

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

    return res.json({ ok: true, product: rowToProduct(updated) });
  }

  if (req.method === 'DELETE') {
    const user = await requireAuth(req, res);
    if (!user) return;
    if (!requireRole(user, res, 'seller', 'admin')) return;

    const { data: row } = await db.from('products').select('*').eq('id', id).maybeSingle();
    if (!row || !ownsProduct(user, row)) {
      return res.status(404).json({ ok: false, error: 'Product not found.' });
    }

    await db.from('products').update({ active: false, updated_at: new Date().toISOString() }).eq('id', row.id);
    return res.json({ ok: true });
  }

  return methodNotAllowed(res, ['GET', 'PUT', 'DELETE']);
}
