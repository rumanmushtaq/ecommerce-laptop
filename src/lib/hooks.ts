import { smooth } from './smoothScroll'
import { useEffect, useState } from 'react'

export function useMediaQuery(query: string) {
  // Starts false on the server and first client render (no hydration mismatch), then syncs
  const [match, setMatch] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia(query)
    const on = () => setMatch(mq.matches)
    on()
    mq.addEventListener('change', on)
    return () => mq.removeEventListener('change', on)
  }, [query])
  return match
}

/** True on devices with a precise hovering pointer (mouse / trackpad). */
export const useFinePointer = () => useMediaQuery('(hover: hover) and (pointer: fine)')

let webglCache: boolean | null = null
export function hasWebGL() {
  if (webglCache !== null) return webglCache
  try {
    const c = document.createElement('canvas')
    webglCache = !!(c.getContext('webgl2') || c.getContext('webgl'))
  } catch {
    webglCache = false
  }
  return webglCache
}

/** WebGL support, known only after mount: null while unknown so server and client render the same markup. */
export function useWebGL() {
  const [ok, setOk] = useState<boolean | null>(null)
  useEffect(() => setOk(hasWebGL()), [])
  return ok
}

type Nav = Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } }

/** Whether this device should run live 3D: WebGL, no reduced motion / data saver, 4+ cores, 4GB+ RAM, tablet width or wider. */
function capable3D() {
  if (!hasWebGL()) return false
  const nav = navigator as Nav
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || nav.connection?.saveData) return false
  if ((nav.hardwareConcurrency ?? 4) < 4 || (nav.deviceMemory ?? 8) < 4) return false
  return window.matchMedia('(min-width: 768px)').matches
}

/** 'high' devices get post-processing and live shadows; everyone else gets the lean scene. */
export function gpuTier(): 'high' | 'mid' {
  const nav = navigator as Nav
  return (nav.hardwareConcurrency ?? 4) >= 8 && (nav.deviceMemory ?? 8) >= 8 ? 'high' : 'mid'
}

/** Live 3D allowed on this device; null until known (after mount). */
export function useCan3D() {
  const [ok, setOk] = useState<boolean | null>(null)
  useEffect(() => setOk(capable3D()), [])
  return ok
}

/**
 * True once the page has fully loaded and the browser is idle, on capable devices only.
 * Lets the hero paint instantly with a still image and swap to 3D without blocking first load.
 */
export function useDeferred3D() {
  const [go, setGo] = useState(false)
  useEffect(() => {
    if (!capable3D()) return
    let idle = 0
    const ric = (window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 1200))) as (cb: () => void, o?: { timeout: number }) => number
    const start = () => {
      idle = ric(() => setGo(true), { timeout: 3000 })
    }
    if (document.readyState === 'complete') start()
    else window.addEventListener('load', start, { once: true })
    return () => {
      window.removeEventListener('load', start)
      ;(window.cancelIdleCallback ?? window.clearTimeout)(idle)
    }
  }, [])
  return go
}

/** Smoothly scroll to a section id. */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (smooth.lenis) smooth.lenis.scrollTo(el, { offset: -8, duration: 1.4 })
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
