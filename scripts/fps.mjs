// Scrolls through each section inside the page (2px/ms) and reports frame stats per section.
import { chromium } from 'playwright'
const [w = '1440', h = '900'] = process.argv.slice(2)
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=gl', '--ignore-gpu-blocklist', '--disable-renderer-backgrounding', '--disable-background-timer-throttling', '--disable-backgrounding-occluded-windows', '--disable-frame-rate-limit'] })
const page = await b.newPage({ viewport: { width: +w, height: +h } })
await page.goto('http://localhost:5188/')
await page.waitForTimeout(4000)
// Warm-up pass: decode images and compile shaders once, like a returning visitor's second scroll
for (let y = 0; y < (await page.evaluate(() => document.documentElement.scrollHeight)); y += 700) {
  await page.evaluate((y) => window.scrollTo(0, y), y)
  await page.waitForTimeout(250)
}
await page.evaluate(() => window.scrollTo(0, 0))
await page.waitForTimeout(2500)
const ids = ['top', 'trust', 'collections', 'products', 'showcase', 'gaming', 'offers', 'why', 'reviews', 'newsletter']
const out = []
for (const id of ids) {
  const r = await page.evaluate(
    (id) =>
      new Promise((resolve) => {
        const el = document.getElementById(id)
        window.scrollTo(0, el.offsetTop)
        const frames = []
        let last = performance.now()
        const start = last
        const span = Math.min(el.offsetHeight, 2400)
        const tick = (t) => {
          frames.push(t - last)
          last = t
          const k = (t - start) / 1500
          window.scrollTo(0, el.offsetTop + span * Math.min(k, 1))
          if (k < 1) requestAnimationFrame(tick)
          else {
            frames.shift()
            if (!frames.length) return resolve({ fps: 0, p95: 0, max: 0, n: 0 })
            frames.sort((a, b) => a - b)
            const avg = frames.reduce((a, b) => a + b, 0) / frames.length
            resolve({ fps: 1000 / avg, p95: frames[Math.floor(frames.length * 0.95)], max: frames[frames.length - 1] })
          }
        }
        requestAnimationFrame(tick)
      }),
    id,
  )
  out.push(`${id.padEnd(12)} fps ${r.fps.toFixed(0).padStart(3)}  p95 ${r.p95.toFixed(1).padStart(5)}ms  worst ${r.max.toFixed(0)}ms`)
}
console.log(out.join('\n'))
await b.close()
