import { Router } from 'express';
import db from '../db/index.js';
import { requireAuth, requireRole, attachUser } from '../middleware/auth.js';

const router = Router();

const listActive = db.prepare('SELECT * FROM products WHERE active = 1 ORDER BY numeric_id ASC');
const findByIdAny = db.prepare('SELECT * FROM products WHERE id = ?');
const listBySeller = db.prepare('SELECT * FROM products WHERE seller_id = ? ORDER BY created_at DESC');
const maxNumericId = db.prepare('SELECT MAX(numeric_id) AS max FROM products');

const insertProduct = db.prepare(`
  INSERT INTO products
    (id, numeric_id, sku, seller_id, name, category, subcategory, price, sale_price, rating, reviews,
     colors_json, sizes_json, images_json, short_description, description, material, stock, tags_json,
     featured, is_new)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

const updateProduct = db.prepare(`
  UPDATE products SET
    name = ?, category = ?, subcategory = ?, price = ?, sale_price = ?, colors_json = ?, sizes_json = ?,
    images_json = ?, short_description = ?, description = ?, material = ?, stock = ?, tags_json = ?,
    featured = ?, is_new = ?, active = ?, updated_at = datetime('now')
  WHERE id = ?
`);

const softDelete = db.prepare(`UPDATE products SET active = 0, updated_at = datetime('now') WHERE id = ?`);

function missingFields(body, fields) {
  return fields.filter((f) => body[f] === undefined || body[f] === null || body[f] === '');
}

function validate(fields) {
  return (req, res, next) => {
    const missing = missingFields(req.body ?? {}, fields);
    if (missing.length) {
      return res.status(400).json({ ok: false, error: `Missing required field(s): ${missing.join(', ')}` });
    }
    next();
  };
}

function slugify(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

function uniqueSlug(name) {
  const base = slugify(name) || 'product';
  let candidate = base;
  let suffix = 2;
  while (findByIdAny.get(candidate)) {
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
  return candidate;
}

function rowToProduct(row) {
  return {
    id: row.id,
    numericId: row.numeric_id,
    sku: row.sku,
    sellerId: row.seller_id,
    name: row.name,
    category: row.category,
    subcategory: row.subcategory,
    price: row.price,
    salePrice: row.sale_price,
    rating: row.rating,
    reviews: row.reviews,
    colors: JSON.parse(row.colors_json),
    sizes: JSON.parse(row.sizes_json),
    images: JSON.parse(row.images_json),
    shortDescription: row.short_description,
    description: row.description,
    material: row.material,
    stock: row.stock,
    tags: JSON.parse(row.tags_json),
    featured: Boolean(row.featured),
    isNew: Boolean(row.is_new),
    active: Boolean(row.active),
    onSale: row.sale_price != null,
  };
}

function ownsProduct(user, row) {
  return user && (user.role === 'admin' || row.seller_id === user.id);
}

router.get('/', (req, res) => {
  res.json({ ok: true, products: listActive.all().map(rowToProduct) });
});

// Must come before /:id — otherwise "mine" is parsed as a product id.
router.get('/mine', requireAuth, requireRole('seller', 'admin'), (req, res) => {
  res.json({ ok: true, products: listBySeller.all(req.user.id).map(rowToProduct) });
});

router.post(
  '/',
  requireAuth,
  requireRole('seller', 'admin'),
  validate(['name', 'category', 'price', 'stock']),
  (req, res) => {
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

    const id = uniqueSlug(name);
    const numericId = (maxNumericId.get().max ?? 0) + 1;
    const sku = `SLR-${String(numericId).padStart(4, '0')}`;

    insertProduct.run(
      id,
      numericId,
      sku,
      req.user.id,
      name.trim(),
      category,
      subcategory || category,
      Number(price),
      salePrice ? Number(salePrice) : null,
      JSON.stringify(colors?.length ? colors : ['Black']),
      JSON.stringify(sizes?.length ? sizes : ['One Size']),
      JSON.stringify(images?.length ? images : []),
      shortDescription || '',
      description || '',
      material || '',
      Number(stock) || 0,
      JSON.stringify(tags ?? []),
      featured ? 1 : 0,
      isNew ? 1 : 0
    );

    res.json({ ok: true, product: rowToProduct(findByIdAny.get(id)) });
  }
);

router.put(
  '/:id',
  requireAuth,
  requireRole('seller', 'admin'),
  validate(['name', 'category', 'price', 'stock']),
  (req, res) => {
    const row = findByIdAny.get(req.params.id);
    if (!row || !ownsProduct(req.user, row)) {
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

    updateProduct.run(
      name.trim(),
      category,
      subcategory || category,
      Number(price),
      salePrice ? Number(salePrice) : null,
      JSON.stringify(colors?.length ? colors : ['Black']),
      JSON.stringify(sizes?.length ? sizes : ['One Size']),
      JSON.stringify(images?.length ? images : []),
      shortDescription || '',
      description || '',
      material || '',
      Number(stock) || 0,
      JSON.stringify(tags ?? []),
      featured ? 1 : 0,
      isNew ? 1 : 0,
      active === false ? 0 : 1,
      row.id
    );

    res.json({ ok: true, product: rowToProduct(findByIdAny.get(row.id)) });
  }
);

router.delete('/:id', requireAuth, requireRole('seller', 'admin'), (req, res) => {
  const row = findByIdAny.get(req.params.id);
  if (!row || !ownsProduct(req.user, row)) {
    return res.status(404).json({ ok: false, error: 'Product not found.' });
  }
  softDelete.run(row.id);
  res.json({ ok: true });
});

// Placed last so it doesn't swallow the static routes above (/mine, POST /).
router.get('/:id', attachUser, (req, res) => {
  const row = findByIdAny.get(req.params.id);
  if (!row) return res.status(404).json({ ok: false, error: 'Product not found.' });
  if (!row.active && !ownsProduct(req.user, row)) {
    return res.status(404).json({ ok: false, error: 'Product not found.' });
  }
  res.json({ ok: true, product: rowToProduct(row) });
});

export default router;
