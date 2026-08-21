import { motion } from 'framer-motion';
import { Award, Lock, RefreshCw, Truck } from 'lucide-react';
import './WhyChooseUs.css';

const POINTS = [
  { icon: Award, title: 'Premium Quality', copy: 'Heavyweight fabrics and construction built to outlast a season.' },
  { icon: Truck, title: 'Fast Delivery', copy: 'Standard and express shipping options, dispatched within 24 hours.' },
  { icon: RefreshCw, title: 'Easy Returns', copy: '30-day returns on unworn items — no questions asked.' },
  { icon: Lock, title: 'Secure Checkout', copy: 'Your information stays protected from cart to confirmation.' },
];

export default function WhyChooseUs() {
  return (
    <section className="why-us">
      <div className="container">
        <div className="why-us__grid">
          {POINTS.map((p, i) => (
            <motion.div
              className="why-us__item"
              key={p.title}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.5, delay: i * 0.08, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="why-us__icon">
                <p.icon size={20} strokeWidth={1.6} />
              </span>
              <h3>{p.title}</h3>
              <p>{p.copy}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
