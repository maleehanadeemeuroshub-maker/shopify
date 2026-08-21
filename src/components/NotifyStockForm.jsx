import { useState } from 'react';
import { Bell, Check } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { isSubscribed, subscribeToRestock } from '../utils/stockNotify.js';
import './NotifyStockForm.css';

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function NotifyStockForm({ productId }) {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [email, setEmail] = useState(user?.email ?? '');
  const [subscribed, setSubscribed] = useState(() => (user?.email ? isSubscribed(productId, user.email) : false));
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setError('Enter a valid email address.');
      return;
    }
    subscribeToRestock(productId, email);
    setSubscribed(true);
    setError('');
    showToast("You're on the list — we'll email you when this is back in stock.");
  };

  if (subscribed) {
    return (
      <div className="notify-stock notify-stock--done">
        <Check size={14} /> We&apos;ll email you when this restocks.
      </div>
    );
  }

  return (
    <form className="notify-stock" onSubmit={handleSubmit}>
      <div className="notify-stock__field">
        <Bell size={14} />
        <input
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value);
            setError('');
          }}
          placeholder="you@example.com"
        />
      </div>
      <button type="submit">Notify Me</button>
      {error && <p className="notify-stock__error">{error}</p>}
    </form>
  );
}
