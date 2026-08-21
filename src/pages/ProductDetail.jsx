import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, Flame, Heart, RefreshCw, ShieldCheck, ShoppingBag, Truck, ZoomIn } from 'lucide-react';
import ProductImage from '../components/ProductImage.jsx';
import StarRating from '../components/StarRating.jsx';
import MagneticButton from '../components/MagneticButton.jsx';
import Accordion from '../components/Accordion.jsx';
import Modal from '../components/Modal.jsx';
import ProductRail from '../components/ProductRail.jsx';
import ReviewsSection from '../components/ReviewsSection.jsx';
import NotifyStockForm from '../components/NotifyStockForm.jsx';
import FrequentlyBoughtTogether from '../components/FrequentlyBoughtTogether.jsx';
import { ColorSelector, SizeSelector, QuantitySelector } from '../components/ProductSelectors.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useProductReviews } from '../hooks/useProductReviews.js';
import { getProductById, getRelatedProducts } from '../data/products.js';
import { formatPrice, discountPercent } from '../utils/format.js';
import { recordView, getRecentlyViewedIds } from '../utils/recentlyViewed.js';
import { getViewerCount, getSoldTodayCount } from '../utils/socialProof.js';
import './ProductDetail.css';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const product = getProductById(id);

  const { addItem, closeDrawer } = useCart();
  const { has, toggle } = useWishlist();

  const [activeImage, setActiveImage] = useState(0);
  const [color, setColor] = useState(product?.colors[0]);
  const [size, setSize] = useState(product?.sizes[0]);
  const [qty, setQty] = useState(1);
  const [sizeGuideOpen, setSizeGuideOpen] = useState(false);
  const [zoomStyle, setZoomStyle] = useState({});
  const [zooming, setZooming] = useState(false);
  const [recentlyViewed, setRecentlyViewed] = useState([]);
  const mediaRef = useRef(null);

  useEffect(() => {
    if (product) {
      setActiveImage(0);
      setColor(product.colors[0]);
      setSize(product.sizes[0]);
      setQty(1);

      const ids = getRecentlyViewedIds(product.id);
      setRecentlyViewed(ids.map(getProductById).filter(Boolean).slice(0, 8));
      recordView(product.id);
    }
    window.scrollTo(0, 0);
  }, [product]);

  const related = useMemo(() => (product ? getRelatedProducts(product) : []), [product]);
  const { average: reviewAverage, count: reviewCount } = useProductReviews(product);
  const fbtSuggestions = useMemo(() => related.filter((p) => p.stock > 0).slice(0, 2), [related]);

  if (!product) {
    return (
      <div className="pdp-not-found container">
        <h1>Product not found</h1>
        <p>We couldn&apos;t find the product you&apos;re looking for.</p>
        <MagneticButton as={Link} to="/shop" variant="solid">
          Back to Shop
        </MagneticButton>
      </div>
    );
  }

  const discount = discountPercent(product.price, product.salePrice);
  const outOfStock = product.stock <= 0;
  const wished = has(product.id);
  const viewerCount = getViewerCount(product.id);
  const soldToday = getSoldTodayCount(product.id);

  const handleMouseMove = (e) => {
    const rect = mediaRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%` });
  };

  const handleAddToCart = () => addItem(product, { size, color, qty });

  const handleBuyNow = () => {
    addItem(product, { size, color, qty });
    closeDrawer();
    navigate('/checkout');
  };

  const accordionItems = [
    { title: 'Description', content: <p>{product.description}</p> },
    { title: 'Materials', content: <p>{product.material}</p> },
    {
      title: 'Size & Fit',
      content: (
        <p>
          This piece is cut for a true-to-size, relaxed fit. If you&apos;re between sizes, we recommend sizing down for a
          slimmer look or sizing up for extra room to layer.
        </p>
      ),
    },
    {
      title: 'Shipping Information',
      content: (
        <ul>
          <li>Standard Delivery: 4–6 business days</li>
          <li>Express Delivery: 1–2 business days</li>
          <li>Free standard shipping on orders over $100</li>
          <li>Orders are processed within 24 hours on business days</li>
        </ul>
      ),
    },
    {
      title: 'Returns & Exchanges',
      content: (
        <p>
          Not the right fit? Returns are accepted within 30 days of delivery, provided the item is unworn with tags
          attached. Exchanges ship free — just start a return from your account and select &ldquo;Exchange&rdquo;.
        </p>
      ),
    },
    {
      title: 'Care Instructions',
      content: (
        <ul>
          <li>Machine wash cold, inside out, with like colors</li>
          <li>Do not bleach</li>
          <li>Tumble dry low or hang to dry</li>
          <li>Do not iron directly on printed or embroidered areas</li>
        </ul>
      ),
    },
  ];

  return (
    <div className="pdp container">
      <nav className="pdp-breadcrumb">
        <Link to="/">Home</Link> / <Link to="/shop">Shop</Link> /{' '}
        <Link to={`/shop?category=${encodeURIComponent(product.category)}`}>{product.category}</Link> /{' '}
        <span>{product.name}</span>
      </nav>

      <div className="pdp-layout">
        <div className="pdp-gallery">
          <div
            className="pdp-gallery__main"
            ref={mediaRef}
            onMouseEnter={() => setZooming(true)}
            onMouseLeave={() => setZooming(false)}
            onMouseMove={handleMouseMove}
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={activeImage}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="pdp-gallery__frame"
              >
                <ProductImage
                  src={product.images[activeImage]}
                  alt={product.name}
                  className={zooming ? 'is-zoomed' : ''}
                  style={zooming ? zoomStyle : undefined}
                />
              </motion.div>
            </AnimatePresence>
            {discount > 0 && <span className="pdp-gallery__badge">-{discount}%</span>}
            <span className="pdp-gallery__zoomhint">
              <ZoomIn size={13} /> Hover to zoom
            </span>
          </div>

          <div className="pdp-gallery__thumbs">
            {product.images.map((src, i) => (
              <button
                key={src}
                type="button"
                className={i === activeImage ? 'is-active' : ''}
                onClick={() => setActiveImage(i)}
              >
                <ProductImage src={src} alt={`${product.name} view ${i + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="pdp-info">
          <span className="pdp-info__category">{product.category}</span>
          <h1>{product.name}</h1>

          <a href="#reviews" className="pdp-info__rating">
            <StarRating rating={reviewAverage} reviews={reviewCount} showValue />
          </a>

          <div className="pdp-info__price">
            {product.salePrice ? (
              <>
                <span className="pdp-info__price-sale">{formatPrice(product.salePrice)}</span>
                <span className="pdp-info__price-original">{formatPrice(product.price)}</span>
                <span className="pdp-info__discount">Save {discount}%</span>
              </>
            ) : (
              <span className="pdp-info__price-sale">{formatPrice(product.price)}</span>
            )}
          </div>

          <p className="pdp-info__short">{product.shortDescription}</p>

          <div className="pdp-info__selectors">
            <ColorSelector colors={product.colors} value={color} onChange={setColor} />
            <SizeSelector sizes={product.sizes} value={size} onChange={setSize} onSizeGuide={() => setSizeGuideOpen(true)} />
            <QuantitySelector value={qty} onChange={setQty} max={product.stock} />
          </div>

          <div className="pdp-info__stock">
            {outOfStock ? (
              <span className="pdp-info__stock--out">Out of stock</span>
            ) : product.stock <= 5 ? (
              <span className="pdp-info__stock--low">
                <Flame size={13} /> Only {product.stock} left in stock — selling fast
              </span>
            ) : (
              <span className="pdp-info__stock--ok">In stock, ready to ship</span>
            )}
          </div>

          {!outOfStock && (
            <p className="pdp-info__urgency">
              <Eye size={13} /> {viewerCount} viewing now · {soldToday} sold in the last 24h
            </p>
          )}

          <div className="pdp-info__ctas">
            <MagneticButton variant="solid" onClick={handleAddToCart} disabled={outOfStock}>
              <ShoppingBag size={16} /> {outOfStock ? 'Sold Out' : 'Add to Cart'}
            </MagneticButton>
            <MagneticButton variant="outline" onClick={handleBuyNow} disabled={outOfStock}>
              Buy Now
            </MagneticButton>
            <button
              type="button"
              className={`pdp-info__wishlist ${wished ? 'is-active' : ''}`}
              onClick={() => toggle(product.id)}
              aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={18} fill={wished ? 'currentColor' : 'none'} />
            </button>
          </div>

          {outOfStock && <NotifyStockForm productId={product.id} />}

          <div className="pdp-info__trust">
            <div>
              <Truck size={16} /> Free shipping over $100
            </div>
            <div>
              <RefreshCw size={16} /> 30-day returns
            </div>
            <div>
              <ShieldCheck size={16} /> Secure checkout
            </div>
          </div>

          <p className="pdp-info__sku">SKU: {product.sku}</p>

          <Accordion items={accordionItems} />
        </div>
      </div>

      <FrequentlyBoughtTogether mainProduct={product} suggestions={fbtSuggestions} />

      <ReviewsSection product={product} />

      {related.length > 0 && (
        <ProductRail
          eyebrow="You may also like"
          title="Complete the look"
          products={related}
          viewAllHref={`/shop?category=${encodeURIComponent(product.category)}`}
        />
      )}

      {recentlyViewed.length > 0 && (
        <ProductRail eyebrow="Your history" title="Recently Viewed" products={recentlyViewed} />
      )}

      <Modal open={sizeGuideOpen} onClose={() => setSizeGuideOpen(false)} labelledBy="size-guide-title">
        <div className="size-guide">
          <h2 id="size-guide-title">Size Guide</h2>
          <p>Measurements in inches. If you&apos;re between sizes, we recommend sizing up.</p>
          <div className="size-guide__table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Size</th>
                  <th>Chest</th>
                  <th>Waist</th>
                  <th>Length</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td>XS</td>
                  <td>34–36</td>
                  <td>28–30</td>
                  <td>26</td>
                </tr>
                <tr>
                  <td>S</td>
                  <td>36–38</td>
                  <td>30–32</td>
                  <td>27</td>
                </tr>
                <tr>
                  <td>M</td>
                  <td>39–41</td>
                  <td>33–35</td>
                  <td>28</td>
                </tr>
                <tr>
                  <td>L</td>
                  <td>42–44</td>
                  <td>36–38</td>
                  <td>29</td>
                </tr>
                <tr>
                  <td>XL</td>
                  <td>45–47</td>
                  <td>39–41</td>
                  <td>30</td>
                </tr>
                <tr>
                  <td>XXL</td>
                  <td>48–50</td>
                  <td>42–44</td>
                  <td>31</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Modal>
    </div>
  );
}
