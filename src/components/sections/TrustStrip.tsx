import { motion } from 'motion/react'
import { BadgeCheck, Package, ShieldCheck, Star } from 'lucide-react'
import { brands } from '../../data/catalog'
import { VelocityMarquee } from '../ui/motion'
import { CountUp, EASE } from '../ui/primitives'

// Each partner gets its own typographic treatment so the marquee reads as a wall of wordmarks
const brandStyle = [
  'font-semibold tracking-tight',
  'font-mono uppercase tracking-[0.2em] text-[0.8em]',
  'font-serif italic',
  'font-bold uppercase tracking-[0.3em] text-[0.8em]',
  'font-light tracking-[0.12em]',
  'font-black italic tracking-tight',
  'font-serif',
  'font-medium tracking-[-0.04em]',
  'font-mono font-medium uppercase text-[0.78em]',
  'font-semibold uppercase tracking-[0.42em] text-[0.72em]',
]

const stats = [
  { icon: Package, value: 120, suffix: 'k+', label: 'Machines delivered', note: 'across 40 countries' },
  { icon: Star, value: 4.9, decimals: 1, suffix: '/5', label: 'Average rating', note: '38,200 verified reviews' },
  { icon: BadgeCheck, value: 100, suffix: '%', label: 'Genuine hardware', note: 'authorised partner of 10 brands' },
  { icon: ShieldCheck, value: 2, suffix: '-yr', label: 'Noctis warranty', note: 'on top of the maker’s' },
]

export function TrustStrip() {
  return (
    <section id="trust" className="relative border-y border-white/[0.06] bg-coal/60 py-12 md:py-16" aria-label="Partners and trust">
      {/* travelling light along the top edge */}
      <div aria-hidden className="absolute inset-x-0 -top-px h-px overflow-hidden">
        <div className="h-full w-1/3 animate-[sweep_6s_linear_infinite] bg-gradient-to-r from-transparent via-ember to-transparent" />
      </div>

      <p className="eyebrow mb-8 text-center">Authorised partner of the makers you trust</p>
      <VelocityMarquee className="[mask-image:linear-gradient(90deg,transparent,black_12%,black_88%,transparent)]">
        <div className="flex items-center">
          {brands.map((b, i) => (
            <span key={i} className="flex items-center">
              <span
                className={`px-8 text-[1.65rem] text-bone/40 transition-colors duration-500 hover:text-bone md:px-12 md:text-[2rem] ${brandStyle[i % brands.length]}`}
              >
                {b}
              </span>
              <span className="text-ember/60">✦</span>
            </span>
          ))}
        </div>
      </VelocityMarquee>

      <div className="mx-auto mt-12 grid max-w-[1520px] grid-cols-2 section-pad md:mt-16 lg:grid-cols-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-10% 0px' }}
            transition={{ duration: 0.9, delay: i * 0.08, ease: EASE }}
            className={`group relative px-2 py-6 sm:px-6 lg:py-2 ${i % 2 ? 'border-l' : ''} ${i > 1 ? 'max-lg:border-t' : ''} ${i === 2 ? 'lg:border-l' : ''} hairline`}
          >
            <s.icon className="mb-4 h-5 w-5 text-ember transition-transform duration-500 group-hover:-translate-y-1 group-hover:rotate-[-8deg]" strokeWidth={1.5} />
            <p className="text-[clamp(2rem,4vw,3.25rem)] font-medium leading-none tracking-[-0.04em]">
              <CountUp to={s.value} decimals={s.decimals} suffix={s.suffix} />
            </p>
            <p className="mt-3 text-sm text-bone">{s.label}</p>
            <p className="mt-0.5 text-xs text-mist">{s.note}</p>
          </motion.div>
        ))}
      </div>
    </section>
  )
}
