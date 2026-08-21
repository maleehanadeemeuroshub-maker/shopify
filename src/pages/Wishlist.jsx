import { Link } from 'react-router-dom';
import { ArrowRight, Heart } from 'lucide-react';
import ProductCard from '../components/ProductCard.jsx';
import MagneticButton from '../components/MagneticButton.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { PRODUCTS } from '../data/products.js';
import './Wishlist.css';

export default function Wishlist() {
  const { ids } = useWishlist();
  const products = PRODUCTS.filter((p) => ids.includes(p.id));

  if (products.length === 0) {
    return (
      <div className="wishlist-page wishlist-page--empty container">
        <Heart size={40} strokeWidth={1.2} />
        <h1>Your wishlist is empty</h1>
        <p>Save the pieces you love and find them here later.</p>
        <MagneticButton as={Link} to="/shop" variant="solid">
          Explore the Shop <ArrowRight size={16} />
        </MagneticButton>
      </div>
    );
  }

  return (
    <div className="wishlist-page container">
      <h1>Your Wishlist</h1>
      <p className="wishlist-page__count">{products.length} saved item{products.length > 1 ? 's' : ''}</p>
      <div className="wishlist-page__grid">
        {products.map((product) => (
          <ProductCard product={product} key={product.id} />
        ))}
      </div>
    </div>
  );
}
