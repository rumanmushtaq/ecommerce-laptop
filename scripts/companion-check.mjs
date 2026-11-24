// Captures the travelling laptop at key scroll points (needs dev or prod server). Usage: node scripts/companion-check.mjs <url> <outDir>
import { chromium } from 'playwright'
const [url = 'http://localhost:5188/', out = '.'] = process.argv.slice(2)
const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=gl', '--ignore-gpu-blocklist'] })
const page = await b.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
await page.goto(url)
const tick = async (n) => { for (let i = 0; i < n; i++) { await page.waitForTimeout(250); await page.evaluate(() => 0) } }
await tick(40)
const shots = [['hero', 0], ['hero-cycled', 0]]
await page.screenshot({ path: `${out}/c-hero.png` })
await tick(20)
await page.screenshot({ path: `${out}/c-hero2.png` })
const marks = await page.evaluate(() => {
  const top = (id) => document.getElementById(id).getBoundingClientRect().top + scrollY
  return { trust: top('trust'), products: top('products') + 900, showcase: top('showcase') + 200, showcase3: top('showcase') + 2600, gaming: top('gaming') + 250, offers: top('offers') + 250, final: top('newsletter') + 300 }
})
for (const [k, y] of Object.entries(marks)) {
  await page.evaluate((y) => window.scrollTo(0, y), y)
  await tick(10)
  await page.screenshot({ path: `${out}/c-${k}.png` })
}
console.log(errors.length ? errors.slice(0, 5).join('\n') : 'no errors')
await b.close()
