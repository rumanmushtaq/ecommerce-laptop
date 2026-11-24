import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowDown, ArrowRight, Plus, Sparkles } from 'lucide-react'
import { useRef, useState } from 'react'
import { formatPrice, products } from '../../data/catalog'
import { gpuTier, scrollToId, useDeferred3D, useMediaQuery } from '../../lib/hooks'
import { useStore } from '../../lib/store'
import { EASE, MagneticButton, Stars } from '../ui/primitives'
import { LazyImage } from '../ui/LazyImage'
import dynamic from 'next/dynamic'

const HeroScene = dynamic(() => import('../three/HeroScene'), { ssr: false })
const flagship = products[0]

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
  const compact = useMediaQuery('(max-width: 1023px)')
  const inView = useInView(ref, { margin: '0px 0px -10% 0px' })
  const [sceneReady, setSceneReady] = useState(false)
  const { addToCart } = useStore()
  // Still image paints instantly; live 3D loads after the page is idle, on capable devices only
  const load3D = useDeferred3D()

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -140])
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  const ghostY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '35%'])
  const ghostScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.12])


  return (
    <section id="top" ref={ref} className="relative min-h-[100svh] overflow-hidden" aria-label="Noctis Studio 16">
      {/* -------- Backdrop -------- */}
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_68%_45%,rgba(185,166,255,0.16),transparent_60%),radial-gradient(ellipse_60%_50%_at_85%_20%,rgba(158,230,207,0.10),transparent_60%),radial-gradient(ellipse_70%_60%_at_10%_90%,rgba(143,123,255,0.08),transparent_60%)]" />
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
          <div className="h-full w-full animate-[spin-slow_40s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(185,166,255,0.10)_40deg,transparent_80deg,transparent_180deg,rgba(158,230,207,0.08)_220deg,transparent_260deg)] [mask-image:radial-gradient(circle,black_10%,transparent_55%)]" />
        </div>
        {/* ghost wordmark */}
        <motion.div style={{ y: ghostY, scale: ghostScale }} className="fade-in absolute inset-x-0 top-[12%] select-none text-center max-lg:top-[58%]">
          <span className="block bg-gradient-to-b from-ember/[0.16] via-white/[0.05] to-white/0 bg-clip-text text-[27vw] font-semibold leading-none tracking-[-0.06em] text-transparent">
            NOCTIS
          </span>
        </motion.div>
      </div>

      {/* -------- Product: still render first (LCP-friendly), live 3D crossfades in later -------- */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/renders/noctis-800.webp"
        srcSet="/renders/noctis-800.webp 800w, /renders/noctis.webp 1400w"
        sizes="(min-width: 1024px) 60vw, 92vw"
        alt="Noctis Studio 16 Graphite Edition"
        width={1400}
        height={1050}
        fetchPriority="high"
        className={`pointer-events-none absolute right-[1%] top-1/2 w-[58%] -translate-y-1/2 object-contain transition-opacity duration-1000 max-lg:bottom-[4%] max-lg:left-[4%] max-lg:top-auto max-lg:w-[92%] max-lg:translate-y-0 ${
          reduce ? '' : 'lg:animate-[float-y_7s_ease-in-out_infinite]'
        }`}
        style={{ opacity: sceneReady ? 0 : 1 }}
      />
      {load3D && (
        <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: sceneReady ? 1 : 0 }} transition={{ duration: 1.1, ease: EASE }}>
          <HeroScene
            progress={scrollYProgress}
            active={inView}
            started={sceneReady}
            instant
            tier={gpuTier()}
            reduced={reduce}
            compact={compact}
            onReady={() => setSceneReady(true)}
          />
        </motion.div>
      )}

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
              className="bg-gradient-to-r from-ember-soft via-ember to-peach bg-clip-text pr-2 font-serif font-normal italic tracking-[-0.02em] text-transparent"
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
          className="rise-in glass pointer-events-auto ml-auto hidden items-center gap-4 rounded-2xl p-2.5 pr-3 lg:flex"
        >
          <div className="relative h-14 w-[74px] overflow-hidden rounded-xl bg-white/[0.04]">
            <LazyImage src={flagship.image} alt="" sizes="80px" className="h-full w-full" imgClassName="scale-[1.35]" />
          </div>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-wider text-mist">Featured · {flagship.specs[2].value}</p>
            <p className="text-sm font-medium">Noctis {flagship.name}</p>
            <p className="font-mono text-xs">
              {formatPrice(flagship.price)} <span className="text-mist line-through">{formatPrice(flagship.compareAt!)}</span>
            </p>
          </div>
          <button
            onClick={() => addToCart(flagship)}
            aria-label={`Add ${flagship.name} to bag`}
            className="ml-2 grid h-10 w-10 place-items-center rounded-full bg-bone text-ink transition-transform hover:scale-110 hover:bg-white"
            data-cursor="hover"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-ink to-transparent lg:h-40" />
    </section>
  )
}
