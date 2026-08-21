import { ArrowRight, ArrowLeft, Quote } from 'lucide-react';
import { Link } from 'react-router-dom';
import KineticGrid from '../components/ui/kinetic-grid.tsx';
import MagneticButton from '../components/MagneticButton.jsx';
import { useModal } from '../context/ModalContext.jsx';

const STATS = [
  { value: '2019', label: 'Founded by three friends selling out of a garage' },
  { value: '150+', label: 'Product editions shipped every year' },
  { value: '2.4M', label: 'Storefronts built on GENZ-WEARS worldwide' },
];

export default function WhyGenzWears() {
  const { openAuth } = useModal();

  return (
    <KineticGrid globalColor="default">
      <div className="mx-auto flex min-h-screen max-w-4xl flex-col justify-center px-6 py-32 sm:px-10">
        <Link
          to="/"
          className="mb-10 inline-flex w-fit items-center gap-2 text-sm font-medium text-white/55 transition-colors hover:text-white"
        >
          <ArrowLeft size={15} /> Back to home
        </Link>

        <span className="mb-5 inline-flex w-fit items-center gap-2 rounded-full border border-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-brand-green">
          Our story
        </span>

        <h1 className="max-w-2xl font-display text-4xl font-semibold leading-[1.08] tracking-tight text-white sm:text-6xl">
          Why we build GENZ-WEARS
        </h1>

        <p className="mt-6 max-w-xl text-base leading-relaxed text-white/55 sm:text-lg">
          We started GENZ-WEARS because every commerce platform we tried felt built
          for someone else&apos;s brand. So we built the one we wished existed: fast enough
          to launch a drop overnight, sturdy enough to run it at scale.
        </p>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-3">
          {STATS.map((s) => (
            <div key={s.label} className="border-l border-white/15 pl-4">
              <div className="font-display text-2xl font-bold text-white">{s.value}</div>
              <div className="mt-1 text-sm leading-snug text-white/45">{s.label}</div>
            </div>
          ))}
        </div>

        <div className="mt-14 rounded-2xl border border-white/10 bg-white/[0.03] p-7 backdrop-blur-sm sm:p-9">
          <Quote className="mb-4 text-brand-green" size={22} />
          <p className="font-display text-xl font-medium leading-snug text-white sm:text-2xl">
            &ldquo;We&apos;re not trying to be the biggest commerce platform. We&apos;re trying to be the
            one that never gets in your way.&rdquo;
          </p>
          <div className="mt-5 flex items-center gap-3">
            <div
              className="h-11 w-11 shrink-0 rounded-full bg-cover bg-center"
              style={{
                backgroundImage:
                  "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&q=80')",
                backgroundColor: '#1c211e',
              }}
            />
            <div>
              <div className="text-sm font-semibold text-white">Rae Okafor</div>
              <div className="text-xs text-white/45">Co-founder &amp; CEO, GENZ-WEARS</div>
            </div>
          </div>
        </div>

        <div className="mt-14 flex flex-wrap items-center gap-4">
          <MagneticButton variant="solid" onClick={() => openAuth('signup')}>
            Start for free <ArrowRight size={16} />
          </MagneticButton>
          <MagneticButton as={Link} to="/enterprise" variant="outline">
            Talk to our team
          </MagneticButton>
        </div>
      </div>
    </KineticGrid>
  );
}
