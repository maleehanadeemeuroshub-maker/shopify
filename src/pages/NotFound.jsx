import { Link } from 'react-router-dom';
import { ArrowRight, Compass } from 'lucide-react';
import MagneticButton from '../components/MagneticButton.jsx';
import './NotFound.css';

export default function NotFound() {
  return (
    <div className="not-found container">
      <Compass size={40} strokeWidth={1.2} />
      <span className="eyebrow">404</span>
      <h1>This page doesn&apos;t exist</h1>
      <p>The link may be broken, or the page may have moved.</p>
      <MagneticButton as={Link} to="/" variant="solid">
        Back to Home <ArrowRight size={16} />
      </MagneticButton>
    </div>
  );
}
