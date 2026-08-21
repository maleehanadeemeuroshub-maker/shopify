import { Check, X } from 'lucide-react';
import './OrderProgress.css';

const STEPS = [
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'processing', label: 'Processing' },
  { key: 'shipped', label: 'Shipped' },
  { key: 'delivered', label: 'Delivered' },
];

export default function OrderProgress({ status = 'confirmed' }) {
  if (status === 'cancelled') {
    return (
      <div className="order-progress order-progress--cancelled">
        <span className="order-progress__cancelled-icon">
          <X size={13} />
        </span>
        <span>This order was cancelled.</span>
      </div>
    );
  }

  const activeIndex = Math.max(0, STEPS.findIndex((s) => s.key === status));

  return (
    <div className="order-progress">
      {STEPS.map((step, i) => {
        const done = i < activeIndex;
        const current = i === activeIndex;
        return (
          <div className={`order-progress__step ${done ? 'is-done' : ''} ${current ? 'is-current' : ''}`} key={step.key}>
            {i < STEPS.length - 1 && <span className="order-progress__line" />}
            <span className="order-progress__dot">{done ? <Check size={12} /> : i + 1}</span>
            <span className="order-progress__label">{step.label}</span>
          </div>
        );
      })}
    </div>
  );
}
