'use client'

import { AnimatePresence, motion } from 'motion/react'
import type { VariantKey } from '../three/variants'
import { LazyImage } from '../ui/LazyImage'
import { useCompanion } from './context'

export type CompanionPose = 'hero' | 'showcase' | 'float' | 'closing'

/** Still render for every laptop design, used before the 3D companion arrives and on phones. */
export const variantImage: Record<VariantKey, string> = {
  noctis: '/renders/noctis.webp',
  silver: '/renders/silver.webp',
  graphite: '/renders/graphite.webp',
  carbon: '/renders/carbon.webp',
  eclipse: '/renders/eclipse.webp',
  stealth: '/renders/stealth.webp',
  copper: '/renders/copper.webp',
  sage: '/renders/sage.webp',
  titan: '/renders/titan.webp',
}

/**
 * A place on the page where the travelling 3D laptop lands. The companion reads this element's
 * position, size, design (data-variant) and pose every frame. Until the 3D is live (or on phones)
 * the slot shows the matching still render, crossfading when the design changes.
 */
export function CompanionSlot({
  id,
  variant,
  pose,
  className = '',
  priority = false,
  sizes = '(min-width: 1024px) 50vw, 92vw',
}: {
  id: string
  variant: VariantKey | 'none'
  pose: CompanionPose
  className?: string
  priority?: boolean
  sizes?: string
}) {
  const { active } = useCompanion()
  const live = active && variant !== 'none'
  // Callers may position the slot themselves; otherwise it anchors its own image layer
  const position = /(^|\s)!?(absolute|fixed)(\s|$)/.test(className) ? '' : 'relative'
  return (
    <div data-companion={id} data-variant={variant} data-pose={pose} className={`${position} ${className}`} style={{ aspectRatio: '4 / 3' }}>
      <AnimatePresence initial={false}>
        {variant !== 'none' && (
          <motion.div
            key={variant}
            className="absolute inset-0"
            initial={{ opacity: 0, scale: 0.94, rotate: -2 }}
            animate={{ opacity: live ? 0 : 1, scale: 1, rotate: 0 }}
            exit={{ opacity: 0, scale: 1.04 }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          >
            {priority ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={variantImage[variant].replace('.webp', '-800.webp')}
                srcSet={`${variantImage[variant].replace('.webp', '-800.webp')} 800w, ${variantImage[variant]} 1400w`}
                sizes={sizes}
                alt=""
                width={1400}
                height={1050}
                fetchPriority="high"
                className="h-full w-full object-contain"
              />
            ) : (
              <LazyImage src={variantImage[variant]} alt="" sizes={sizes} className="h-full w-full" />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
