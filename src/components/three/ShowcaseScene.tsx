import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import type { MotionValue } from 'motion/react'
import { useRef } from 'react'
import { Group, MathUtils } from 'three'
import { Laptop } from './Laptop'
import { StudioLights } from './StudioLights'

// One pose per story chapter: display, performance, silence, craft
const POSES = [
  { rotY: 0, rotX: 0.12, lid: 1.78, y: -0.15 },
  { rotY: -0.55, rotX: 0.62, lid: 1.95, y: -0.5 },
  { rotY: -1.5, rotX: 0.04, lid: 1.62, y: -0.1 },
  { rotY: -3.65, rotX: 0.22, lid: 1.75, y: -0.15 },
]

const smooth = (t: number) => t * t * (3 - 2 * t)

function Model({ progress, reduced }: { progress: MotionValue<number>; reduced: boolean }) {
  const group = useRef<Group>(null)
  const drive = useRef({ lid: POSES[0].lid, power: 1 })

  useFrame((state, dt) => {
    const g = group.current
    if (!g) return
    const s = Math.min(0.9999, Math.max(0, progress.get())) * (POSES.length - 1)
    const i = Math.floor(s)
    const f = smooth(s - i)
    const a = POSES[i]
    const b = POSES[Math.min(i + 1, POSES.length - 1)]
    const lerp = (k: 'rotY' | 'rotX' | 'lid' | 'y') => MathUtils.lerp(a[k], b[k], f)
    const k = reduced ? 50 : 5
    g.rotation.y = MathUtils.damp(g.rotation.y, lerp('rotY') + state.pointer.x * 0.08, k, dt)
    g.rotation.x = MathUtils.damp(g.rotation.x, lerp('rotX'), k, dt)
    g.position.y = MathUtils.damp(g.position.y, lerp('y'), k, dt)
    drive.current.lid = MathUtils.damp(drive.current.lid, lerp('lid'), k, dt)
    const wide = state.viewport.aspect > 1.05
    g.scale.setScalar(wide ? Math.min(1.25, state.viewport.width / 5.4) : Math.min(0.9, (state.viewport.width * 0.95) / 3.5))
  })

  return (
    <group ref={group}>
      <Laptop variant="noctis" drive={drive} />
    </group>
  )
}

export default function ShowcaseScene({ progress, active, reduced }: { progress: MotionValue<number>; active: boolean; reduced: boolean }) {
  return (
    <Canvas
      frameloop={active ? 'always' : 'demand'}
      dpr={[1, 1.5]}
      camera={{ position: [0, 1.3, 7], fov: 30 }}
      gl={{ antialias: true, alpha: true }}
      onCreated={({ camera }) => camera.lookAt(0, 0.35, 0)}
      aria-hidden
    >
      <StudioLights mood="brand" />
      <spotLight position={[0, 6, 2]} angle={0.5} penumbra={1} intensity={30} color="#efe8ff" />
      <Model progress={progress} reduced={reduced} />
      <ContactShadows position={[0, -1.05, 0]} opacity={0.6} scale={9} blur={2.8} far={3} resolution={256} />
    </Canvas>
  )
}
