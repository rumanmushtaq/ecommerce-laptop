import { AnimatePresence, LayoutGroup, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowRight, Cpu, Fan, Gauge, Rotate3d, Zap } from 'lucide-react'
import { useRef, useState } from 'react'
import { formatPrice, products } from '../../data/catalog'
import { useStore } from '../../lib/store'
import { EASE, MagneticButton } from '../ui/primitives'
import { MaskReveal, Scramble, useVelocitySkew } from '../ui/motion'
import { useShopCategory } from '../layout/Navbar'
import { AddButton } from './FeaturedProducts'
import { LazyImage } from '../ui/LazyImage'

const rigs = [
  { id: 'noctis-forge-x', short: 'Forge X desktop', image: '/renders/forge-hero.webp', fps: [214, 168, 181, 790] },
  { id: 'msi-titan-18', short: 'Titan 18 HX', image: '/renders/titan-hero.webp', fps: [168, 131, 142, 612] },
  { id: 'razer-blade-16', short: 'Blade 16', image: '/renders/stealth.webp', fps: [152, 118, 128, 571] },
  { id: 'rog-zephyrus-g16', short: 'Zephyrus G16', image: '/renders/eclipse.webp', fps: [124, 96, 104, 498] },
]
const games = ['Cyberpunk 2077 · RT Ultra', 'Alan Wake 2 · High', 'Black Myth: Wukong · Very High', 'Valorant · Competitive']
const MAX_FPS = [230, 180, 200, 820]

const features = [
  { icon: Cpu, label: 'RTX 50-series', note: 'DLSS 4 frame gen' },
  { icon: Gauge, label: '240Hz OLED', note: '0.2 ms response' },
  { icon: Fan, label: 'Vapour chamber', note: 'liquid-metal TIM' },
  { icon: Zap, label: '270 W headroom', note: 'no throttling' },
]

export function Gaming() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const [rig, setRig] = useState(0)
  const shop = useShopCategory()
  const { openQuick } = useStore()
  const current = rigs[rig]
  const product = products.find((p) => p.id === current.id)!

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const imgY = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [80, -80])
  const skew = useVelocitySkew(10)
  const titleX = useTransform(scrollYProgress, [0, 1], reduce ? ['0%', '0%'] : ['6%', '-6%'])

  return (
    <section id="gaming" ref={ref} className="relative overflow-hidden bg-black py-24 md:py-36" aria-label="Gaming laptops and PCs">
      <div aria-hidden className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(50%_45%_at_70%_55%,rgba(255,122,182,0.28),transparent_70%),radial-gradient(40%_40%_at_20%_30%,rgba(143,123,255,0.22),transparent_70%)]" />
        <div className="absolute inset-x-0 bottom-0 h-[55%] [perspective:500px]">
          <div className="absolute inset-0 origin-bottom [transform:rotateX(65deg)] [mask-image:linear-gradient(to_top,black_20%,transparent)] overflow-hidden">
            <div
              className="absolute inset-x-0 bottom-0"
              style={{
                backgroundImage: 'linear-gradient(rgba(255,122,182,0.45) 1px, transparent 1px), linear-gradient(90deg, rgba(143,123,255,0.45) 1px, transparent 1px)',
                backgroundSize: '64px 64px',
                top: '-64px',
                willChange: 'transform',
                animation: 'grid-run 1.2s linear infinite',
              }}
            />
          </div>
        </div>
        <div className="absolute inset-0 opacity-[0.07] [background:repeating-linear-gradient(0deg,#fff_0px,#fff_1px,transparent_1px,transparent_4px)]" />
      </div>

      <motion.p
        aria-hidden
        style={{ x: titleX, skewX: skew }}
        className="pointer-events-none absolute top-10 whitespace-nowrap text-[18vw] font-black uppercase leading-none tracking-[-0.06em] text-white/[0.03] md:top-6"
      >
        Frames without mercy
      </motion.p>

      <div className="relative mx-auto max-w-[1520px] section-pad">
        <div className="grid items-center gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="mb-5 flex items-center gap-3 font-mono text-xs uppercase tracking-[0.22em] text-plasma">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-plasma opacity-70" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-plasma" />
              </span>
              <Scramble text="04 — Gaming lab" />
            </p>
            <motion.h2
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-10% 0px' }}
              transition={{ duration: 1, ease: EASE }}
              className="text-[clamp(3rem,7.5vw,7rem)] font-black uppercase leading-[0.85] tracking-[-0.05em]"
              style={{ textShadow: '3px 0 0 rgba(255,122,182,0.55), -3px 0 0 rgba(158,230,207,0.4)' }}
            >
              Frames
              <br />
              without
              <br />
              <span className="bg-gradient-to-r from-plasma via-[#ffa3d1] to-volt bg-clip-text text-transparent [text-shadow:none]">mercy.</span>
            </motion.h2>
            <p className="mt-7 max-w-[440px] leading-relaxed text-white/60">
              Every gaming rig is benchmarked in our lab, re-pasted with liquid metal and stress-tested for 24 hours before it ships. You get the numbers below — not the brochure’s.
            </p>

            <LayoutGroup id="rigs">
              <div className="mt-9 inline-flex flex-wrap gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
                {rigs.map((r, i) => (
                  <button key={r.id} onClick={() => setRig(i)} className="relative rounded-full px-4 py-2 text-sm" data-cursor="hover" aria-pressed={i === rig}>
                    {i === rig && (
                      <motion.span layoutId="rig-pill" className="absolute inset-0 rounded-full bg-gradient-to-r from-plasma to-volt" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
                    )}
                    <span className={`relative ${i === rig ? 'text-white' : 'text-white/55 hover:text-white'}`}>{r.short}</span>
                  </button>
                ))}
              </div>
            </LayoutGroup>

            <div className="mt-8 space-y-4">
              {games.map((g, i) => (
                <div key={g}>
                  <div className="mb-1.5 flex justify-between gap-3 font-mono text-[11px] uppercase tracking-wider">
                    <span className="truncate text-white/55">{g}</span>
                    <motion.span key={`${rig}-${i}`} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} className="shrink-0 text-white">
                      {current.fps[i]} fps
                    </motion.span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-white/[0.07]">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-volt via-plasma to-[#ffb4a2] shadow-[0_0_14px_rgba(255,122,182,0.7)]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(current.fps[i] / MAX_FPS[i]) * 100}%` }}
                      transition={{ duration: 1.1, delay: i * 0.08, ease: EASE }}
                    />
                  </div>
                </div>
              ))}
              <p className="font-mono text-[10px] text-white/35">Measured at 1440p, native panel, plugged in. Noctis Lab, Oct 2026.</p>
            </div>
          </div>

          <div className="relative">
            <MaskReveal>
            <motion.div style={{ y: imgY }} className="relative aspect-[16/11]">
              <div aria-hidden className="absolute inset-x-[10%] bottom-[8%] h-[30%] rounded-[50%] bg-plasma/40 blur-[70px]" />
              <AnimatePresence mode="popLayout">
                <motion.div
                  key={current.id}
                  initial={{ opacity: 0, x: 80, rotate: 2 }}
                  animate={{ opacity: 1, x: 0, rotate: 0 }}
                  exit={{ opacity: 0, x: -80, rotate: -2 }}
                  transition={{ duration: 0.8, ease: EASE }}
                  className="absolute inset-0"
                >
                  <LazyImage
                    src={current.image}
                    alt={`${product.brand} ${product.name}`}
                    sizes="(min-width: 1024px) 55vw, 92vw"
                    className="h-full w-full"
                    imgClassName="scale-110 drop-shadow-[0_30px_60px_rgba(255,122,182,0.25)]"
                  />
                </motion.div>
              </AnimatePresence>
            </motion.div>
            </MaskReveal>

            <div className="relative mt-4 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-white/10 bg-white/[0.03] p-4 backdrop-blur-md sm:p-5">
              <div>
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-white/50">{product.brand}</p>
                <p className="text-lg font-semibold">{product.name}</p>
                <p className="font-mono text-sm text-white/80">
                  {formatPrice(product.price)} {product.compareAt && <span className="text-white/40 line-through">{formatPrice(product.compareAt)}</span>}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openQuick(product.id)}
                  className="flex h-11 items-center gap-2 rounded-full border border-white/15 px-4 text-sm text-white/85 transition-colors hover:border-plasma hover:text-white"
                  data-cursor="hover"
                >
                  <Rotate3d className="h-4 w-4 text-plasma" /> View in 3D
                </button>
                <AddButton product={product} />
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
              {features.map((f, i) => (
                <motion.div
                  key={f.label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07, duration: 0.7, ease: EASE }}
                  whileHover={{ y: -4 }}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.02] p-3.5 transition-colors hover:border-plasma/50"
                >
                  <f.icon className="h-4 w-4 text-plasma" strokeWidth={1.6} />
                  <p className="mt-2.5 text-sm font-medium">{f.label}</p>
                  <p className="text-[11px] text-white/45">{f.note}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-14 flex justify-center">
          <MagneticButton
            size="lg"
            onClick={() => shop('gaming')}
            className="!bg-gradient-to-r from-plasma to-volt !text-white shadow-[0_10px_50px_-10px_rgba(255,122,182,0.8)]"
          >
            Shop gaming laptops <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
          </MagneticButton>
        </div>
      </div>
    </section>
  )
}
