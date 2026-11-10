import Lenis from 'lenis'
import { useEffect } from 'react'

/** The active Lenis instance (null when reduced motion is on or before mount). */
export const smooth: { lenis: Lenis | null } = { lenis: null }

/** Inertia smooth scrolling for the whole page. Paused while an overlay panel is open. */
export function useSmoothScroll(paused: boolean) {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return
    const lenis = new Lenis({
      lerp: 0.085,
      wheelMultiplier: 1,
      anchors: { offset: -16 },
      prevent: (node) => !!node.closest?.('[data-lenis-prevent]'),
    })
    smooth.lenis = lenis
    let raf = requestAnimationFrame(function loop(t) {
      lenis.raf(t)
      raf = requestAnimationFrame(loop)
    })
    return () => {
      cancelAnimationFrame(raf)
      lenis.destroy()
      smooth.lenis = null
    }
  }, [])

  useEffect(() => {
    if (paused) smooth.lenis?.stop()
    else smooth.lenis?.start()
  }, [paused])
}
