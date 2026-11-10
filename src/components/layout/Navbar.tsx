import { AnimatePresence, motion, useMotionValueEvent, useScroll } from 'motion/react'
import { ArrowUpRight, ChevronDown, Heart, Menu, Search, ShoppingBag, X } from 'lucide-react'
import { useEffect, useState } from 'react'
import { categories, type Category } from '../../data/catalog'
import { scrollToId } from '../../lib/hooks'
import { useStore } from '../../lib/store'
import { EASE, Logo } from '../ui/primitives'
import { LazyImage } from '../ui/LazyImage'

const links = [
  { id: 'products', label: 'Shop' },
  { id: 'showcase', label: 'Studio 16' },
  { id: 'gaming', label: 'Gaming' },
  { id: 'offers', label: 'Deals' },
  { id: 'why', label: 'Why Noctis' },
]

export function useShopCategory() {
  const { setFilter } = useStore()
  return (c: Category | 'all') => {
    setFilter(c)
    scrollToId('products')
  }
}

function IconButton({
  label,
  onClick,
  children,
  badge,
  pulseKey,
}: {
  label: string
  onClick: () => void
  children: React.ReactNode
  badge?: number
  pulseKey?: number
}) {
  return (
    <motion.button
      key={pulseKey}
      onClick={onClick}
      aria-label={label}
      data-cursor="hover"
      animate={pulseKey ? { scale: [1, 1.25, 0.92, 1] } : undefined}
      transition={{ duration: 0.5, ease: EASE }}
      whileHover={{ y: -1 }}
      className="relative grid h-9 w-9 place-items-center rounded-full text-bone/80 sm:h-10 sm:w-10 transition-colors hover:bg-white/8 hover:text-bone"
    >
      {children}
      <AnimatePresence>
        {!!badge && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="absolute -right-0.5 -top-0.5 grid h-[18px] min-w-[18px] place-items-center rounded-full bg-ember px-1 font-mono text-[10px] font-medium text-ink"
          >
            {badge}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  )
}

const promos = [
  { text: 'The Night Sale — up to 12% off until Sunday midnight', target: 'offers' },
  { text: 'Free 48h express delivery on orders over $1,500', target: 'why' },
  { text: '0% APR for 12 months on every laptop', target: 'products' },
  { text: 'Trade in your old laptop for up to $740 credit', target: 'offers' },
]

/** Slim rotating announcement strip; collapses once the page scrolls. */
function PromoBar({ onClose }: { onClose: () => void }) {
  const [i, setI] = useState(0)
  useEffect(() => {
    const id = setInterval(() => setI((n) => (n + 1) % promos.length), 4200)
    return () => clearInterval(id)
  }, [])
  const p = promos[i]
  return (
    <motion.div
      initial={{ height: 0, opacity: 0 }}
      animate={{ height: 34, opacity: 1 }}
      exit={{ height: 0, opacity: 0 }}
      transition={{ duration: 0.5, ease: EASE }}
      className="relative overflow-hidden border-b border-white/[0.06] bg-gradient-to-r from-ember/[0.12] via-peach/[0.10] to-ice/[0.10]"
    >
      <button onClick={() => scrollToId(p.target)} className="flex h-[34px] w-full items-center justify-center gap-2 px-10 text-[12px] text-bone/85 hover:text-bone" data-cursor="hover">
        <span className="h-1.5 w-1.5 shrink-0 animate-pulse rounded-full bg-ember" />
        <AnimatePresence mode="wait">
          <motion.span
            key={i}
            initial={{ y: 14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -14, opacity: 0 }}
            transition={{ duration: 0.35, ease: EASE }}
            className="truncate"
          >
            {p.text}
          </motion.span>
        </AnimatePresence>
        <ArrowUpRight className="h-3.5 w-3.5 shrink-0 text-ember" />
      </button>
      <button onClick={onClose} aria-label="Dismiss announcement" className="absolute right-2 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-mist hover:text-bone">
        <X className="h-3.5 w-3.5" />
      </button>
    </motion.div>
  )
}

export function Navbar({ ready }: { ready: boolean }) {
  const { open, count, wishlist, cartPulse } = useStore()
  const shop = useShopCategory()
  const { scrollY } = useScroll()
  const [solid, setSolid] = useState(false)
  const [hidden, setHidden] = useState(false)
  const [hovered, setHovered] = useState<string | null>(null)
  const [mega, setMega] = useState(false)
  const [promoClosed, setPromoClosed] = useState(false)

  useMotionValueEvent(scrollY, 'change', (y) => {
    const prev = scrollY.getPrevious() ?? 0
    setSolid(y > 40)
    setHidden(y > 500 && y > prev + 4 ? true : y < prev - 4 ? false : hidden)
    if (y > prev + 4) setMega(false)
  })

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault()
        open('search')
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <motion.header
      initial={{ y: -90, opacity: 0 }}
      animate={ready ? { y: hidden ? -90 : 0, opacity: 1 } : undefined}
      transition={{ duration: 0.8, ease: EASE, delay: hidden ? 0 : 0.1 }}
      className="fixed inset-x-0 top-0 z-50"
      onMouseLeave={() => setMega(false)}
    >
      <AnimatePresence initial={false}>{!solid && !promoClosed && <PromoBar onClose={() => setPromoClosed(true)} />}</AnimatePresence>
      <div
        className={`mx-3 mt-3 flex h-16 max-w-[1520px] items-center justify-between rounded-full px-2 transition-[background,border-color,box-shadow] duration-500 sm:px-4 md:mx-5 min-[1560px]:mx-auto ${
          solid || mega
            ? 'border border-white/[0.07] bg-ink/70 shadow-[0_20px_60px_-30px_rgba(0,0,0,0.9)] backdrop-blur-xl'
            : 'border border-transparent'
        }`}
      >
        <a href="#top" aria-label="Noctis home" data-cursor="hover" className="pl-2">
          <Logo />
        </a>

        <nav className="hidden items-center lg:flex" onMouseLeave={() => setHovered(null)} aria-label="Primary">
          <button
            className="relative flex items-center gap-1 px-4 py-2 text-sm text-bone/75 transition-colors hover:text-bone"
            onMouseEnter={() => {
              setHovered('collections')
              setMega(true)
            }}
            onClick={() => setMega((m) => !m)}
            aria-expanded={mega}
            data-cursor="hover"
          >
            {hovered === 'collections' && (
              <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-white/[0.07]" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
            )}
            <span className="relative">Categories</span>
            <ChevronDown className={`relative h-3.5 w-3.5 transition-transform duration-300 ${mega ? 'rotate-180' : ''}`} />
          </button>
          {links.map((l) => (
            <a
              key={l.id}
              href={`#${l.id}`}
              onMouseEnter={() => {
                setHovered(l.id)
                setMega(false)
              }}
              data-cursor="hover"
              className="relative px-4 py-2 text-sm text-bone/75 transition-colors hover:text-bone"
            >
              {hovered === l.id && (
                <motion.span layoutId="nav-pill" className="absolute inset-0 rounded-full bg-white/[0.07]" transition={{ type: 'spring', stiffness: 380, damping: 30 }} />
              )}
              <span className="relative">{l.label}</span>
            </a>
          ))}
        </nav>

        <div className="flex items-center sm:gap-1">
          <button
            onClick={() => open('search')}
            data-cursor="hover"
            className="mr-1 hidden h-10 items-center gap-2.5 rounded-full border border-white/10 pl-3.5 pr-2 text-sm text-mist transition-colors hover:border-white/20 hover:text-bone md:flex"
          >
            <Search className="h-4 w-4" />
            <span className="pr-6">Search laptops</span>
            <kbd className="rounded-md bg-white/[0.07] px-1.5 py-0.5 font-mono text-[10px]">⌘K</kbd>
          </button>
          <span className="md:hidden">
            <IconButton label="Search" onClick={() => open('search')}>
              <Search className="h-[18px] w-[18px]" />
            </IconButton>
          </span>
          <IconButton label={`Wishlist, ${wishlist.length} items`} onClick={() => open('wishlist')} badge={wishlist.length}>
            <Heart className="h-[18px] w-[18px]" />
          </IconButton>
          <IconButton label={`Bag, ${count} items`} onClick={() => open('cart')} badge={count} pulseKey={cartPulse}>
            <ShoppingBag className="h-[18px] w-[18px]" />
          </IconButton>
          <span className="lg:hidden">
            <IconButton label="Open menu" onClick={() => open('menu')}>
              <Menu className="h-5 w-5" />
            </IconButton>
          </span>
        </div>
      </div>

      {/* Categories mega menu */}
      <AnimatePresence>
        {mega && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.45, ease: EASE }}
            className="mx-auto mt-2 hidden max-w-[1100px] rounded-3xl border border-white/[0.07] bg-ink/85 p-3 shadow-[0_40px_120px_-40px_rgba(0,0,0,0.9)] backdrop-blur-2xl lg:block"
          >
            <div className="grid grid-cols-4 gap-2">
              {categories.map((c, i) => (
                <motion.button
                  key={c.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.04 * i, duration: 0.5, ease: EASE }}
                  onClick={() => {
                    setMega(false)
                    shop(c.id)
                  }}
                  data-cursor="hover"
                  className="group relative overflow-hidden rounded-2xl bg-white/[0.03] p-4 text-left transition-colors hover:bg-white/[0.06]"
                >
                  <div
                    className="absolute -right-10 -top-10 h-32 w-32 rounded-full opacity-0 blur-3xl transition-opacity duration-500 group-hover:opacity-50"
                    style={{ background: c.accent }}
                  />
                  <LazyImage
                    src={c.image}
                    alt=""
                    ratio="4 / 3"
                    sizes="200px"
                    className="-mx-2 w-[calc(100%+1rem)]"
                    imgClassName="transition-transform duration-700 ease-out group-hover:scale-[1.06]"
                  />
                  <p className="relative mt-1 flex items-center justify-between text-sm font-medium">
                    {c.title}
                    <ArrowUpRight className="h-3.5 w-3.5 -translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
                  </p>
                  <p className="relative mt-0.5 font-mono text-[10px] uppercase tracking-wider text-mist">{c.kicker}</p>
                </motion.button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}
