import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import Modal from './Modal.jsx';
import ProductImage from './ProductImage.jsx';
import StarRating from './StarRating.jsx';
import MagneticButton from './MagneticButton.jsx';
import { ColorSelector, SizeSelector, QuantitySelector } from './ProductSelectors.jsx';
import { useQuickView } from '../context/QuickViewContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { getProductById } from '../data/products.js';
import { formatPrice, discountPercent } from '../utils/format.js';
import './QuickViewModal.css';

export default function QuickViewModal() {
  const { productId, close } = useQuickView();
  const { addItem, openDrawer } = useCart();

  // Keep rendering the last-viewed product's content while the modal
  // animates closed, instead of unmounting it the instant productId clears.
  const [product, setProduct] = useState(null);

  const [color, setColor] = useState(null);
  const [size, setSize] = useState(null);
  const [qty, setQty] = useState(1);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    if (!productId) return;
    const next = getProductById(productId);
    setProduct(next);
    if (next) {
      setColor(next.colors[0]);
      setSize(next.sizes[0]);
      setQty(1);
      setActiveImage(0);
    }
  }, [productId]);

  if (!product) return null;

  const discount = discountPercent(product.price, product.salePrice);

  const handleAddToCart = () => {
    addItem(product, { size, color, qty });
    close();
    openDrawer();
  };

  return (
    <Modal open={Boolean(productId)} onClose={close} labelledBy="quickview-title" size="lg">
      <div className="quick-view">
        <div className="quick-view__gallery">
          <div className="quick-view__main">
            <ProductImage src={product.images[activeImage]} alt={product.name} />
            {discount > 0 && <span className="quick-view__discount">-{discount}%</span>}
          </div>
          {product.images.length > 1 && (
            <div className="quick-view__thumbs">
              {product.images.map((src, i) => (
                <button
                  key={src}
                  type="button"
                  className={i === activeImage ? 'is-active' : ''}
                  onClick={() => setActiveImage(i)}
                >
                  <ProductImage src={src} alt="" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="quick-view__info">
          <span className="quick-view__category">{product.category}</span>
          <h2 id="quickview-title">{product.name}</h2>
          <StarRating rating={product.rating} reviews={product.reviews} showValue />

          <div className="quick-view__price">
            {product.salePrice ? (
              <>
                <span className="quick-view__price-sale">{formatPrice(product.salePrice)}</span>
                <span className="quick-view__price-original">{formatPrice(product.price)}</span>
              </>
            ) : (
              <span className="quick-view__price-sale">{formatPrice(product.price)}</span>
            )}
          </div>

          <p className="quick-view__desc">{product.shortDescription}</p>

          <ColorSelector colors={product.colors} value={color} onChange={setColor} />
          <SizeSelector sizes={product.sizes} value={size} onChange={setSize} />
          <QuantitySelector value={qty} onChange={setQty} max={product.stock} />

          <div className="quick-view__ctas">
            <MagneticButton variant="solid" onClick={handleAddToCart} disabled={product.stock <= 0}>
              <ShoppingBag size={16} /> {product.stock <= 0 ? 'Sold Out' : 'Add to Cart'}
            </MagneticButton>
            <Link to={`/product/${product.id}`} className="quick-view__fulllink" onClick={close}>
              View full details <ArrowRight size={14} />
            </Link>
          </div>
        </div>
      </div>
    </Modal>
  );
}
