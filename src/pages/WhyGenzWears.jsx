import { useRef } from 'react';
import { motion, useScroll } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Quote } from 'lucide-react';
import ScrollScene3D from '../components/ScrollScene3D.jsx';
import MagneticButton from '../components/MagneticButton.jsx';

const CHAPTERS = [
  {
    eyebrow: '2019',
    title: 'Three friends, one garage',
    copy: "GENZ-WEARS started as a weekend project between friends who couldn't find streetwear that actually held up. No warehouse, no investors — just a sewing machine and a stubborn idea.",
  },
  {
    eyebrow: 'Craft',
    title: 'Obsessed with the fabric first',
    copy: 'Every piece starts with the material, not the logo. Heavyweight cotton, real construction, garments built to be worn hard and wash well — because a good drop should still fit a year later.',
  },
  {
    eyebrow: 'Movement',
    title: 'Built to move, not sit in a closet',
    copy: 'We design for people who actually wear their clothes — skating, commuting, showing up. Streetwear that keeps pace instead of just looking good in a photo.',
  },
  {
    eyebrow: 'Today',
    title: 'Still three friends, just louder now',
    copy: "What hasn't changed: no gimmicks, no filler drops, no chasing trends we don't believe in. Just pieces we'd actually wear, made properly, dropped when they're ready.",
  },
];

const STATS = [
  { value: '2019', label: 'Founded by three friends in a rented garage' },
  { value: '30+', label: 'New styles shipped every season' },
  { value: '4.8★', label: 'Average rating across 2,000+ reviews' },
];

export default function WhyGenzWears() {
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: containerRef, offset: ['start start', 'end end'] });

  return (
    <div ref={containerRef} className="relative bg-[#07090a]">
      {/* Pinned for the whole scroll story via position:sticky (self-releasing —
          no fixed-position z-index bleed into the Footer below, unlike a
          position:fixed canvas would risk). The content wrapper below pulls up
          over it with a matching negative margin. */}
      <div className="sticky top-0 z-0 h-screen w-full overflow-hidden">
        <ScrollScene3D progress={scrollYProgress} className="absolute inset-0 h-full w-full" />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#07090a] via-transparent to-[#07090a]" />
      </div>

      <div className="relative z-10 -mt-[100vh]">
        <section className="flex min-h-screen flex-col justify-center px-6 sm:px-10">
          <motion.div
            className="mx-auto w-full max-w-3xl"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          >
            <Link
              to="/"
              className="mb-8 inline-flex w-fit items-center gap-2 text-sm font-medium text-white/55 transition-colors hover:text-white"
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
              Scroll to hear it from us — no pitch deck, just the honest version.
            </p>
          </motion.div>
        </section>

        {CHAPTERS.map((c, i) => (
          <section key={c.title} className="flex min-h-screen items-center px-6 sm:px-10">
            <motion.div
              className="mx-auto w-full max-w-2xl"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.5 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              <span className="mb-4 inline-block text-xs font-bold uppercase tracking-[0.2em] text-brand-green">
                {String(i + 1).padStart(2, '0')} — {c.eyebrow}
              </span>
              <h2 className="font-display text-3xl font-semibold leading-tight text-white sm:text-5xl">{c.title}</h2>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/55 sm:text-lg">{c.copy}</p>
            </motion.div>
          </section>
        ))}

        <section className="flex min-h-screen flex-col justify-center px-6 pb-24 sm:px-10">
          <motion.div
            className="mx-auto w-full max-w-3xl"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
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
                &ldquo;We&apos;re not trying to be the biggest name in streetwear. We&apos;re trying to be the one
                you actually keep wearing.&rdquo;
              </p>
              <div className="mt-5 flex items-center gap-3">
                <div
                  className="h-11 w-11 shrink-0 rounded-full bg-cover bg-center"
                  style={{
                    backgroundImage: "url('https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=200&q=80')",
                    backgroundColor: '#1c211e',
                  }}
                />
                <div>
                  <div className="text-sm font-semibold text-white">Rae Okafor</div>
                  <div className="text-xs text-white/45">Co-founder, GENZ-WEARS</div>
                </div>
              </div>
            </div>

            <div className="mt-14 flex flex-wrap items-center gap-4">
              <MagneticButton as={Link} to="/shop" variant="solid">
                Shop Now <ArrowRight size={16} />
              </MagneticButton>
              <MagneticButton as={Link} to="/enterprise" variant="outline">
                Wholesale &amp; Bulk
              </MagneticButton>
            </div>
          </motion.div>
        </section>
      </div>
    </div>
  );
}
