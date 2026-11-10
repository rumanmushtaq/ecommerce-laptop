// Usage: node scripts/shot.mjs <url> <out.png> [width] [height] [fullPage] [waitMs]
import { chromium } from 'playwright'
const [url, out, w = '1440', h = '900', full = '0', wait = '2500'] = process.argv.slice(2)
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=gl', '--ignore-gpu-blocklist'] })
const page = await browser.newPage({ viewport: { width: +w, height: +h }, deviceScaleFactor: 1 })
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(String(e)))
await page.goto(url, { waitUntil: 'networkidle' })
// Poll while waiting: keeps headless rAF from idling so WebGL intros actually play
for (let t = 0; t < +wait; t += 500) {
  await page.waitForTimeout(500)
  await page.evaluate(() => 0)
}
await page.screenshot({ path: out, fullPage: full === '1' })
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors')
await browser.close()
