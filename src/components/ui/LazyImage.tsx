import { useEffect, useRef, useState, type CSSProperties } from 'react'
import { lqip } from '../../data/lqip'

interface Props {
  src: string
  alt: string
  /** Wrapper: position + size. The box is reserved before the image arrives, so nothing around it shifts. */
  className?: string
  /** Image: fit, transforms, hover effects */
  imgClassName?: string
  /** Aspect ratio of the reserved box when the wrapper isn't sized by its parent (e.g. "4 / 3") */
  ratio?: string
  sizes?: string
  /** Above the fold: fetch immediately at high priority */
  priority?: boolean
  style?: CSSProperties
}

// Product renders ship in two widths; the browser picks the smaller one for cards and thumbnails
const srcSetFor = (src: string) => (src.startsWith('/renders/') ? `${src.replace('.webp', '-800.webp')} 800w, ${src} 1400w` : undefined)

/**
 * Image that only downloads when it is about to scroll into view, shows its own blurred
 * preview + shimmer while loading, decodes off the main thread and fades in. Each image
 * handles its own loading state, so one slow image never affects the rest of the page.
 */
export function LazyImage({ src, alt, className = '', imgClassName = '', ratio, sizes = '(min-width: 1024px) 40vw, 90vw', priority = false, style }: Props) {
  const wrap = useRef<HTMLSpanElement>(null)
  const [near, setNear] = useState(priority)
  const [loaded, setLoaded] = useState(false)
  const [settled, setSettled] = useState(false)

  useEffect(() => {
    if (near) return
    const el = wrap.current
    if (!el || !('IntersectionObserver' in window)) {
      setNear(true)
      return
    }
    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          setNear(true)
          io.disconnect()
        }
      },
      { rootMargin: '400px 0px' },
    )
    io.observe(el)
    return () => io.disconnect()
  }, [near])

  // Drop the placeholder layers once the fade has finished so they cost nothing afterwards
  useEffect(() => {
    if (!loaded) return
    const t = setTimeout(() => setSettled(true), 800)
    return () => clearTimeout(t)
  }, [loaded])

  const preview = lqip[src]
  // Callers may position the box themselves (absolute/fixed); otherwise it anchors its own layers
  const position = /(^|\s)(absolute|fixed)(\s|$)/.test(className) ? '' : 'relative'

  return (
    <span ref={wrap} className={`${position} block ${className}`} style={{ aspectRatio: ratio, ...style }}>
      {!settled && (
        <span aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden transition-opacity duration-700 ${loaded ? 'opacity-0' : 'opacity-100'}`}>
          {preview && <span className="absolute inset-[6%] scale-105 bg-contain bg-center bg-no-repeat opacity-70 blur-lg" style={{ backgroundImage: `url(${preview})` }} />}
          {!loaded && (
            <span className="absolute inset-y-0 left-0 w-full -translate-x-full animate-[shimmer_1.6s_ease-in-out_infinite] bg-gradient-to-r from-transparent via-white/[0.07] to-transparent" />
          )}
        </span>
      )}
      <span className="absolute inset-0 block transition-opacity duration-700" style={{ opacity: loaded ? 1 : 0 }}>
        {near && (
          <img
            src={src}
            srcSet={srcSetFor(src)}
            sizes={sizes}
            alt={alt}
            loading={priority ? 'eager' : 'lazy'}
            decoding="async"
            fetchPriority={priority ? 'high' : 'auto'}
            draggable={false}
            onLoad={(e) => {
              const img = e.currentTarget
              ;(img.decode ? img.decode() : Promise.resolve()).catch(() => undefined).then(() => setLoaded(true))
            }}
            onError={() => setLoaded(true)}
            className={`h-full w-full object-contain ${imgClassName}`}
          />
        )}
      </span>
    </span>
  )
}
