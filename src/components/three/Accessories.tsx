import { RoundedBox } from '@react-three/drei'
import { useLayoutEffect, useMemo, useRef } from 'react'
import { InstancedMesh, Object3D } from 'three'
import { getRgbTexture } from './screenTexture'

const dummy = new Object3D()

/** 75% aluminium mechanical keyboard with pastel accent keys and RGB underglow. */
export function Keyboard({ body = '#2a2838' }: { body?: string }) {
  const keys = useRef<InstancedMesh>(null)
  const accents = useRef<InstancedMesh>(null)
  const rgb = useMemo(() => getRgbTexture(), [])
  const u = 0.19
  // [x (units), row, width (units), accent?]
  const layout = useMemo(() => {
    const out: [number, number, number, boolean][] = []
    const rows: number[][] = [
      Array(15).fill(1),
      [...Array(13).fill(1), 2],
      [1.5, ...Array(12).fill(1), 1.5],
      [1.75, ...Array(11).fill(1), 2.25],
      [2.25, ...Array(10).fill(1), 1.75, 1],
      [1.25, 1.25, 1.25, 6.25, 1, 1, 1, 1, 1],
    ]
    rows.forEach((row, r) => {
      let x = 0
      row.forEach((w, i) => {
        const accent = (r === 0 && i === 0) || (r === 2 && i === row.length - 1) || (r === 5 && w > 6)
        out.push([x + w / 2, r, w, accent])
        x += w
      })
    })
    return out
  }, [])

  useLayoutEffect(() => {
    let a = 0
    let b = 0
    layout.forEach(([x, r, w, accent]) => {
      dummy.position.set((x - 7.5) * u, 0, (r - 2.5) * u)
      dummy.scale.set(w * u - 0.03, 0.09, u - 0.03)
      dummy.updateMatrix()
      if (accent) accents.current?.setMatrixAt(a++, dummy.matrix)
      else keys.current?.setMatrixAt(b++, dummy.matrix)
    })
    if (keys.current) keys.current.instanceMatrix.needsUpdate = true
    if (accents.current) accents.current.instanceMatrix.needsUpdate = true
  }, [layout])

  const nAccent = layout.filter((k) => k[3]).length
  return (
    <group>
      <RoundedBox args={[3.05, 0.2, 1.32]} radius={0.06} smoothness={4} position={[0, 0.1, 0]} rotation-x={0.05}>
        <meshPhysicalMaterial color={body} metalness={0.85} roughness={0.32} clearcoat={0.4} />
      </RoundedBox>
      <mesh position={[0, 0.205, 0]} rotation-x={-Math.PI / 2 + 0.05}>
        <planeGeometry args={[2.9, 1.18]} />
        <meshStandardMaterial color="#000" emissive="#fff" emissiveMap={rgb} emissiveIntensity={0.9} toneMapped={false} />
      </mesh>
      <group position={[0, 0.27, 0]} rotation-x={0.05}>
        <instancedMesh ref={keys} args={[undefined, undefined, layout.length - nAccent]}>
          <boxGeometry />
          <meshStandardMaterial color="#e9e6f2" roughness={0.55} />
        </instancedMesh>
        <instancedMesh ref={accents} args={[undefined, undefined, nAccent]}>
          <boxGeometry />
          <meshStandardMaterial color="#b9a6ff" roughness={0.5} />
        </instancedMesh>
      </group>
      {/* Knob */}
      <mesh position={[1.36, 0.36, -0.5]}>
        <cylinderGeometry args={[0.1, 0.1, 0.14, 32]} />
        <meshStandardMaterial color="#d8d4e6" metalness={1} roughness={0.2} />
      </mesh>
    </group>
  )
}

/** Ergonomic wireless mouse. */
export function Mouse({ body = '#4a4756' }: { body?: string }) {
  return (
    <group>
      <mesh position={[0, 0.2, 0]} scale={[0.55, 0.32, 0.95]}>
        <sphereGeometry args={[1, 48, 32, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshPhysicalMaterial color={body} metalness={0.25} roughness={0.62} clearcoat={0.15} />
      </mesh>
      <mesh position={[0, 0.2, 0]} rotation-x={-Math.PI / 2} scale={[0.55, 0.95, 1]}>
        <circleGeometry args={[1, 48]} />
        <meshStandardMaterial color="#0e0d12" />
      </mesh>
      {/* Button split + wheel */}
      <mesh position={[0, 0.5, 0.42]} rotation-x={-0.5}>
        <boxGeometry args={[0.008, 0.02, 0.5]} />
        <meshStandardMaterial color="#0b0a0f" />
      </mesh>
      <mesh position={[0, 0.5, 0.42]} rotation-z={Math.PI / 2}>
        <cylinderGeometry args={[0.07, 0.07, 0.06, 24]} />
        <meshStandardMaterial color="#b9a6ff" metalness={0.8} roughness={0.25} emissive="#b9a6ff" emissiveIntensity={0.4} />
      </mesh>
      {/* Thumb rest */}
      <mesh position={[-0.5, 0.15, 0]} scale={[0.12, 0.12, 0.5]}>
        <sphereGeometry args={[1, 24, 16]} />
        <meshPhysicalMaterial color={body} metalness={0.25} roughness={0.62} clearcoat={0.15} />
      </mesh>
    </group>
  )
}

/** Over-ear noise-cancelling headphones. */
export function Headphones({ body = '#d9d5e6' }: { body?: string }) {
  return (
    <group position={[0, 0.05, 0]}>
      <mesh position={[0, 0.85, 0]}>
        <torusGeometry args={[0.82, 0.07, 16, 64, Math.PI]} />
        <meshPhysicalMaterial color={body} metalness={0.4} roughness={0.4} clearcoat={0.5} />
      </mesh>
      <mesh position={[0, 0.85, 0]}>
        <torusGeometry args={[0.78, 0.05, 12, 64, Math.PI]} />
        <meshStandardMaterial color="#1c1a24" roughness={0.9} />
      </mesh>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.84, 0.55, 0]} rotation-z={(s * Math.PI) / 2}>
          <mesh>
            <cylinderGeometry args={[0.4, 0.42, 0.24, 48]} />
            <meshPhysicalMaterial color={body} metalness={0.4} roughness={0.38} clearcoat={0.6} />
          </mesh>
          <mesh position={[0, s * -0.13, 0]} rotation-x={Math.PI / 2}>
            <torusGeometry args={[0.31, 0.09, 16, 48]} />
            <meshStandardMaterial color="#26232f" roughness={0.95} />
          </mesh>
          <mesh position={[0, s * 0.121, 0]} rotation-x={(s * -Math.PI) / 2}>
            <ringGeometry args={[0.16, 0.18, 48]} />
            <meshStandardMaterial color="#b9a6ff" emissive="#b9a6ff" emissiveIntensity={1.4} toneMapped={false} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Pocket SSD in a soft-touch shell. */
export function Ssd({ body = '#b9a6ff' }: { body?: string }) {
  return (
    <group>
      <RoundedBox args={[1.25, 0.14, 0.8]} radius={0.06} smoothness={6} position={[0, 0.07, 0]}>
        <meshPhysicalMaterial color={body} metalness={0.2} roughness={0.55} clearcoat={0.3} />
      </RoundedBox>
      <mesh position={[0, 0.141, 0]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.5, 0.06]} />
        <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.2} />
      </mesh>
      <RoundedBox args={[0.12, 0.04, 0.02]} radius={0.015} smoothness={2} position={[0, 0.07, 0.401]}>
        <meshStandardMaterial color="#0b0a0f" />
      </RoundedBox>
      <mesh position={[0.5, 0.07, 0.402]}>
        <circleGeometry args={[0.012, 16]} />
        <meshStandardMaterial color="#9ee6cf" emissive="#9ee6cf" emissiveIntensity={3} toneMapped={false} />
      </mesh>
    </group>
  )
}

/** Thunderbolt dock with a row of front ports. */
export function Dock({ body = '#1c1b24' }: { body?: string }) {
  return (
    <group>
      <RoundedBox args={[1.7, 0.26, 0.62]} radius={0.06} smoothness={4} position={[0, 0.13, 0]}>
        <meshPhysicalMaterial color={body} metalness={0.85} roughness={0.3} clearcoat={0.4} />
      </RoundedBox>
      {[-0.6, -0.45, -0.3, -0.12, 0.05, 0.2].map((x, i) => (
        <RoundedBox key={x} args={[i < 3 ? 0.1 : 0.12, i < 3 ? 0.035 : 0.05, 0.02]} radius={0.012} smoothness={2} position={[x, 0.13, 0.311]}>
          <meshStandardMaterial color="#07070a" />
        </RoundedBox>
      ))}
      <mesh position={[0.62, 0.13, 0.312]}>
        <circleGeometry args={[0.04, 24]} />
        <meshStandardMaterial color="#07070a" />
      </mesh>
      <mesh position={[0, 0.262, 0.2]} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[1.4, 0.012]} />
        <meshStandardMaterial color="#b9a6ff" emissive="#b9a6ff" emissiveIntensity={2} toneMapped={false} />
      </mesh>
    </group>
  )
}
