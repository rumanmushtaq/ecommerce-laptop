import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { useLayoutEffect, useMemo, useRef, type RefObject } from 'react'
import { AdditiveBlending, Group, InstancedMesh, MeshStandardMaterial, Object3D, ShaderMaterial } from 'three'
import { getRgbTexture, getScreenTexture } from './screenTexture'
import { variants, type LaptopVariant, type VariantKey } from './variants'

export const LAPTOP_W = 3.2
export const LAPTOP_D = 2.2

/** Live values a parent scene can drive every frame (lid angle in radians, screen power 0..1). */
export type LaptopDrive = RefObject<{ lid: number; power: number }>

interface LaptopProps {
  variant?: VariantKey
  lid?: number
  power?: number
  drive?: LaptopDrive
  /** Override the chassis colour (Quick View finishes) */
  body?: string
  /** Animated light layer over the display (hero only: costs a draw call) */
  liveScreen?: boolean
}

// Slow aurora bands + a sweeping glare, added on top of the static wallpaper
const liveScreenShader = {
  uniforms: { uTime: { value: 0 }, uPower: { value: 1 } },
  vertexShader: `varying vec2 vUv; void main() { vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `
    varying vec2 vUv; uniform float uTime; uniform float uPower;
    void main() {
      vec2 uv = vUv;
      float n = sin(uv.x * 5.0 + uTime * 0.5) * 0.5 + 0.5;
      float band = smoothstep(0.35, 1.0, sin(uv.y * 4.0 + sin(uv.x * 3.0 + uTime * 0.4) * 1.4 - uTime * 0.7) * 0.5 + 0.5);
      vec3 col = mix(vec3(0.73, 0.65, 1.0), vec3(1.0, 0.71, 0.64), n) * band * 0.12;
      float sweep = fract(uTime * 0.09) * 2.2 - 0.6;
      float glare = smoothstep(0.06, 0.0, abs(uv.x + uv.y * 0.35 - sweep)) * 0.10;
      gl_FragColor = vec4((col + glare) * uPower, 1.0);
    }`,
}

// Keyboard rows in key units (15u wide). Row 0 is the half-height function row.
const ROWS: number[][] = [
  Array(15).fill(1),
  [...Array(13).fill(1), 2],
  [1.5, ...Array(12).fill(1), 1.5],
  [1.75, ...Array(11).fill(1), 2.25],
  [2.25, ...Array(10).fill(1), 2.75],
  [1, 1, 1, 1.25, 5.5, 1.25, 1, 1, 1, 1],
]

const dummy = new Object3D()

/** Dark anodised finishes lose their colour under strong studio reflections; soften the metal so they read as dark. */
function tuneDark(v: LaptopVariant): LaptopVariant {
  const n = parseInt(v.body.slice(1), 16)
  const lum = (0.2126 * ((n >> 16) & 255) + 0.7152 * ((n >> 8) & 255) + 0.0722 * (n & 255)) / 255
  return lum < 0.2 ? { ...v, metalness: v.metalness * 0.7, roughness: Math.min(0.6, v.roughness + 0.14) } : v
}
const hash = (i: number, j: number) => {
  const x = Math.sin(i * 12.9898 + j * 78.233) * 43758.5453
  return x - Math.floor(x)
}

function Keyboard({ width, y, z, color }: { width: number; y: number; z: number; color: string }) {
  const ref = useRef<InstancedMesh>(null)
  const u = width / 15
  const gap = u * 0.16
  const count = ROWS.reduce((n, r) => n + r.length, 0)

  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    let i = 0
    let rowZ = -2.75 * u // keyboard is 5.5u deep, centred on z
    ROWS.forEach((row, r) => {
      const h = r === 0 ? 0.5 : 1
      let x = -width / 2
      row.forEach((w) => {
        dummy.position.set(x + (w * u) / 2, 0, rowZ + (h * u) / 2)
        dummy.scale.set(w * u - gap, 0.012, h * u - gap)
        dummy.updateMatrix()
        mesh.setMatrixAt(i++, dummy.matrix)
        x += w * u
      })
      rowZ += h * u
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [u, gap, width])

  return (
    <instancedMesh ref={ref} args={[undefined, undefined, count]} position={[0, y, z]}>
      <boxGeometry />
      <meshStandardMaterial color={color} roughness={0.55} metalness={0.15} />
    </instancedMesh>
  )
}

function Matrix({ color, z, y }: { color: string; z: number; y: number }) {
  const ref = useRef<InstancedMesh>(null)
  const cells = useMemo(() => {
    const out: [number, number][] = []
    for (let i = 0; i < 26; i++)
      for (let j = 0; j < 30; j++) {
        // Diagonal band that thins toward its edges, like a dot-matrix lid
        const d = i - j * 0.55
        if (Math.abs(d - 4) < 6 && (i + j) % 2 === 0 && hash(i, j) > Math.abs(d - 4) / 7) out.push([i, j])
      }
    return out
  }, [])
  useLayoutEffect(() => {
    const mesh = ref.current
    if (!mesh) return
    cells.forEach(([i, j], k) => {
      dummy.position.set(-0.75 + i * 0.06, 0, -0.85 + j * 0.06)
      dummy.rotation.set(-Math.PI / 2, 0, 0)
      dummy.scale.setScalar(0.028)
      dummy.updateMatrix()
      mesh.setMatrixAt(k, dummy.matrix)
    })
    mesh.instanceMatrix.needsUpdate = true
  }, [cells])
  return (
    <instancedMesh ref={ref} args={[undefined, undefined, cells.length]} position={[0.3, y, z]}>
      <planeGeometry />
      <meshStandardMaterial color={color} emissive={color} emissiveIntensity={1.6} toneMapped={false} />
    </instancedMesh>
  )
}

export function Laptop({ variant = 'noctis', lid = 1.9, power = 1, drive, body, liveScreen = false }: LaptopProps) {
  const v = tuneDark(body ? { ...variants[variant], body } : variants[variant])
  const W = LAPTOP_W
  const D = LAPTOP_D
  const T = v.thickness
  const LT = v.gaming ? 0.07 : 0.055
  const hingeY = T + 0.014

  const hinge = useRef<Group>(null)
  const display = useRef<MeshStandardMaterial>(null)
  const screenTex = useMemo(() => getScreenTexture(v.screen), [v.screen])
  const rgbTex = useMemo(() => (v.backlight === 'rgb' ? getRgbTexture() : null), [v.backlight])

  const live = useMemo(
    () => (liveScreen ? new ShaderMaterial({ ...liveScreenShader, uniforms: { uTime: { value: 0 }, uPower: { value: 1 } }, transparent: true, blending: AdditiveBlending, depthWrite: false, toneMapped: false }) : null),
    [liveScreen],
  )

  useFrame((state) => {
    if (live) {
      live.uniforms.uTime.value = state.clock.elapsedTime
      live.uniforms.uPower.value = drive?.current ? drive.current.power : power
    }
    if (!drive?.current) return
    if (hinge.current) hinge.current.rotation.x = -drive.current.lid
    if (display.current) display.current.emissiveIntensity = 1.0 * drive.current.power
  })

  const chassis = (
    <meshPhysicalMaterial
      color={v.body}
      metalness={v.metalness}
      roughness={v.roughness}
      clearcoat={0.35}
      clearcoatRoughness={0.35}
    />
  )

  const kbWidth = W * 0.8
  const kbZ = -D * 0.14

  return (
    <group position={[0, -T / 2, 0]}>
      {/* ---------- Base ---------- */}
      <RoundedBox args={[W, T, D]} radius={Math.min(T * 0.45, 0.05)} smoothness={4} position={[0, T / 2, 0]}>
        {chassis}
      </RoundedBox>
      {v.trim && (
        <mesh position={[0, T - 0.006, 0]}>
          <boxGeometry args={[W - 0.006, 0.006, D - 0.006]} />
          <meshStandardMaterial color={v.trim} metalness={1} roughness={0.15} />
        </mesh>
      )}
      {/* Keyboard deck well */}
      <mesh position={[0, T + 0.0008, kbZ]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[kbWidth + 0.01, (kbWidth / 15) * 5.5 + 0.01]} />
        {v.backlight ? (
          <meshStandardMaterial
            color="#000"
            emissive={v.backlight === 'rgb' ? '#ffffff' : v.backlight}
            emissiveMap={rgbTex}
            emissiveIntensity={v.backlight === 'rgb' ? 1.1 : 0.35}
            toneMapped={false}
          />
        ) : (
          <meshStandardMaterial color={v.deck} roughness={0.6} metalness={0.4} />
        )}
      </mesh>
      <Keyboard width={kbWidth} y={T + 0.006} z={kbZ} color={v.keys} />
      {/* Trackpad */}
      <RoundedBox args={[W * 0.36, 0.003, D * 0.27]} radius={0.0015} smoothness={2} position={[0, T + 0.0005, D * 0.3]}>
        <meshPhysicalMaterial color={v.deck} metalness={v.metalness * 0.6} roughness={0.34} clearcoat={0.4} />
      </RoundedBox>
      {/* Side ports */}
      {[-1, 1].map((s) => (
        <group key={s}>
          {[0, 1].map((p) => (
            <mesh key={p} position={[s * (W / 2 + 0.0005), T * 0.5, -0.4 + p * 0.22]}>
              <boxGeometry args={[0.002, Math.min(T * 0.32, 0.03), 0.12]} />
              <meshStandardMaterial color="#050506" roughness={0.9} />
            </mesh>
          ))}
        </group>
      ))}
      {v.gaming && (
        <>
          {/* Front light bar */}
          <mesh position={[0, T * 0.32, D / 2 + 0.001]}>
            <boxGeometry args={[W * 0.62, 0.012, 0.004]} />
            <meshStandardMaterial
              color="#000"
              emissive={v.backlight === 'rgb' ? '#fff' : v.logoColor}
              emissiveMap={rgbTex}
              emissiveIntensity={2}
              toneMapped={false}
            />
          </mesh>
          {/* Side exhaust fins */}
          {[-1, 1].map((s) =>
            Array.from({ length: 9 }, (_, i) => (
              <mesh key={`${s}-${i}`} position={[s * (W / 2 + 0.001), T * 0.55, -D / 2 + 0.16 + i * 0.045]}>
                <boxGeometry args={[0.003, T * 0.42, 0.018]} />
                <meshStandardMaterial color="#030304" roughness={1} />
              </mesh>
            )),
          )}
        </>
      )}

      {/* ---------- Hinge + lid ---------- */}
      <mesh position={[0, hingeY - 0.004, -D / 2 + 0.035]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.03, 0.03, W * 0.72, 20]} />
        <meshStandardMaterial color={v.body} metalness={0.8} roughness={0.45} />
      </mesh>
      <group ref={hinge} position={[0, hingeY, -D / 2]} rotation={[-lid, 0, 0]}>
        <RoundedBox args={[W, LT, D]} radius={Math.min(LT * 0.45, 0.024)} smoothness={4} position={[0, LT / 2, D / 2]}>
          {chassis}
        </RoundedBox>
        {v.trim && (
          <mesh position={[0, 0.006, D / 2]}>
            <boxGeometry args={[W - 0.004, 0.005, D - 0.004]} />
            <meshStandardMaterial color={v.trim} metalness={1} roughness={0.15} />
          </mesh>
        )}
        {/* Bezel glass */}
        <mesh position={[0, -0.0015, D / 2]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W * 0.985, D * 0.985]} />
          <meshPhysicalMaterial color="#030304" roughness={0.12} metalness={0.2} clearcoat={1} />
        </mesh>
        {/* Display */}
        <mesh position={[0, -0.0022, D / 2 + 0.045]} rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[W * 0.95, W * 0.95 * 0.64]} />
          <meshStandardMaterial
            ref={display}
            color="#000"
            emissive="#fff"
            emissiveMap={screenTex}
            emissiveIntensity={1.0 * power}
            roughness={0.18}
            metalness={0.1}
            toneMapped={false}
          />
        </mesh>
        {live && (
          <mesh position={[0, -0.0032, D / 2 + 0.045]} rotation={[Math.PI / 2, 0, 0]} material={live}>
            <planeGeometry args={[W * 0.95, W * 0.95 * 0.64]} />
          </mesh>
        )}
        {/* Webcam */}
        <mesh position={[0, -0.0025, D - 0.035]} rotation={[Math.PI / 2, 0, 0]}>
          <circleGeometry args={[0.012, 16]} />
          <meshStandardMaterial color="#0d1830" roughness={0.1} metalness={0.6} />
        </mesh>

        {/* Lid logo */}
        {v.logo === 'ring' && (
          <mesh position={[0, LT + 0.0012, D / 2]} rotation={[-Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.16, 0.012, 12, 64]} />
            <meshStandardMaterial color={v.logoColor} emissive={v.logoColor} emissiveIntensity={1.8} toneMapped={false} />
          </mesh>
        )}
        {v.logo === 'dot' && (
          <mesh position={[0, LT + 0.0012, D / 2]} rotation={[-Math.PI / 2, 0, 0]}>
            <circleGeometry args={[0.13, 48]} />
            <meshStandardMaterial
              color={v.logoColor}
              emissive={v.logoColor}
              emissiveIntensity={v.logoColor === '#ff2a2a' ? 1.6 : 0.15}
              metalness={1}
              roughness={0.05}
            />
          </mesh>
        )}
        {v.logo === 'bar' && (
          <mesh position={[0, LT + 0.0012, D / 2]} rotation={[-Math.PI / 2, 0, 0]}>
            <planeGeometry args={[0.7, 0.03]} />
            <meshStandardMaterial color={v.logoColor} emissive={v.logoColor} emissiveIntensity={0.6} metalness={1} roughness={0.1} />
          </mesh>
        )}
        {v.logo === 'matrix' && <Matrix color={v.logoColor} y={LT + 0.0012} z={D / 2} />}
      </group>
    </group>
  )
}
