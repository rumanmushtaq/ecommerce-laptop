import { AnimatePresence, motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowDown, ArrowRight, Plus, Sparkles } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { formatPrice, products } from '../../data/catalog'
import { scrollToId } from '../../lib/hooks'
import { useStore } from '../../lib/store'
import { EASE, MagneticButton, Stars } from '../ui/primitives'
import { LazyImage } from '../ui/LazyImage'
import { CompanionSlot } from '../companion/CompanionSlot'
import type { VariantKey } from '../three/variants'
import { useCompanion } from '../companion/context'

// The hero laptop cycles through these designs; the travelling 3D companion morphs between them
const CYCLE: { variant: VariantKey; id: string; tag: string }[] = [
  { variant: 'noctis', id: 'noctis-studio-16', tag: 'Graphite Edition' },
  { variant: 'silver', id: 'macbook-pro-16', tag: 'Studio silver' },
  { variant: 'eclipse', id: 'rog-zephyrus-g16', tag: 'Dot-matrix gaming' },
  { variant: 'copper', id: 'spectre-x360-14', tag: 'Copper-cut convertible' },
  { variant: 'sage', id: 'surface-laptop-7', tag: 'Everyday sage' },
]
const CYCLE_MS = 4200

// Finish configurator: repaints the live 3D chassis (first entry keeps each design's own colour)
const FINISHES: { name: string; color?: string }[] = [
  { name: 'Signature' },
  { name: 'Obsidian', color: '#0d1018' },
  { name: 'Arctic Silver', color: '#c9d3e0' },
  { name: 'Glacier Cyan', color: '#3fa9c9' },
  { name: 'Nebula Violet', color: '#4b3a8f' },
  { name: 'Rose Quartz', color: '#d98aa8' },
]

/** One headline word rising out of its own mask; pure CSS so it plays before hydration. */
function Word({ children, delay, className = '' }: { children: React.ReactNode; delay: number; className?: string }) {
  return (
    <span className="-mb-[0.12em] inline-block overflow-hidden pb-[0.12em] align-bottom">
      <span className={`word-up ${className}`} style={{ animationDelay: `${delay}s` }}>
        {children}
      </span>
    </span>
  )
}

const rise = (delay: number) => ({ className: 'rise-in', style: { animationDelay: `${delay}s` } })

export function Hero() {
  const ref = useRef<HTMLElement>(null)
  const reduce = !!useReducedMotion()
  const inView = useInView(ref, { margin: '0px 0px -10% 0px' })
  const [ci, setCi] = useState(0)
  const [paused, setPaused] = useState(false)
  const [finish, setFinish] = useState(0)
  // Once the visitor picks a finish, stop auto-cycling so their choice stays on screen
  const [locked, setLocked] = useState(false)
  const { active: live3D } = useCompanion()
  const { addToCart } = useStore()
  const current = CYCLE[ci]
  const featured = products.find((p) => p.id === current.id)!

  // Auto-advance the hero design while the hero is on screen
  useEffect(() => {
    if (reduce || paused || locked || !inView) return
    const id = setTimeout(() => setCi((i) => (i + 1) % CYCLE.length), CYCLE_MS)
    return () => clearTimeout(id)
  }, [ci, reduce, paused, locked, inView])

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -140])
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  const ghostY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '35%'])
  const ghostScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.12])


  return (
    <section id="top" ref={ref} className="relative min-h-[100svh] overflow-hidden" aria-label="Noctis Studio 16">
      {/* -------- Backdrop -------- */}
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_68%_45%,rgba(92,225,255,0.16),transparent_60%),radial-gradient(ellipse_60%_50%_at_85%_20%,rgba(167,139,250,0.10),transparent_60%),radial-gradient(ellipse_70%_60%_at_10%_90%,rgba(139,92,246,0.08),transparent_60%)]" />
        {/* Aurora: three soft light ribbons drifting behind the product (animated on desktop only) */}
        <div className="aurora absolute inset-0 overflow-hidden">
          <span className="aurora-ribbon aurora-a" />
          <span className="aurora-ribbon aurora-b" />
          <span className="aurora-ribbon aurora-c" />
        </div>
        {/* perspective floor grid */}
        <div className="absolute inset-x-0 bottom-0 h-[45%] [perspective:600px]">
          <div className="absolute inset-0 origin-bottom [transform:rotateX(62deg)] opacity-40 [mask-image:linear-gradient(to_top,black,transparent_85%)] overflow-hidden">
            <div
              className="grid-anim absolute inset-x-0 bottom-0 [--grid-speed:3s]"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
                backgroundSize: '64px 64px',
                top: '-64px',
              }}
            />
          </div>
        </div>
        {/* rotating light cone behind the product */}
        <div className="absolute left-[68%] top-[46%] h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 opacity-60 max-lg:left-1/2 max-lg:top-[72%]">
          <div className="h-full w-full animate-[spin-slow_40s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(92,225,255,0.10)_40deg,transparent_80deg,transparent_180deg,rgba(167,139,250,0.08)_220deg,transparent_260deg)] [mask-image:radial-gradient(circle,black_10%,transparent_55%)]" />
        </div>
        {/* ghost wordmark */}
        <motion.div style={{ y: ghostY, scale: ghostScale }} className="fade-in absolute inset-x-0 top-[12%] select-none text-center max-lg:top-[58%]">
          <span className="block bg-gradient-to-b from-ember/[0.16] via-white/[0.05] to-white/0 bg-clip-text text-[27vw] font-semibold leading-none tracking-[-0.06em] text-transparent">
            NOCTIS
          </span>
        </motion.div>
      </div>

      {/* -------- Product slot: the travelling 3D laptop lands here (still render until it arrives / on phones) -------- */}
      <CompanionSlot
        id="hero"
        variant={current.variant}
        body={FINISHES[finish].color}
        pose="hero"
        priority
        sizes="(min-width: 1024px) 58vw, 92vw"
        className={`pointer-events-none absolute right-[1%] top-1/2 w-[58%] -translate-y-1/2 max-lg:bottom-[5%] max-lg:left-[4%] max-lg:top-auto max-lg:w-[92%] max-lg:translate-y-0 ${
          reduce ? '' : 'lg:animate-[float-y_7s_ease-in-out_infinite]'
        }`}
      />

      {/* -------- Copy -------- */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] max-w-[1520px] flex-col section-pad pb-10 pt-32 max-lg:pb-[50svh] lg:justify-center lg:pt-24"
      >
        <div className="pointer-events-auto max-w-[640px]">
          <div {...rise(0.05)} className="rise-in glass mb-7 inline-flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 text-xs">
            <span className="flex items-center gap-1.5 rounded-full bg-ember px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-ink">
              <Sparkles className="h-3 w-3" /> New
            </span>
            <span className="text-bone/80">Studio 16 Graphite Edition — only at Noctis</span>
          </div>

          <h1 className="text-[clamp(3rem,7.6vw,7.4rem)] font-medium leading-[0.92] tracking-[-0.05em]">
            <Word delay={0.05}>Power,</Word>
            <br />
            <Word delay={0.12}>sculpted</Word> <Word delay={0.18}>in</Word>{' '}
            <Word
              delay={0.24}
              className="shine-text bg-gradient-to-r from-ember-soft via-peach to-ember bg-clip-text pr-2 font-serif font-normal italic tracking-[-0.02em] text-transparent"
            >
              light.
            </Word>
          </h1>

          <p {...rise(0.3)} className="rise-in mt-7 max-w-[470px] text-[1.02rem] leading-relaxed text-bone/65 md:text-[1.08rem]">
            Hand-picked laptops, desktops and displays from the world’s finest makers — tuned, tested and delivered in 48 hours.
            Gaming towers, 49″ OLEDs and featherweight ultrabooks, curated for people who notice the details.
          </p>

          <div {...rise(0.4)} className="rise-in mt-9 flex flex-wrap items-center gap-3">
            <MagneticButton size="lg" onClick={() => scrollToId('collections')}>
              Explore Collection
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </MagneticButton>
            <MagneticButton size="lg" variant="ghost" onClick={() => scrollToId('offers')}>
              Discover Best Deals
            </MagneticButton>
          </div>

          <div {...rise(0.5)} className="rise-in mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs text-mist max-sm:hidden">
            <span className="flex items-center gap-2">
              <Stars value={5} size={12} /> <span className="text-bone">4.9</span> from 38,200 reviews
            </span>
            <span className="h-3 w-px bg-white/15" />
            <span>Free 48h express</span>
            <span className="h-3 w-px bg-white/15" />
            <span>2-year Noctis warranty</span>
          </div>
        </div>
      </motion.div>

      {/* -------- Bottom rail -------- */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 mx-auto flex max-w-[1520px] items-end justify-between section-pad pb-7">
        <motion.button
          {...rise(0.7)}
          onClick={() => scrollToId('trust')}
          className="rise-in pointer-events-auto hidden items-center gap-3 text-xs text-mist transition-colors hover:text-bone lg:flex"
          data-cursor="hover"
        >
          <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-white/15">
            <motion.span animate={reduce ? undefined : { y: [-14, 14] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
              <ArrowDown className="h-4 w-4" />
            </motion.span>
          </span>
          Scroll to explore
        </motion.button>

        <div
          {...rise(0.8)}
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
          className="rise-in glass pointer-events-auto ml-auto hidden w-[400px] flex-col gap-3 rounded-2xl p-3 lg:flex"
        >
          <div className="flex items-center gap-4">
            <div className="relative h-14 w-[74px] shrink-0 overflow-hidden rounded-xl" style={{ background: `radial-gradient(circle at 50% 40%, ${featured.glow}55, transparent 70%)` }}>
              <LazyImage key={featured.id} src={featured.image} alt="" sizes="80px" className="h-full w-full" imgClassName="scale-[1.35]" />
            </div>
            <div className="relative h-[52px] min-w-0 flex-1 overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.div
                  key={featured.id}
                  initial={{ y: 26, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  exit={{ y: -26, opacity: 0 }}
                  transition={{ duration: 0.5, ease: EASE }}
                >
                  <p className="font-mono text-[10px] uppercase tracking-wider text-mist">Now showing · {current.tag}</p>
                  <p className="truncate text-sm font-medium">
                    {featured.brand} {featured.name}
                  </p>
                  <p className="font-mono text-xs">
                    {formatPrice(featured.price)} {featured.compareAt && <span className="text-mist line-through">{formatPrice(featured.compareAt)}</span>}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>
            <button
              onClick={() => addToCart(featured)}
              aria-label={`Add ${featured.name} to bag`}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-bone text-ink transition-transform hover:scale-110 hover:bg-white"
              data-cursor="hover"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          {/* Design picker doubles as the cycle progress */}
          <div className="flex gap-1.5" role="tablist" aria-label="Laptop designs">
            {CYCLE.map((c, i) => (
              <button
                key={c.variant}
                role="tab"
                aria-selected={i === ci}
                aria-label={c.tag}
                onClick={() => setCi(i)}
                className="group h-5 flex-1"
                data-cursor="hover"
              >
                <span className="block h-[3px] overflow-hidden rounded-full bg-white/10 transition-colors group-hover:bg-white/20">
                  {i === ci && (
                    <motion.span
                      key={`${ci}-${paused}`}
                      className="block h-full rounded-full bg-gradient-to-r from-ember to-peach"
                      initial={{ width: paused || reduce || locked ? '100%' : '0%' }}
                      animate={{ width: '100%' }}
                      transition={{ duration: paused || reduce || locked ? 0 : CYCLE_MS / 1000, ease: 'linear' }}
                    />
                  )}
                </span>
              </button>
            ))}
          </div>
          {live3D && (
            <div className="flex items-center gap-2 border-t border-white/[0.07] pt-2.5">
              <span className="font-mono text-[10px] uppercase tracking-wider text-mist">
                Finish · <span className="text-bone">{FINISHES[finish].name}</span>
              </span>
              <div className="ml-auto flex gap-1" role="radiogroup" aria-label="Laptop finish">
                {FINISHES.map((f, i) => (
                  <button
                    key={f.name}
                    role="radio"
                    aria-checked={i === finish}
                    aria-label={f.name}
                    onClick={() => {
                      setFinish(i)
                      setLocked(true)
                    }}
                    className="relative grid h-7 w-7 place-items-center"
                    data-cursor="hover"
                  >
                    {i === finish && (
                      <motion.span layoutId="finish-ring" className="absolute inset-0 rounded-full border-2 border-ember" transition={{ type: 'spring', stiffness: 420, damping: 30 }} />
                    )}
                    <span
                      className="h-[18px] w-[18px] rounded-full border border-white/25 shadow-inner"
                      style={{ background: f.color ?? 'conic-gradient(from 200deg, #5ce1ff, #a78bfa, #f472b6, #5ce1ff)' }}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-ink to-transparent lg:h-40" />
    </section>
  )
}
