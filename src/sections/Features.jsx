import { motion } from 'framer-motion';
import { Sparkles, ArrowRight } from 'lucide-react';
import BorderBeamPanel from '../components/ui/border-beam-panel.tsx';
import { useModal } from '../context/ModalContext.jsx';
import './Features.css';

const CARDS = [
  {
    title: 'Get started fast',
    copy: 'You could be selling by tomorrow.',
    image: 'https://images.unsplash.com/photo-1607082349566-187342175e2f?w=600&q=80',
  },
  {
    title: 'Switch to GENZ-WEARS',
    copy: 'Get more customers. Make more sales.',
    image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&q=80',
  },
  {
    title: 'Trusted by enterprise brands',
    copy: 'No matter your size, complexity, or ambition.',
    image: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=600&q=80',
  },
];

const viewport = { once: true, amount: 0.3 };

export default function Features() {
  const { openAuth } = useModal();

  return (
    <section className="features" id="features">
      <div className="container features__grid">
        <div className="features__cards">
          {CARDS.map((c, i) => (
            <motion.div
              className="fcard"
              key={c.title}
              initial={{ opacity: 0, y: 36 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={viewport}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -6 }}
            >
              <BorderBeamPanel className="fcard__beam p-0 border-0 bg-transparent" radius={16} thickness={1.6} beams={2} glow>
                <div className="fcard__img" style={{ backgroundImage: `url(${c.image})` }} />
                <div className="fcard__text">
                  <h3>{c.title}</h3>
                  <p>{c.copy}</p>
                  <button className="fcard__link" onClick={() => openAuth('signup')} type="button">
                    Learn more <ArrowRight size={13} />
                  </button>
                </div>
              </BorderBeamPanel>
            </motion.div>
          ))}
        </div>

        <motion.div
          className="side-panel"
          initial={{ opacity: 0, y: 36 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={viewport}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="eyebrow">Built into every store</div>
          <div className="shoppay-card">
            <div className="shoppay-badge">
              shop <span>Pay</span>
            </div>
            <div className="shoppay-glow" />
          </div>
          <p className="side-panel__caption">
            World&apos;s best checkout
            <span>Proven to convert better.</span>
          </p>
          <div className="mini-feature">
            <div className="mini-feature__icon">
              <Sparkles size={20} strokeWidth={1.8} />
            </div>
            <div>
              <h4>Sidekick</h4>
              <p>Your commerce-obsessed AI assistant.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
