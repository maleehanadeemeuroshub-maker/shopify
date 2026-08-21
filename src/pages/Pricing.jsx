import { motion } from 'framer-motion';
import LuminousPricingSection from '../components/ui/luminous-pricing.tsx';
import { useModal } from '../context/ModalContext.jsx';
import './Pricing.css';

export default function Pricing() {
  const { openAuth } = useModal();

  return (
    <div className="pricing-page">
      <motion.div
        className="pricing-page__intro container"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      >
        <span className="eyebrow">Simple, transparent pricing</span>
        <h1>Plans built for every drop</h1>
        <p>Start free, upgrade when you&apos;re ready to scale. No hidden fees, cancel anytime.</p>
      </motion.div>

      <LuminousPricingSection onChoosePlan={() => openAuth('signup')} />
    </div>
  );
}
