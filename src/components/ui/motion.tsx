import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  wrap,
} from 'motion/react'
import { useEffect, useRef, useState, type ReactNode } from 'react'
import { EASE } from './primitives'

/** Skew (deg) that follows how fast the page is scrolling — headings lean into the motion. */
export function useVelocitySkew(max = 4) {
  const reduce = useReducedMotion()
  const { scrollY } = useScroll()
  const velocity = useVelocity(scrollY)
  const smooth = useSpring(velocity, { damping: 40, stiffness: 300 })
  return useTransform(smooth, [-2500, 0, 2500], reduce ? [0, 0, 0] : [max, 0, -max], { clamp: true })
}

export function VelocitySkew({ children, className = '', max = 4 }: { children: ReactNode; className?: string; max?: number }) {
  const skewY = useVelocitySkew(max)
  return (
    <motion.div style={{ skewY }} className={className}>
      {children}
    </motion.div>
  )
}

const GLYPHS = '!<>-_\\/[]{}—=+*^?#ABCDEFGHJKLMNOPQRSTUVWXYZ0123456789'

/** Text that resolves out of random glyphs when it scrolls into view. */
export function Scramble({ text, className = '', delay = 0 }: { text: string; className?: string; delay?: number }) {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-10% 0px' })
  const reduce = useReducedMotion()
  const [out, setOut] = useState(text)

  useEffect(() => {
    if (!inView || reduce) return
    let frame = 0
    let raf = 0
    const total = 26 + text.length
    const start = performance.now() + delay * 1000
    const tick = (now: number) => {
      if (now < start) {
        setOut(text.replace(/\S/g, () => GLYPHS[(Math.random() * GLYPHS.length) | 0]))
        raf = requestAnimationFrame(tick)
        return
      }
      frame++
      const revealed = Math.floor((frame / total) * text.length * 1.6)
      setOut(
        text
          .split('')
          .map((c, i) => (i < revealed || c === ' ' ? c : GLYPHS[(Math.random() * GLYPHS.length) | 0]))
          .join(''),
      )
      if (revealed < text.length) raf = requestAnimationFrame(tick)
      else setOut(text)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, reduce, text, delay])

  return (
    <span ref={ref} className={className} aria-label={text}>
      <span aria-hidden>{out}</span>
    </span>
  )
}

/** Image/figure wipes in from the bottom with a slight zoom-out when it enters the viewport. */
export function MaskReveal({ children, className = '', delay = 0 }: { children: ReactNode; className?: string; delay?: number }) {
  const reduce = useReducedMotion()
  return (
    <motion.div
      className={className}
      initial={reduce ? { opacity: 0 } : { clipPath: 'inset(100% 0% 0% 0%)', scale: 1.08 }}
      whileInView={reduce ? { opacity: 1 } : { clipPath: 'inset(0% 0% 0% 0%)', scale: 1 }}
      viewport={{ once: true, margin: '-12% 0px' }}
      transition={{ duration: 1.3, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  )
}

/** Endless row whose speed (and direction) reacts to scroll velocity. */
export function VelocityMarquee({ children, baseSpeed = 2.2, className = '' }: { children: ReactNode; baseSpeed?: number; className?: string }) {
  const reduce = useReducedMotion()
  const x = useMotionValue(0)
  const { scrollY } = useScroll()
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 })
  const factor = useTransform(velocity, [0, 1200], [0, 6], { clamp: false })
  const dir = useRef(1)
  const hovered = useRef(false)
  const pos = useTransform(x, (v) => `${wrap(-50, 0, v)}%`)

  useAnimationFrame((_, delta) => {
    if (reduce) return
    const f = factor.get()
    if (f < 0) dir.current = -1
    else if (f > 0) dir.current = 1
    const speed = hovered.current ? 0.25 : 1
    x.set(x.get() + dir.current * baseSpeed * speed * (delta / 1000) * (1 + Math.abs(f)) * -1)
  })

  return (
    <div
      className={`overflow-hidden ${className}`}
      onMouseEnter={() => (hovered.current = true)}
      onMouseLeave={() => (hovered.current = false)}
    >
      <motion.div className="flex w-max" style={{ x: pos }}>
        {children}
        {children}
      </motion.div>
    </div>
  )
}

/** Pastel light behind the whole page. Static gradients on one fixed layer: costs nothing per frame. */
export function AuroraBackdrop() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10"
      style={{
        background:
          'radial-gradient(60vmax 50vmax at 0% 0%, rgba(185,166,255,0.10), transparent 70%), radial-gradient(55vmax 45vmax at 100% 30%, rgba(255,180,162,0.07), transparent 70%), radial-gradient(50vmax 40vmax at 30% 100%, rgba(158,230,207,0.05), transparent 70%)',
      }}
    />
  )
}
