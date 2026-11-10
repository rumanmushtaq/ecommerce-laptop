import { Canvas, useThree } from '@react-three/fiber'
import { ContactShadows } from '@react-three/drei'
import { useEffect, useState } from 'react'
import { framing, ProductModel, type ModelKind } from '../components/three/ProductModel'
import { StudioLights } from '../components/three/StudioLights'
import { screenStatus } from '../components/three/screenTexture'

/**
 * Dev-only render studio (open /studio). Renders each product variant with
 * identical camera + lighting and posts the frame to the Next dev server,
 * which writes it to public/renders/<name>.webp. Add `&preview=<shot>` to
 * look at a single shot without saving.
 */
interface Shot {
  name: string
  model?: ModelKind
  variant: string
  rotY?: number
  cam?: [number, number, number]
  lid?: number
  mood?: 'brand' | 'neon' | 'neutral'
  size?: [number, number]
}

const shots: Shot[] = [
  { name: 'noctis', variant: 'noctis', rotY: -0.55, cam: [0, 2.4, 7.2] },
  { name: 'silver', variant: 'silver', rotY: -0.55, cam: [0, 2.4, 7.2], mood: 'neutral' },
  { name: 'graphite', variant: 'graphite', rotY: -0.55, cam: [0, 2.4, 7.2] },
  { name: 'carbon', variant: 'carbon', rotY: -0.55, cam: [0, 2.4, 7.2], mood: 'neutral' },
  { name: 'eclipse', variant: 'eclipse', rotY: -0.55, cam: [0, 2.4, 7.2], mood: 'neon' },
  { name: 'stealth', variant: 'stealth', rotY: -0.55, cam: [0, 2.4, 7.2], mood: 'neon' },
  { name: 'copper', variant: 'copper', rotY: -0.55, cam: [0, 2.4, 7.2] },
  { name: 'sage', variant: 'sage', rotY: -0.55, cam: [0, 2.4, 7.2], mood: 'neutral' },
  { name: 'titan', variant: 'titan', rotY: -0.55, cam: [0, 2.4, 7.2], mood: 'neon' },
  { name: 'titan-hero', variant: 'titan', rotY: 0.5, cam: [0, 1.1, 6.4], mood: 'neon', size: [1600, 1000] },
  { name: 'silver-side', variant: 'silver', rotY: 0.85, cam: [0, 1.6, 6.8], lid: 1.75, mood: 'neutral' },
  // Desktops
  { name: 'forge', model: 'tower', variant: 'forge', mood: 'neon' },
  { name: 'frost', model: 'tower', variant: 'frost' },
  { name: 'compact', model: 'compact', variant: 'compact', mood: 'neutral' },
  { name: 'forge-hero', model: 'tower', variant: 'forge', rotY: -0.95, cam: [0, 1.6, 7.6], mood: 'neon', size: [1600, 1000] },
  // Monitors
  { name: 'studio-display', model: 'monitor', variant: 'studio', mood: 'neutral' },
  { name: 'odyssey', model: 'monitor', variant: 'odyssey', rotY: -0.25, cam: [0, 2.8, 12], mood: 'neon' },
  { name: 'ultrafine', model: 'monitor', variant: 'ultrafine' },
  { name: 'swift', model: 'monitor', variant: 'swift', mood: 'neon' },
  // Accessories
  { name: 'keyboard', model: 'keyboard', variant: 'keyboard' },
  { name: 'mouse', model: 'mouse', variant: 'mouse' },
  { name: 'headphones', model: 'headphones', variant: 'headphones', mood: 'neutral' },
  { name: 'ssd', model: 'ssd', variant: 'ssd' },
  { name: 'dock', model: 'dock', variant: 'dock' },
]

function Capture({ shot, onDone }: { shot: Shot; onDone: () => void }) {
  const gl = useThree((s) => s.gl)
  const preview = new URLSearchParams(window.location.search).get('preview')
  useEffect(() => {
    if (preview) return
    // Give the environment map + textures a few frames to settle
    let t = 0
    const capture = async () => {
      // Wait until the screen photo + fonts have been painted into the display texture
      if (screenStatus.pending > 0) {
        t = window.setTimeout(capture, 150)
        return
      }
      await new Promise((r) => setTimeout(r, 400))
      const data = gl.domElement.toDataURL('image/webp', 0.9)
      await fetch('/api/save-render', { method: 'POST', body: JSON.stringify({ name: shot.name, data }) })
      onDone()
    }
    t = window.setTimeout(capture, 700)
    return () => clearTimeout(t)
  }, [gl, shot, onDone, preview])
  return null
}

export default function Studio() {
  const preview = new URLSearchParams(window.location.search).get('preview')
  const [index, setIndex] = useState(preview ? Math.max(0, shots.findIndex((s) => s.name === preview)) : 0)
  const shot = shots[index]
  const done = index >= shots.length

  if (done) return <p style={{ color: '#fff', padding: 40, fontFamily: 'monospace' }}>All {shots.length} renders saved.</p>

  const [w, h] = shot.size ?? [1400, 1050]
  const model = shot.model ?? 'laptop'
  const frame = framing[model]
  return (
    <div style={{ background: '#222', minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <p style={{ color: '#aaa', fontFamily: 'monospace' }}>
        {index + 1}/{shots.length} {shot.name}
      </p>
      <div style={{ width: w / 2, height: h / 2 }}>
        <Canvas
          key={shot.name}
          dpr={2}
          gl={{ preserveDrawingBuffer: true, alpha: true, antialias: true }}
          camera={{ position: shot.cam ?? frame.cam, fov: 28 }}
          onCreated={({ camera }) => camera.lookAt(0, frame.look, 0)}
        >
          <StudioLights mood={shot.mood} />
          <group rotation-y={shot.rotY ?? frame.rotY}>
            <ProductModel model={model} variant={shot.variant} lid={shot.lid ?? 1.88} />
          </group>
          <ContactShadows position={[0, frame.ground, 0]} opacity={0.75} scale={9} blur={2.4} far={2} resolution={1024} />
          <Capture shot={shot} onDone={() => setIndex((i) => i + 1)} />
        </Canvas>
      </div>
    </div>
  )
}
