import { AnimatePresence, motion } from 'motion/react'
import { ArrowRight, ArrowUpRight, Heart, Loader2, Lock, Minus, Plus, Search, ShoppingBag, Trash2, X } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { categories, categoryLabel, formatPrice, products } from '../../data/catalog'
import { scrollToId } from '../../lib/hooks'
import { smooth } from '../../lib/smoothScroll'
import { useStore } from '../../lib/store'
import { EASE, Logo } from '../ui/primitives'
import { LazyImage } from '../ui/LazyImage'

function useEscape(active: boolean, close: () => void) {
  useEffect(() => {
    if (!active) return
    const on = (e: KeyboardEvent) => e.key === 'Escape' && close()
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [active, close])
}

const Backdrop = ({ onClick }: { onClick: () => void }) => (
  <motion.div
    className="fixed inset-0 z-[70] bg-black/60 backdrop-blur-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    onClick={onClick}
  />
)

/* ------------------------------------------------------------------ */
/* Bag + wishlist drawer                                               */
/* ------------------------------------------------------------------ */

export function BagDrawer() {
  const store = useStore()
  const { panel, close, open, lines, subtotal, wishlist, setQty, remove, addToCart, toggleWish, toast } = store
  const visible = panel === 'cart' || panel === 'wishlist'
  const [checking, setChecking] = useState(false)
  useEscape(visible, close)

  const wished = products.filter((p) => wishlist.includes(p.id))
  const freeShipLeft = Math.max(0, 1500 - subtotal)

  const checkout = () => {
    setChecking(true)
    setTimeout(() => {
      setChecking(false)
      toast({ title: 'Your bag is saved', body: 'Secure checkout opens in the full store. Items are held for 30 minutes.' })
    }, 1100)
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          <Backdrop onClick={close} />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={panel === 'cart' ? 'Shopping bag' : 'Wishlist'}
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.6, ease: EASE }}
            className="fixed inset-y-0 right-0 z-[80] flex w-full max-w-[460px] flex-col border-l border-white/[0.07] bg-coal/95 backdrop-blur-2xl"
          >
            <div className="flex items-center justify-between px-6 pb-4 pt-6">
              <div className="flex gap-1 rounded-full bg-white/[0.04] p-1">
                {(['cart', 'wishlist'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => open(tab)}
                    className="relative rounded-full px-4 py-1.5 text-sm"
                    data-cursor="hover"
                  >
                    {panel === tab && (
                      <motion.span layoutId="drawer-tab" className="absolute inset-0 rounded-full bg-white/10" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />
                    )}
                    <span className={`relative ${panel === tab ? 'text-bone' : 'text-mist'}`}>
                      {tab === 'cart' ? `Bag (${store.count})` : `Wishlist (${wishlist.length})`}
                    </span>
                  </button>
                ))}
              </div>
              <button onClick={close} aria-label="Close" className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10" data-cursor="hover">
                <X className="h-5 w-5" />
              </button>
            </div>

            {panel === 'cart' && lines.length > 0 && (
              <div className="mx-6 mb-2 rounded-2xl bg-white/[0.03] p-3.5">
                <p className="text-xs text-mist">
                  {freeShipLeft > 0 ? (
                    <>
                      Add <span className="text-bone">{formatPrice(freeShipLeft)}</span> for free express delivery
                    </>
                  ) : (
                    <span className="text-bone">You unlocked free 48h express delivery ✦</span>
                  )}
                </p>
                <div className="mt-2.5 h-1 overflow-hidden rounded-full bg-white/[0.06]">
                  <motion.div
                    className="h-full rounded-full bg-gradient-to-r from-ember to-ember-soft"
                    animate={{ width: `${Math.min(100, (subtotal / 1500) * 100)}%` }}
                    transition={{ duration: 0.8, ease: EASE }}
                  />
                </div>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-2" data-lenis-prevent>
              <AnimatePresence mode="popLayout" initial={false}>
                {panel === 'cart' &&
                  lines.map(({ product: p, qty, key, label, unit }) => (
                    <motion.div
                      layout
                      key={key}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 40, transition: { duration: 0.25 } }}
                      transition={{ duration: 0.5, ease: EASE }}
                      className="flex gap-4 border-b border-white/[0.06] py-5"
                    >
                      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-white/[0.03]">
                        <div className="absolute inset-0 opacity-40 blur-xl" style={{ background: `radial-gradient(circle, ${p.glow}, transparent 65%)` }} />
                        <LazyImage src={p.image} alt="" sizes="96px" className="h-full w-full" imgClassName="scale-125" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-mist">{p.brand}</p>
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        {label && <p className="truncate text-xs text-ember">{label}</p>}
                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center rounded-full border border-white/10">
                            <button onClick={() => setQty(key, qty - 1)} aria-label="Decrease quantity" className="grid h-8 w-8 place-items-center text-mist hover:text-bone">
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <motion.span key={qty} initial={{ y: -8, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="w-5 text-center font-mono text-sm">
                              {qty}
                            </motion.span>
                            <button onClick={() => setQty(key, qty + 1)} aria-label="Increase quantity" className="grid h-8 w-8 place-items-center text-mist hover:text-bone">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <p className="font-mono text-sm">{formatPrice(unit * qty)}</p>
                        </div>
                      </div>
                      <button onClick={() => remove(key)} aria-label={`Remove ${p.name}`} className="self-start p-1 text-mist hover:text-plasma">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
                {panel === 'wishlist' &&
                  wished.map((p) => (
                    <motion.div
                      layout
                      key={p.id}
                      initial={{ opacity: 0, x: 30 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 40, transition: { duration: 0.25 } }}
                      transition={{ duration: 0.5, ease: EASE }}
                      className="flex gap-4 border-b border-white/[0.06] py-5"
                    >
                      <div className="relative h-20 w-24 shrink-0 overflow-hidden rounded-xl bg-white/[0.03]">
                        <LazyImage src={p.image} alt="" sizes="96px" className="h-full w-full" imgClassName="scale-125" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="font-mono text-[10px] uppercase tracking-wider text-mist">{p.brand}</p>
                        <p className="truncate text-sm font-medium">{p.name}</p>
                        <div className="mt-3 flex items-center justify-between">
                          <p className="font-mono text-sm">{formatPrice(p.price)}</p>
                          <button
                            onClick={() => {
                              addToCart(p)
                              toggleWish(p)
                            }}
                            className="flex items-center gap-1.5 rounded-full bg-bone px-3 py-1.5 text-xs font-medium text-ink hover:bg-white"
                          >
                            <ShoppingBag className="h-3.5 w-3.5" /> Move to bag
                          </button>
                        </div>
                      </div>
                      <button onClick={() => toggleWish(p)} aria-label={`Remove ${p.name} from wishlist`} className="self-start p-1 text-mist hover:text-plasma">
                        <X className="h-4 w-4" />
                      </button>
                    </motion.div>
                  ))}
              </AnimatePresence>

              {((panel === 'cart' && lines.length === 0) || (panel === 'wishlist' && wished.length === 0)) && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center py-20 text-center">
                  <div className="grid h-16 w-16 place-items-center rounded-full border border-white/10">
                    {panel === 'cart' ? <ShoppingBag className="h-6 w-6 text-mist" /> : <Heart className="h-6 w-6 text-mist" />}
                  </div>
                  <p className="mt-5 font-serif text-3xl italic">{panel === 'cart' ? 'Your bag is empty' : 'Nothing saved yet'}</p>
                  <p className="mt-2 max-w-[260px] text-sm text-mist">
                    {panel === 'cart' ? 'The right machine is a scroll away.' : 'Tap the heart on any laptop to keep it here.'}
                  </p>
                  <button
                    onClick={() => {
                      close()
                      setTimeout(() => scrollToId('products'), 300)
                    }}
                    className="mt-6 flex items-center gap-2 rounded-full border border-white/15 px-5 py-2.5 text-sm hover:bg-white/5"
                  >
                    Browse laptops <ArrowRight className="h-4 w-4" />
                  </button>
                </motion.div>
              )}
            </div>

            {panel === 'cart' && lines.length > 0 && (
              <div className="border-t border-white/[0.07] px-6 pb-6 pt-5">
                <div className="flex justify-between text-sm text-mist">
                  <span>Subtotal</span>
                  <span className="font-mono text-bone">{formatPrice(subtotal)}</span>
                </div>
                <div className="mt-1.5 flex justify-between text-sm text-mist">
                  <span>Express delivery</span>
                  <span className="font-mono">{freeShipLeft > 0 ? formatPrice(29) : 'Free'}</span>
                </div>
                <button
                  onClick={checkout}
                  disabled={checking}
                  className="mt-5 flex h-14 w-full items-center justify-center gap-2 rounded-full bg-ember font-medium text-ink transition-colors hover:bg-ember-soft disabled:opacity-80"
                  data-cursor="hover"
                >
                  {checking ? <Loader2 className="h-5 w-5 animate-spin" /> : <Lock className="h-4 w-4" />}
                  {checking ? 'Securing your bag…' : `Checkout · ${formatPrice(subtotal + (freeShipLeft > 0 ? 29 : 0))}`}
                </button>
                <p className="mt-3 text-center text-[11px] text-mist">Pay in 4 interest-free · 30-day returns · 2-year warranty</p>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ */
/* Command-palette style search                                        */
/* ------------------------------------------------------------------ */

const suggestions = ['OLED', 'RTX 5090', 'MacBook', 'Monitor', 'Keyboard', 'under $500']

export function SearchOverlay() {
  const { panel, close, setFilter } = useStore()
  const visible = panel === 'search'
  const [q, setQ] = useState('')
  const [active, setActive] = useState(0)
  const input = useRef<HTMLInputElement>(null)
  useEscape(visible, close)

  useEffect(() => {
    if (visible) {
      setQ('')
      setActive(0)
      setTimeout(() => input.current?.focus(), 80)
    }
  }, [visible])

  const results = useMemo(() => {
    const term = q.trim().toLowerCase()
    if (!term) return products.slice(0, 5)
    const under = term.match(/under \$?(\d+)/)
    return products.filter((p) => {
      if (under) return p.price < Number(under[1])
      const hay = [p.brand, p.name, p.category, categoryLabel(p.category), p.blurb, ...p.specs.map((s) => s.value)].join(' ').toLowerCase()
      return term.split(/\s+/).every((w) => hay.includes(w))
    })
  }, [q])

  const go = (id: string) => {
    close()
    setFilter('all')
    setTimeout(() => {
      const el = document.getElementById(`product-${id}`)
      if (el && smooth.lenis) smooth.lenis.scrollTo(el, { offset: -(window.innerHeight - el.offsetHeight) / 2, duration: 1.4 })
      else el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      el?.animate([{ boxShadow: '0 0 0 2px #b9a6ff' }, { boxShadow: '0 0 0 2px transparent' }], { duration: 1800, delay: 500 })
    }, 350)
  }

  return (
    <AnimatePresence>
      {visible && (
        <>
          <Backdrop onClick={close} />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search laptops"
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="fixed inset-x-3 top-[10vh] z-[80] mx-auto max-w-[640px] overflow-hidden rounded-3xl border border-white/10 bg-coal/95 shadow-[0_60px_160px_-40px_rgba(0,0,0,1)] backdrop-blur-2xl"
          >
            <div className="flex items-center gap-3 border-b border-white/[0.07] px-5">
              <Search className="h-5 w-5 text-mist" />
              <input
                ref={input}
                value={q}
                onChange={(e) => {
                  setQ(e.target.value)
                  setActive(0)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'ArrowDown') {
                    e.preventDefault()
                    setActive((a) => Math.min(a + 1, results.length - 1))
                  } else if (e.key === 'ArrowUp') {
                    e.preventDefault()
                    setActive((a) => Math.max(a - 1, 0))
                  } else if (e.key === 'Enter' && results[active]) go(results[active].id)
                }}
                placeholder="Search by brand, GPU, display…"
                aria-label="Search laptops"
                className="h-16 flex-1 bg-transparent text-lg outline-none placeholder:text-mist/60"
              />
              <button onClick={close} className="rounded-md bg-white/[0.06] px-2 py-1 font-mono text-[10px] text-mist hover:text-bone">
                ESC
              </button>
            </div>
            <div className="flex flex-wrap gap-2 px-5 pt-4">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setQ(s)}
                  className={`rounded-full border px-3 py-1 text-xs transition-colors ${q === s ? 'border-ember text-ember' : 'border-white/10 text-mist hover:border-white/25 hover:text-bone'}`}
                >
                  {s}
                </button>
              ))}
            </div>
            <ul className="max-h-[50vh] overflow-y-auto p-3" role="listbox" data-lenis-prevent>
              {results.map((p, i) => (
                <li key={p.id} role="option" aria-selected={i === active}>
                  <button
                    onMouseEnter={() => setActive(i)}
                    onClick={() => go(p.id)}
                    className="relative flex w-full items-center gap-4 rounded-2xl p-2.5 text-left"
                  >
                    {i === active && <motion.span layoutId="search-active" className="absolute inset-0 rounded-2xl bg-white/[0.06]" transition={{ type: 'spring', stiffness: 500, damping: 38 }} />}
                    <LazyImage src={p.image} alt="" sizes="64px" className="h-12 w-16 shrink-0" />
                    <span className="relative min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {p.brand} {p.name}
                      </span>
                      <span className="block font-mono text-[10px] uppercase tracking-wider text-mist">
                        {categoryLabel(p.category)} · {p.specs[1].value}
                      </span>
                    </span>
                    <span className="relative font-mono text-sm">{formatPrice(p.price)}</span>
                  </button>
                </li>
              ))}
              {results.length === 0 && (
                <li className="px-3 py-10 text-center text-sm text-mist">
                  No laptops match “{q}”. Try <button className="text-ember underline-offset-4 hover:underline" onClick={() => setQ('OLED')}>OLED</button>.
                </li>
              )}
            </ul>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ */
/* Mobile menu                                                         */
/* ------------------------------------------------------------------ */

export function MobileMenu() {
  const { panel, close, setFilter, open } = useStore()
  const visible = panel === 'menu'
  useEscape(visible, close)
  const nav = (id: string) => {
    close()
    setTimeout(() => scrollToId(id), 350)
  }
  const links = [
    ['products', 'Laptops'],
    ['showcase', 'Studio 16'],
    ['gaming', 'Gaming'],
    ['offers', 'Deals'],
    ['why', 'Why Noctis'],
    ['reviews', 'Reviews'],
  ]
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          initial={{ clipPath: 'inset(0 0 100% 0)' }}
          animate={{ clipPath: 'inset(0 0 0% 0)' }}
          exit={{ clipPath: 'inset(0 0 100% 0)' }}
          transition={{ duration: 0.7, ease: EASE }}
          className="fixed inset-0 z-[80] flex flex-col overflow-y-auto bg-ink px-5 pb-8 pt-6"
          data-lenis-prevent
        >
          <div className="flex items-center justify-between">
            <Logo />
            <button onClick={close} aria-label="Close menu" className="grid h-11 w-11 place-items-center rounded-full border border-white/10">
              <X className="h-5 w-5" />
            </button>
          </div>
          <nav className="mt-12 flex flex-col" aria-label="Mobile">
            {links.map(([id, label], i) => (
              <motion.button
                key={id}
                onClick={() => nav(id)}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 + i * 0.05, duration: 0.6, ease: EASE }}
                className="flex items-center justify-between border-b border-white/[0.07] py-4 text-left text-[2rem] font-medium tracking-tight"
              >
                {label}
                <ArrowUpRight className="h-5 w-5 text-mist" />
              </motion.button>
            ))}
          </nav>
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="mt-8">
            <p className="eyebrow mb-3">Categories</p>
            <div className="flex flex-wrap gap-2">
              {categories.map((c) => (
                <button
                  key={c.id}
                  onClick={() => {
                    setFilter(c.id)
                    nav('products')
                  }}
                  className="rounded-full border border-white/10 px-4 py-2 text-sm text-bone/80"
                >
                  {c.title}
                </button>
              ))}
            </div>
            <button onClick={() => open('search')} className="mt-8 flex h-12 w-full items-center gap-3 rounded-full border border-white/10 px-5 text-mist">
              <Search className="h-4 w-4" /> Search laptops
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

/* ------------------------------------------------------------------ */
/* Toasts                                                              */
/* ------------------------------------------------------------------ */

export function Toasts() {
  const { toasts, dismiss, open } = useStore()
  return (
    <div className="pointer-events-none fixed bottom-20 left-1/2 z-[90] flex w-[min(92vw,380px)] -translate-x-1/2 flex-col gap-2 sm:left-auto sm:right-6 sm:translate-x-0 lg:bottom-6" aria-live="polite">
      <AnimatePresence initial={false}>
        {toasts.map((t) => (
          <motion.div
            layout
            key={t.id}
            initial={{ opacity: 0, y: 30, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 60, transition: { duration: 0.25 } }}
            transition={{ duration: 0.5, ease: EASE }}
            className="pointer-events-auto relative flex items-center gap-3 overflow-hidden rounded-2xl border border-white/10 bg-graphite/90 p-3 pr-4 shadow-2xl backdrop-blur-xl"
          >
            {t.image && <LazyImage src={t.image} alt="" sizes="56px" priority className="h-11 w-14 shrink-0" />}
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium">{t.title}</p>
              <p className="truncate text-xs text-mist">{t.body}</p>
            </div>
            {t.title === 'Added to bag' && (
              <button
                onClick={() => {
                  dismiss(t.id)
                  open('cart')
                }}
                className="text-xs font-medium text-ember hover:text-ember-soft"
              >
                View
              </button>
            )}
            <motion.span
              className="absolute bottom-0 left-0 h-px bg-ember"
              initial={{ width: '100%' }}
              animate={{ width: '0%' }}
              transition={{ duration: 3.8, ease: 'linear' }}
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
