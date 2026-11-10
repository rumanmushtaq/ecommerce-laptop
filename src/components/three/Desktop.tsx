import { useFrame } from '@react-three/fiber'
import { RoundedBox } from '@react-three/drei'
import { useMemo, useRef } from 'react'
import { BoxGeometry, BufferGeometry, Group, PlaneGeometry } from 'three'
import { getRgbTexture, getScreenTexture, type ScreenSpec } from './screenTexture'

/* ================================================================== */
/* Presets                                                            */
/* ================================================================== */

export interface MonitorVariant {
  /** Visible panel size in scene units (width x height) */
  width: number
  height: number
  /** Radius of curvature for curved panels; omit for flat */
  curve?: number
  shell: string
  metalness: number
  roughness: number
  stand: 'plate' | 'v'
  /** Ring light on the back (gaming) */
  glow?: string
  screen: ScreenSpec
}

export interface TowerVariant {
  shell: string
  trim: string
  metalness: number
  roughness: number
  /** Fan ring colours, cycled across the fans */
  fans: string[]
  screen?: never
}

export const monitorVariants = {
  studio: {
    width: 3.6,
    height: 2.025,
    shell: '#c9cbd1',
    metalness: 0.95,
    roughness: 0.28,
    stand: 'plate',
    screen: { app: 'desktop', photo: 'river', accent: '#9ee6cf', size: [1600, 900] },
  },
  odyssey: {
    width: 5.8,
    height: 1.63,
    curve: 6,
    shell: '#e8e7ee',
    metalness: 0.3,
    roughness: 0.45,
    stand: 'v',
    glow: '#b9a6ff',
    screen: { app: 'game', photo: 'peaks', accent: '#ff7ab6', size: [2560, 720] },
  },
  ultrafine: {
    width: 3.9,
    height: 2.19,
    shell: '#1b1a22',
    metalness: 0.6,
    roughness: 0.4,
    stand: 'plate',
    screen: { app: 'video', photo: 'dune', accent: '#b9a6ff', size: [1600, 900] },
  },
  swift: {
    width: 3.5,
    height: 1.97,
    shell: '#121116',
    metalness: 0.5,
    roughness: 0.45,
    stand: 'v',
    glow: '#ff7ab6',
    screen: { app: 'game', photo: 'city', accent: '#ff7ab6', size: [1600, 900] },
  },
} satisfies Record<string, MonitorVariant>

export const towerVariants = {
  forge: { shell: '#17161f', trim: '#2a2838', metalness: 0.6, roughness: 0.4, fans: ['#b9a6ff', '#ff7ab6', '#9ee6cf'] },
  frost: { shell: '#e6e4ec', trim: '#c9c6d4', metalness: 0.35, roughness: 0.45, fans: ['#9ee6cf', '#b9a6ff', '#ffb4a2'] },
} satisfies Record<string, TowerVariant>

export type MonitorKey = keyof typeof monitorVariants
export type TowerKey = keyof typeof towerVariants

/* ================================================================== */
/* Helpers                                                            */
/* ================================================================== */

/** Wraps a geometry around a vertical cylinder so a panel curves toward the viewer at its edges. */
function bend<T extends BufferGeometry>(geo: T, radius?: number): T {
  if (!radius) return geo
  const pos = geo.attributes.position
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i)
    const z = pos.getZ(i)
    const a = x / radius
    pos.setX(i, Math.sin(a) * (radius - z))
    pos.setZ(i, z + radius - Math.cos(a) * radius)
  }
  pos.needsUpdate = true
  geo.computeVertexNormals()
  return geo
}

/* ================================================================== */
/* Monitor                                                            */
/* ================================================================== */

export function Monitor({ variant = 'studio', power = 1, body }: { variant?: MonitorKey; power?: number; body?: string }) {
  const v: MonitorVariant = monitorVariants[variant]
  const shell = body ?? v.shell
  const { width: w, height: h, curve } = v
  const screen = useMemo(() => getScreenTexture(v.screen), [v.screen])
  const segs = curve ? 64 : 1
  const panelGeo = useMemo(() => bend(new BoxGeometry(w + 0.08, h + 0.08, 0.06, segs, 1, 1), curve), [w, h, curve, segs])
  const screenGeo = useMemo(() => {
    const g = new PlaneGeometry(w, h, segs, 1)
    g.translate(0, 0, 0.0305)
    return bend(g, curve)
  }, [w, h, curve, segs])
  const centerY = 1.15 + h / 2

  return (
    <group>
      <group position={[0, centerY, 0]}>
        {/* Panel shell + bezel */}
        <mesh geometry={panelGeo}>
          <meshPhysicalMaterial color={shell} metalness={v.metalness} roughness={v.roughness} clearcoat={0.4} />
        </mesh>
        <mesh geometry={screenGeo}>
          <meshStandardMaterial color="#000" emissive="#fff" emissiveMap={screen} emissiveIntensity={power} roughness={0.15} metalness={0.1} toneMapped={false} />
        </mesh>
        {/* Electronics hump on the back */}
        <RoundedBox args={[Math.min(w * 0.5, 2.2), h * 0.6, 0.22]} radius={0.06} smoothness={4} position={[0, -h * 0.05, -0.14]}>
          <meshPhysicalMaterial color={shell} metalness={v.metalness} roughness={v.roughness + 0.05} clearcoat={0.3} />
        </RoundedBox>
        {v.glow && (
          <mesh position={[0, -h * 0.05, -0.252]} rotation-y={Math.PI}>
            <torusGeometry args={[0.32, 0.018, 12, 64]} />
            <meshStandardMaterial color={v.glow} emissive={v.glow} emissiveIntensity={2} toneMapped={false} />
          </mesh>
        )}
      </group>
      {/* Stand */}
      <RoundedBox args={[0.34, centerY - 0.05, 0.08]} radius={0.03} smoothness={3} position={[0, (centerY - 0.05) / 2 + 0.02, -0.32]} rotation-x={-0.12}>
        <meshPhysicalMaterial color={shell} metalness={v.metalness} roughness={v.roughness} clearcoat={0.3} />
      </RoundedBox>
      {v.stand === 'plate' ? (
        <RoundedBox args={[1.5, 0.05, 1.05]} radius={0.024} smoothness={4} position={[0, 0.025, -0.15]}>
          <meshPhysicalMaterial color={shell} metalness={v.metalness} roughness={v.roughness} clearcoat={0.5} />
        </RoundedBox>
      ) : (
        <group position={[0, 0.03, -0.3]}>
          {[-1, 1].map((s) => (
            <RoundedBox key={s} args={[0.12, 0.05, 1.5]} radius={0.02} smoothness={2} position={[s * 0.45, 0, 0.35]} rotation-y={s * 0.6}>
              <meshStandardMaterial color="#1a1920" metalness={0.7} roughness={0.35} />
            </RoundedBox>
          ))}
        </group>
      )}
    </group>
  )
}

/* ================================================================== */
/* Tower PC                                                           */
/* ================================================================== */

function Fan({ color, size = 0.26, spin = false, axis = 'z' }: { color: string; size?: number; spin?: boolean; axis?: 'x' | 'y' | 'z' }) {
  const blades = useRef<Group>(null)
  useFrame((_, dt) => {
    if (spin && blades.current) blades.current.rotation.z += dt * 9
  })
  const rot: [number, number, number] = axis === 'x' ? [0, Math.PI / 2, 0] : axis === 'y' ? [Math.PI / 2, 0, 0] : [0, 0, 0]
  return (
    <group rotation={rot}>
      <mesh>
        <torusGeometry args={[size, size * 0.07, 12, 48]} />
        <meshStandardMaterial color={color} emissive={color} emissiveIntensity={2.2} toneMapped={false} />
      </mesh>
      <group ref={blades}>
        {Array.from({ length: 7 }, (_, i) => (
          <mesh key={i} rotation-z={(i / 7) * Math.PI * 2} position={[0, 0, 0]}>
            <planeGeometry args={[size * 0.28, size * 1.7]} />
            <meshStandardMaterial color="#0c0b10" roughness={0.6} transparent opacity={0.85} side={2} />
          </mesh>
        ))}
        <mesh>
          <circleGeometry args={[size * 0.28, 24]} />
          <meshStandardMaterial color="#111" emissive={color} emissiveIntensity={0.4} />
        </mesh>
      </group>
    </group>
  )
}

export function Tower({ variant = 'forge', spin = false, body }: { variant?: TowerKey; spin?: boolean; body?: string }) {
  const v: TowerVariant = towerVariants[variant]
  const shell = body ?? v.shell
  const W = 1.05
  const H = 2.25
  const D = 2.1
  const rgb = useMemo(() => getRgbTexture(), [])
  const panel = (args: [number, number, number], pos: [number, number, number]) => (
    <mesh position={pos}>
      <boxGeometry args={args} />
      <meshPhysicalMaterial color={shell} metalness={v.metalness} roughness={v.roughness} clearcoat={0.35} />
    </mesh>
  )

  return (
    <group position={[0, 0.06, 0]}>
      {/* Shell: top, bottom, back, left side, front frame */}
      {panel([W, 0.06, D], [0, H - 0.03, 0])}
      {panel([W, 0.08, D], [0, 0.04, 0])}
      {panel([W, H, 0.05], [0, H / 2, -D / 2 + 0.025])}
      {panel([0.05, H, D], [-W / 2 + 0.025, H / 2, 0])}
      {/* Front: dark mesh panel with a vertical light bar */}
      <mesh position={[0, H / 2, D / 2 - 0.02]}>
        <boxGeometry args={[W, H, 0.04]} />
        <meshStandardMaterial color={v.trim} metalness={0.4} roughness={0.7} />
      </mesh>
      <mesh position={[W / 2 - 0.09, H / 2, D / 2 + 0.002]}>
        <planeGeometry args={[0.03, H * 0.82]} />
        <meshStandardMaterial color="#000" emissive="#fff" emissiveMap={rgb} emissiveIntensity={1.6} toneMapped={false} />
      </mesh>
      {/* Glass frame edges on the window side */}
      {[
        [0.04, 0.04, D, 0, H - 0.04],
        [0.04, 0.04, D, 0, 0.1],
      ].map(([a, b, c, , y], i) => (
        <mesh key={i} position={[W / 2 - 0.02, y, 0]}>
          <boxGeometry args={[a, b, c]} />
          <meshStandardMaterial color={v.trim} metalness={0.6} roughness={0.4} />
        </mesh>
      ))}

      {/* ---------- Interior, seen through the glass ---------- */}
      <pointLight position={[0.1, H * 0.6, 0.2]} color={v.fans[0]} intensity={3} distance={2.4} decay={1.5} />
      <pointLight position={[0.1, H * 0.25, 0.5]} color={v.fans[1]} intensity={2} distance={2} decay={1.5} />
      {/* Motherboard */}
      <mesh position={[-W / 2 + 0.07, H * 0.6, -0.15]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[1.45, 1.5]} />
        <meshStandardMaterial color="#121118" metalness={0.5} roughness={0.5} />
      </mesh>
      {/* CPU pump with glowing ring */}
      <group position={[-W / 2 + 0.16, H * 0.72, -0.2]}>
        <mesh rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.17, 0.17, 0.16, 32]} />
          <meshStandardMaterial color="#1a1922" metalness={0.8} roughness={0.25} />
        </mesh>
        <mesh position={[0.081, 0, 0]} rotation-y={Math.PI / 2}>
          <torusGeometry args={[0.12, 0.015, 12, 48]} />
          <meshStandardMaterial color={v.fans[0]} emissive={v.fans[0]} emissiveIntensity={2.5} toneMapped={false} />
        </mesh>
      </group>
      {/* RAM sticks with lit tops */}
      {[0, 1, 2, 3].map((i) => (
        <group key={i} position={[-W / 2 + 0.13, H * 0.72, 0.18 + i * 0.07]}>
          <mesh>
            <boxGeometry args={[0.1, 0.5, 0.03]} />
            <meshStandardMaterial color="#17161e" metalness={0.6} roughness={0.4} />
          </mesh>
          <mesh position={[0.0, 0.26, 0]}>
            <boxGeometry args={[0.1, 0.03, 0.032]} />
            <meshStandardMaterial color="#000" emissive={v.fans[i % v.fans.length]} emissiveIntensity={2.4} toneMapped={false} />
          </mesh>
        </group>
      ))}
      {/* Graphics card */}
      <group position={[-W / 2 + 0.3, H * 0.42, 0.05]}>
        <RoundedBox args={[0.42, 0.32, 1.55]} radius={0.03} smoothness={3}>
          <meshPhysicalMaterial color="#1c1b24" metalness={0.85} roughness={0.25} clearcoat={0.6} />
        </RoundedBox>
        <mesh position={[0.212, 0.06, 0]} rotation-y={Math.PI / 2}>
          <planeGeometry args={[1.3, 0.025]} />
          <meshStandardMaterial color="#000" emissive="#fff" emissiveMap={rgb} emissiveIntensity={1.8} toneMapped={false} />
        </mesh>
        <mesh position={[0.212, -0.05, 0.35]} rotation-y={Math.PI / 2}>
          <planeGeometry args={[0.42, 0.07]} />
          <meshStandardMaterial color="#d8d4e6" metalness={0.9} roughness={0.2} />
        </mesh>
      </group>
      {/* Top radiator fans */}
      {[-0.55, 0, 0.55].map((z, i) => (
        <group key={z} position={[-0.02, H - 0.14, z]}>
          <Fan color={v.fans[i % v.fans.length]} size={0.22} spin={spin} axis="y" />
        </group>
      ))}
      {/* Front intake fans, visible through the glass edge */}
      {[0.55, 1.15, 1.75].map((y, i) => (
        <group key={y} position={[0.05, y, D / 2 - 0.12]}>
          <Fan color={v.fans[(i + 1) % v.fans.length]} size={0.27} spin={spin} axis="z" />
        </group>
      ))}
      {/* Rear exhaust */}
      <group position={[0, H * 0.72, -D / 2 + 0.09]}>
        <Fan color={v.fans[2 % v.fans.length]} size={0.22} spin={spin} axis="z" />
      </group>
      {/* PSU shroud */}
      <mesh position={[0.02, 0.27, -0.02]}>
        <boxGeometry args={[W - 0.12, 0.36, D - 0.12]} />
        <meshStandardMaterial color={v.trim} metalness={0.5} roughness={0.5} />
      </mesh>
      <mesh position={[W / 2 - 0.085, 0.3, 0.2]} rotation-y={Math.PI / 2}>
        <ringGeometry args={[0.07, 0.085, 32]} />
        <meshStandardMaterial color={v.fans[0]} emissive={v.fans[0]} emissiveIntensity={2} toneMapped={false} />
      </mesh>
      {/* Tempered glass side */}
      <mesh position={[W / 2 - 0.004, H / 2, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[D - 0.02, H - 0.1]} />
        <meshPhysicalMaterial color="#d9d6ff" transparent opacity={0.12} roughness={0.04} metalness={0} clearcoat={1} depthWrite={false} />
      </mesh>
      {/* Feet */}
      {[-1, 1].map((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * (W / 2 - 0.12), -0.03, sz * (D / 2 - 0.2)]}>
            <cylinderGeometry args={[0.07, 0.07, 0.06, 20]} />
            <meshStandardMaterial color="#0b0b0e" roughness={0.8} />
          </mesh>
        )),
      )}
    </group>
  )
}

/* ================================================================== */
/* Compact desktop                                                    */
/* ================================================================== */

export function Compact({ body = '#c9cbd1' }: { body?: string }) {
  const W = 2.0
  const H = 0.98
  return (
    <group>
      <RoundedBox args={[W, H, W]} radius={0.22} smoothness={6} position={[0, H / 2 + 0.05, 0]}>
        <meshPhysicalMaterial color={body} metalness={0.95} roughness={0.27} clearcoat={0.4} />
      </RoundedBox>
      {/* Recessed base ring */}
      <mesh position={[0, 0.03, 0]}>
        <cylinderGeometry args={[0.82, 0.82, 0.06, 64]} />
        <meshStandardMaterial color="#141318" roughness={0.6} />
      </mesh>
      {/* Front I/O: two USB-C, SD slot, status LED */}
      {[-0.62, -0.5].map((x) => (
        <RoundedBox key={x} args={[0.07, 0.03, 0.01]} radius={0.012} smoothness={2} position={[x, 0.28, W / 2 + 0.001]}>
          <meshStandardMaterial color="#09090b" />
        </RoundedBox>
      ))}
      <RoundedBox args={[0.22, 0.02, 0.01]} radius={0.008} smoothness={2} position={[-0.28, 0.28, W / 2 + 0.001]}>
        <meshStandardMaterial color="#09090b" />
      </RoundedBox>
      <mesh position={[0.78, 0.28, W / 2 + 0.002]}>
        <circleGeometry args={[0.014, 16]} />
        <meshStandardMaterial color="#9ee6cf" emissive="#9ee6cf" emissiveIntensity={3} toneMapped={false} />
      </mesh>
      {/* Logo on the lid */}
      <mesh position={[0, H + 0.051, 0]} rotation-x={-Math.PI / 2}>
        <circleGeometry args={[0.16, 48]} />
        <meshStandardMaterial color="#f2f2f5" metalness={1} roughness={0.08} />
      </mesh>
    </group>
  )
}
