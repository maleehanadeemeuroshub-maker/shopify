import { Lock, RefreshCw, Sparkles, Truck } from 'lucide-react';
import Marquee from '../components/Marquee.jsx';
import './TrustMarquee.css';

const ITEMS = [
  <>
    <Truck size={13} /> Free shipping over $100
  </>,
  <>
    <RefreshCw size={13} /> 30-day free returns
  </>,
  <>
    <Lock size={13} /> Secure checkout
  </>,
  <>
    <Sparkles size={13} /> New drops every week
  </>,
];

export default function TrustMarquee() {
  return (
    <div className="trust-marquee">
      <Marquee items={ITEMS} speed={26} separator="/" />
    </div>
  );
}
