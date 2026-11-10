import { AnimatePresence, motion, useInView, useMotionValueEvent, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowRight } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { formatPrice, products } from '../../data/catalog'
import { useWebGL } from '../../lib/hooks'
import { smooth } from '../../lib/smoothScroll'
import { Scramble } from '../ui/motion'
import { useStore } from '../../lib/store'
import { EASE, MagneticButton } from '../ui/primitives'
import { LazyImage } from '../ui/LazyImage'
import dynamic from 'next/dynamic'

const ShowcaseScene = dynamic(() => import('../three/ShowcaseScene'), { ssr: false })
const studio = products[0]

const chapters = [
  {
    label: 'Display',
    title: 'A screen that disappears.',
    copy: 'A 16″ 3.2K tandem OLED, factory-calibrated to ΔE < 1 and shipped with its own colour report. True blacks, 1,000-nit HDR peaks, 120Hz of glass-smooth motion.',
    stat: '3.2K',
    statLabel: 'OLED · 120Hz · 100% DCI-P3',
    color: '#b9a6ff',
  },
  {
    label: 'Performance',
    title: 'Desktop silicon, folded flat.',
    copy: 'Core Ultra 9 and an RTX 5070 Ti share a 140 W envelope we tuned in-house — sustained, not boosted. 8K timelines scrub. Shaders compile while you blink.',
    stat: '24',
    statLabel: 'CPU cores · 140 W sustained',
    color: '#9ee6cf',
  },
  {
    label: 'Silence',
    title: 'Quieter than the room.',
    copy: 'A full-width vapour chamber and dual liquid-crystal-polymer fans keep it at 22 dB through spreadsheets and editing. Only 16.9 mm at its thickest.',
    stat: '22dB',
    statLabel: 'under everyday load',
    color: '#b48cff',
  },
  {
    label: 'Craft',
    title: 'Milled. Cut. Signed.',
    copy: 'A single block of graphite-anodised aluminium, finished with a diamond-cut copper edge by hand. A 99.9 Wh cell carries it through a long-haul flight.',
    stat: '18h',
    statLabel: 'battery · 1.79 kg',
    color: '#f2b8a0',
  },
]

export function Showcase() {
  const ref = useRef<HTMLElement>(null)
  const reduce = !!useReducedMotion()
  const near = useInView(ref, { margin: '600px 0px 600px 0px' })
  const visible = useInView(ref)
  const [mounted, setMounted] = useState(false)
  const [step, setStep] = useState(0)
  const { addToCart } = useStore()
  const webgl = useWebGL()
  if (near && !mounted) setMounted(true)
  useEffect(() => {
    const idle = (window.requestIdleCallback ?? ((cb: () => void) => setTimeout(cb, 2500))) as (cb: () => void) => number
    const id = idle(() => setMounted(true))
    return () => (window.cancelIdleCallback ?? clearTimeout)(id)
  }, [])

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] })
  useMotionValueEvent(scrollYProgress, 'change', (v) => setStep(Math.min(chapters.length - 1, Math.floor(v * chapters.length))))
  const bigY = useTransform(scrollYProgress, [0, 1], ['10%', '-10%'])
  const c = chapters[step]

  const jump = (i: number) => {
    const el = ref.current
    if (!el) return
    const top = el.offsetTop + ((el.offsetHeight - window.innerHeight) * (i + 0.5)) / chapters.length
    if (smooth.lenis) smooth.lenis.scrollTo(top, { duration: 1.2 })
    else window.scrollTo({ top, behavior: reduce ? 'auto' : 'smooth' })
  }

  return (
    <section id="showcase" ref={ref} className="relative h-[420vh]" aria-label="Noctis Studio 16 in detail">
      <div className="sticky top-0 flex h-[100svh] flex-col overflow-hidden">
        {/* Ambient light follows the chapter colour */}
        <motion.div
          aria-hidden
          className="absolute inset-0"
          animate={{ background: `radial-gradient(60% 55% at 66% 52%, ${c.color}26, transparent 70%)` }}
          transition={{ duration: 1.2 }}
        />
        <motion.div aria-hidden style={{ y: bigY }} className="pointer-events-none absolute -right-[4vw] top-1/2 -translate-y-1/2 select-none max-lg:hidden">
          <AnimatePresence mode="wait">
            <motion.span
              key={step}
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -60 }}
              transition={{ duration: 0.8, ease: EASE }}
              className="text-outline block font-serif text-[34vw] italic leading-none"
            >
              0{step + 1}
            </motion.span>
          </AnimatePresence>
        </motion.div>

        <div className="relative mx-auto grid h-full w-full max-w-[1520px] grid-rows-[1fr_auto] section-pad pt-24 pb-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:grid-rows-1 lg:items-center lg:pb-0">
          {/* Copy */}
          <div className="relative z-10 order-2 lg:order-1">
            <p className="eyebrow mb-4 flex items-center gap-3 max-lg:hidden">
              <span className="h-px w-8 bg-ember" />
              03 — Inside Studio 16
            </p>
            <h2 className="mb-6 text-[clamp(1.8rem,3.4vw,3rem)] font-medium leading-[1] tracking-[-0.04em] max-lg:hidden">
              One machine. <span className="font-serif font-normal italic text-bone/80">Four obsessions.</span>
            </h2>
            <div className="relative min-h-[230px] sm:min-h-[210px] lg:min-h-[300px]">
              <AnimatePresence mode="wait">
                <motion.div
                  key={step}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.6, ease: EASE }}
                >
                  <p className="font-mono text-xs uppercase tracking-[0.2em]" style={{ color: c.color }}>
                    <Scramble key={step} text={`0${step + 1} / 04 · ${c.label}`} />
                  </p>
                  <h3 className="mt-3 text-[clamp(1.6rem,3vw,2.6rem)] font-medium leading-[1.02] tracking-[-0.03em]">{c.title}</h3>
                  <p className="mt-4 max-w-[480px] text-[0.95rem] leading-relaxed text-bone/60 max-sm:text-sm">{c.copy}</p>
                  <div className="mt-6 flex items-end gap-4">
                    <span className="text-[clamp(2.6rem,5vw,4.5rem)] font-medium leading-none tracking-[-0.05em]">{c.stat}</span>
                    <span className="pb-1.5 font-mono text-[11px] uppercase tracking-wider text-mist">{c.statLabel}</span>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-4 lg:mt-10">
              <MagneticButton onClick={() => addToCart(studio)}>
                Add to bag · {formatPrice(studio.price)}
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </MagneticButton>
              <span className="font-mono text-xs text-mist">
                or {formatPrice(Math.round(studio.price / 12))}/mo · 0% APR
              </span>
            </div>
          </div>

          {/* 3D */}
          <div className="relative order-1 min-h-0 lg:order-2 lg:h-[78svh]">
            {webgl ? (
              mounted && (
                <>
                  <ShowcaseScene progress={scrollYProgress} active={visible} reduced={reduce} />
                </>
              )
            ) : (
              <LazyImage src={studio.image} alt="Noctis Studio 16" sizes="60vw" className="h-full w-full" />
            )}
            {/* Spec callout */}
            <AnimatePresence mode="wait">
              <motion.div
                key={step}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0, transition: { delay: 0.4, duration: 0.6, ease: EASE } }}
                exit={{ opacity: 0, transition: { duration: 0.2 } }}
                className="glass absolute right-0 top-4 hidden items-center gap-3 rounded-full py-2 pl-2 pr-4 text-xs md:flex lg:top-[12%]"
              >
                <span className="relative grid h-6 w-6 place-items-center">
                  <span className="absolute inset-0 animate-ping rounded-full opacity-40" style={{ background: c.color }} />
                  <span className="h-2 w-2 rounded-full" style={{ background: c.color }} />
                </span>
                {c.statLabel}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Chapter rail */}
        <div className="relative mx-auto mb-5 grid w-full max-w-[1520px] grid-cols-4 gap-2 section-pad lg:mb-8">
          {chapters.map((ch, i) => (
            <button key={ch.label} onClick={() => jump(i)} className="group text-left" data-cursor="hover" aria-label={`Go to ${ch.label}`}>
              <div className="h-[2px] overflow-hidden rounded-full bg-white/10">
                <motion.div
                  className="h-full origin-left"
                  style={{ background: ch.color }}
                  animate={{ scaleX: i < step ? 1 : i === step ? 0.55 : 0 }}
                  transition={{ duration: 0.6, ease: EASE }}
                />
              </div>
              <p className={`mt-2 font-mono text-[10px] uppercase tracking-[0.18em] transition-colors ${i === step ? 'text-bone' : 'text-mist group-hover:text-bone/70'}`}>
                0{i + 1} <span className="max-sm:hidden">{ch.label}</span>
              </p>
            </button>
          ))}
        </div>
      </div>
    </section>
  )
}
