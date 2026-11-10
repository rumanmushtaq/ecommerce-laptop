import { Canvas, useFrame } from '@react-three/fiber'
import { ContactShadows, Float, PerformanceMonitor, RoundedBox } from '@react-three/drei'
import { Bloom, EffectComposer, Vignette } from '@react-three/postprocessing'
import type { MotionValue } from 'motion/react'
import { useMemo, useRef, useState } from 'react'
import { AdditiveBlending, CanvasTexture, Group, MathUtils, PointLight, Vector3 } from 'three'
import { Laptop } from './Laptop'
import { StudioLights } from './StudioLights'

interface Props {
  progress: MotionValue<number>
  active: boolean
  started: boolean
  reduced: boolean
  compact: boolean
  onReady?: () => void
}

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const clamp01 = (t: number) => Math.min(1, Math.max(0, t))

function Rig({ progress, started, reduced, compact }: Omit<Props, 'active' | 'onReady'>) {
  const root = useRef<Group>(null)
  const product = useRef<Group>(null)
  const floaters = useRef<Group>(null)
  const drive = useRef({ lid: reduced ? 1.85 : 0, power: reduced ? 1 : 0 })
  // Own intro timer: R3F resets clock.elapsedTime whenever frameloop toggles
  const intro = useRef(0)
  const camTarget = useMemo(() => new Vector3(), [])

  useFrame((state, dt) => {
    if (!root.current || !product.current) return
    const { viewport, pointer, clock } = state
    if (started) intro.current += Math.min(dt, 0.05)
    const t = intro.current

    // Intro choreography: rise + spin in, lid opens, display powers on
    const rise = reduced ? 1 : ease(clamp01(t / 1.5))
    const open = reduced ? 1 : ease(clamp01((t - 0.55) / 1.45))
    const power = reduced ? 1 : clamp01((t - 1.6) / 0.6)
    const p = progress.get()

    drive.current.lid = MathUtils.lerp(0.02, 1.85, open) - p * 0.55
    drive.current.power = power * (1 - p * 0.4)

    // Responsive placement: right of the headline on wide screens, below it on phones
    // Measured at the resting camera distance (8.6), not the current one, so the fly-in doesn't shift layout
    const vh = 4.609
    const vw = vh * viewport.aspect
    const wide = viewport.aspect > 1.05
    const scale = wide ? Math.min(0.92, vw / 8.6) : Math.min(0.58, (vw * 0.72) / 3.6)
    const baseX = wide ? vw * 0.19 : -vw * 0.04
    const baseY = wide ? -0.32 : -vh * 0.27

    root.current.position.set(baseX, baseY + p * 1.1 + (1 - rise) * -0.9, 0)
    root.current.scale.setScalar(scale * (1 + p * 0.12))

    const follow = reduced || compact ? 0 : 1
    const idle = reduced ? 0 : Math.sin(clock.elapsedTime * 0.35) * 0.08
    const targetY = -0.42 + (1 - rise) * -1.6 + pointer.x * 0.32 * follow + p * 1.2 + idle
    const targetX = 0.06 - pointer.y * 0.12 * follow + p * 0.25
    product.current.rotation.y = MathUtils.damp(product.current.rotation.y, targetY, 4, dt)
    product.current.rotation.x = MathUtils.damp(product.current.rotation.x, targetX, 4, dt)
    product.current.position.y = reduced ? 0 : Math.sin(clock.elapsedTime * 0.9) * 0.05

    // Camera: dolly in from high and wide during the intro, then sway subtly with the pointer
    const fly = reduced ? 1 : ease(clamp01(t / 2.4))
    camTarget.set(
      pointer.x * 0.35 * follow,
      MathUtils.lerp(3.6, 1.5, fly) + pointer.y * 0.18 * follow,
      MathUtils.lerp(13.5, 8.6, fly),
    )
    state.camera.position.lerp(camTarget, reduced ? 1 : 1 - Math.exp(-6 * dt))
    state.camera.lookAt(baseX * 0.35, 0.2 - p * 0.3, 0)

    if (floaters.current) {
      // Depth parallax: decorative layer drifts against the pointer
      floaters.current.position.x = MathUtils.damp(floaters.current.position.x, -pointer.x * 0.3 * follow, 3, dt)
      floaters.current.position.y = MathUtils.damp(floaters.current.position.y, -pointer.y * 0.2 * follow - p * 0.6, 3, dt)
      const s = MathUtils.damp(floaters.current.scale.x, rise, 3, dt)
      floaters.current.scale.setScalar(s)
    }
  })

  return (
    <group ref={root}>
      <group ref={product}>
        <Laptop variant="noctis" drive={drive} liveScreen />
      </group>
      <group ref={floaters}>
        <Floaters compact={compact} reduced={reduced} />
      </group>
      <ContactShadows position={[0, -0.115, 0]} opacity={0.7} scale={8} blur={2.6} far={2.2} resolution={256} color="#000" />
      {!reduced && <Floor />}
    </group>
  )
}

/** Light pool spilling from the display onto the floor: additive radial gradient, no extra render pass. */
function Floor() {
  const tex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const ctx = c.getContext('2d')!
    const g = ctx.createRadialGradient(128, 110, 0, 128, 128, 128)
    g.addColorStop(0, 'rgba(255,180,162,0.55)')
    g.addColorStop(0.35, 'rgba(185,166,255,0.18)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    ctx.fillStyle = g
    ctx.fillRect(0, 0, 256, 256)
    return new CanvasTexture(c)
  }, [])
  return (
    <mesh rotation-x={-Math.PI / 2} position={[0, -0.122, -0.4]}>
      <planeGeometry args={[9, 6]} />
      <meshBasicMaterial map={tex} transparent blending={AdditiveBlending} depthWrite={false} toneMapped={false} />
    </mesh>
  )
}

function Chip() {
  return (
    <group>
      <RoundedBox args={[0.62, 0.07, 0.62]} radius={0.02} smoothness={3}>
        <meshStandardMaterial color="#141519" metalness={0.6} roughness={0.4} />
      </RoundedBox>
      <mesh position={[0, 0.04, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.36, 0.36]} />
        <meshStandardMaterial color="#d8a564" metalness={1} roughness={0.22} />
      </mesh>
      <mesh position={[0, 0.0365, 0]} rotation-x={-Math.PI / 2}>
        <ringGeometry args={[0.24, 0.255, 4, 1]} />
        <meshStandardMaterial color="#b9a6ff" emissive="#b9a6ff" emissiveIntensity={2.5} toneMapped={false} />
      </mesh>
    </group>
  )
}

function Orb({ r }: { r: number }) {
  return (
    <mesh>
      <sphereGeometry args={[r, 48, 48]} />
      <meshPhysicalMaterial
        color="#1a1a1f"
        metalness={1}
        roughness={0.08}
        iridescence={1}
        iridescenceIOR={1.6}
        iridescenceThicknessRange={[200, 800]}
        clearcoat={1}
      />
    </mesh>
  )
}

function Floaters({ compact, reduced }: { compact: boolean; reduced: boolean }) {
  const speed = reduced ? 0 : 1.4
  return (
    <>
      <Float speed={speed} rotationIntensity={0.8} floatIntensity={0.6} position={[-1.75, 1.9, -1.4]} rotation={[0.5, 0.4, -0.2]}>
        <Chip />
      </Float>
      <Float speed={speed * 0.8} rotationIntensity={0.3} floatIntensity={0.9} position={[2.3, 1.55, -1.1]}>
        <Orb r={0.34} />
      </Float>
      <Float speed={speed} rotationIntensity={1.2} floatIntensity={0.5} position={[1.95, -0.55, -1.8]} rotation={[1.1, 0.2, 0.3]}>
        <mesh>
          <torusGeometry args={[0.55, 0.014, 16, 96]} />
          <meshStandardMaterial color="#b9a6ff" emissive="#b9a6ff" emissiveIntensity={2} toneMapped={false} />
        </mesh>
      </Float>
      {!compact && (
        <>
          <Float speed={speed * 1.1} rotationIntensity={1} floatIntensity={0.8} position={[-1.9, -0.95, 1.1]} rotation={[0.3, 0.6, 0.2]}>
            <RoundedBox args={[0.34, 0.2, 0.34]} radius={0.05} smoothness={4}>
              <meshPhysicalMaterial color="#b9a6ff" roughness={0.35} clearcoat={0.6} />
            </RoundedBox>
          </Float>
          <Float speed={speed * 0.7} rotationIntensity={0.6} floatIntensity={0.7} position={[2.15, -1.05, 1.1]}>
            <Orb r={0.16} />
          </Float>
          <Float speed={speed * 0.9} rotationIntensity={0.7} floatIntensity={0.6} position={[0.55, 2.05, -1.9]} rotation={[0.4, -0.5, 0.25]}>
            <RoundedBox args={[1, 0.035, 0.28]} radius={0.012} smoothness={2}>
              <meshStandardMaterial color="#1b1c21" metalness={0.8} roughness={0.3} />
            </RoundedBox>
            <mesh position={[0.25, 0.019, 0]} rotation-x={-Math.PI / 2}>
              <planeGeometry args={[0.32, 0.12]} />
              <meshStandardMaterial color="#9ee6cf" emissive="#9ee6cf" emissiveIntensity={1.2} toneMapped={false} />
            </mesh>
          </Float>
        </>
      )}
    </>
  )
}

/** Two coloured lights orbiting the product so its edges catch moving highlights. */
function OrbitLights({ reduced }: { reduced: boolean }) {
  const a = useRef<PointLight>(null)
  const b = useRef<PointLight>(null)
  useFrame(({ clock }) => {
    const t = reduced ? 1 : clock.elapsedTime * 0.45
    a.current?.position.set(Math.cos(t) * 4.5, 1.6 + Math.sin(t * 1.3) * 0.6, Math.sin(t) * 3)
    b.current?.position.set(Math.cos(t + Math.PI) * 4.5, 1.2, Math.sin(t + Math.PI) * 3)
  })
  return (
    <>
      <pointLight ref={a} color="#b9a6ff" intensity={14} distance={11} decay={1.6} />
      <pointLight ref={b} color="#9ee6cf" intensity={10} distance={11} decay={1.6} />
    </>
  )
}

export default function HeroScene({ active, onReady, ...rest }: Props) {
  // Adaptive quality: drop resolution and post-processing on slower GPUs so scrolling stays smooth
  const [dpr, setDpr] = useState(rest.compact ? 1.25 : 1.5)
  const [fx, setFx] = useState(!rest.compact)
  return (
    <Canvas
      frameloop={active ? 'always' : 'demand'}
      dpr={dpr}
      camera={{ position: [0, 3.6, 13.5], fov: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ camera }) => {
        camera.lookAt(0, 0.2, 0)
        onReady?.()
      }}
      resize={{ debounce: 120 }}
      aria-hidden
    >
      <PerformanceMonitor
        onDecline={() => {
          setDpr(1)
          setFx(false)
        }}
        onIncline={() => setDpr(rest.compact ? 1.25 : 1.5)}
        flipflops={3}
        onFallback={() => {
          setDpr(1)
          setFx(false)
        }}
      />
      <StudioLights mood="brand" />
      <OrbitLights reduced={rest.reduced} />
      <Rig {...rest} />
      {fx && (
        <EffectComposer multisampling={4} enableNormalPass={false}>
          <Bloom mipmapBlur luminanceThreshold={1} luminanceSmoothing={0.2} intensity={0.9} radius={0.72} />
          <Vignette offset={0.3} darkness={0.35} />
        </EffectComposer>
      )}
    </Canvas>
  )
}
