// Full-page QA: scrolls through the page (to trigger in-view animations) then captures
// viewport screenshots at each section, plus overflow + broken image checks.
import { chromium } from 'playwright'
const [w, h, out] = process.argv.slice(2)
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=gl', '--ignore-gpu-blocklist'] })
const page = await browser.newPage({ viewport: { width: +w, height: +h } })
const errors = []
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
page.on('pageerror', (e) => errors.push(String(e)))
await page.goto('http://localhost:5188/')
for (let t = 0; t < 10; t++) { await page.waitForTimeout(400); await page.evaluate(() => 0) }
const ids = ['top', 'trust', 'collections', 'products', 'showcase', 'gaming', 'offers', 'why', 'reviews', 'newsletter']
for (const id of ids) {
  await page.evaluate((id) => document.getElementById(id).scrollIntoView({ behavior: 'instant' }), id)
  for (let t = 0; t < 5; t++) { await page.waitForTimeout(300); await page.evaluate(() => 0) }
  await page.screenshot({ path: `${out}/${w}-${id}.png` })
}
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
await page.waitForTimeout(800)
await page.screenshot({ path: `${out}/${w}-footer.png` })
const report = await page.evaluate(() => ({
  docWidth: document.documentElement.scrollWidth,
  vw: window.innerWidth,
  wide: [...document.querySelectorAll('body *')].filter((el) => el.getBoundingClientRect().right > window.innerWidth + 1 && getComputedStyle(el).position !== 'fixed').slice(0, 8).map((el) => el.tagName + '.' + String(el.className).slice(0, 60)),
  brokenImgs: [...document.images].filter((i) => i.complete && i.naturalWidth === 0).map((i) => i.src),
}))
console.log(JSON.stringify(report, null, 1))
console.log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors')
await browser.close()
