import { supabaseAdmin } from '../_lib/supabaseAdmin.js';
import { requireAuth, requireRole } from '../_lib/auth.js';
import { requireFields, methodNotAllowed } from '../_lib/validate.js';
import { rowToProduct, uniqueSlug, getCategoryId } from '../_lib/products.js';

export default async function handler(req, res) {
  const db = supabaseAdmin();

  if (req.method === 'GET') {
    const { data, error } = await db
      .from('products')
      .select('*')
      .eq('active', true)
      .order('numeric_id', { ascending: true });
    if (error) {
      console.error('[products]', error);
      return res.status(500).json({ ok: false, error: 'Could not load products.' });
    }
    return res.json({ ok: true, products: data.map(rowToProduct) });
  }

  if (req.method === 'POST') {
    const user = await requireAuth(req, res);
    if (!user) return;
    if (!requireRole(user, res, 'seller', 'admin')) return;
    if (!requireFields(req, res, ['name', 'category', 'price', 'stock'])) return;

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
    } = req.body;

    const id = await uniqueSlug(db, name);
    // numeric_id is a DB-generated identity column now (Supabase Auth ids
    // are uuids, so there's no per-seller numeric counter to derive a SKU
    // from) — a short random suffix is unique enough for a display SKU.
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

    return res.json({ ok: true, product: rowToProduct(inserted) });
  }

  return methodNotAllowed(res, ['GET', 'POST']);
}
