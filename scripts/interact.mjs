// Clicks through every interactive feature and reports what changed.
import { chromium } from 'playwright'
const out = process.argv[2]
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=gl'] })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', (e) => errors.push(String(e)))
page.on('console', (m) => m.type() === 'error' && errors.push(m.text()))
const wait = (ms) => page.waitForTimeout(ms)
const log = (...a) => console.log(...a)
await page.goto('http://localhost:5188/')
await wait(2500)

// Hero quick add
await page.getByRole('button', { name: /Add Studio 16 — Graphite Edition to bag/ }).click()
await wait(600)
log('toast:', await page.locator('[aria-live=polite]').innerText())
log('bag badge:', await page.getByRole('button', { name: /^Bag, / }).getAttribute('aria-label'))

// Filter tabs
await page.locator('#products').scrollIntoViewIfNeeded()
await page.getByRole('tab', { name: 'Gaming' }).click()
await wait(1200)
log('gaming filter cards:', await page.locator('#products article').count())
await page.getByRole('tab', { name: 'All' }).click()
await wait(1200)
log('all cards:', await page.locator('#products article').count())

// Product add + wishlist
await page.getByRole('button', { name: 'Add Apple MacBook Pro 16″ M4 Max to bag' }).click()
await wait(1200)
await page.getByRole('button', { name: /Save MacBook Pro 16″ M4 Max to wishlist/ }).first().click()
await wait(500)
log('wishlist:', await page.getByRole('button', { name: /^Wishlist, / }).getAttribute('aria-label'))

// 3D Quick View: finish + memory upgrade, add configured machine
await page.getByRole('button', { name: /Open Apple MacBook Pro 16″ M4 Max in 3D quick view/ }).click()
await wait(2600)
await page.getByRole('button', { name: 'Space Black' }).click()
await page.getByRole('dialog').getByRole('button', { name: /^96GB/ }).click()
await wait(1200)
await page.screenshot({ path: `${out}/i-quick.png` })
log('quick price:', await page.getByRole('dialog').locator('.text-3xl').innerText())
await page.getByRole('dialog').getByRole('button', { name: /Add Apple MacBook Pro 16″ M4 Max to bag/ }).click()
await wait(1200)
await page.keyboard.press('Escape')
await wait(800)

// Cart drawer + qty (scroll up a little: navbar hides while scrolling down)
await page.mouse.wheel(0, -300)
await wait(900)
await page.getByRole('button', { name: /^Bag, / }).click()
await wait(800)
await page.getByRole('button', { name: 'Increase quantity' }).first().click()
await wait(400)
await page.screenshot({ path: `${out}/i-cart.png` })
log('drawer text:', (await page.getByRole('dialog').innerText()).replace(/\n+/g, ' | ').slice(0, 260))
await page.getByRole('button', { name: /^Checkout/ }).click()
await wait(1500)
log('checkout toast:', await page.locator('[aria-live=polite]').innerText().then((t) => t.replace(/\n/g, ' | ')))
await page.keyboard.press('Escape')
await wait(700)

// Search: Cmd+K
await page.keyboard.press('Control+k')
await wait(600)
await page.keyboard.type('thinkpad')
await wait(300)
await page.screenshot({ path: `${out}/i-search.png` })
log('search results:', await page.getByRole('option').count())
await page.keyboard.press('Enter')
await wait(1800)
log('scrolled to thinkpad, card in view:', await page.locator('#product-thinkpad-x1-carbon').evaluate((el) => { const r = el.getBoundingClientRect(); return r.top < innerHeight && r.bottom > 0 }))

// Collections panel click -> filter
await page.locator('#collections').scrollIntoViewIfNeeded()
await wait(800)
await page.getByRole('button', { name: 'Business collection' }).hover()
await wait(900)
await page.getByRole('button', { name: 'Business collection' }).click()
await wait(1800)
log('after collection click, selected tab:', await page.locator('[role=tab][aria-selected=true]').innerText())

// Mega menu
await page.evaluate(() => window.scrollTo(0, 0))
await wait(800)
await page.getByRole('button', { name: 'Categories' }).hover()
await wait(800)
await page.screenshot({ path: `${out}/i-mega.png` })

// Gaming rig toggle
await page.locator('#gaming').scrollIntoViewIfNeeded()
await page.getByRole('button', { name: 'Blade 16' }).click()
await wait(900)
log('gaming card:', (await page.locator('#gaming').innerText()).includes('Blade 16'))

// Trade-in
await page.locator('#offers').scrollIntoViewIfNeeded()
await page.getByRole('button', { name: '4+ yrs' }).click()
await page.getByRole('button', { name: 'Lock it in' }).click()
await wait(500)
log('trade toast:', await page.locator('[aria-live=polite]').innerText().then((t) => t.split('\n').slice(-3).join(' | ')))

// Testimonials next
await page.locator('#reviews').scrollIntoViewIfNeeded()
const q1 = await page.locator('#reviews blockquote').innerText()
await page.getByRole('button', { name: 'Next review' }).click()
await wait(900)
log('review changed:', q1 !== (await page.locator('#reviews blockquote').innerText()))

// Newsletter validation + success
await page.locator('#email-cta').fill('nope')
await page.locator('#newsletter form button[type=submit]').click()
await wait(300)
log('invalid msg:', await page.locator('#newsletter [role=alert]').innerText())
await page.locator('#email-cta').fill('ada@studio.com')
await page.locator('#newsletter form button[type=submit]').click()
await wait(1300)
log('success:', await page.locator('#newsletter [role=status]').innerText())

// Persistence after reload
await page.reload()
await wait(2500)
log('after reload bag:', await page.getByRole('button', { name: /^Bag, / }).getAttribute('aria-label'))

// Mobile menu
await page.setViewportSize({ width: 390, height: 844 })
await wait(600)
await page.getByRole('button', { name: 'Open menu' }).click()
await wait(900)
await page.screenshot({ path: `${out}/i-menu.png` })
await page.getByRole('button', { name: 'Deals' }).click()
await wait(1500)
log('menu nav -> offers top:', await page.locator('#offers').evaluate((el) => Math.round(el.getBoundingClientRect().top)))
log(errors.length ? 'ERRORS:\n' + errors.join('\n') : 'no console errors')
await browser.close()
