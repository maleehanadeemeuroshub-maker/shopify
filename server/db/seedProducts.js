import db from './index.js';
import { PRODUCTS } from '../../src/data/products.js';

const insertProduct = db.prepare(`
  INSERT INTO products
    (id, numeric_id, sku, name, category, subcategory, price, sale_price, rating, reviews,
     colors_json, sizes_json, images_json, short_description, description, material, stock,
     tags_json, featured, is_new)
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// The static catalog in src/data/products.js is the seed for the real
// products table — it only runs once, the first time the server starts
// against a fresh database. After that, the database is the source of
// truth (so seller-added products and stock/price edits persist).
export function seedProductsIfEmpty() {
  const { count } = db.prepare('SELECT COUNT(*) AS count FROM products').get();
  if (count > 0) return;

  db.exec('BEGIN');
  try {
    for (const p of PRODUCTS) {
      insertProduct.run(
        p.id,
        p.numericId,
        p.sku,
        p.name,
        p.category,
        p.subcategory,
        p.price,
        p.salePrice,
        p.rating,
        p.reviews,
        JSON.stringify(p.colors),
        JSON.stringify(p.sizes),
        JSON.stringify(p.images),
        p.shortDescription,
        p.description,
        p.material,
        p.stock,
        JSON.stringify(p.tags),
        p.featured ? 1 : 0,
        p.isNew ? 1 : 0
      );
    }
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  console.log(`[db] Seeded ${PRODUCTS.length} products.`);
}
