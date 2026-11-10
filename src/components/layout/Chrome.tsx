import { AnimatePresence, motion, useMotionValue, useReducedMotion, useScroll, useSpring } from 'motion/react'
import { useEffect, useState } from 'react'
import { useFinePointer } from '../../lib/hooks'
import { EASE } from '../ui/primitives'

export function ScrollProgress() {
  const { scrollYProgress } = useScroll()
  const scaleX = useSpring(scrollYProgress, { stiffness: 120, damping: 24, restDelta: 0.001 })
  return <motion.div aria-hidden className="fixed inset-x-0 top-0 z-[55] h-[2px] origin-left bg-gradient-to-r from-ember via-ember-soft to-ice" style={{ scaleX }} />
}

/** Dot + lagging ring. Grows over anything interactive. Desktop pointers only. */
export function Cursor() {
  const fine = useFinePointer()
  const reduce = useReducedMotion()
  const x = useMotionValue(-100)
  const y = useMotionValue(-100)
  const rx = useSpring(x, { stiffness: 260, damping: 26, mass: 0.5 })
  const ry = useSpring(y, { stiffness: 260, damping: 26, mass: 0.5 })
  const [hover, setHover] = useState(false)
  const [down, setDown] = useState(false)

  useEffect(() => {
    if (!fine || reduce) return
    const move = (e: PointerEvent) => {
      x.set(e.clientX)
      y.set(e.clientY)
      const t = e.target as HTMLElement | null
      setHover(!!t?.closest('a, button, [data-cursor="hover"], input, label, [role="option"]'))
    }
    const d = () => setDown(true)
    const u = () => setDown(false)
    window.addEventListener('pointermove', move)
    window.addEventListener('pointerdown', d)
    window.addEventListener('pointerup', u)
    return () => {
      window.removeEventListener('pointermove', move)
      window.removeEventListener('pointerdown', d)
      window.removeEventListener('pointerup', u)
    }
  }, [fine, reduce, x, y])

  if (!fine || reduce) return null
  return (
    <>
      <motion.div aria-hidden className="pointer-events-none fixed left-0 top-0 z-[100] h-1.5 w-1.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-ember" style={{ x, y }} />
      <motion.div
        aria-hidden
        className="pointer-events-none fixed left-0 top-0 z-[100] -translate-x-1/2 -translate-y-1/2 rounded-full border border-ember/50"
        style={{ x: rx, y: ry }}
        animate={{ width: hover ? 54 : 30, height: hover ? 54 : 30, opacity: hover ? 1 : 0.6, scale: down ? 0.8 : 1, backgroundColor: hover ? 'rgba(238,234,247,0.08)' : 'rgba(0,0,0,0)' }}
        transition={{ duration: 0.35, ease: EASE }}
      />
    </>
  )
}

/** Short branded intro; resolves as soon as fonts are in so it never blocks for long. */
export function Preloader({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion()
  const [pct, setPct] = useState(0)
  const [gone, setGone] = useState(false)

  useEffect(() => {
    const start = performance.now()
    const min = reduce ? 0 : 1100
    let fontsReady = false
    document.fonts?.ready.then(() => (fontsReady = true))
    let raf = 0
    const tick = () => {
      const t = Math.min(1, (performance.now() - start) / Math.max(min, 1))
      const target = fontsReady ? t : Math.min(t, 0.85)
      setPct(Math.round(target * 100))
      if (target >= 1) {
        setGone(true)
        onDone()
        return
      }
      raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    // Safety net: never hold the page longer than 2.5s
    const bail = setTimeout(() => {
      setGone(true)
      onDone()
    }, 2500)
    return () => {
      cancelAnimationFrame(raf)
      clearTimeout(bail)
    }
  }, [onDone, reduce])

  return (
    <AnimatePresence>
      {!gone && (
        <motion.div
          className="fixed inset-0 z-[200] flex items-end justify-between bg-ink px-6 pb-8 sm:px-12 sm:pb-12"
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          initial={{ clipPath: 'inset(0 0 0% 0)' }}
          transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
          role="status"
          aria-label="Loading"
        >
          <div>
            <p className="eyebrow">Noctis — 2026 collection</p>
            <p className="mt-2 font-serif text-4xl italic text-bone/90 sm:text-6xl">Sculpted in light.</p>
          </div>
          <p className="font-mono text-6xl font-light tabular-nums text-bone sm:text-8xl">
            {pct}
            <span className="text-ember">%</span>
          </p>
          <motion.div className="absolute left-0 top-0 h-[2px] bg-ember" style={{ width: `${pct}%` }} />
        </motion.div>
      )}
    </AnimatePresence>
  )
}
