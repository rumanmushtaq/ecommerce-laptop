'use client'

import { useReducedMotion } from 'motion/react'
import dynamic from 'next/dynamic'
import { useDeferred3D } from '../../lib/hooks'
import { useCompanion } from './context'

const CompanionScene = dynamic(() => import('../three/CompanionScene'), { ssr: false })

/**
 * Boots the travelling 3D laptop once the page is idle (capable devices only) and fades it in
 * over the still images already showing in each slot.
 */
export function Companion() {
  const load = useDeferred3D()
  const reduce = !!useReducedMotion()
  const { active, setActive } = useCompanion()
  if (!load) return null
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-30 transition-opacity duration-700" style={{ opacity: active ? 1 : 0 }}>
      <CompanionScene reduced={reduce} onReady={() => setActive(true)} />
    </div>
  )
}
