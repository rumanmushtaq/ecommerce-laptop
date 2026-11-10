import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, OrbitControls } from '@react-three/drei'
import { useRef } from 'react'
import { Group, MathUtils } from 'three'
import { framing, ProductModel, type ModelKind } from './ProductModel'
import { StudioLights } from './StudioLights'

function Model({ model, variant, body, reduced }: { model: ModelKind; variant: string; body: string; reduced: boolean }) {
  const group = useRef<Group>(null)
  const drive = useRef({ lid: reduced ? 1.85 : 0.05, power: reduced ? 1 : 0 })
  const t = useRef(0)
  const rest = framing[model].rotY + 0.2
  useFrame((_, dt) => {
    t.current += Math.min(dt, 0.05)
    const k = reduced ? 1 : Math.min(1, t.current / 1.4)
    const e = 1 - Math.pow(1 - k, 3)
    drive.current.lid = MathUtils.lerp(0.05, 1.85, e)
    drive.current.power = Math.min(1, Math.max(0, (t.current - 0.9) / 0.5))
    if (group.current) {
      group.current.rotation.y = MathUtils.lerp(rest - 1.8, rest, e)
      group.current.position.y = MathUtils.lerp(-0.4, 0, e) + (model === 'laptop' ? -0.25 : 0)
    }
  })
  return (
    <group ref={group}>
      <ProductModel model={model} variant={variant} body={body} drive={drive} spin={!reduced} />
    </group>
  )
}

/** Drag-to-rotate viewer for any product kind. Remounts per product so the intro replays. */
export default function QuickViewScene({
  model,
  variant,
  body,
  reduced,
  onReady,
}: {
  model: ModelKind
  variant: string
  body: string
  reduced: boolean
  onReady?: () => void
}) {
  const f = framing[model]
  const dist = Math.hypot(...f.cam)
  return (
    <Canvas dpr={[1, 1.5]} camera={{ position: f.cam, fov: 30 }} gl={{ antialias: true, alpha: true }} onCreated={() => onReady?.()}>
      <StudioLights mood={model === 'tower' || model === 'keyboard' ? 'neon' : 'brand'} />
      <Model model={model} variant={variant} body={body} reduced={reduced} />
      <ContactShadows position={[0, model === 'laptop' ? -0.32 : 0, 0]} opacity={0.65} scale={dist * 1.3} blur={2.6} far={2.5} resolution={256} />
      <OrbitControls
        enablePan={false}
        enableDamping
        minDistance={dist * 0.65}
        maxDistance={dist * 1.3}
        minPolarAngle={0.4}
        maxPolarAngle={1.5}
        autoRotate={!reduced}
        autoRotateSpeed={0.7}
        target={[0, f.look, 0]}
      />
    </Canvas>
  )
}
