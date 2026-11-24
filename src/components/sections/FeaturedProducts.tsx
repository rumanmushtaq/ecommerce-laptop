import { AnimatePresence, LayoutGroup, motion } from 'motion/react'
import { Check, Heart, Loader2, Rotate3d, ShoppingBag } from 'lucide-react'
import { useState } from 'react'
import { categories, formatPrice, products, type LineConfig, type Product } from '../../data/catalog'
import { useStore, type Filter } from '../../lib/store'
import { EASE, SectionIntro, Stars, Tilt } from '../ui/primitives'
import { LazyImage } from '../ui/LazyImage'

// Wide editorial cards at these positions keep the 3- and 2-column grids complete
const FEATURED = new Set(['noctis-studio-16', 'noctis-forge-x', 'odyssey-oled-g9'])

const tabs: { id: Filter; label: string }[] = [{ id: 'all', label: 'All' }, ...categories.map((c) => ({ id: c.id, label: c.title }))]

function WishButton({ product }: { product: Product }) {
  const { isWished, toggleWish } = useStore()
  const on = isWished(product.id)
  return (
    <motion.button
      onClick={() => toggleWish(product)}
      whileTap={{ scale: 0.8 }}
      aria-pressed={on}
      aria-label={on ? `Remove ${product.name} from wishlist` : `Save ${product.name} to wishlist`}
      className="relative grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-ink/40 backdrop-blur transition-colors hover:border-white/25"
      data-cursor="hover"
    >
      <motion.span key={String(on)} initial={{ scale: on ? 0.4 : 1 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 14 }}>
        <Heart className={`h-4 w-4 transition-colors ${on ? 'fill-plasma text-plasma' : 'text-bone/70'}`} />
      </motion.span>
      {/* burst ring when saved */}
      <AnimatePresence>
        {on && (
          <motion.span
            initial={{ scale: 0.6, opacity: 0.8 }}
            animate={{ scale: 1.8, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="pointer-events-none absolute inset-0 rounded-full border border-plasma"
          />
        )}
      </AnimatePresence>
    </motion.button>
  )
}

export function AddButton({ product, compact = false, config }: { product: Product; compact?: boolean; config?: LineConfig }) {
  const { addToCart } = useStore()
  const [state, setState] = useState<'idle' | 'loading' | 'done'>('idle')
  const click = () => {
    if (state !== 'idle') return
    setState('loading')
    setTimeout(() => {
      addToCart(product, config)
      setState('done')
      setTimeout(() => setState('idle'), 1500)
    }, 550)
  }
  return (
    <motion.button
      onClick={click}
      whileTap={{ scale: 0.95 }}
      aria-label={`Add ${product.brand} ${product.name} to bag`}
      data-cursor="hover"
      className={`relative flex h-11 items-center justify-center gap-2 overflow-hidden rounded-full text-sm font-medium transition-colors ${
        state === 'done' ? 'bg-emerald-400 text-ink' : 'bg-bone text-ink hover:bg-ember'
      } ${compact ? 'w-11' : 'px-5'}`}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={state}
          initial={{ y: 14, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -14, opacity: 0 }}
          transition={{ duration: 0.25 }}
          className="flex items-center gap-2"
        >
          {state === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : state === 'done' ? <Check className="h-4 w-4" /> : <ShoppingBag className="h-4 w-4" />}
          {!compact && (state === 'done' ? 'Added' : 'Add to bag')}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  )
}

function ProductCard({ product: p, feature }: { product: Product; feature: boolean }) {
  const { openQuick } = useStore()
  const save = p.compareAt ? p.compareAt - p.price : 0
  return (
    <Tilt max={feature ? 4 : 7} className="h-full rounded-[28px]">
      <motion.article
        id={`product-${p.id}`}
        whileHover={{ y: -6 }}
        transition={{ duration: 0.5, ease: EASE }}
        className={`group relative flex h-full flex-col rounded-[28px] border border-transparent p-3 transition-shadow duration-500 sm:p-3.5 ${
          feature ? 'md:grid md:grid-cols-[1.25fr_1fr] md:gap-6' : ''
        }`}
        style={{
          background: `linear-gradient(180deg, #0f1630, #0a0e1d) padding-box, linear-gradient(150deg, ${p.glow}, rgba(255,255,255,0.06) 42%, ${p.glow}66) border-box`,
          boxShadow: `0 30px 80px -50px ${p.glow}`,
        }}
      >
        {/* holographic foil edge, spins only while hovered */}
        <span aria-hidden className="holo-edge" />
        {/* Product shot */}
        <div
          className={`relative rounded-[22px] p-3.5 ${feature ? 'md:row-span-2 md:min-h-[460px]' : ''}`}
          style={{
            background: `radial-gradient(120% 80% at 50% -5%, ${p.glow}f2 0%, ${p.glow}80 34%, transparent 70%), linear-gradient(175deg, ${p.glow}55, #0f1630 82%)`,
          }}
        >
          {/* studio texture (clipped to the stage): dot grid + soft highlight + hover light sweep */}
          <span aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden rounded-[22px]">
            <span className="absolute inset-0 opacity-[0.22] [background-image:radial-gradient(rgba(255,255,255,0.55)_1px,transparent_1px)] [background-size:14px_14px] [mask-image:linear-gradient(to_bottom,black,transparent_70%)]" />
            <span className="absolute -inset-x-10 -top-1/2 h-full rounded-full bg-white/20 opacity-30 blur-3xl transition-opacity duration-700 group-hover:opacity-60" />
            <span className="absolute inset-y-0 left-0 w-1/3 -translate-x-[130%] skew-x-[-18deg] bg-gradient-to-r from-transparent via-white/25 to-transparent transition-transform duration-[1100ms] ease-out group-hover:translate-x-[420%]" />
          </span>
          <div className="relative z-40 flex items-start justify-between">
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-black/25 px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.18em] text-white/90 backdrop-blur-sm">{p.brand}</span>
              {p.badge && <span className="rounded-full bg-white px-2 py-1 font-mono text-[9px] font-medium uppercase tracking-wider text-ink">{p.badge}</span>}
            </div>
            <span className={feature ? 'md:hidden' : ''}>
              <WishButton product={p} />
            </span>
          </div>
          <div
            className={`relative z-30 ${
              feature ? '-mt-24 aspect-[4/3] md:absolute md:inset-x-2 md:bottom-2 md:-top-16 md:mt-0 md:aspect-auto' : '-mt-24 aspect-[4/3] sm:-mt-28'
            }`}
          >
            {/* floor shadow: tightens and fades as the laptop lifts off its stage */}
            <div
              aria-hidden
              className="absolute inset-x-[18%] bottom-[8%] h-[11%] rounded-[50%] bg-black/55 blur-xl transition-all duration-700 ease-out group-hover:inset-x-[26%] group-hover:opacity-60"
            />
            <button
              onClick={() => openQuick(p.id)}
              aria-label={`Open ${p.brand} ${p.name} in 3D quick view`}
              className="group/qv relative block h-full w-full"
              data-cursor="hover"
            >
              <motion.div layoutId={`shot-${p.id}`} className="h-full w-full">
                <LazyImage
                  src={p.image}
                  alt={`${p.brand} ${p.name}`}
                  className="h-full w-full"
                  sizes="(min-width: 1024px) 34vw, (min-width: 768px) 50vw, 92vw"
                  imgClassName="drop-shadow-[0_22px_28px_rgba(0,0,0,0.45)] transition-transform duration-[900ms] ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-y-5 group-hover:scale-[1.07] group-hover:-rotate-1"
                />
              </motion.div>
              <span className="glass absolute bottom-2 left-1/2 flex -translate-x-1/2 translate-y-2 items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-medium opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100 max-md:translate-y-0 max-md:opacity-100">
                <Rotate3d className="h-3.5 w-3.5 text-ember" /> View in 3D
              </span>
            </button>
          </div>
        </div>

        {/* Details */}
        <div className={`relative flex flex-1 flex-col px-2.5 pb-2 ${feature ? 'pt-4 md:pt-2' : 'pt-4'}`}>
          {feature && (
            <div className="relative z-30 mb-4 hidden items-center justify-between md:flex">
              <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-ember">Editor’s pick</span>
              <WishButton product={p} />
            </div>
          )}
          <h3 className={`font-medium leading-tight tracking-[-0.02em] ${feature ? 'text-[1.9rem]' : 'text-xl'}`}>{p.name}</h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed text-mist">{p.blurb}</p>
          <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-mist">
            <span className="flex items-center gap-2">
              <Stars value={p.rating} size={12} />
              <span className="text-bone">{p.rating}</span>({p.reviews.toLocaleString()})
            </span>
            <span className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${p.stock && p.stock < 8 ? 'animate-pulse bg-peach' : 'bg-ice'}`} />
              {p.stock && p.stock < 8 ? <span className="text-peach">Only {p.stock} left</span> : 'In stock · ships tomorrow'}
            </span>
          </div>

          <dl className={`mt-5 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] ${feature ? '' : 'text-[11px]'}`}>
            {p.specs.map((s) => (
              <div key={s.label} className="bg-coal px-3 py-2.5">
                <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-mist">{s.label}</dt>
                <dd className="mt-0.5 truncate text-[12px] text-bone/90">{s.value}</dd>
              </div>
            ))}
          </dl>

          <div className="mt-auto flex items-end justify-between gap-3 pt-6">
            <div>
              {save > 0 && <p className="mb-1 font-mono text-[10px] uppercase tracking-wider text-ember">Save {formatPrice(save)}</p>}
              <p className="flex items-baseline gap-2">
                <span className="text-2xl font-medium tracking-tight">{formatPrice(p.price)}</span>
                {p.compareAt && <span className="text-sm text-mist line-through">{formatPrice(p.compareAt)}</span>}
              </p>
              <p className="mt-0.5 font-mono text-[10px] text-mist">or {formatPrice(Math.ceil(p.price / 12))}/mo · 0% APR</p>
            </div>
            <AddButton product={p} />
          </div>
        </div>
      </motion.article>
    </Tilt>
  )
}

export function FeaturedProducts() {
  const { filter, setFilter } = useStore()
  const list = filter === 'all' ? products : products.filter((p) => p.category === filter)

  return (
    <section id="products" className="relative mx-auto max-w-[1520px] scroll-mt-20 section-pad py-24 md:py-32">
      <SectionIntro
        eyebrow="02 — Featured laptops"
        title={[{ text: 'The 2026' }, { text: 'edit.', className: 'font-serif italic font-normal text-ember' }]}
        aside="Laptops, desktops, displays and the gear around them — every piece one we would buy ourselves. Every price includes our 2-year warranty, free express delivery over $1,500 and 30-day returns."
      />

      <LayoutGroup>
        <div className="no-scrollbar -mx-4 mt-10 flex gap-1 overflow-x-auto px-4 md:mx-0 md:px-0" role="tablist" aria-label="Filter by category">
          <div className="flex gap-1 rounded-full border border-white/[0.07] bg-white/[0.02] p-1">
            {tabs.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={filter === t.id}
                onClick={() => setFilter(t.id)}
                className="relative whitespace-nowrap rounded-full px-4 py-2 text-sm"
                data-cursor="hover"
              >
                {filter === t.id && <motion.span layoutId="filter-pill" className="absolute inset-0 rounded-full bg-bone" transition={{ type: 'spring', stiffness: 380, damping: 32 }} />}
                <span className={`relative transition-colors ${filter === t.id ? 'text-ink' : 'text-mist hover:text-bone'}`}>{t.label}</span>
              </button>
            ))}
          </div>
        </div>

        <motion.div layout className="mt-24 grid grid-flow-row-dense gap-x-4 gap-y-28 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence mode="popLayout">
            {list.map((p, i) => {
              const feature = filter === 'all' && FEATURED.has(p.id)
              return (
                <motion.div
                  layout
                  key={p.id}
                  initial={{ opacity: 0, y: 70, rotateX: 10, scale: 0.96 }}
                  whileInView={{ opacity: 1, y: 0, rotateX: 0, scale: 1 }}
                  viewport={{ once: true, margin: '-6% 0px' }}
                  exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.25 } }}
                  transition={{ duration: 1, delay: (i % 3) * 0.1, ease: EASE }}
                  style={{ transformPerspective: 1200 }}
                  className={feature ? 'md:col-span-2' : ''}
                >
                  <ProductCard product={p} feature={feature} />
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      </LayoutGroup>
    </section>
  )
}
