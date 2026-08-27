export function rowToProduct(row) {
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
    colors: row.colors,
    sizes: row.sizes,
    images: row.images,
    shortDescription: row.short_description,
    description: row.description,
    material: row.material,
    stock: row.stock,
    tags: row.tags,
    featured: Boolean(row.featured),
    isNew: Boolean(row.is_new),
    active: Boolean(row.active),
    onSale: row.sale_price != null,
  };
}

export function slugify(name) {
  return String(name)
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

export async function uniqueSlug(db, name) {
  const base = slugify(name) || 'product';
  let candidate = base;
  let suffix = 2;
  // eslint-disable-next-line no-constant-condition
  while (true) {
    const { data } = await db.from('products').select('id').eq('id', candidate).maybeSingle();
    if (!data) return candidate;
    candidate = `${base}-${suffix}`;
    suffix += 1;
  }
}

export function ownsProduct(user, row) {
  return user && (user.role === 'admin' || row.seller_id === user.id);
}

// Looks up the fixed-taxonomy category row by name so products.category_id
// stays a real FK — falls back to null (category text column still holds
// the name) if a seller free-types something outside the seeded taxonomy.
export async function getCategoryId(db, categoryName) {
  if (!categoryName) return null;
  const { data } = await db.from('categories').select('id').ilike('name', categoryName).maybeSingle();
  return data?.id ?? null;
}
