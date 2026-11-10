// Renders every product shot via the dev-only studio page (needs `npm run dev` on :5188).
import { chromium } from 'playwright'
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=gl', '--ignore-gpu-blocklist'] })
const page = await browser.newPage({ viewport: { width: 1000, height: 800 } })
await page.goto('http://localhost:5188/studio')
await page.waitForFunction(() => document.body.innerText.includes('renders saved'), null, { timeout: 900000 })
console.log(await page.innerText('body'))
await browser.close()
