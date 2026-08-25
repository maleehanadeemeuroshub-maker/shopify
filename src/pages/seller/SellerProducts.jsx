import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Pencil, Trash2 } from 'lucide-react';
import ProductImage from '../../components/ProductImage.jsx';
import { productsApi } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { formatPrice } from '../../utils/format.js';
import './Seller.css';

export default function SellerProducts() {
  const { showToast } = useToast();
  const [products, setProducts] = useState(null);

  const load = () => productsApi.mine().then((res) => res.ok && setProducts(res.products));

  useEffect(() => {
    load();
  }, []);

  const handleDelete = async (product) => {
    if (!window.confirm(`Remove "${product.name}" from your store? It will no longer be visible to shoppers.`)) return;
    const res = await productsApi.remove(product.id);
    if (res.ok) {
      showToast('Product removed.');
      load();
    } else {
      showToast(res.error || 'Could not remove product.', { tone: 'error' });
    }
  };

  if (!products) return null;

  return (
    <div className="seller container">
      <div className="seller__head">
        <h1>Your Products</h1>
        <Link to="/seller/products/new" className="seller__cta">
          + Add Product
        </Link>
      </div>

      <nav className="seller__tabs">
        <Link to="/seller">Overview</Link>
        <Link to="/seller/products" className="is-active">
          Products
        </Link>
        <Link to="/seller/orders">Orders</Link>
      </nav>

      <div className="seller__panel">
        {products.length === 0 ? (
          <p className="seller__empty">You haven&apos;t listed any products yet.</p>
        ) : (
          <div className="seller__product-table">
            {products.map((p) => (
              <div className="seller__product-row" key={p.id}>
                <div className="seller__product-img">
                  <ProductImage src={p.images[0]} alt={p.name} />
                </div>
                <div className="seller__product-info">
                  <strong>{p.name}</strong>
                  <span>{p.category}</span>
                </div>
                <span className="seller__product-price">{formatPrice(p.salePrice ?? p.price)}</span>
                <span className={`seller__product-stock ${p.stock === 0 ? 'is-out' : ''}`}>
                  {p.stock === 0 ? 'Out of stock' : `${p.stock} in stock`}
                </span>
                <span className={`seller__product-status ${p.active ? 'is-active' : 'is-inactive'}`}>
                  {p.active ? 'Active' : 'Hidden'}
                </span>
                <div className="seller__product-actions">
                  <Link to={`/seller/products/${p.id}/edit`} aria-label="Edit product">
                    <Pencil size={15} />
                  </Link>
                  <button type="button" onClick={() => handleDelete(p)} aria-label="Delete product">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
