import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { PerformanceMonitor } from '@react-three/drei'
import { useEffect, useMemo, useRef, useState } from 'react'
import { CanvasTexture, Color, Group, MathUtils, Mesh, MeshBasicMaterial, Vector3 } from 'three'
import type { CompanionPose } from '../companion/CompanionSlot'
import { Laptop } from './Laptop'
import { getScreenTexture } from './screenTexture'
import { StudioLights } from './StudioLights'
import { variants, type VariantKey } from './variants'

interface Slot {
  el: HTMLElement
  cx: number
  cy: number
  w: number
  h: number
  variant: VariantKey
  /** Optional chassis colour override (hero finish configurator) */
  body?: string
  pose: CompanionPose
}

// Showcase chapters (display, performance, silence, craft): orientation + lid per chapter
const CHAPTERS = [
  { rotY: 0.05, rotX: 0.14, lid: 1.78 },
  { rotY: -0.55, rotX: 0.62, lid: 1.95 },
  { rotY: -1.45, rotX: 0.06, lid: 1.62 },
  { rotY: -2.45, rotX: 0.34, lid: 1.55 },
]

const clamp01 = (v: number) => Math.min(1, Math.max(0, v))
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2)
const smooth = (t: number) => t * t * (3 - 2 * t)

/** All visible slots on the page, top to bottom, in viewport pixels. */
function readSlots(): Slot[] {
  const out: Slot[] = []
  document.querySelectorAll<HTMLElement>('[data-companion]').forEach((el) => {
    const v = el.dataset.variant
    if (!v || v === 'none') return
    const r = el.getBoundingClientRect()
    if (r.width < 2) return // hidden at this breakpoint
    out.push({ el, cx: r.left + r.width / 2, cy: r.top + r.height / 2, w: r.width, h: r.height, variant: v as VariantKey, body: el.dataset.body || undefined, pose: (el.dataset.pose ?? 'float') as CompanionPose })
  })
  return out.sort((a, b) => a.cy - b.cy)
}

/** Scroll progress through the section that holds a slot (0 when its top hits the top of the viewport). */
function sectionProgress(el: HTMLElement, vh: number) {
  const sec = el.closest('section')
  if (!sec) return 0
  const r = sec.getBoundingClientRect()
  return clamp01(-r.top / Math.max(1, r.height - vh))
}

function Traveller({ reduced }: { reduced: boolean }) {
  const outer = useRef<Group>(null)
  const orient = useRef<Group>(null)
  const morphG = useRef<Group>(null)
  const burst = useRef<Mesh>(null)
  const shadow = useRef<Mesh>(null)
  const drive = useRef({ lid: 1.85, power: 1 })
  const [shown, setShown] = useState<{ variant: VariantKey; body?: string }>({ variant: 'noctis' })
  // Designs are compared as "variant|body" keys
  const state = useRef({ shown: 'noctis|', morph: -1, target: 'noctis|', swapped: false, burst: -1, first: true })
  const { camera, size } = useThree()

  const v = useMemo(() => ({ ndc: new Vector3(), p: new Vector3(), l: new Vector3(), r: new Vector3() }), [])
  const shadowTex = useMemo(() => {
    const c = document.createElement('canvas')
    c.width = c.height = 128
    const x = c.getContext('2d')!
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64)
    g.addColorStop(0, 'rgba(0,0,0,0.75)')
    g.addColorStop(1, 'rgba(0,0,0,0)')
    x.fillStyle = g
    x.fillRect(0, 0, 128, 128)
    return new CanvasTexture(c)
  }, [])

  // Screen point -> point on the z=0 plane the laptop lives on
  const toWorld = (px: number, py: number, out: Vector3) => {
    v.ndc.set((px / size.width) * 2 - 1, -(py / size.height) * 2 + 1, 0.5).unproject(camera)
    v.ndc.sub(camera.position).normalize()
    const d = -camera.position.z / v.ndc.z
    return out.copy(camera.position).addScaledVector(v.ndc, d)
  }

  useFrame((frame, dt) => {
    const o = outer.current
    const or = orient.current
    const mg = morphG.current
    if (!o || !or || !mg) return
    const slots = readSlots()
    if (!slots.length) return
    const vh = size.height
    const mid = vh / 2
    const time = frame.clock.elapsedTime
    const st = state.current

    // ---- Where should the laptop be? Between the slot above and the slot below the viewport centre
    let prev: Slot | null = null
    let next: Slot | null = null
    for (const s of slots) {
      if (s.cy <= mid) prev = s
      else if (!next) next = s
    }
    const a = prev ?? next!
    const b = next ?? prev!
    let t = 0
    let travel = 0
    if (prev && next) {
      // Stay docked while a slot is still fully on screen, so the laptop sits still inside its card
      // as you read it; only once the slot starts leaving does it set off for the next one.
      const gap = next.cy - prev.cy
      let holdA = Math.max(0, (vh - prev.h) / 2) * 0.85
      let holdB = Math.max(0, (vh - next.h) / 2) * 0.85
      // Always keep at least 60% of a screen for the trip itself, so it never whips across
      const room = gap - holdA - holdB
      const minTrip = Math.min(gap, vh * 0.6)
      if (room < minTrip) {
        const shrink = Math.max(0, gap - minTrip) / Math.max(1, holdA + holdB)
        holdA *= shrink
        holdB *= shrink
      }
      t = clamp01((mid - prev.cy - holdA) / Math.max(1, gap - holdA - holdB))
      // Long gaps (e.g. the product grid) send it gliding small along the right edge so it never blocks
      // content: it tucks in within the first ~12% of the gap and only leaves the edge near the next slot
      const plateau = smooth(Math.min(clamp01(t / 0.12), clamp01((1 - t) / 0.12)))
      travel = plateau * clamp01((next.cy - prev.cy - vh) / vh)
    }
    const e = smooth(t)
    let px = MathUtils.lerp(a.cx, b.cx, e)
    let py = MathUtils.lerp(a.cy, b.cy, e)
    let pw = MathUtils.lerp(a.w, b.w, e)
    px = MathUtils.lerp(px, size.width * 0.95, travel)
    py = MathUtils.lerp(py, vh * 0.74, travel)
    pw = MathUtils.lerp(pw, Math.min(pw, size.width * 0.13), travel)
    const slot = t < 0.5 ? a : b

    toWorld(px, py, v.p)
    toWorld(px - pw / 2, py, v.l)
    toWorld(px + pw / 2, py, v.r)
    // Fit the laptop's footprint inside the slot; the showcase's rear and side views need more room
    const fit = slot.pose === 'showcase' ? 4.9 : 4.3
    const scale = v.l.distanceTo(v.r) / fit
    // Snappier when docked in a slot, floatier while travelling
    const k = st.first ? 1000 : MathUtils.lerp(12, 5, Math.sin(Math.PI * t))
    st.first = false
    o.position.x = MathUtils.damp(o.position.x, v.p.x, k, dt)
    o.position.y = MathUtils.damp(o.position.y, v.p.y, k, dt)
    o.scale.setScalar(MathUtils.damp(o.scale.x, scale, k, dt))

    // ---- Pose for the slot it is heading to
    let rotY = -0.5
    let rotX = 0.16
    let lid = 1.85
    const pointer = frame.pointer
    if (slot.pose === 'hero') {
      rotY = -0.42 + pointer.x * 0.3 + (reduced ? 0 : Math.sin(time * 0.35) * 0.07)
      rotX = 0.12 - pointer.y * 0.1
    } else if (slot.pose === 'showcase') {
      const p = sectionProgress(slot.el, vh) * (CHAPTERS.length - 1)
      const i = Math.min(CHAPTERS.length - 2, Math.floor(p))
      const f = smooth(p - i)
      rotY = MathUtils.lerp(CHAPTERS[i].rotY, CHAPTERS[i + 1].rotY, f) + pointer.x * 0.08
      rotX = MathUtils.lerp(CHAPTERS[i].rotX, CHAPTERS[i + 1].rotX, f)
      lid = MathUtils.lerp(CHAPTERS[i].lid, CHAPTERS[i + 1].lid, f)
    } else if (slot.pose === 'closing') {
      const r = slot.el.getBoundingClientRect()
      const p = clamp01((vh - r.top) / (vh + r.height))
      rotY = -0.3 + (reduced ? 0 : Math.sin(time * 0.3) * 0.1)
      lid = MathUtils.lerp(1.85, 0.25, smooth(clamp01((p - 0.55) * 2.4)))
    } else {
      rotY = -0.55 + (reduced ? 0 : Math.sin(time * 0.45) * 0.25)
      rotX = 0.18 + (reduced ? 0 : Math.sin(time * 0.6) * 0.04)
    }
    // A slow tumble while gliding between distant slots
    rotY += travel * Math.PI * 0.85
    rotX += travel * 0.35
    or.rotation.y = MathUtils.damp(or.rotation.y, rotY, 5, dt)
    or.rotation.x = MathUtils.damp(or.rotation.x, rotX, 5, dt)
    if (!reduced) or.position.y = Math.sin(time * 0.9) * 0.05

    // ---- Design swap: spin a full turn, dip the screen, swap the model at the edge-on moment
    const want = `${slot.variant}|${slot.body ?? ''}`
    if (st.morph < 0 && want !== st.shown) {
      st.morph = 0
      st.target = want
      st.swapped = false
    }
    let power = 1
    if (st.morph >= 0) {
      st.morph += dt / (reduced ? 0.05 : 0.95)
      if (!st.swapped && st.morph >= 0.5) {
        st.swapped = true
        st.shown = st.target
        st.burst = 0
        const [variant, body] = st.target.split('|')
        setShown({ variant: variant as VariantKey, body: body || undefined })
      }
      const m = Math.min(st.morph, 1)
      mg.rotation.y = reduced ? 0 : easeInOut(m) * Math.PI * 2
      mg.scale.setScalar(1 - 0.2 * Math.sin(Math.PI * m))
      power = 1 - 0.9 * Math.sin(Math.PI * m)
      if (st.morph >= 1) {
        st.morph = -1
        mg.rotation.y = 0
        mg.scale.setScalar(1)
      }
    }
    drive.current.lid = MathUtils.damp(drive.current.lid, lid, 5, dt)
    drive.current.power = power

    // ---- Light ring that blooms out when a new design lands
    const ring = burst.current
    if (ring) {
      if (st.burst >= 0) {
        st.burst += dt / 0.75
        const q = Math.min(st.burst, 1)
        ring.visible = true
        ring.scale.setScalar(0.8 + q * 1.4)
        ;(ring.material as MeshBasicMaterial).opacity = (1 - q) * 0.7
        if (st.burst >= 1) st.burst = -1
      } else ring.visible = false
    }
    if (shadow.current) (shadow.current.material as MeshBasicMaterial).opacity = 0.6 * (1 - travel * 0.8)
  })

  const accent = useMemo(() => new Color(shown.body ?? variants[shown.variant].logoColor), [shown])

  return (
    <group ref={outer}>
      <group ref={orient}>
        <mesh ref={shadow} rotation-x={-Math.PI / 2} position={[0, -0.97, 0.15]}>
          <planeGeometry args={[5.2, 3.4]} />
          <meshBasicMaterial map={shadowTex} transparent depthWrite={false} opacity={0.6} />
        </mesh>
        <mesh ref={burst} rotation-x={-Math.PI / 2} position={[0, -0.9, 0.2]} visible={false}>
          <torusGeometry args={[1.4, 0.018, 12, 96]} />
          <meshBasicMaterial color={accent} transparent opacity={0} toneMapped={false} depthWrite={false} />
        </mesh>
        <group ref={morphG}>
          {/* Offset so rotations pivot around the laptop's visual centre */}
          <group position={[0, -0.95, 0.35]}>
            <Laptop variant={shown.variant} body={shown.body} drive={drive} liveScreen={shown.variant === 'noctis'} />
          </group>
        </group>
      </group>
    </group>
  )
}

/** Paint every laptop screen during idle time so design swaps never hitch. */
function usePrewarmScreens() {
  useEffect(() => {
    const keys = Object.keys(variants) as VariantKey[]
    let i = 0
    let id = 0
    const ric = (window.requestIdleCallback ?? ((cb: () => void) => window.setTimeout(cb, 300))) as (cb: () => void) => number
    const step = () => {
      if (i >= keys.length) return
      getScreenTexture(variants[keys[i++]].screen)
      id = ric(step)
    }
    id = ric(step)
    return () => (window.cancelIdleCallback ?? window.clearTimeout)(id)
  }, [])
}

/** One fixed, click-through canvas for the whole page: the laptop that travels with the reader. */
export default function CompanionScene({ reduced, onReady }: { reduced: boolean; onReady?: () => void }) {
  const [dpr, setDpr] = useState(1.5)
  usePrewarmScreens()
  return (
    <Canvas
      dpr={dpr}
      camera={{ position: [0, 0.6, 10], fov: 30 }}
      gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
      onCreated={({ camera }) => {
        camera.lookAt(0, 0, 0)
        // Let the first frame render before revealing, so the swap from still image is seamless
        requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()))
      }}
      style={{ position: 'fixed', inset: 0, pointerEvents: 'none' }}
      aria-hidden
    >
      <PerformanceMonitor onDecline={() => setDpr(1)} onIncline={() => setDpr(1.5)} flipflops={3} onFallback={() => setDpr(1)} />
      <StudioLights mood="brand" />
      <pointLight position={[-6, 4, 4]} color="#ff7a1a" intensity={18} distance={20} decay={1.4} />
      <pointLight position={[6, 2, 3]} color="#c9c9cf" intensity={12} distance={20} decay={1.4} />
      <Traveller reduced={reduced} />
    </Canvas>
  )
}
