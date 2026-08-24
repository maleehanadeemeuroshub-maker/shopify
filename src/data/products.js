// Centralized demo product catalog for the GENZ-WEARS practice storefront.
// All prices, stock counts, and reviews are fictional demo data.
// Images are royalty-free Unsplash photography, loosely matched by category —
// swap the `img()` ids below for real product photography when available.

function img(id, w = 900) {
  return `https://images.unsplash.com/${id}?w=${w}&q=80&auto=format&fit=crop`;
}

// Per-category image pools, sized to exactly 2x how many products use that
// category below. imgsFor() hands out sequential, NON-overlapping pairs —
// pool[0,1] to product 1, pool[2,3] to product 2, etc — so no two products
// in the same category share so much as a single photo, let alone both.
const POOL = {
  tee: [
    'photo-1521572163474-6864f9cf17ab',
    'photo-1503341504253-dff4815485f1',
    'photo-1576566588028-4147f3842f27',
    'photo-1583743814966-8936f5b7be1a',
    'photo-1618354691792-d1d42acfd860',
    'photo-1562157873-818bc0726f68',
    'photo-1554568218-0f1715e72254',
    'photo-1441984904996-e0b6ba687e04',
  ],
  hoodie: [
    'photo-1556821840-3a63f95609a7',
    'photo-1509942774463-acf339cf87d5',
    'photo-1620331311520-246422fd82f9',
    'photo-1614251055880-ee96e4803393',
    'photo-1517438476312-10d79c077509',
    'photo-1608234807905-4466023792f5',
    'photo-1591369822096-ffd140ec948f',
    'photo-1519415943484-9fa1873496d4',
  ],
  sweatshirt: [
    'photo-1622445275576-721325763afe',
    'photo-1596755094514-f87e34085b2c',
    'photo-1591195853828-11db59a44f6b',
    'photo-1516035069371-29a1b244cc32',
  ],
  cargo: [
    'photo-1541099649105-f69ad21f3246',
    'photo-1475178626620-a4d074967452',
    'photo-1604176354204-9268737828e4',
    'photo-1509631179647-0177331693ae',
  ],
  denim: [
    'photo-1542272604-787c3835535d',
    'photo-1594938298603-c8148c4dae35',
    'photo-1541840031508-326b77c9a17e',
    'photo-1582418702059-97ebafb35d09',
    'photo-1516257984-b1b4d707412e',
    'photo-1548883354-94bcfe321cbb',
  ],
  jacket: [
    'photo-1551028719-00167b16eac5',
    'photo-1544022613-e87ca75a784a',
    'photo-1591047139829-d91aecb6caea',
    'photo-1608063615781-e2ef8c73d114',
    'photo-1520975954732-35dd22299614',
    'photo-1521223890158-f9f7c3d5d504',
  ],
  shirt: [
    'photo-1594633312681-425c7b97ccd1',
    'photo-1602810318383-e386cc2a3ccf',
    'photo-1603252109303-2751441dd157',
    'photo-1622470953794-aa9c70b0fb9d',
  ],
  coord: [
    'photo-1618932260643-eee4a2f652a6',
    'photo-1552902865-b72c031ac5ea',
    'photo-1600185365483-26d7a4cc7519',
    'photo-1554412933-514a83d2f3c8',
  ],
  cap: [
    'photo-1521369909029-2afed882baee',
    'photo-1521572267360-ee0c2909d518',
    'photo-1534215754734-18e55d13e346',
    'photo-1517941823-815bea90d291',
  ],
  bag: [
    'photo-1553062407-98eeb64c6a62',
    'photo-1548036328-c9fa89d128fa',
    'photo-1590874103328-eac38a683ce7',
    'photo-1547949003-9792a18a2601',
  ],
  watch: [
    'photo-1524805444758-089113d48a6d',
    'photo-1523275335684-37898b6baf30',
    'photo-1523170335258-f5ed11844a49',
    'photo-1548171915-e79a380a2a4b',
  ],
  sunglasses: [
    'photo-1572635196237-14b3f281503f',
    'photo-1511499767150-a48a237f0083',
    'photo-1577803645773-f96470509666',
    'photo-1473496169904-658ba7c44d8a',
  ],
  sneaker: [
    'photo-1542291026-7eec264c27ff',
    'photo-1595950653106-6c9ebd614d3a',
    'photo-1600185365926-3a2ce3cdb9eb',
    'photo-1608231387042-66d1773070a5',
  ],
};

const poolCursor = {};
function imgsFor(key) {
  const pool = POOL[key];
  const i = poolCursor[key] ?? 0;
  poolCursor[key] = i + 1;
  const a = pool[(i * 2) % pool.length];
  const b = pool[(i * 2 + 1) % pool.length];
  return [img(a), img(b)];
}

const ALL_COLORS = ['Black', 'White', 'Stone', 'Olive', 'Navy'];
const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const ONE_SIZE = ['One Size'];
const SHOE_SIZES = ['UK 6', 'UK 7', 'UK 8', 'UK 9', 'UK 10', 'UK 11'];

let uid = 0;
function product(p) {
  uid += 1;
  return {
    id: p.slug,
    numericId: uid,
    sku: p.sku,
    name: p.name,
    category: p.category,
    subcategory: p.subcategory ?? p.category,
    price: p.price,
    salePrice: p.salePrice ?? null,
    rating: p.rating,
    reviews: p.reviews,
    colors: p.colors ?? ALL_COLORS.slice(0, 3),
    sizes: p.sizes ?? CLOTHING_SIZES,
    images: p.images,
    shortDescription: p.shortDescription,
    description: p.description,
    material: p.material,
    stock: p.stock,
    tags: p.tags ?? [],
    featured: Boolean(p.featured),
    isNew: Boolean(p.isNew),
    onSale: Boolean(p.salePrice),
  };
}

export const PRODUCTS = [
  product({
    slug: 'essential-oversized-cotton-tee',
    sku: 'GW-TS-001',
    name: 'Essential Oversized Cotton Tee',
    category: 'T-Shirts',
    price: 34.99,
    salePrice: 27.99,
    rating: 4.8,
    reviews: 124,
    images: imgsFor('tee'),
    shortDescription: 'A boxy, heavyweight tee cut for an oversized silhouette.',
    description:
      'The tee that started it all. Cut from heavyweight combed cotton with a dropped shoulder and boxy fit, the Essential Oversized Cotton Tee is built to hold its shape wash after wash. Garment-dyed for a soft, lived-in hand-feel from day one.',
    material: '100% Premium Combed Cotton, 240gsm',
    stock: 18,
    tags: ['new', 'bestseller'],
    featured: true,
    isNew: true,
  }),
  product({
    slug: 'heavyweight-graphic-tee',
    sku: 'GW-TS-002',
    name: 'Heavyweight Graphic Tee',
    category: 'T-Shirts',
    price: 39.99,
    rating: 4.6,
    reviews: 88,
    images: imgsFor('tee'),
    shortDescription: 'Puff-print graphic on our signature heavyweight cotton base.',
    description:
      'A statement piece built on the same heavyweight cotton base as the Essential Tee, finished with a raised puff-print graphic across the chest. Pre-shrunk and colorfast.',
    material: '100% Premium Combed Cotton, 240gsm',
    stock: 9,
    tags: ['bestseller'],
    featured: true,
  }),
  product({
    slug: 'ribbed-longline-tee',
    sku: 'GW-TS-003',
    name: 'Ribbed Longline Tee',
    category: 'T-Shirts',
    subcategory: 'Longline',
    price: 32.99,
    salePrice: 24.99,
    rating: 4.5,
    reviews: 52,
    images: imgsFor('tee'),
    shortDescription: 'Extended hem, ribbed collar, slim-through-body fit.',
    description:
      'A longer cut for layering, with a ribbed crew collar that holds its shape and a slightly tapered body that plays well under jackets and overshirts.',
    material: '95% Cotton, 5% Elastane',
    stock: 14,
    tags: ['sale'],
  }),
  product({
    slug: 'classic-crewneck-tee',
    sku: 'GW-TS-004',
    name: 'Classic Crewneck Tee',
    category: 'T-Shirts',
    price: 29.99,
    rating: 4.7,
    reviews: 201,
    images: imgsFor('tee'),
    shortDescription: 'The everyday tee — true to size, no frills.',
    description:
      'Our best-selling basic. A true-to-size fit in mid-weight cotton jersey, made to be the reliable layer under everything else in your rotation.',
    material: '100% Cotton Jersey, 180gsm',
    stock: 26,
    tags: ['bestseller'],
    featured: true,
  }),
  product({
    slug: 'signature-heavyweight-hoodie',
    sku: 'GW-HD-001',
    name: 'Signature Heavyweight Hoodie',
    category: 'Hoodies',
    price: 74.99,
    salePrice: 59.99,
    rating: 4.9,
    reviews: 312,
    images: imgsFor('hoodie'),
    shortDescription: 'Our heaviest fleece, brushed inside for warmth.',
    description:
      'The hoodie the whole line is built around. 420gsm brushed-back fleece, double-lined hood, and a kangaroo pocket reinforced at the stress points. Runs true to size with room to layer.',
    material: '80% Cotton, 20% Recycled Polyester, 420gsm Fleece',
    stock: 22,
    tags: ['bestseller', 'sale'],
    featured: true,
  }),
  product({
    slug: 'cropped-zip-hoodie',
    sku: 'GW-HD-002',
    name: 'Cropped Zip Hoodie',
    category: 'Hoodies',
    subcategory: 'Zip-Up',
    price: 69.99,
    rating: 4.4,
    reviews: 47,
    images: imgsFor('hoodie'),
    shortDescription: 'Full-zip, cropped length, brushed fleece lining.',
    description:
      'A cropped take on the classic zip-up, finished with a two-way YKK zipper and a brushed fleece interior that stays soft through repeated washes.',
    material: '80% Cotton, 20% Polyester',
    stock: 11,
    tags: ['new'],
    isNew: true,
  }),
  product({
    slug: 'oversized-pullover-hoodie',
    sku: 'GW-HD-003',
    name: 'Oversized Pullover Hoodie',
    category: 'Hoodies',
    price: 79.99,
    rating: 4.7,
    reviews: 96,
    images: imgsFor('hoodie'),
    shortDescription: 'Drop-shoulder, oversized fit, dropped hem.',
    description:
      'A deliberately oversized silhouette with a dropped shoulder seam and extended hem. Layers cleanly over tees, sits heavy without feeling stiff.',
    material: '80% Cotton, 20% Recycled Polyester',
    stock: 4,
    tags: ['new'],
    isNew: true,
  }),
  product({
    slug: 'fleece-lined-hoodie',
    sku: 'GW-HD-004',
    name: 'Fleece-Lined Hoodie',
    category: 'Hoodies',
    price: 84.99,
    salePrice: 67.99,
    rating: 4.6,
    reviews: 63,
    images: imgsFor('hoodie'),
    shortDescription: 'Sherpa-lined hood and pocket for cold-weather wear.',
    description:
      'Built for the coldest part of the season — a sherpa-lined hood and front pocket, with a heavyweight cotton shell that blocks wind better than a standard fleece.',
    material: 'Shell: 90% Cotton 10% Polyester · Lining: Sherpa Fleece',
    stock: 7,
    tags: ['sale'],
  }),
  product({
    slug: 'vintage-wash-crewneck-sweatshirt',
    sku: 'GW-SW-001',
    name: 'Vintage Wash Crewneck Sweatshirt',
    category: 'Sweatshirts',
    price: 59.99,
    rating: 4.5,
    reviews: 41,
    images: imgsFor('sweatshirt'),
    shortDescription: 'Garment-washed for a broken-in look from the first wear.',
    description:
      'Garment-dyed and washed after construction for a faded, vintage finish with none of the wear. A relaxed crewneck fit in mid-weight fleece.',
    material: '100% Cotton Fleece, 320gsm',
    stock: 15,
    tags: [],
  }),
  product({
    slug: 'embroidered-logo-sweatshirt',
    sku: 'GW-SW-002',
    name: 'Embroidered Logo Sweatshirt',
    category: 'Sweatshirts',
    price: 64.99,
    salePrice: 49.99,
    rating: 4.6,
    reviews: 58,
    images: imgsFor('sweatshirt'),
    shortDescription: 'Chain-stitch chest embroidery, ribbed cuffs and hem.',
    description:
      'A cleaner alternative to a full graphic — a small chain-stitch embroidered logo on the chest, ribbed cuffs and hem for a fit that holds through the day.',
    material: '80% Cotton, 20% Polyester Fleece',
    stock: 19,
    tags: ['sale'],
  }),
  product({
    slug: 'urban-utility-cargo',
    sku: 'GW-CG-001',
    name: 'Urban Utility Cargo',
    category: 'Cargo Pants',
    subcategory: 'Pants',
    price: 69.99,
    rating: 4.5,
    reviews: 77,
    colors: ['Black', 'Olive', 'Stone'],
    images: imgsFor('cargo'),
    shortDescription: 'Six-pocket cargo with an adjustable waist and tapered leg.',
    description:
      'Utility-inspired cargo pants with six functional pockets, an adjustable elastic waistband, and a tapered leg that keeps the silhouette clean without looking slim-fit.',
    material: '98% Cotton, 2% Elastane Ripstop',
    stock: 13,
    tags: ['bestseller'],
    featured: true,
  }),
  product({
    slug: 'tapered-tech-cargo-pants',
    sku: 'GW-CG-002',
    name: 'Tapered Tech Cargo Pants',
    category: 'Cargo Pants',
    subcategory: 'Pants',
    price: 74.99,
    salePrice: 59.99,
    rating: 4.4,
    reviews: 33,
    colors: ['Black', 'Navy'],
    images: imgsFor('cargo'),
    shortDescription: 'Water-resistant tech fabric with articulated knees.',
    description:
      'Built from a brushed water-resistant tech fabric with articulated knees for movement and a tapered ankle that pairs cleanly with our sneakers.',
    material: '92% Nylon, 8% Elastane',
    stock: 6,
    tags: ['sale'],
  }),
  product({
    slug: 'relaxed-fit-denim-jeans',
    sku: 'GW-DN-001',
    name: 'Relaxed Fit Denim Jeans',
    category: 'Denim Jeans',
    subcategory: 'Denim',
    price: 79.99,
    rating: 4.6,
    reviews: 112,
    colors: ['Black', 'Stone'],
    images: imgsFor('denim'),
    shortDescription: 'Mid-weight denim, relaxed through hip and thigh.',
    description:
      'A relaxed fit through the hip and thigh with a straight leg opening. Mid-weight 13oz denim that breaks in without losing its shape.',
    material: '100% Cotton Denim, 13oz',
    stock: 21,
    tags: ['bestseller'],
    featured: true,
  }),
  product({
    slug: 'straight-leg-raw-denim',
    sku: 'GW-DN-002',
    name: 'Straight Leg Raw Denim',
    category: 'Denim Jeans',
    subcategory: 'Denim',
    price: 89.99,
    rating: 4.7,
    reviews: 39,
    colors: ['Navy', 'Black'],
    images: imgsFor('denim'),
    shortDescription: 'Unwashed selvedge-style denim that fades with wear.',
    description:
      'Raw, unwashed denim in a true straight leg. Develops unique fades and creases the more you wear it — expect a break-in period.',
    material: '100% Cotton Selvedge-Style Denim, 14.5oz',
    stock: 8,
    tags: ['new'],
    isNew: true,
  }),
  product({
    slug: 'distressed-slim-jeans',
    sku: 'GW-DN-003',
    name: 'Distressed Slim Jeans',
    category: 'Denim Jeans',
    subcategory: 'Denim',
    price: 84.99,
    salePrice: 67.99,
    rating: 4.3,
    reviews: 27,
    colors: ['Black', 'Stone'],
    images: imgsFor('denim'),
    shortDescription: 'Slim fit with hand-distressed detailing at the knee.',
    description:
      'A slim fit through the leg with hand-distressed detailing at the knee. Comfort stretch denim that moves with you.',
    material: '98% Cotton, 2% Elastane',
    stock: 5,
    tags: ['sale'],
  }),
  product({
    slug: 'oversized-bomber-jacket',
    sku: 'GW-JK-001',
    name: 'Oversized Bomber Jacket',
    category: 'Jackets',
    price: 129.99,
    rating: 4.8,
    reviews: 64,
    colors: ['Black', 'Olive'],
    images: imgsFor('jacket'),
    shortDescription: 'Ribbed collar and cuffs, oversized through the body.',
    description:
      'An oversized bomber with a ribbed collar, cuffs, and hem, finished with a two-way front zip and interior utility pocket. Lightly padded for structure without bulk.',
    material: 'Shell: 100% Nylon · Lining: Polyester',
    stock: 10,
    tags: ['bestseller'],
    featured: true,
  }),
  product({
    slug: 'quilted-utility-jacket',
    sku: 'GW-JK-002',
    name: 'Quilted Utility Jacket',
    category: 'Jackets',
    price: 149.99,
    salePrice: 119.99,
    rating: 4.6,
    reviews: 29,
    colors: ['Black', 'Stone'],
    images: imgsFor('jacket'),
    shortDescription: 'Quilted panels, four-pocket utility front.',
    description:
      'A quilted mid-layer jacket built with a four-pocket utility front and a stand collar. Warm enough to wear alone in mild weather, or layered under a shell.',
    material: 'Shell: 100% Nylon · Fill: Recycled Polyester',
    stock: 0,
    tags: ['sale'],
  }),
  product({
    slug: 'water-resistant-windbreaker',
    sku: 'GW-JK-003',
    name: 'Water-Resistant Windbreaker',
    category: 'Jackets',
    price: 99.99,
    rating: 4.4,
    reviews: 18,
    colors: ['Black', 'Navy'],
    images: imgsFor('jacket'),
    shortDescription: 'Packable shell with a water-resistant DWR finish.',
    description:
      'A packable windbreaker with a DWR water-resistant finish, adjustable hood, and elastic cuffs. Folds into its own pocket for travel.',
    material: '100% Recycled Nylon, DWR Coating',
    stock: 12,
    tags: ['new'],
    isNew: true,
  }),
  product({
    slug: 'boxy-flannel-overshirt',
    sku: 'GW-SH-001',
    name: 'Boxy Flannel Overshirt',
    category: 'Shirts',
    price: 64.99,
    rating: 4.5,
    reviews: 22,
    images: imgsFor('shirt'),
    shortDescription: 'Brushed flannel, boxy fit, chest pockets.',
    description:
      'A heavier flannel cut boxy enough to wear as an overshirt, with double chest pockets and a slightly dropped shoulder.',
    material: '100% Brushed Cotton Flannel',
    stock: 16,
    tags: [],
  }),
  product({
    slug: 'relaxed-oxford-shirt',
    sku: 'GW-SH-002',
    name: 'Relaxed Oxford Shirt',
    category: 'Shirts',
    price: 54.99,
    salePrice: 42.99,
    rating: 4.3,
    reviews: 15,
    images: imgsFor('shirt'),
    shortDescription: 'Classic oxford cloth, relaxed through the body.',
    description:
      'A wardrobe staple — oxford cloth cut with a relaxed body and a soft, unstructured collar that works buttoned up or open over a tee.',
    material: '100% Cotton Oxford',
    stock: 20,
    tags: ['sale'],
  }),
  product({
    slug: 'two-piece-utility-coord-set',
    sku: 'GW-CO-001',
    name: 'Two-Piece Utility Co-Ord Set',
    category: 'Co-Ord Sets',
    price: 119.99,
    rating: 4.7,
    reviews: 24,
    colors: ['Olive', 'Black'],
    images: imgsFor('coord'),
    shortDescription: 'Matching shirt and pant set in ripstop utility fabric.',
    description:
      'A matching short-sleeve overshirt and elastic-waist pant, both cut from the same ripstop utility fabric. Sold as a set, easy to wear as separates.',
    material: '98% Cotton, 2% Elastane Ripstop',
    stock: 7,
    tags: ['new'],
    isNew: true,
  }),
  product({
    slug: 'ribbed-knit-coord-set',
    sku: 'GW-CO-002',
    name: 'Ribbed Knit Co-Ord Set',
    category: 'Co-Ord Sets',
    price: 99.99,
    salePrice: 79.99,
    rating: 4.5,
    reviews: 19,
    colors: ['Black', 'Stone'],
    images: imgsFor('coord'),
    shortDescription: 'Ribbed knit tank and pant, sold as a set.',
    description:
      'A ribbed knit tank and matching wide-leg pant with a drawstring waist. Soft, stretchy, and built to move.',
    material: '95% Cotton, 5% Elastane Rib Knit',
    stock: 9,
    tags: ['sale'],
  }),
  product({
    slug: 'signature-logo-cap',
    sku: 'GW-CP-001',
    name: 'Signature Logo Cap',
    category: 'Caps',
    subcategory: 'Accessories',
    price: 28,
    rating: 4.7,
    reviews: 143,
    colors: ['Black', 'White', 'Olive'],
    sizes: ONE_SIZE,
    images: imgsFor('cap'),
    shortDescription: 'Structured six-panel cap with embroidered logo.',
    description:
      'A structured six-panel cap with a curved brim and adjustable strap closure, finished with a subtle embroidered logo at the front.',
    material: '100% Cotton Twill',
    stock: 40,
    tags: ['bestseller'],
    featured: true,
  }),
  product({
    slug: 'structured-snapback',
    sku: 'GW-CP-002',
    name: 'Structured Snapback',
    category: 'Caps',
    subcategory: 'Accessories',
    price: 32,
    salePrice: 24.99,
    rating: 4.4,
    reviews: 51,
    colors: ['Black', 'Navy'],
    sizes: ONE_SIZE,
    images: imgsFor('cap'),
    shortDescription: 'Flat brim, structured crown, snapback closure.',
    description:
      'A flat-brim snapback with a structured crown and classic snap closure at the back, sized to fit most.',
    material: '100% Cotton Twill',
    stock: 17,
    tags: ['sale'],
  }),
  product({
    slug: 'canvas-utility-tote',
    sku: 'GW-BG-001',
    name: 'Canvas Utility Tote',
    category: 'Bags',
    subcategory: 'Accessories',
    price: 54.99,
    rating: 4.6,
    reviews: 37,
    colors: ['Black', 'Stone'],
    sizes: ONE_SIZE,
    images: imgsFor('bag'),
    shortDescription: 'Heavyweight canvas tote with internal pocket.',
    description:
      'A heavyweight canvas tote with reinforced handles rated for everyday carry, plus an internal zip pocket for the small stuff.',
    material: '100% Heavyweight Cotton Canvas, 16oz',
    stock: 25,
    tags: [],
  }),
  product({
    slug: 'technical-crossbody-bag',
    sku: 'GW-BG-002',
    name: 'Technical Crossbody Bag',
    category: 'Bags',
    subcategory: 'Accessories',
    price: 69.99,
    rating: 4.5,
    reviews: 21,
    colors: ['Black'],
    sizes: ONE_SIZE,
    images: imgsFor('bag'),
    shortDescription: 'Water-resistant crossbody with adjustable strap.',
    description:
      'A compact, water-resistant crossbody bag with a padded interior sleeve and adjustable strap — built for keys, cards, and a phone.',
    material: '100% Recycled Ripstop Nylon',
    stock: 14,
    tags: ['new'],
    isNew: true,
  }),
  product({
    slug: 'minimalist-steel-watch',
    sku: 'GW-WT-001',
    name: 'Minimalist Steel Watch',
    category: 'Watches',
    subcategory: 'Accessories',
    price: 149.99,
    rating: 4.8,
    reviews: 46,
    colors: ['Black', 'White'],
    sizes: ONE_SIZE,
    images: imgsFor('watch'),
    shortDescription: 'Stainless steel case, minimal dial, leather strap.',
    description:
      'A minimalist stainless steel watch with a sunray-brushed dial and genuine leather strap. Water-resistant to 3ATM.',
    material: 'Stainless Steel Case · Genuine Leather Strap',
    stock: 11,
    tags: ['bestseller'],
    featured: true,
  }),
  product({
    slug: 'diver-chronograph-watch',
    sku: 'GW-WT-002',
    name: 'Diver Chronograph Watch',
    category: 'Watches',
    subcategory: 'Accessories',
    price: 189.99,
    salePrice: 154.99,
    rating: 4.6,
    reviews: 34,
    colors: ['Black', 'Navy'],
    sizes: ONE_SIZE,
    images: imgsFor('watch'),
    shortDescription: 'Rotating bezel, chronograph dial, 200m water resistance.',
    description:
      'A rugged dive-inspired chronograph with a unidirectional rotating bezel, luminous hands, and a brushed stainless bracelet. Rated to 200m water resistance.',
    material: 'Stainless Steel Case & Bracelet · Sapphire Crystal',
    stock: 9,
    tags: ['sale'],
  }),
  product({
    slug: 'retro-square-sunglasses',
    sku: 'GW-SG-001',
    name: 'Retro Square Sunglasses',
    category: 'Sunglasses',
    subcategory: 'Accessories',
    price: 45,
    rating: 4.3,
    reviews: 28,
    colors: ['Black', 'Stone'],
    sizes: ONE_SIZE,
    images: imgsFor('sunglasses'),
    shortDescription: 'Square acetate frame with UV400 protection.',
    description:
      'A square acetate frame with a slightly oversized profile and UV400-rated polarized lenses.',
    material: 'Acetate Frame · Polarized UV400 Lenses',
    stock: 23,
    tags: [],
  }),
  product({
    slug: 'round-tinted-sunglasses',
    sku: 'GW-SG-002',
    name: 'Round Tinted Sunglasses',
    category: 'Sunglasses',
    subcategory: 'Accessories',
    price: 49.99,
    rating: 4.4,
    reviews: 17,
    colors: ['Black', 'Stone'],
    sizes: ONE_SIZE,
    images: imgsFor('sunglasses'),
    shortDescription: 'Round metal frame with gradient-tinted lenses.',
    description:
      'A round metal frame with a slim double bridge and gradient-tinted lenses — a lighter, throwback alternative to the square frame.',
    material: 'Metal Frame · Gradient-Tinted UV400 Lenses',
    stock: 19,
    tags: ['new'],
    isNew: true,
  }),
  product({
    slug: 'classic-court-sneakers',
    sku: 'GW-SN-001',
    name: 'Classic Court Sneakers',
    category: 'Sneakers',
    subcategory: 'Shoes',
    price: 99.99,
    rating: 4.7,
    reviews: 89,
    colors: ['White', 'Black'],
    sizes: SHOE_SIZES,
    images: imgsFor('sneaker'),
    shortDescription: 'Low-top leather court sneaker with rubber outsole.',
    description:
      'A clean, low-top court sneaker in smooth leather with a cupsole rubber outsole for durability and grip.',
    material: 'Leather Upper · Rubber Outsole',
    stock: 15,
    tags: ['bestseller'],
    featured: true,
  }),
  product({
    slug: 'chunky-retro-runners',
    sku: 'GW-SN-002',
    name: 'Chunky Retro Runners',
    category: 'Sneakers',
    subcategory: 'Shoes',
    price: 119.99,
    salePrice: 94.99,
    rating: 4.5,
    reviews: 54,
    colors: ['Black', 'White', 'Stone'],
    sizes: SHOE_SIZES,
    images: imgsFor('sneaker'),
    shortDescription: 'Chunky retro-runner silhouette with layered midsole.',
    description:
      'A chunky, retro-inspired running silhouette with a layered midsole and mesh-and-suede upper for breathability.',
    material: 'Mesh & Suede Upper · EVA Midsole',
    stock: 2,
    tags: ['sale'],
  }),
];

export const CATEGORIES = [
  'T-Shirts',
  'Hoodies',
  'Sweatshirts',
  'Cargo Pants',
  'Denim Jeans',
  'Jackets',
  'Shirts',
  'Co-Ord Sets',
  'Caps',
  'Bags',
  'Watches',
  'Sunglasses',
  'Sneakers',
];

export const ACCESSORY_CATEGORIES = ['Caps', 'Bags', 'Watches', 'Sunglasses'];
export const PANTS_CATEGORIES = ['Cargo Pants', 'Denim Jeans'];
export const SHOE_CATEGORIES = ['Sneakers'];
export const CLOTHING_CATEGORIES = CATEGORIES.filter(
  (c) => !ACCESSORY_CATEGORIES.includes(c) && !SHOE_CATEGORIES.includes(c)
);

export const SHOP_PILLS = ['All', 'New Arrivals', 'Clothing', 'Hoodies', 'T-Shirts', 'Pants', 'Jackets', 'Accessories', 'Shoes', 'Sale'];

export function matchesPill(p, pill) {
  switch (pill) {
    case 'All':
      return true;
    case 'New Arrivals':
      return p.isNew;
    case 'Clothing':
      return CLOTHING_CATEGORIES.includes(p.category);
    case 'Pants':
      return PANTS_CATEGORIES.includes(p.category);
    case 'Accessories':
      return ACCESSORY_CATEGORIES.includes(p.category);
    case 'Shoes':
      return SHOE_CATEGORIES.includes(p.category);
    case 'Sale':
      return p.onSale;
    default:
      return p.category === pill;
  }
}

export function getProductById(id) {
  return PRODUCTS.find((p) => p.id === id);
}

export function getRelatedProducts(product, limit = 4) {
  return PRODUCTS.filter((p) => p.id !== product.id && p.category === product.category).slice(0, limit);
}

export const ALL_SIZES = Array.from(new Set(PRODUCTS.flatMap((p) => p.sizes)));
export const ALL_COLORS_LIST = Array.from(new Set(PRODUCTS.flatMap((p) => p.colors)));
