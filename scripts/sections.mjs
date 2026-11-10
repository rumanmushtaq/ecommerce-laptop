// node scripts/sections.mjs <w> <h> <outPrefix> id1 id2 ...   (screens selected sections)
import { chromium } from 'playwright'
const [w, h, out, ...ids] = process.argv.slice(2)
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=gl', '--ignore-gpu-blocklist'] })
const page = await browser.newPage({ viewport: { width: +w, height: +h } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await page.goto('http://localhost:5188/')
const tick = async (n) => { for (let t = 0; t < n; t++) { await page.waitForTimeout(300); await page.evaluate(() => 0) } }
await tick(14)
for (const id of ids) {
  const [sid, off = '0'] = id.split(':')
  await page.evaluate(([sid, off]) => { const el = document.getElementById(sid); window.scrollTo(0, el.offsetTop + +off) }, [sid, off])
  await tick(6)
  await page.screenshot({ path: `${out}-${id.replace(':', '_')}.png` })
}
console.log(errors.length ? errors.join('\n') : 'no errors')
await browser.close()
