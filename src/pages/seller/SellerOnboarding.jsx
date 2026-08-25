import { useState } from 'react';
import { Navigate } from 'react-router-dom';
import { DollarSign, Package, TrendingUp } from 'lucide-react';
import MagneticButton from '../../components/MagneticButton.jsx';
import { useAuth } from '../../context/AuthContext.jsx';
import { useModal } from '../../context/ModalContext.jsx';
import './Seller.css';

export default function SellerOnboarding() {
  const { user, ready, becomeSeller } = useAuth();
  const { openAuth } = useModal();
  const [submitting, setSubmitting] = useState(false);

  if (!ready) return null;
  if (user?.role === 'seller' || user?.role === 'admin') return <Navigate to="/seller" replace />;

  const handleClick = async () => {
    if (!user) {
      openAuth('signup');
      return;
    }
    setSubmitting(true);
    await becomeSeller();
    setSubmitting(false);
  };

  return (
    <div className="seller-onboarding container">
      <div className="seller-onboarding__hero">
        <span className="eyebrow">Sell on GENZ-WEARS</span>
        <h1>Turn your designs into a storefront.</h1>
        <p>
          List products, manage inventory, and track real orders and revenue — all from your own seller dashboard,
          right alongside the full GENZ-WEARS catalog.
        </p>
        <MagneticButton variant="solid" onClick={handleClick} disabled={submitting}>
          {submitting ? 'Setting up your store…' : user ? 'Become a Seller' : 'Sign Up to Start Selling'}
        </MagneticButton>
      </div>

      <div className="seller-onboarding__grid">
        <div className="seller-onboarding__card">
          <Package size={22} strokeWidth={1.4} />
          <h3>List Products</h3>
          <p>Add and manage your own catalog — full control over pricing, variants, and inventory.</p>
        </div>
        <div className="seller-onboarding__card">
          <DollarSign size={22} strokeWidth={1.4} />
          <h3>Track Revenue</h3>
          <p>Real-time sales, order history, and performance stats from your seller dashboard.</p>
        </div>
        <div className="seller-onboarding__card">
          <TrendingUp size={22} strokeWidth={1.4} />
          <h3>Grow Your Reach</h3>
          <p>Your products appear right alongside the full GENZ-WEARS catalog — no separate storefront needed.</p>
        </div>
      </div>
    </div>
  );
}
