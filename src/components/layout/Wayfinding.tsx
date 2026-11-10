import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { Search, ShoppingBag } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatPrice } from '../../data/catalog'
import { scrollToId } from '../../lib/hooks'
import { useStore } from '../../lib/store'
import { EASE } from '../ui/primitives'

const sections = [
  ['collections', 'Collections'],
  ['products', 'Laptops'],
  ['showcase', 'Studio 16'],
  ['gaming', 'Gaming'],
  ['offers', 'Deals'],
  ['why', 'Why Noctis'],
  ['reviews', 'Reviews'],
] as const

/** Visible once the visitor is past the hero and before the footer. */
function usePastHero() {
  const { scrollY } = useScroll()
  const [past, setPast] = useState(false)
  useMotionValueEvent(scrollY, 'change', (y) => {
    const end = document.documentElement.scrollHeight - window.innerHeight * 1.6
    setPast(y > window.innerHeight * 0.8 && y < end)
  })
  return past
}

/** Desktop: vertical index of the page's chapters with the current one highlighted. */
export function SectionRail() {
  const visible = usePastHero()
  const [active, setActive] = useState<string>('collections')

  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setActive(e.target.id)),
      { rootMargin: '-45% 0px -50% 0px' },
    )
    sections.forEach(([id]) => {
      const el = document.getElementById(id)
      if (el) io.observe(el)
    })
    return () => io.disconnect()
  }, [])

  return (
    <AnimatePresence>
      {visible && (
        <motion.nav
          aria-label="Page sections"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 20 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="fixed right-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-end gap-1 min-[1640px]:flex"
        >
          {sections.map(([id, label]) => {
            const on = active === id
            return (
              <button key={id} onClick={() => scrollToId(id)} className="group flex h-6 items-center gap-3" data-cursor="hover" aria-current={on ? 'true' : undefined}>
                <span
                  className={`rounded-full bg-ink/80 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] opacity-0 backdrop-blur transition-all duration-500 translate-x-2 group-hover:translate-x-0 group-hover:opacity-100 ${
                    on ? 'text-bone' : 'text-mist'
                  }`}
                >
                  {label}
                </span>
                <motion.span
                  className="block h-px rounded-full"
                  animate={{ width: on ? 28 : 12, backgroundColor: on ? '#b9a6ff' : 'rgba(238,234,247,0.25)' }}
                  transition={{ duration: 0.5, ease: EASE }}
                />
              </button>
            )
          })}
        </motion.nav>
      )}
    </AnimatePresence>
  )
}

/** Mobile/tablet: thumb-reachable bar with the three actions shoppers need most. */
export function MobileShopBar() {
  const visible = usePastHero()
  const { open, count, subtotal, cartPulse } = useStore()
  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ duration: 0.6, ease: EASE }}
          className="fixed inset-x-3 bottom-3 z-40 flex items-center gap-2 rounded-full border border-white/10 bg-ink/80 p-1.5 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.9)] backdrop-blur-xl lg:hidden"
        >
          <button onClick={() => open('search')} aria-label="Search laptops" className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-white/[0.06]">
            <Search className="h-[18px] w-[18px]" />
          </button>
          <button onClick={() => scrollToId('products')} className="h-11 flex-1 rounded-full bg-ember text-sm font-medium text-ink">
            Shop laptops
          </button>
          <motion.button
            key={cartPulse}
            animate={cartPulse ? { scale: [1, 1.12, 1] } : undefined}
            transition={{ duration: 0.45 }}
            onClick={() => open('cart')}
            aria-label={`Bag, ${count} items`}
            className="flex h-11 shrink-0 items-center gap-2 rounded-full bg-white/[0.06] px-4 text-sm"
          >
            <ShoppingBag className="h-[18px] w-[18px]" />
            {count > 0 ? <span className="font-mono text-xs">{formatPrice(subtotal)}</span> : <span className="text-xs text-mist">Bag</span>}
          </motion.button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
