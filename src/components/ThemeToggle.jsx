import { AnimatePresence, motion } from 'framer-motion';
import { Monitor, Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext.jsx';
import './ThemeToggle.css';

const ORDER = ['light', 'dark', 'system'];
const ICONS = { light: Sun, dark: Moon, system: Monitor };
const LABELS = { light: 'Light theme', dark: 'Dark theme', system: 'Match system theme' };

export default function ThemeToggle({ className = '' }) {
  const { preference, setThemePreference } = useTheme();
  const Icon = ICONS[preference];

  const cycle = () => {
    const next = ORDER[(ORDER.indexOf(preference) + 1) % ORDER.length];
    setThemePreference(next);
  };

  return (
    <button
      type="button"
      className={`theme-toggle ${className}`}
      onClick={cycle}
      aria-label={`${LABELS[preference]} — click to change`}
      title={LABELS[preference]}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={preference}
          className="theme-toggle__icon"
          initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <Icon size={18} />
        </motion.span>
      </AnimatePresence>
    </button>
  );
}
