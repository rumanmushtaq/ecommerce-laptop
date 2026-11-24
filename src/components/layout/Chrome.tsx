import { motion, useMotionValue, useReducedMotion, useScroll, useSpring } from 'motion/react'
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
        animate={{ width: hover ? 54 : 30, height: hover ? 54 : 30, opacity: hover ? 1 : 0.6, scale: down ? 0.8 : 1, backgroundColor: hover ? 'rgba(245,243,240,0.08)' : 'rgba(0,0,0,0)' }}
        transition={{ duration: 0.35, ease: EASE }}
      />
    </>
  )
}

/** Feeds the pointer position into `.spotlight` cards and `.spot-text` as --mx / --my (one write per frame). */
export function Spotlights() {
  const fine = useFinePointer()
  useEffect(() => {
    if (!fine) return
    let frame = 0
    let last: PointerEvent | null = null
    const apply = () => {
      frame = 0
      const el = (last?.target as Element | null)?.closest?.<HTMLElement>('.spotlight, .spot-text')
      if (!el || !last) return
      const r = el.getBoundingClientRect()
      el.style.setProperty('--mx', `${last.clientX - r.left}px`)
      el.style.setProperty('--my', `${last.clientY - r.top}px`)
    }
    const onMove = (e: PointerEvent) => {
      last = e
      if (!frame) frame = requestAnimationFrame(apply)
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('pointermove', onMove)
      cancelAnimationFrame(frame)
    }
  }, [fine])
  return null
}
