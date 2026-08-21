import { ArrowLeft, ArrowRight, Gauge, LifeBuoy, Layers, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import KineticGrid from '../components/ui/kinetic-grid.tsx';
import MagneticButton from '../components/MagneticButton.jsx';
import { useModal } from '../context/ModalContext.jsx';

const CAPABILITIES = [
  {
    icon: ShieldCheck,
    title: 'Enterprise-grade security',
    copy: 'SOC 2 Type II, SSO/SAML, and granular role-based access across every store.',
  },
  {
    icon: Layers,
    title: 'Custom integrations',
    copy: 'Connect your ERP, PIM, and warehouse systems with a dedicated integrations team.',
  },
  {
    icon: Gauge,
    title: '99.98% uptime SLA',
    copy: 'Multi-region infrastructure built to survive your biggest drop day.',
  },
  {
    icon: LifeBuoy,
    title: 'Priority support',
    copy: 'A named solutions engineer and sub-hour response times, around the clock.',
  },
];

export default function Enterprise() {
  const { openAuth } = useModal();

  return (
    <KineticGrid globalColor="monochrome">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-32 sm:px-10">
        <Link
          to="/"
          className="mb-10 inline-flex w-fit items-center gap-2 text-sm font-medium text-white/55 transition-colors hover:text-white"
        >
          <ArrowLeft size={15} /> Back to home
        </Link>

        <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-white/70">
          GENZ-WEARS for Enterprise
        </span>

        <h1 className="max-w-2xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl">
          Built for brands that can&apos;t afford downtime
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/55 sm:text-lg">
          Whatever your size, complexity, or ambition — get the infrastructure,
          security, and support to match. Talk to our team about a plan built
          around your stack.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-5 sm:grid-cols-2">
          {CAPABILITIES.map(({ icon: Icon, title, copy }) => (
            <div
              key={title}
              className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur-sm"
            >
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-white">
                <Icon size={18} strokeWidth={1.8} />
              </div>
              <h3 className="font-display text-base font-semibold text-white">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-white/50">{copy}</p>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-4">
          <MagneticButton variant="solid" onClick={() => openAuth('signup')}>
            Get in touch <ArrowRight size={16} />
          </MagneticButton>
          <MagneticButton as={Link} to="/why-genzwears" variant="outline">
            Why we build GENZ-WEARS
          </MagneticButton>
        </div>
      </div>
    </KineticGrid>
  );
}
