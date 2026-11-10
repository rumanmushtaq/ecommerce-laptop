import {
  animate,
  motion,
  useInView,
  useMotionTemplate,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
  type HTMLMotionProps,
} from 'motion/react'
import { Star } from 'lucide-react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { Scramble, VelocitySkew } from './motion'

export const EASE = [0.16, 1, 0.3, 1] as const

/* ------------------------------------------------------------------ */
/* Magnetic button                                                     */
/* ------------------------------------------------------------------ */

type ButtonProps = Omit<HTMLMotionProps<'button'>, 'children'> & {
  variant?: 'primary' | 'ghost' | 'light'
  size?: 'md' | 'lg'
  children: ReactNode
}

export function MagneticButton({ variant = 'primary', size = 'md', className = '', children, ...rest }: ButtonProps) {
  const ref = useRef<HTMLButtonElement>(null)
  const reduce = useReducedMotion()
  const x = useSpring(0, { stiffness: 220, damping: 16, mass: 0.4 })
  const y = useSpring(0, { stiffness: 220, damping: 16, mass: 0.4 })

  const onMove = (e: React.PointerEvent) => {
    if (reduce || e.pointerType !== 'mouse' || !ref.current) return
    const r = ref.current.getBoundingClientRect()
    x.set((e.clientX - (r.left + r.width / 2)) * 0.25)
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35)
  }
  const reset = () => {
    x.set(0)
    y.set(0)
  }

  const styles = {
    primary: 'bg-ember text-ink shadow-[0_10px_40px_-10px_rgba(185,166,255,0.7)] hover:bg-ember-soft',
    ghost: 'glass text-bone hover:bg-white/10',
    light: 'bg-bone text-ink hover:bg-white',
  }[variant]
  const sizes = size === 'lg' ? 'h-14 px-7 text-[0.95rem]' : 'h-11 px-5 text-sm'

  return (
    <motion.button
      ref={ref}
      style={{ x, y }}
      onPointerMove={onMove}
      onPointerLeave={reset}
      whileTap={{ scale: 0.96 }}
      data-cursor="hover"
      className={`group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium tracking-tight transition-colors duration-300 disabled:opacity-60 ${sizes} ${styles} ${className}`}
      {...rest}
    >
      {/* light sweep on hover */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[120%] bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-0 group-hover:animate-[sweep_0.9s_ease] group-hover:opacity-100"
      />
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </motion.button>
  )
}

/* ------------------------------------------------------------------ */
/* Reveal helpers                                                      */
/* ------------------------------------------------------------------ */

export function Reveal({
  children,
  delay = 0,
  y = 28,
  className = '',
  as = 'div',
}: {
  children: ReactNode
  delay?: number
  y?: number
  className?: string
  as?: 'div' | 'li' | 'p' | 'span'
}) {
  const reduce = useReducedMotion()
  const Comp = motion[as]
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y: reduce ? 0 : y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </Comp>
  )
}

/** Word-by-word masked rise. Pass segments so parts can be styled (e.g. serif italics). */
export function SplitHeading({
  segments,
  className = '',
  delay = 0,
  immediate = false,
  as = 'h2',
}: {
  segments: { text: string; className?: string; br?: boolean }[]
  className?: string
  delay?: number
  immediate?: boolean
  as?: 'h1' | 'h2'
}) {
  const reduce = useReducedMotion()
  const Tag = motion[as]
  let i = 0
  return (
    <Tag
      className={className}
      initial="hidden"
      {...(immediate ? { animate: 'show' } : { whileInView: 'show', viewport: { once: true, margin: '-10% 0px' } })}
      transition={{ staggerChildren: 0.06, delayChildren: delay }}
      aria-label={segments.map((s) => s.text).join(' ')}
    >
      {segments.map((seg, si) => (
        <span key={si} aria-hidden>
          {seg.text.split(' ').map((word) => {
            const k = i++
            return (
              <span key={k} className="inline-block overflow-hidden pb-[0.12em] align-bottom -mb-[0.12em]">
                <motion.span
                  className={`inline-block ${seg.className ?? ''}`}
                  variants={{
                    hidden: { y: reduce ? 0 : '110%', opacity: reduce ? 0 : 1 },
                    show: { y: '0%', opacity: 1, transition: { duration: 1, ease: EASE } },
                  }}
                >
                  {word}
                </motion.span>
                &nbsp;
              </span>
            )
          })}
          {seg.br && <br />}
        </span>
      ))}
    </Tag>
  )
}

export function SectionIntro({
  eyebrow,
  title,
  aside,
  className = '',
}: {
  eyebrow: string
  title: { text: string; className?: string; br?: boolean }[]
  aside?: ReactNode
  className?: string
}) {
  return (
    <div className={`flex flex-col gap-6 md:flex-row md:items-end md:justify-between ${className}`}>
      <div className="max-w-3xl">
        <Reveal>
          <p className="eyebrow mb-5 flex items-center gap-3">
            <motion.span
              className="h-px w-8 origin-left bg-ember"
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, ease: EASE }}
            />
            <Scramble text={eyebrow} />
          </p>
        </Reveal>
        <VelocitySkew>
          <SplitHeading
            segments={title}
            className="text-[clamp(2.2rem,5.2vw,4.6rem)] font-medium leading-[0.98] tracking-[-0.04em]"
          />
        </VelocitySkew>
      </div>
      {aside && (
        <Reveal delay={0.15} className="max-w-sm text-[0.95rem] leading-relaxed text-mist">
          {aside}
        </Reveal>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Tilt card with moving glare                                         */
/* ------------------------------------------------------------------ */

export function Tilt({ children, className = '', max = 8 }: { children: ReactNode; className?: string; max?: number }) {
  const reduce = useReducedMotion()
  const px = useMotionValue(0.5)
  const py = useMotionValue(0.5)
  const rx = useSpring(useTransform(py, [0, 1], [max, -max]), { stiffness: 160, damping: 18 })
  const ry = useSpring(useTransform(px, [0, 1], [-max, max]), { stiffness: 160, damping: 18 })
  const gx = useTransform(px, (v) => `${v * 100}%`)
  const gy = useTransform(py, (v) => `${v * 100}%`)
  const glare = useMotionTemplate`radial-gradient(420px circle at ${gx} ${gy}, rgba(255,255,255,0.10), transparent 45%)`

  return (
    <motion.div
      className={`relative [transform-style:preserve-3d] ${className}`}
      style={reduce ? undefined : { rotateX: rx, rotateY: ry, transformPerspective: 1100 }}
      onPointerMove={(e) => {
        if (e.pointerType !== 'mouse') return
        const r = e.currentTarget.getBoundingClientRect()
        px.set((e.clientX - r.left) / r.width)
        py.set((e.clientY - r.top) / r.height)
      }}
      onPointerLeave={() => {
        px.set(0.5)
        py.set(0.5)
      }}
    >
      {children}
      <motion.div aria-hidden className="pointer-events-none absolute inset-0 z-20 rounded-[inherit]" style={{ background: glare }} />
    </motion.div>
  )
}

/* ------------------------------------------------------------------ */
/* Small bits                                                          */
/* ------------------------------------------------------------------ */

export function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${value} out of 5 stars`}>
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          width={size}
          height={size}
          className={i < Math.round(value) ? 'fill-ember text-ember' : 'fill-white/10 text-white/10'}
          strokeWidth={0}
        />
      ))}
    </span>
  )
}

export function CountUp({ to, decimals = 0, suffix = '', prefix = '' }: { to: number; decimals?: number; suffix?: string; prefix?: string }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduce = useReducedMotion()
  const [val, setVal] = useState(0)
  useEffect(() => {
    if (!inView) return
    if (reduce) {
      setVal(to)
      return
    }
    const c = animate(0, to, { duration: 2, ease: EASE, onUpdate: setVal })
    return () => c.stop()
  }, [inView, to, reduce])
  return (
    <span ref={ref} className="tabular-nums">
      {prefix}
      {val.toLocaleString('en-US', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}
      {suffix}
    </span>
  )
}

export function Logo({ className = '' }: { className?: string }) {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <svg viewBox="0 0 32 32" className="h-7 w-7" aria-hidden>
        <defs>
          <linearGradient id="lg-n" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffb4a2" />
            <stop offset="1" stopColor="#b9a6ff" />
          </linearGradient>
        </defs>
        <rect x="1" y="1" width="30" height="30" rx="9" fill="none" stroke="rgba(255,255,255,.14)" />
        <path d="M10 22V10l12 12V10" fill="none" stroke="url(#lg-n)" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
      <span className="text-[1.05rem] font-semibold tracking-[0.32em] max-[359px]:hidden">NOCTIS</span>
    </span>
  )
}
