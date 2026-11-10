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

/** Smoothly scroll to a section id. */
export function scrollToId(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  if (smooth.lenis) smooth.lenis.scrollTo(el, { offset: -8, duration: 1.4 })
  else el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}
