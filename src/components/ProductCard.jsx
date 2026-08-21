import { Eye, Heart, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import ProductImage from './ProductImage.jsx';
import StarRating from './StarRating.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useQuickView } from '../context/QuickViewContext.jsx';
import { formatPrice, discountPercent } from '../utils/format.js';
import './ProductCard.css';

export default function ProductCard({ product }) {
  const { has, toggle } = useWishlist();
  const { addItem } = useCart();
  const { open: openQuickView } = useQuickView();
  const wished = has(product.id);
  const discount = discountPercent(product.price, product.salePrice);
  const outOfStock = product.stock <= 0;

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (outOfStock) return;
    addItem(product, { size: product.sizes[0], color: product.colors[0], qty: 1 });
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggle(product.id);
  };

  const handleQuickView = (e) => {
    e.preventDefault();
    e.stopPropagation();
    openQuickView(product.id);
  };

  return (
    <Link to={`/product/${product.id}`} className="product-card">
      <div className="product-card__media">
        <ProductImage src={product.images[0]} alt={product.name} className="product-card__img product-card__img--front" />
        {product.images[1] && (
          <ProductImage src={product.images[1]} alt={`${product.name} alternate view`} className="product-card__img product-card__img--back" />
        )}

        <div className="product-card__badges">
          {product.isNew && <span className="product-card__badge product-card__badge--new">New</span>}
          {discount > 0 && <span className="product-card__badge product-card__badge--sale">-{discount}%</span>}
          {outOfStock && <span className="product-card__badge product-card__badge--out">Sold Out</span>}
        </div>

        <div className="product-card__actions">
          <button
            type="button"
            className={`product-card__wishlist ${wished ? 'is-active' : ''}`}
            onClick={handleWishlist}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
          >
            <Heart size={16} fill={wished ? 'currentColor' : 'none'} strokeWidth={1.8} />
          </button>
          <button type="button" className="product-card__quickview-btn" onClick={handleQuickView} aria-label="Quick view">
            <Eye size={16} strokeWidth={1.8} />
          </button>
        </div>

        <button type="button" className="product-card__quickadd" onClick={handleQuickAdd} disabled={outOfStock}>
          <Plus size={14} /> {outOfStock ? 'Sold Out' : 'Quick Add'}
        </button>
      </div>

      <div className="product-card__info">
        <span className="product-card__category">{product.category}</span>
        <h3 className="product-card__name">{product.name}</h3>
        <StarRating rating={product.rating} reviews={product.reviews} size={11} />
        <div className="product-card__price">
          {product.salePrice ? (
            <>
              <span className="product-card__price-sale">{formatPrice(product.salePrice)}</span>
              <span className="product-card__price-original">{formatPrice(product.price)}</span>
            </>
          ) : (
            <span className="product-card__price-sale">{formatPrice(product.price)}</span>
          )}
        </div>
      </div>
    </Link>
  );
}
