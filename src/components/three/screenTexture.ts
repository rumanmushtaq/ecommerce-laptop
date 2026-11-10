import { CanvasTexture, SRGBColorSpace } from 'three'

export type AppKind = 'video' | 'photo' | 'code' | 'dashboard' | 'game' | 'browser' | 'desktop'
export interface ScreenSpec {
  app: AppKind
  /** File name in public/screens (real photography) */
  photo: string
  accent: string
  /** Canvas size in px; defaults to 16:10 laptop panels. Monitors pass 16:9 or 32:9. */
  size?: [number, number]
}

/** Pending texture loads; the render studio waits for this to reach zero before capturing. */
export const screenStatus = { pending: 0 }

// Current canvas size; set per texture right before an app paints (drawing is synchronous)
let W = 1600
let H = 1024
const cache = new Map<string, CanvasTexture>()
const images = new Map<string, Promise<HTMLImageElement>>()

const UI = {
  panel: '#1a1922',
  panel2: '#211f2b',
  line: 'rgba(255,255,255,0.07)',
  hi: '#ece9f5',
  lo: '#8f8ba3',
  lavender: '#b9a6ff',
  peach: '#ffb4a2',
  mint: '#9ee6cf',
}
// next/font self-hosts fonts under generated family names; read them from its CSS variables
const family = (v: string, fallback: string) => getComputedStyle(document.documentElement).getPropertyValue(v).trim() || fallback
let SANS = 'system-ui, sans-serif'
let MONO = 'ui-monospace, monospace'
let SERIF = 'Georgia, serif'

type Ctx = CanvasRenderingContext2D

function loadImage(name: string) {
  let p = images.get(name)
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image()
      img.onload = () => resolve(img)
      img.onerror = reject
      img.src = `/screens/${name}.jpg`
    })
    images.set(name, p)
  }
  return p
}

/* ---------------------------------------------------------------- helpers */

function rr(ctx: Ctx, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath()
  ctx.roundRect(x, y, w, h, r)
}
function fillRR(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, fill: string | CanvasGradient) {
  rr(ctx, x, y, w, h, r)
  ctx.fillStyle = fill
  ctx.fill()
}
function text(ctx: Ctx, s: string, x: number, y: number, size: number, color: string, weight = 400, font = SANS, align: CanvasTextAlign = 'left') {
  ctx.font = `${weight} ${size}px ${font}`
  ctx.fillStyle = color
  ctx.textAlign = align
  ctx.fillText(s, x, y)
  ctx.textAlign = 'left'
}
/** Draw an image cropped to cover the box; fx/fy pick the focal point (0..1). */
function cover(ctx: Ctx, img: HTMLImageElement, x: number, y: number, w: number, h: number, fx = 0.5, fy = 0.5, zoom = 1) {
  const s = Math.max(w / img.width, h / img.height) * zoom
  const sw = w / s
  const sh = h / s
  const sx = (img.width - sw) * fx
  const sy = (img.height - sh) * fy
  ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h)
}
function clipRR(ctx: Ctx, x: number, y: number, w: number, h: number, r: number, draw: () => void) {
  ctx.save()
  rr(ctx, x, y, w, h, r)
  ctx.clip()
  draw()
  ctx.restore()
}
const rand = (i: number) => {
  const v = Math.sin(i * 127.1 + 311.7) * 43758.5453
  return v - Math.floor(v)
}

function menubar(ctx: Ctx, app: string, dark = true) {
  ctx.fillStyle = dark ? 'rgba(16,14,24,0.72)' : 'rgba(250,249,253,0.75)'
  ctx.fillRect(0, 0, W, 30)
  const c = dark ? 'rgba(255,255,255,0.88)' : 'rgba(20,18,30,0.85)'
  ctx.fillStyle = c
  ctx.beginPath()
  ctx.arc(26, 15, 7, 0, Math.PI * 2)
  ctx.fill()
  text(ctx, app, 46, 21, 14, c, 600)
  text(ctx, 'File    Edit    View    Window    Help', 46 + ctx.measureText(app).width + 26, 21, 14, c, 400)
  text(ctx, 'Mon 9:41', W - 22, 21, 14, c, 500, SANS, 'right')
  // battery + wifi
  ctx.strokeStyle = c
  ctx.lineWidth = 1.5
  rr(ctx, W - 130, 9, 26, 12, 3)
  ctx.stroke()
  ctx.fillStyle = c
  ctx.fillRect(W - 127, 12, 17, 6)
  for (let i = 0; i < 3; i++) {
    ctx.beginPath()
    ctx.arc(W - 160, 22, 4 + i * 4, Math.PI * 1.25, Math.PI * 1.75)
    ctx.stroke()
  }
}

function windowFrame(ctx: Ctx, x: number, y: number, w: number, h: number, title: string, light = false) {
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.55)'
  ctx.shadowBlur = 60
  ctx.shadowOffsetY = 24
  fillRR(ctx, x, y, w, h, 14, light ? '#f7f6fb' : UI.panel)
  ctx.restore()
  rr(ctx, x + 0.5, y + 0.5, w - 1, h - 1, 14)
  ctx.strokeStyle = light ? 'rgba(0,0,0,0.12)' : 'rgba(255,255,255,0.10)'
  ctx.lineWidth = 1
  ctx.stroke()
  ;['#ff5f57', '#febc2e', '#28c840'].forEach((col, i) => {
    ctx.fillStyle = col
    ctx.beginPath()
    ctx.arc(x + 22 + i * 20, y + 20, 6.5, 0, Math.PI * 2)
    ctx.fill()
  })
  text(ctx, title, x + w / 2, y + 25, 13, light ? '#4a4658' : UI.lo, 500, SANS, 'center')
}

function dock(ctx: Ctx, accent: string) {
  const n = 11
  const size = 54
  const gap = 12
  const w = n * size + (n - 1) * gap + 28
  const x = (W - w) / 2
  const y = H - size - 30
  fillRR(ctx, x, y, w, size + 20, 22, 'rgba(30,28,42,0.45)')
  rr(ctx, x + 0.5, y + 0.5, w - 1, size + 19, 22)
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.stroke()
  const palette = [
    ['#b9a6ff', '#6f5ce0'],
    ['#ffb4a2', '#ff7a8a'],
    ['#9ee6cf', '#3fb6a0'],
    ['#ffffff', '#c9c4dc'],
    ['#8fb8ff', '#4f6fe6'],
    ['#ffd58a', '#ff9f5a'],
    ['#ff7ab6', '#b45cff'],
    ['#2b2838', '#121019'],
    ['#9ee6cf', '#5d8cff'],
    ['#f3b6a6', '#b9a6ff'],
    [accent, '#2a2638'],
  ]
  palette.forEach(([a, b], i) => {
    const ix = x + 14 + i * (size + gap)
    const g = ctx.createLinearGradient(ix, y + 10, ix, y + 10 + size)
    g.addColorStop(0, a)
    g.addColorStop(1, b)
    fillRR(ctx, ix, y + 10, size, size, 13, g)
    // simple glyph per icon
    ctx.strokeStyle = 'rgba(255,255,255,0.9)'
    ctx.fillStyle = 'rgba(255,255,255,0.9)'
    ctx.lineWidth = 3
    const cx = ix + size / 2
    const cy = y + 10 + size / 2
    const k = i % 5
    ctx.beginPath()
    if (k === 0) ctx.arc(cx, cy, 13, 0, Math.PI * 2)
    else if (k === 1) ctx.rect(cx - 12, cy - 12, 24, 24)
    else if (k === 2) {
      ctx.moveTo(cx - 13, cy + 10)
      ctx.lineTo(cx, cy - 13)
      ctx.lineTo(cx + 13, cy + 10)
      ctx.closePath()
    } else if (k === 3) {
      ctx.moveTo(cx - 14, cy)
      ctx.lineTo(cx + 14, cy)
      ctx.moveTo(cx, cy - 14)
      ctx.lineTo(cx, cy + 14)
    } else ctx.arc(cx, cy, 6, 0, Math.PI * 2)
    ctx.stroke()
  })
}

function slider(ctx: Ctx, x: number, y: number, w: number, label: string, value: string, t: number, accent: string) {
  text(ctx, label, x, y, 13, UI.lo)
  text(ctx, value, x + w, y, 13, UI.hi, 500, MONO, 'right')
  fillRR(ctx, x, y + 10, w, 4, 2, 'rgba(255,255,255,0.10)')
  const mid = x + w / 2
  const kx = x + w * t
  ctx.fillStyle = accent
  ctx.fillRect(Math.min(mid, kx), y + 10, Math.abs(kx - mid), 4)
  ctx.beginPath()
  ctx.arc(kx, y + 12, 7, 0, Math.PI * 2)
  ctx.fillStyle = '#f4f2fb'
  ctx.fill()
}

/* ---------------------------------------------------------------- apps */

function videoApp(ctx: Ctx, img: HTMLImageElement, a: string) {
  ctx.fillStyle = '#131219'
  ctx.fillRect(0, 0, W, H)
  menubar(ctx, 'Cutline Pro')
  // toolbar
  ctx.fillStyle = UI.panel
  ctx.fillRect(0, 30, W, 44)
  text(ctx, 'Dune Sessions — Director’s Cut', W / 2, 58, 14, UI.hi, 500, SANS, 'center')
  ;['Import', 'Effects', 'Titles', 'Audio'].forEach((t, i) => {
    fillRR(ctx, 16 + i * 92, 40, 82, 26, 7, i === 1 ? 'rgba(185,166,255,0.18)' : 'rgba(255,255,255,0.05)')
    text(ctx, t, 57 + i * 92, 58, 12, i === 1 ? UI.lavender : UI.lo, 500, SANS, 'center')
  })
  fillRR(ctx, W - 118, 40, 100, 26, 7, a)
  text(ctx, 'Export', W - 68, 58, 12, '#141218', 600, SANS, 'center')

  // media bin
  ctx.fillStyle = UI.panel
  ctx.fillRect(0, 76, 300, 540)
  text(ctx, 'MEDIA  ·  24 clips', 18, 102, 11, UI.lo, 600, MONO)
  for (let i = 0; i < 8; i++) {
    const x = 16 + (i % 2) * 138
    const y = 118 + Math.floor(i / 2) * 120
    clipRR(ctx, x, y, 130, 80, 8, () => {
      ctx.filter = `hue-rotate(${i * 14 - 30}deg) brightness(${0.85 + rand(i) * 0.35})`
      cover(ctx, img, x, y, 130, 80, rand(i + 3), rand(i + 7), 1.6 + rand(i) * 1.2)
      ctx.filter = 'none'
    })
    if (i === 2) {
      rr(ctx, x - 2, y - 2, 134, 84, 9)
      ctx.strokeStyle = a
      ctx.lineWidth = 2.5
      ctx.stroke()
    }
    text(ctx, `A0${i + 1}_C00${(i * 7) % 9 + 1}.mov`, x, y + 100, 11, UI.lo, 400, MONO)
  }

  // viewer
  ctx.fillStyle = '#0b0a0f'
  ctx.fillRect(302, 76, 876, 540)
  cover(ctx, img, 330, 100, 820, 461, 0.5, 0.55)
  ctx.strokeStyle = 'rgba(255,255,255,0.18)'
  ctx.setLineDash([6, 6])
  ctx.strokeRect(330 + 41, 100 + 23, 738, 415)
  ctx.setLineDash([])
  text(ctx, '00:02:14:08', 740, 596, 18, UI.hi, 500, MONO, 'center')
  text(ctx, '4K · 23.976 · Rec.709', 1150, 596, 11, UI.lo, 400, MONO, 'right')

  // inspector
  ctx.fillStyle = UI.panel
  ctx.fillRect(1180, 76, 420, 540)
  text(ctx, 'COLOR', 1200, 102, 11, UI.lo, 600, MONO)
  ;['Lift', 'Gamma', 'Gain'].forEach((t, i) => {
    const cx = 1250 + i * 120
    const g = ctx.createConicGradient(0, cx, 168)
    ;['#ff6b6b', '#ffd36b', '#7bff9e', '#6bd8ff', '#8f7bff', '#ff6bd5', '#ff6b6b'].forEach((col, k, arr) => g.addColorStop(k / (arr.length - 1), col))
    ctx.beginPath()
    ctx.arc(cx, 168, 42, 0, Math.PI * 2)
    ctx.fillStyle = g
    ctx.fill()
    const r = ctx.createRadialGradient(cx, 168, 0, cx, 168, 42)
    r.addColorStop(0, 'rgba(40,38,52,1)')
    r.addColorStop(1, 'rgba(40,38,52,0)')
    ctx.fillStyle = r
    ctx.fill()
    ctx.beginPath()
    ctx.arc(cx + Math.cos(i * 2) * 12, 168 + Math.sin(i * 2) * 12, 5, 0, Math.PI * 2)
    ctx.fillStyle = '#fff'
    ctx.fill()
    text(ctx, t, cx, 236, 12, UI.lo, 500, SANS, 'center')
  })
  slider(ctx, 1200, 280, 380, 'Temperature', '5 840 K', 0.62, UI.peach)
  slider(ctx, 1200, 326, 380, 'Tint', '+4', 0.54, UI.lavender)
  slider(ctx, 1200, 372, 380, 'Saturation', '112', 0.68, UI.lavender)
  slider(ctx, 1200, 418, 380, 'Contrast', '+18', 0.66, UI.lavender)
  slider(ctx, 1200, 464, 380, 'Film grain', '22%', 0.3, UI.mint)
  slider(ctx, 1200, 510, 380, 'Vignette', '−12', 0.38, UI.mint)

  // timeline
  ctx.fillStyle = '#16151d'
  ctx.fillRect(0, 618, W, H - 618)
  for (let x = 120; x < W; x += 40) {
    ctx.fillStyle = 'rgba(255,255,255,0.18)'
    ctx.fillRect(x, 632, 1, x % 200 === 0 ? 12 : 6)
    if (x % 200 === 0) text(ctx, `00:0${Math.floor(x / 400)}:${String((x / 10) % 60).padStart(2, '0')}`, x + 4, 642, 10, UI.lo, 400, MONO)
  }
  const tracks = ['V3', 'V2', 'V1', 'A1', 'A2']
  tracks.forEach((t, ti) => {
    const y = 660 + ti * 66
    ctx.fillStyle = 'rgba(255,255,255,0.03)'
    ctx.fillRect(0, y, W, 60)
    text(ctx, t, 24, y + 36, 12, UI.lo, 600, MONO)
    let x = 120 + ti * 28
    let k = 0
    while (x < W - 40) {
      const w = 160 + rand(ti * 10 + k) * 260
      const cw = Math.min(w, W - 40 - x)
      if (ti < 2 && rand(ti * 5 + k) > 0.55) {
        x += w * 0.6
        k++
        continue
      }
      if (ti === 2) {
        clipRR(ctx, x, y + 4, cw - 4, 52, 6, () => {
          for (let f = 0; f * 92 < cw; f++) cover(ctx, img, x + f * 92, y + 4, 92, 52, rand(k + f), 0.5, 2.2)
        })
      } else if (ti >= 3) {
        fillRR(ctx, x, y + 4, cw - 4, 52, 6, ti === 3 ? 'rgba(158,230,207,0.22)' : 'rgba(255,180,162,0.18)')
        ctx.fillStyle = ti === 3 ? UI.mint : UI.peach
        for (let s = 0; s < cw - 10; s += 4) {
          const amp = (Math.abs(Math.sin((s + k * 50) / 23)) * 0.6 + rand(s + k) * 0.4) * 20
          ctx.fillRect(x + 4 + s, y + 30 - amp / 2, 2, amp)
        }
      } else {
        fillRR(ctx, x, y + 4, cw - 4, 52, 6, ti === 0 ? 'rgba(185,166,255,0.55)' : 'rgba(143,123,255,0.35)')
        text(ctx, ti === 0 ? 'Title — Dunes' : 'Grade layer', x + 12, y + 35, 12, '#fff', 500)
      }
      x += w
      k++
    }
  })
  // playhead
  ctx.fillStyle = UI.peach
  ctx.fillRect(760, 628, 2, H - 628)
  ctx.beginPath()
  ctx.moveTo(752, 626)
  ctx.lineTo(770, 626)
  ctx.lineTo(761, 638)
  ctx.fill()
}

function histogram(img: HTMLImageElement) {
  const c = document.createElement('canvas')
  c.width = 160
  c.height = 100
  const x = c.getContext('2d')!
  x.drawImage(img, 0, 0, 160, 100)
  const d = x.getImageData(0, 0, 160, 100).data
  const bins = [new Array(64).fill(0), new Array(64).fill(0), new Array(64).fill(0)]
  for (let i = 0; i < d.length; i += 4) for (let ch = 0; ch < 3; ch++) bins[ch][d[i + ch] >> 2]++
  const max = Math.max(...bins.flat())
  return bins.map((b) => b.map((v) => v / max))
}

function photoApp(ctx: Ctx, img: HTMLImageElement, a: string) {
  ctx.fillStyle = '#121117'
  ctx.fillRect(0, 0, W, H)
  menubar(ctx, 'Lumen')
  // presets
  ctx.fillStyle = UI.panel
  ctx.fillRect(0, 30, 250, H - 30)
  text(ctx, 'PRESETS', 20, 62, 11, UI.lo, 600, MONO)
  ;['Original', 'Nordic Fade', 'Velvet Dusk', 'Glacier', 'Kodak 400', 'Mono Silk', 'Lavender Haze', 'Golden Hour', 'Matte Ink'].forEach((p, i) => {
    if (i === 6) fillRR(ctx, 10, 78 + i * 38, 230, 32, 8, 'rgba(185,166,255,0.16)')
    text(ctx, p, 22, 99 + i * 38, 14, i === 6 ? UI.lavender : UI.hi, i === 6 ? 600 : 400)
  })
  // canvas
  const px = 280
  const pw = 920
  const ph = Math.round((pw * img.height) / img.width)
  const py = 60 + (760 - ph) / 2
  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  ctx.shadowBlur = 30
  ctx.filter = 'saturate(1.12) contrast(1.06) hue-rotate(-6deg)'
  ctx.drawImage(img, px, py, pw, ph)
  ctx.restore()
  // before/after split line
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.fillRect(px + pw * 0.42, py, 2, ph)
  ctx.beginPath()
  ctx.arc(px + pw * 0.42 + 1, py + ph / 2, 14, 0, Math.PI * 2)
  ctx.fill()
  text(ctx, 'BEFORE', px + 16, py + 28, 11, 'rgba(255,255,255,0.85)', 600, MONO)
  text(ctx, 'AFTER', px + pw - 16, py + 28, 11, 'rgba(255,255,255,0.85)', 600, MONO, 'right')
  text(ctx, 'fjord_0412.raw  ·  6000×4000  ·  ISO 100  ·  f/8  ·  1/250', px, 860, 12, UI.lo, 400, MONO)

  // right panel
  ctx.fillStyle = UI.panel
  ctx.fillRect(1230, 30, 370, H - 30)
  text(ctx, 'HISTOGRAM', 1250, 62, 11, UI.lo, 600, MONO)
  fillRR(ctx, 1250, 74, 330, 120, 8, '#0f0e14')
  const hist = histogram(img)
  ;['rgba(255,110,110,0.55)', 'rgba(110,255,170,0.45)', 'rgba(120,150,255,0.55)'].forEach((col, ch) => {
    ctx.beginPath()
    ctx.moveTo(1250, 194)
    hist[ch].forEach((v, i) => ctx.lineTo(1250 + (i / 63) * 330, 194 - Math.sqrt(v) * 110))
    ctx.lineTo(1580, 194)
    ctx.closePath()
    ctx.fillStyle = col
    ctx.globalCompositeOperation = 'lighter'
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
  })
  const rows: [string, string, number, string][] = [
    ['Exposure', '+0.35', 0.57, a],
    ['Contrast', '+12', 0.56, a],
    ['Highlights', '−48', 0.26, a],
    ['Shadows', '+36', 0.68, a],
    ['Whites', '+8', 0.54, a],
    ['Blacks', '−14', 0.43, a],
    ['Temperature', '5 650', 0.58, UI.peach],
    ['Tint', '+6', 0.53, UI.lavender],
    ['Vibrance', '+18', 0.59, UI.mint],
    ['Clarity', '+10', 0.55, UI.mint],
  ]
  text(ctx, 'BASIC', 1250, 232, 11, UI.lo, 600, MONO)
  rows.forEach(([l, v, t, c], i) => slider(ctx, 1250, 262 + i * 52, 330, l, v, t, c))
  // filmstrip
  ctx.fillStyle = '#17161e'
  ctx.fillRect(250, 880, 980, H - 880)
  for (let i = 0; i < 8; i++) {
    const x = 268 + i * 120
    clipRR(ctx, x, 900, 110, 74, 6, () => {
      ctx.filter = `hue-rotate(${(i - 3) * 18}deg) saturate(${0.6 + i * 0.12})`
      cover(ctx, img, x, 900, 110, 74, rand(i), rand(i + 9), 1 + rand(i + 4))
      ctx.filter = 'none'
    })
    if (i === 3) {
      rr(ctx, x - 2, 898, 114, 78, 7)
      ctx.strokeStyle = a
      ctx.lineWidth = 2.5
      ctx.stroke()
    }
  }
}

const CODE = `import { motion } from 'motion/react'
import { useQuery } from '@tanstack/react-query'
import { fetchLaptops, type Laptop } from './api'

// Featured grid — sorted by what people actually buy
export function FeaturedGrid({ limit = 9 }: { limit?: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['laptops', 'featured'],
    queryFn: () => fetchLaptops({ sort: 'popular' }),
    staleTime: 60_000,
  })

  if (isLoading) return <GridSkeleton count={limit} />

  return (
    <motion.ul layout className="grid gap-4 lg:grid-cols-3">
      {data?.slice(0, limit).map((laptop: Laptop, i) => (
        <motion.li
          key={laptop.id}
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.05 }}
        >
          <ProductCard laptop={laptop} />
        </motion.li>
      ))}
    </motion.ul>
  )
}`

const KEYWORDS = /^(import|from|export|function|const|return|if|type|async|await)$/

function drawCodeLine(ctx: Ctx, line: string, x: number, y: number) {
  if (line.trim().startsWith('//')) {
    text(ctx, line, x, y, 15, '#6f6b86', 400, MONO)
    return
  }
  const parts = line.split(/('[^']*'|\b\d[\d_]*\b|[A-Za-z_]+|\s+|.)/).filter(Boolean)
  ctx.font = `400 15px ${MONO}`
  let cx = x
  for (const p of parts) {
    let col = '#dcd8ea'
    if (p.startsWith("'")) col = UI.peach
    else if (/^\d/.test(p)) col = UI.mint
    else if (KEYWORDS.test(p)) col = '#c4a7ff'
    else if (/^[A-Z][A-Za-z]+$/.test(p)) col = '#9ee6cf'
    else if (/^(className|key|initial|whileInView|transition|layout|queryKey|queryFn|staleTime|limit|data|isLoading)$/.test(p)) col = '#8fb8ff'
    else if (/[{}()<>/=[\]]/.test(p)) col = '#9f9ab5'
    ctx.fillStyle = col
    ctx.fillText(p, cx, y)
    cx += ctx.measureText(p).width
  }
}

function codeApp(ctx: Ctx, img: HTMLImageElement, a: string) {
  cover(ctx, img, 0, 0, W, H)
  ctx.fillStyle = 'rgba(12,10,20,0.28)'
  ctx.fillRect(0, 0, W, H)
  menubar(ctx, 'Studio Code')
  const x = 70
  const y = 62
  const w = 1460
  const h = 830
  windowFrame(ctx, x, y, w, h, 'FeaturedGrid.tsx — noctis-store')
  // activity + sidebar
  ctx.fillStyle = '#15141c'
  ctx.fillRect(x, y + 40, 52, h - 40)
  for (let i = 0; i < 5; i++) fillRR(ctx, x + 14, y + 60 + i * 52, 24, 24, 6, i === 0 ? a : 'rgba(255,255,255,0.18)')
  ctx.fillStyle = '#18171f'
  ctx.fillRect(x + 52, y + 40, 250, h - 40)
  text(ctx, 'EXPLORER', x + 70, y + 68, 11, UI.lo, 600, MONO)
  const tree: [number, string, boolean?][] = [
    [0, '▾ src'],
    [1, '▾ components'],
    [2, 'FeaturedGrid.tsx', true],
    [2, 'ProductCard.tsx'],
    [2, 'Hero.tsx'],
    [2, 'Navbar.tsx'],
    [1, '▸ three'],
    [1, '▸ lib'],
    [1, 'api.ts'],
    [1, 'main.tsx'],
    [0, 'package.json'],
    [0, 'vite.config.ts'],
  ]
  tree.forEach(([d, n, on], i) => {
    if (on) fillRR(ctx, x + 58, y + 82 + i * 30, 238, 26, 6, 'rgba(185,166,255,0.14)')
    text(ctx, n, x + 74 + d * 16, y + 100 + i * 30, 14, on ? UI.hi : '#b3afc6')
  })
  // tabs
  ctx.fillStyle = '#18171f'
  ctx.fillRect(x + 302, y + 40, w - 302, 38)
  ;['FeaturedGrid.tsx', 'api.ts', 'Hero.tsx'].forEach((t, i) => {
    if (i === 0) {
      ctx.fillStyle = UI.panel
      ctx.fillRect(x + 302, y + 40, 190, 38)
      ctx.fillStyle = a
      ctx.fillRect(x + 302, y + 40, 190, 2)
    }
    text(ctx, t, x + 320 + i * 190, y + 64, 13, i === 0 ? UI.hi : UI.lo)
  })
  // code
  const lines = CODE.split('\n')
  lines.forEach((l, i) => {
    const ly = y + 108 + i * 22
    if (ly > y + h - 210) return
    text(ctx, String(i + 1).padStart(2, ' '), x + 330, ly, 14, i === 17 ? UI.hi : '#55516a', 400, MONO, 'right')
    if (i === 17) {
      ctx.fillStyle = 'rgba(255,255,255,0.04)'
      ctx.fillRect(x + 340, ly - 16, w - 470, 22)
    }
    drawCodeLine(ctx, l, x + 352, ly)
  })
  // cursor
  ctx.fillStyle = UI.hi
  ctx.fillRect(x + 352 + 290, y + 108 + 17 * 22 - 15, 2, 19)
  // minimap
  lines.forEach((l, i) => {
    ctx.fillStyle = i === 17 ? 'rgba(185,166,255,0.6)' : 'rgba(255,255,255,0.14)'
    ctx.fillRect(x + w - 110, y + 92 + i * 6, Math.min(80, l.length * 1.4), 3)
  })
  // terminal
  ctx.fillStyle = '#121118'
  ctx.fillRect(x + 302, y + h - 190, w - 302, 166)
  text(ctx, 'TERMINAL', x + 322, y + h - 162, 11, UI.lo, 600, MONO)
  const term: [string, string][] = [
    ['$ npm run build', UI.hi],
    ['vite v8.3.6 building for production…', UI.lo],
    ['✓ 3061 modules transformed.', UI.mint],
    ['dist/assets/index.js   505.87 kB │ gzip: 159.25 kB', UI.lo],
    ['✓ built in 3.20s', UI.mint],
  ]
  term.forEach(([t, c], i) => text(ctx, t, x + 322, y + h - 132 + i * 22, 14, c, 400, MONO))
  // status bar
  ctx.fillStyle = a
  ctx.fillRect(x, y + h - 24, w, 24)
  text(ctx, '⎇ main   ✓ 0 problems', x + 14, y + h - 7, 12, '#16141d', 600, MONO)
  text(ctx, 'Ln 18, Col 22   TypeScript React', x + w - 14, y + h - 7, 12, '#16141d', 600, MONO, 'right')
  dock(ctx, a)
}

function dashboardApp(ctx: Ctx, img: HTMLImageElement, _accent: string) {
  cover(ctx, img, 0, 0, W, H)
  menubar(ctx, 'Ledger', false)
  const x = 56
  const y = 56
  const w = 1488
  const h = 856
  windowFrame(ctx, x, y, w, h, 'Northwind — Q4 Revenue', true)
  // sidebar
  ctx.fillStyle = '#efedf5'
  ctx.fillRect(x, y + 40, 230, h - 40)
  ;['Overview', 'Revenue', 'Customers', 'Inventory', 'Fleet devices', 'Reports', 'Settings'].forEach((n, i) => {
    if (i === 1) fillRR(ctx, x + 12, y + 60 + i * 42, 206, 34, 8, '#e3ddff')
    text(ctx, n, x + 30, y + 83 + i * 42, 15, i === 1 ? '#4b3fb5' : '#4a4658', i === 1 ? 600 : 400)
  })
  const cx = x + 260
  text(ctx, 'Revenue overview', cx, y + 92, 28, '#15131d', 600)
  text(ctx, 'Oct 1 – Dec 31, 2026 · updated 2 min ago', cx, y + 118, 14, '#7a7590')
  // KPIs
  const kpis: [string, string, string, string][] = [
    ['Revenue', '$4.82M', '+18.4%', '#6f5ce0'],
    ['Orders', '12,940', '+9.1%', '#e2725b'],
    ['Avg. order', '$1,862', '+4.6%', '#2f9e86'],
    ['Return rate', '1.8%', '−0.4%', '#4f6fe6'],
  ]
  kpis.forEach(([l, v, d, col], i) => {
    const kx = cx + i * 300
    fillRR(ctx, kx, y + 140, 284, 122, 14, '#ffffff')
    rr(ctx, kx + 0.5, y + 140.5, 283, 121, 14)
    ctx.strokeStyle = '#e6e3ee'
    ctx.stroke()
    text(ctx, l, kx + 20, y + 172, 14, '#7a7590')
    text(ctx, v, kx + 20, y + 214, 30, '#15131d', 600)
    text(ctx, d, kx + 20, y + 244, 13, d.startsWith('−') ? '#2f9e86' : col, 600)
    ctx.strokeStyle = col
    ctx.lineWidth = 2.5
    ctx.beginPath()
    for (let s = 0; s < 12; s++) {
      const px = kx + 170 + s * 9
      const py = y + 236 - (Math.sin(s * 0.7 + i) * 0.4 + s / 12) * 50
      if (s === 0) ctx.moveTo(px, py)
      else ctx.lineTo(px, py)
    }
    ctx.stroke()
  })
  // line chart
  const lx = cx
  const ly = y + 286
  const lw = 780
  const lh = 300
  fillRR(ctx, lx, ly, lw, lh, 14, '#ffffff')
  text(ctx, 'Weekly revenue', lx + 20, ly + 34, 16, '#15131d', 600)
  for (let g = 0; g < 4; g++) {
    ctx.fillStyle = '#efedf5'
    ctx.fillRect(lx + 20, ly + 80 + g * 52, lw - 40, 1)
  }
  ;[
    ['#6f5ce0', 0],
    ['#e2725b', 2.2],
  ].forEach(([col, ph], si) => {
    const pts: [number, number][] = []
    for (let s = 0; s <= 13; s++)
      pts.push([lx + 20 + (s / 13) * (lw - 40), ly + lh - 40 - (0.35 + s / 26 + Math.sin(s * 0.8 + (ph as number)) * 0.12 - si * 0.12) * 200])
    const g = ctx.createLinearGradient(0, ly + 60, 0, ly + lh)
    g.addColorStop(0, si === 0 ? 'rgba(111,92,224,0.25)' : 'rgba(226,114,91,0.15)')
    g.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.beginPath()
    pts.forEach(([px, py], k) => (k ? ctx.lineTo(px, py) : ctx.moveTo(px, py)))
    ctx.lineTo(lx + lw - 20, ly + lh - 30)
    ctx.lineTo(lx + 20, ly + lh - 30)
    ctx.fillStyle = g
    ctx.fill()
    ctx.beginPath()
    pts.forEach(([px, py], k) => (k ? ctx.lineTo(px, py) : ctx.moveTo(px, py)))
    ctx.strokeStyle = col as string
    ctx.lineWidth = 3
    ctx.stroke()
  })
  // bar chart
  const bx = lx + lw + 20
  fillRR(ctx, bx, ly, 404, lh, 14, '#ffffff')
  text(ctx, 'By category', bx + 20, ly + 34, 16, '#15131d', 600)
  const cats: [string, number, string][] = [
    ['Gaming', 0.92, '#6f5ce0'],
    ['Creative', 0.74, '#9b8cff'],
    ['Business', 0.66, '#e2725b'],
    ['Ultrabook', 0.48, '#2f9e86'],
    ['Everyday', 0.34, '#4f6fe6'],
  ]
  cats.forEach(([n, v, col], i) => {
    text(ctx, n, bx + 20, ly + 82 + i * 44, 13, '#4a4658')
    fillRR(ctx, bx + 110, ly + 70 + i * 44, 270, 16, 8, '#f1eff7')
    fillRR(ctx, bx + 110, ly + 70 + i * 44, 270 * v, 16, 8, col)
  })
  // table
  const tx = cx
  const ty = ly + lh + 20
  fillRR(ctx, tx, ty, lw + 424, 210, 14, '#ffffff')
  ;['Order', 'Customer', 'Device', 'Status', 'Total'].forEach((t, i) => text(ctx, t, tx + 24 + i * 240, ty + 34, 12, '#7a7590', 600))
  const rowsT: string[][] = [
    ['#NX-20931', 'Hannah L.', 'ThinkPad X1 Carbon', 'Delivered', '$1,899'],
    ['#NX-20930', 'Kenji W.', 'Studio 16 Graphite', 'In transit', '$2,899'],
    ['#NX-20929', 'Amara O.', 'MacBook Pro 16″', 'Delivered', '$3,299'],
    ['#NX-20928', 'Daniel R.', 'Blade 16', 'Packing', '$2,999'],
  ]
  rowsT.forEach((r, i) => {
    const ry = ty + 72 + i * 36
    ctx.fillStyle = '#f1eff7'
    ctx.fillRect(tx + 20, ry - 24, lw + 384, 1)
    r.forEach((c, k) => {
      if (k === 3) {
        const col = c === 'Delivered' ? '#2f9e86' : c === 'In transit' ? '#6f5ce0' : '#e2725b'
        fillRR(ctx, tx + 24 + k * 240, ry - 17, 92, 24, 12, col + '22')
        text(ctx, c, tx + 70 + k * 240, ry, 12, col, 600, SANS, 'center')
      } else text(ctx, c, tx + 24 + k * 240, ry, 14, k === 4 ? '#15131d' : '#3c3848', k === 4 ? 600 : 400)
    })
  })
}

function gameApp(ctx: Ctx, img: HTMLImageElement, a: string) {
  ctx.filter = 'contrast(1.18) saturate(1.3) brightness(0.92)'
  cover(ctx, img, 0, 0, W, H, 0.5, 0.6, 1.08)
  ctx.filter = 'none'
  // colour grade + vignette
  const grade = ctx.createLinearGradient(0, 0, W, H)
  grade.addColorStop(0, 'rgba(143,123,255,0.22)')
  grade.addColorStop(1, 'rgba(255,122,182,0.18)')
  ctx.globalCompositeOperation = 'soft-light'
  ctx.fillStyle = grade
  ctx.fillRect(0, 0, W, H)
  ctx.globalCompositeOperation = 'source-over'
  const v = ctx.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, H * 0.95)
  v.addColorStop(0, 'rgba(0,0,0,0)')
  v.addColorStop(1, 'rgba(0,0,0,0.65)')
  ctx.fillStyle = v
  ctx.fillRect(0, 0, W, H)

  ctx.shadowColor = 'rgba(0,0,0,0.6)'
  ctx.shadowBlur = 8
  // fps + quest
  text(ctx, '240 FPS  ·  4.1 ms', 30, 40, 16, '#a6ffcf', 600, MONO)
  text(ctx, 'MAIN QUEST', 30, 92, 13, a, 700, MONO)
  text(ctx, 'Reach the relay above the ridge', 30, 120, 22, '#ffffff', 600)
  text(ctx, '◆ 1.2 km  ·  Recommended level 34', 30, 146, 14, 'rgba(255,255,255,0.8)', 500)
  // compass
  ctx.fillStyle = 'rgba(0,0,0,0.25)'
  ctx.fillRect(W / 2 - 300, 26, 600, 30)
  for (let i = -15; i <= 15; i++) {
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.fillRect(W / 2 + i * 20, 46, 2, i % 5 === 0 ? 10 : 5)
  }
  ;[
    ['N', -200],
    ['NE', -100],
    ['E', 0],
    ['SE', 100],
    ['S', 200],
  ].forEach(([l, o]) => text(ctx, l as string, W / 2 + (o as number), 42, 14, l === 'E' ? a : '#fff', 700, MONO, 'center'))
  // minimap
  const mx = W - 140
  const my = 140
  ctx.save()
  ctx.beginPath()
  ctx.arc(mx, my, 100, 0, Math.PI * 2)
  ctx.clip()
  ctx.filter = 'grayscale(0.4) brightness(0.6)'
  cover(ctx, img, mx - 100, my - 100, 200, 200, 0.3, 0.8, 3)
  ctx.filter = 'none'
  ctx.strokeStyle = 'rgba(255,255,255,0.35)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.moveTo(mx - 100, my + 40)
  ctx.bezierCurveTo(mx - 40, my + 10, mx + 10, my + 60, mx + 100, my - 20)
  ctx.stroke()
  ctx.restore()
  ctx.strokeStyle = 'rgba(255,255,255,0.7)'
  ctx.lineWidth = 3
  ctx.beginPath()
  ctx.arc(mx, my, 100, 0, Math.PI * 2)
  ctx.stroke()
  ctx.fillStyle = a
  ctx.beginPath()
  ctx.moveTo(mx, my - 14)
  ctx.lineTo(mx + 10, my + 10)
  ctx.lineTo(mx, my + 4)
  ctx.lineTo(mx - 10, my + 10)
  ctx.closePath()
  ctx.fill()
  // crosshair
  ctx.fillStyle = 'rgba(255,255,255,0.9)'
  ctx.fillRect(W / 2 - 18, H / 2 - 1, 12, 2)
  ctx.fillRect(W / 2 + 6, H / 2 - 1, 12, 2)
  ctx.fillRect(W / 2 - 1, H / 2 - 18, 2, 12)
  ctx.fillRect(W / 2 - 1, H / 2 + 6, 2, 12)
  // health / shield
  text(ctx, '187', 30, H - 70, 44, '#ffffff', 700, MONO)
  fillRR(ctx, 120, H - 102, 320, 14, 7, 'rgba(0,0,0,0.4)')
  fillRR(ctx, 120, H - 102, 320 * 0.82, 14, 7, UI.peach)
  fillRR(ctx, 120, H - 80, 320, 10, 5, 'rgba(0,0,0,0.4)')
  fillRR(ctx, 120, H - 80, 320 * 0.6, 10, 5, UI.lavender)
  text(ctx, 'HEALTH  ·  SHIELD', 120, H - 52, 12, 'rgba(255,255,255,0.75)', 600, MONO)
  // ammo
  text(ctx, '28', W - 170, H - 60, 64, '#ffffff', 700, MONO, 'right')
  text(ctx, '/ 120', W - 40, H - 62, 26, 'rgba(255,255,255,0.7)', 600, MONO, 'right')
  text(ctx, 'VX-9 PULSE RIFLE', W - 40, H - 112, 13, a, 700, MONO, 'right')
  // kill feed
  ;['Vex  ⟶  Raider_04', 'You  ⟶  Sentinel MK2'].forEach((k, i) => text(ctx, k, W - 40, 300 + i * 28, 14, i ? a : '#ffffff', 600, SANS, 'right'))
  ctx.shadowBlur = 0
}

function browserApp(ctx: Ctx, img: HTMLImageElement, a: string) {
  ctx.filter = 'blur(2px) brightness(0.8)'
  cover(ctx, img, -20, -20, W + 40, H + 40, 0.5, 0.3)
  ctx.filter = 'none'
  menubar(ctx, 'Arcwise')
  const x = 90
  const y = 58
  const w = 1420
  const h = 860
  windowFrame(ctx, x, y, w, h, '', true)
  // tabs + url
  ;['The Journal — Noctis', 'Weather · Ghent', 'Inbox (3)'].forEach((t, i) => {
    fillRR(ctx, x + 100 + i * 230, y + 8, 220, 28, 8, i === 0 ? '#ffffff' : 'rgba(0,0,0,0.05)')
    text(ctx, t, x + 116 + i * 230, y + 27, 13, i === 0 ? '#1b1826' : '#6f6a80', i === 0 ? 600 : 400)
  })
  fillRR(ctx, x + 20, y + 46, w - 40, 34, 17, '#ecebf2')
  text(ctx, '🔒  noctis.store/journal/slow-mornings-in-ghent', x + 40, y + 69, 14, '#3c3848')
  // site
  const sy = y + 92
  ctx.fillStyle = '#fbfaf7'
  ctx.fillRect(x + 1, sy, w - 2, h - 93)
  text(ctx, 'The Journal', x + 40, sy + 44, 26, '#1b1826', 400, SERIF)
  ;['Travel', 'Work', 'Gear', 'Studio'].forEach((t, i) => text(ctx, t, x + w - 360 + i * 82, sy + 40, 14, '#4a4658', 500))
  clipRR(ctx, x + 40, sy + 70, w - 80, 420, 16, () => {
    cover(ctx, img, x + 40, sy + 70, w - 80, 420, 0.5, 0.55)
    const g = ctx.createLinearGradient(0, sy + 250, 0, sy + 490)
    g.addColorStop(0, 'rgba(0,0,0,0)')
    g.addColorStop(1, 'rgba(0,0,0,0.6)')
    ctx.fillStyle = g
    ctx.fillRect(x + 40, sy + 70, w - 80, 420)
  })
  text(ctx, 'TRAVEL · 8 MIN READ', x + 80, sy + 400, 13, '#ffffff', 600, MONO)
  text(ctx, 'Slow mornings in Ghent', x + 80, sy + 456, 56, '#ffffff', 400, SERIF)
  for (let i = 0; i < 3; i++) {
    const cx = x + 40 + i * ((w - 80) / 3 + 0)
    const cw = (w - 80) / 3 - 20
    clipRR(ctx, cx, sy + 516, 150, 100, 10, () => cover(ctx, img, cx, sy + 516, 150, 100, rand(i + 2), rand(i + 5), 2.4))
    text(ctx, ['Canal light at 7am', 'Packing a carry-on studio', 'Where to work remotely'][i], cx + 166, sy + 546, 17, '#1b1826', 600)
    for (let l = 0; l < 3; l++) fillRR(ctx, cx + 166, sy + 562 + l * 16, (cw - 180) * (l === 2 ? 0.6 : 1), 8, 4, '#e7e4ee')
  }
  fillRR(ctx, x + w - 210, sy + 22, 150, 32, 16, a)
  text(ctx, 'Subscribe', x + w - 135, sy + 43, 13, '#1b1826', 600, SANS, 'center')
}

function desktopApp(ctx: Ctx, img: HTMLImageElement, a: string) {
  cover(ctx, img, 0, 0, W, H)
  menubar(ctx, 'Finder')
  // weather widget
  const glass = 'rgba(28,26,40,0.45)'
  fillRR(ctx, W - 380, 58, 340, 160, 24, glass)
  text(ctx, 'Ghent', W - 352, 96, 18, '#fff', 600)
  text(ctx, '14°', W - 352, 160, 64, '#fff', 300)
  text(ctx, 'Partly cloudy · H:16° L:9°', W - 352, 196, 14, 'rgba(255,255,255,0.8)')
  ctx.fillStyle = '#ffd58a'
  ctx.beginPath()
  ctx.arc(W - 98, 112, 22, 0, Math.PI * 2)
  ctx.fill()
  fillRR(ctx, W - 130, 116, 70, 30, 15, 'rgba(255,255,255,0.9)')
  // calendar widget
  fillRR(ctx, W - 380, 236, 160, 160, 24, glass)
  text(ctx, 'MONDAY', W - 352, 272, 12, UI.peach, 700, MONO)
  text(ctx, '9', W - 352, 340, 60, '#fff', 300)
  text(ctx, 'Studio call 10:00', W - 352, 374, 12, 'rgba(255,255,255,0.8)')
  fillRR(ctx, W - 200, 236, 160, 160, 24, glass)
  text(ctx, 'BATTERY', W - 176, 272, 12, UI.mint, 700, MONO)
  ctx.lineWidth = 10
  ctx.strokeStyle = 'rgba(255,255,255,0.15)'
  ctx.beginPath()
  ctx.arc(W - 120, 336, 38, 0, Math.PI * 2)
  ctx.stroke()
  ctx.strokeStyle = UI.mint
  ctx.beginPath()
  ctx.arc(W - 120, 336, 38, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * 0.86)
  ctx.stroke()
  text(ctx, '86%', W - 120, 343, 18, '#fff', 600, SANS, 'center')
  // music player
  const px = 60
  const py = H - 330
  fillRR(ctx, px, py, 420, 150, 22, 'rgba(22,20,32,0.6)')
  clipRR(ctx, px + 18, py + 18, 114, 114, 14, () => {
    ctx.filter = 'hue-rotate(40deg) saturate(1.3)'
    cover(ctx, img, px + 18, py + 18, 114, 114, 0.2, 0.3, 2.5)
    ctx.filter = 'none'
  })
  text(ctx, 'Lavender Hours', px + 150, py + 52, 20, '#fff', 600)
  text(ctx, 'Nils & The Quiet Rooms', px + 150, py + 78, 14, 'rgba(255,255,255,0.7)')
  fillRR(ctx, px + 150, py + 100, 250, 5, 3, 'rgba(255,255,255,0.2)')
  fillRR(ctx, px + 150, py + 100, 250 * 0.38, 5, 3, a)
  text(ctx, '1:24', px + 150, py + 128, 12, 'rgba(255,255,255,0.6)', 500, MONO)
  text(ctx, '−2:31', px + 400, py + 128, 12, 'rgba(255,255,255,0.6)', 500, MONO, 'right')
  dock(ctx, a)
}

const APPS: Record<AppKind, (ctx: Ctx, img: HTMLImageElement, accent: string) => void> = {
  video: videoApp,
  photo: photoApp,
  code: codeApp,
  dashboard: dashboardApp,
  game: gameApp,
  browser: browserApp,
  desktop: desktopApp,
}

/** Paints a realistic screen (real photo + app UI) onto a canvas texture. Draws asynchronously once the photo and fonts are ready. */
export function getScreenTexture(spec: ScreenSpec) {
  const [cw, ch] = spec.size ?? [1600, 1024]
  const key = `${spec.app}-${spec.photo}-${spec.accent}-${cw}x${ch}`
  const hit = cache.get(key)
  if (hit) return hit

  const canvas = document.createElement('canvas')
  canvas.width = cw
  canvas.height = ch
  const ctx = canvas.getContext('2d')!
  ctx.fillStyle = '#0b0a14'
  ctx.fillRect(0, 0, cw, ch)
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  tex.anisotropy = 8
  cache.set(key, tex)

  SANS = family('--font-geist', 'Geist, system-ui, sans-serif')
  MONO = family('--font-geist-mono', 'ui-monospace, monospace')
  SERIF = family('--font-instrument', 'Georgia, serif')
  screenStatus.pending++
  // Only the primary family is loadable (next/font's "… Fallback" faces are local metrics), and a font
  // failure must never block the screen: settle all font loads, then paint with whatever is ready.
  const primary = (f: string) => f.split(',')[0].trim()
  const fonts = Promise.allSettled([`500 16px ${primary(SANS)}`, `400 16px ${primary(MONO)}`, `400 16px ${primary(SERIF)}`].map((f) => document.fonts?.load(f)))
  Promise.all([loadImage(spec.photo), fonts])
    .then(([img]) => {
      W = cw
      H = ch
      APPS[spec.app](ctx, img, spec.accent)
      tex.needsUpdate = true
    })
    .catch(() => undefined)
    .finally(() => screenStatus.pending--)
  return tex
}

/** Horizontal spectrum used for RGB keyboard backlights. */
export function getRgbTexture() {
  const hit = cache.get('rgb')
  if (hit) return hit
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 4
  const ctx = canvas.getContext('2d')!
  const g = ctx.createLinearGradient(0, 0, 256, 0)
  ;['#b9a6ff', '#ff7ab6', '#ffb4a2', '#9ee6cf', '#8fb8ff', '#b9a6ff'].forEach((c, i, arr) => g.addColorStop(i / (arr.length - 1), c))
  ctx.fillStyle = g
  ctx.fillRect(0, 0, 256, 4)
  const tex = new CanvasTexture(canvas)
  tex.colorSpace = SRGBColorSpace
  cache.set('rgb', tex)
  return tex
}
