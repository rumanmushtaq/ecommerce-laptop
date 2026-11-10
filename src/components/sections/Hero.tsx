import { motion, useInView, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowDown, ArrowRight, Plus, Sparkles } from 'lucide-react'
import { useRef, useState } from 'react'
import { formatPrice, products } from '../../data/catalog'
import { useWebGL, scrollToId, useMediaQuery } from '../../lib/hooks'
import { useStore } from '../../lib/store'
import { EASE, MagneticButton, SplitHeading, Stars } from '../ui/primitives'
import { LazyImage } from '../ui/LazyImage'
import dynamic from 'next/dynamic'

const HeroScene = dynamic(() => import('../three/HeroScene'), { ssr: false })
const flagship = products[0]

export function Hero({ ready }: { ready: boolean }) {
  const ref = useRef<HTMLElement>(null)
  const reduce = !!useReducedMotion()
  const compact = useMediaQuery('(max-width: 1023px)')
  const inView = useInView(ref, { margin: '0px 0px -10% 0px' })
  const [sceneReady, setSceneReady] = useState(false)
  const { addToCart } = useStore()
  const webgl = useWebGL()

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end start'] })
  const textY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : -140])
  const textOpacity = useTransform(scrollYProgress, [0, 0.55], [1, 0])
  const ghostY = useTransform(scrollYProgress, [0, 1], ['0%', reduce ? '0%' : '35%'])
  const ghostScale = useTransform(scrollYProgress, [0, 1], [1, reduce ? 1 : 1.12])

  const show = (delay: number) => ({
    initial: { opacity: 0, y: reduce ? 0 : 24 },
    animate: ready ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 1, ease: EASE, delay },
  })

  return (
    <section id="top" ref={ref} className="relative min-h-[100svh] overflow-hidden" aria-label="Noctis Studio 16">
      {/* -------- Backdrop -------- */}
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_68%_45%,rgba(185,166,255,0.16),transparent_60%),radial-gradient(ellipse_60%_50%_at_85%_20%,rgba(158,230,207,0.10),transparent_60%),radial-gradient(ellipse_70%_60%_at_10%_90%,rgba(143,123,255,0.08),transparent_60%)]" />
        {/* perspective floor grid */}
        <div className="absolute inset-x-0 bottom-0 h-[45%] [perspective:600px]">
          <div className="absolute inset-0 origin-bottom [transform:rotateX(62deg)] opacity-40 [mask-image:linear-gradient(to_top,black,transparent_85%)] overflow-hidden">
            <div
              className="absolute inset-x-0 bottom-0"
              style={{
                backgroundImage:
                  'linear-gradient(rgba(255,255,255,0.07) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.07) 1px, transparent 1px)',
                backgroundSize: '64px 64px',
                top: '-64px',
                willChange: 'transform',
                animation: reduce ? undefined : 'grid-run 3s linear infinite',
              }}
            />
          </div>
        </div>
        {/* rotating light cone behind the product */}
        <div className="absolute left-[68%] top-[46%] h-[120vmax] w-[120vmax] -translate-x-1/2 -translate-y-1/2 opacity-60 max-lg:left-1/2 max-lg:top-[72%]">
          <div className="h-full w-full animate-[spin-slow_40s_linear_infinite] bg-[conic-gradient(from_0deg,transparent_0deg,rgba(185,166,255,0.10)_40deg,transparent_80deg,transparent_180deg,rgba(158,230,207,0.08)_220deg,transparent_260deg)] [mask-image:radial-gradient(circle,black_10%,transparent_55%)]" />
        </div>
        {/* ghost wordmark */}
        <motion.div
          style={{ y: ghostY, scale: ghostScale }}
          initial={{ opacity: 0 }}
          animate={ready ? { opacity: 1 } : undefined}
          transition={{ duration: 2, ease: EASE, delay: 0.3 }}
          className="absolute inset-x-0 top-[12%] select-none text-center max-lg:top-[58%]"
        >
          <span className="block bg-gradient-to-b from-ember/[0.16] via-white/[0.05] to-white/0 bg-clip-text text-[27vw] font-semibold leading-none tracking-[-0.06em] text-transparent">
            NOCTIS
          </span>
        </motion.div>
      </div>

      {/* -------- 3D product -------- */}
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: ready && (sceneReady || !webgl) ? 1 : 0 }}
        transition={{ duration: 1.2, ease: EASE }}
      >
        {webgl ? (
          <>
            <HeroScene
              progress={scrollYProgress}
              active={inView}
              started={ready && sceneReady}
              reduced={reduce}
              compact={compact}
              onReady={() => setSceneReady(true)}
            />
          </>
        ) : (
          <LazyImage
            src="/renders/noctis.webp"
            alt="Noctis Studio 16 Graphite Edition"
            priority
            ratio="4 / 3"
            sizes="(min-width: 1024px) 62vw, 92vw"
            className="absolute right-0 top-1/2 w-[62%] -translate-y-1/2 max-lg:bottom-[3%] max-lg:left-[4%] max-lg:top-auto max-lg:w-[92%] max-lg:translate-y-0"
          />
        )}
      </motion.div>

      {/* -------- Copy -------- */}
      <motion.div
        style={{ y: textY, opacity: textOpacity }}
        className="pointer-events-none relative z-10 mx-auto flex min-h-[100svh] max-w-[1520px] flex-col section-pad pb-10 pt-32 max-lg:pb-[50svh] lg:justify-center lg:pt-24"
      >
        <div className="pointer-events-auto max-w-[640px]">
          <motion.div {...show(0.15)} className="glass mb-7 inline-flex items-center gap-2.5 rounded-full py-1.5 pl-1.5 pr-4 text-xs">
            <span className="flex items-center gap-1.5 rounded-full bg-ember px-2.5 py-1 font-mono text-[10px] font-medium uppercase tracking-wider text-ink">
              <Sparkles className="h-3 w-3" /> New
            </span>
            <span className="text-bone/80">Studio 16 Graphite Edition — only at Noctis</span>
          </motion.div>

          {ready && (
            <SplitHeading
              as="h1"
              immediate
              delay={0.25}
              className="text-[clamp(3rem,7.6vw,7.4rem)] font-medium leading-[0.92] tracking-[-0.05em]"
              segments={[
                { text: 'Power,', br: true },
                { text: 'sculpted in' },
                { text: 'light.', className: 'font-serif italic font-normal tracking-[-0.02em] bg-gradient-to-r from-ember-soft via-ember to-peach bg-clip-text text-transparent pr-2' },
              ]}
            />
          )}
          {!ready && <h1 className="invisible text-[clamp(3rem,7.6vw,7.4rem)] leading-[0.92]">Power, sculpted in light.</h1>}

          <motion.p {...show(0.65)} className="mt-7 max-w-[470px] text-[1.02rem] leading-relaxed text-bone/65 md:text-[1.08rem]">
            Hand-picked laptops, desktops and displays from the world’s finest makers — tuned, tested and delivered in 48 hours.
            Gaming towers, 49″ OLEDs and featherweight ultrabooks, curated for people who notice the details.
          </motion.p>

          <motion.div {...show(0.8)} className="mt-9 flex flex-wrap items-center gap-3">
            <MagneticButton size="lg" onClick={() => scrollToId('collections')}>
              Explore Collection
              <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
            </MagneticButton>
            <MagneticButton size="lg" variant="ghost" onClick={() => scrollToId('offers')}>
              Discover Best Deals
            </MagneticButton>
          </motion.div>

          <motion.div {...show(0.95)} className="mt-10 flex flex-wrap items-center gap-x-7 gap-y-3 text-xs text-mist max-sm:hidden">
            <span className="flex items-center gap-2">
              <Stars value={5} size={12} /> <span className="text-bone">4.9</span> from 38,200 reviews
            </span>
            <span className="h-3 w-px bg-white/15" />
            <span>Free 48h express</span>
            <span className="h-3 w-px bg-white/15" />
            <span>2-year Noctis warranty</span>
          </motion.div>
        </div>
      </motion.div>

      {/* -------- Bottom rail -------- */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 mx-auto flex max-w-[1520px] items-end justify-between section-pad pb-7">
        <motion.button
          {...show(1.1)}
          onClick={() => scrollToId('trust')}
          className="pointer-events-auto hidden items-center gap-3 text-xs text-mist transition-colors hover:text-bone lg:flex"
          data-cursor="hover"
        >
          <span className="relative grid h-10 w-10 place-items-center overflow-hidden rounded-full border border-white/15">
            <motion.span animate={reduce ? undefined : { y: [-14, 14] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
              <ArrowDown className="h-4 w-4" />
            </motion.span>
          </span>
          Scroll to explore
        </motion.button>

        <motion.div
          initial={{ opacity: 0, x: reduce ? 0 : 30 }}
          animate={ready ? { opacity: 1, x: 0 } : undefined}
          transition={{ duration: 1, ease: EASE, delay: 1.4 }}
          className="glass pointer-events-auto ml-auto hidden items-center gap-4 rounded-2xl p-2.5 pr-3 lg:flex"
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
        </motion.div>
      </div>

      <div aria-hidden className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-20 bg-gradient-to-t from-ink to-transparent lg:h-40" />
    </section>
  )
}
