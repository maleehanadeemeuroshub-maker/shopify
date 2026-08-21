import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import './Newsletter.css';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.includes('@')) return;
    setSubscribed(true);
  };

  return (
    <section className="newsletter">
      <motion.div
        className="container newsletter__inner"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, amount: 0.5 }}
        transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      >
        <div>
          <span className="eyebrow">Stay in the loop</span>
          <h2>Join the community</h2>
          <p>New drops, restocks, and members-only offers — straight to your inbox.</p>
        </div>

        {subscribed ? (
          <div className="newsletter__success">
            <CheckCircle2 size={18} /> You&apos;re on the list — welcome to GENZ-WEARS.
          </div>
        ) : (
          <form className="newsletter__form" onSubmit={handleSubmit}>
            <input
              type="email"
              required
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit">
              Subscribe <ArrowRight size={15} />
            </button>
          </form>
        )}
      </motion.div>
    </section>
  );
}
