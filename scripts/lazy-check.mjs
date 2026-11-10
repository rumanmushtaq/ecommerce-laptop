// Verifies lazy images: requests per scroll position, cumulative layout shift, and a slow-network loading screenshot.
import { chromium } from 'playwright'
const out = process.argv[2]
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=gl'] })
const page = await b.newPage({ viewport: { width: 1440, height: 900 } })
const imgs = []
page.on('request', (r) => r.resourceType() === 'image' && r.url().includes('/renders/') && imgs.push(r.url().split('/renders/')[1]))
await page.addInitScript(() => {
  window.__cls = 0
  new PerformanceObserver((l) => l.getEntries().forEach((e) => !e.hadRecentInput && (window.__cls += e.value))).observe({ type: 'layout-shift', buffered: true })
})
await page.goto('http://localhost:5188/')
for (let i = 0; i < 12; i++) { await page.waitForTimeout(300); await page.evaluate(() => 0) }
console.log('on load:', imgs.length, 'render images ->', imgs.join(', ') || 'none')
const sections = ['collections', 'products', 'gaming', 'offers', 'newsletter']
for (const id of sections) {
  const before = imgs.length
  await page.evaluate((id) => window.scrollTo(0, document.getElementById(id).offsetTop), id)
  for (let i = 0; i < 6; i++) { await page.waitForTimeout(250); await page.evaluate(() => 0) }
  console.log(`at #${id}: +${imgs.length - before} ->`, imgs.slice(before).join(', '))
}
console.log('CLS total:', (await page.evaluate(() => window.__cls)).toFixed(4))

// Slow images only (the rest of the page stays fast): capture each image's own loading state
const slow = await b.newPage({ viewport: { width: 1440, height: 900 } })
await slow.route('**/renders/**', async (route) => {
  await new Promise((r) => setTimeout(r, 6000))
  await route.continue()
})
await slow.goto('http://localhost:5188/')
for (let i = 0; i < 12; i++) { await slow.waitForTimeout(300); await slow.evaluate(() => 0) }
await slow.evaluate(() => window.scrollTo(0, document.getElementById('products').offsetTop + 250))
for (let i = 0; i < 6; i++) { await slow.waitForTimeout(300); await slow.evaluate(() => 0) }
await slow.mouse.move(5, 5)
await slow.screenshot({ path: `${out}/lazy-slow.png` })
for (let i = 0; i < 24; i++) { await slow.waitForTimeout(300); await slow.evaluate(() => 0) }
await slow.screenshot({ path: `${out}/lazy-done.png` })
await b.close()
