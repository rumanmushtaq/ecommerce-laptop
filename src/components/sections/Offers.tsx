import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight, Check, Repeat2, Timer } from 'lucide-react'
import { useEffect, useState } from 'react'
import { formatPrice, products } from '../../data/catalog'
import { useStore } from '../../lib/store'
import { EASE, Reveal, SectionIntro, Tilt } from '../ui/primitives'
import { MaskReveal } from '../ui/motion'
import { useShopCategory } from '../layout/Navbar'
import { AddButton } from './FeaturedProducts'
import { LazyImage } from '../ui/LazyImage'

const deal = products.find((p) => p.id === 'rog-zephyrus-g16')!

/** Sale ends at the coming Sunday 23:59:59 local time. */
function saleEnd() {
  const d = new Date()
  d.setDate(d.getDate() + ((7 - d.getDay()) % 7))
  d.setHours(23, 59, 59, 0)
  return d.getTime()
}

function useCountdown() {
  const [end] = useState(saleEnd)
  const [now, setNow] = useState(0)
  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])
  const s = now ? Math.max(0, Math.floor((end - now) / 1000)) : 0
  return [Math.floor(s / 86400), Math.floor((s % 86400) / 3600), Math.floor((s % 3600) / 60), s % 60]
}

function Digit({ value, label }: { value: number; label: string }) {
  const v = String(value).padStart(2, '0')
  return (
    <div className="flex flex-col items-center">
      <div className="relative h-[1.1em] overflow-hidden font-mono text-[clamp(1.6rem,4vw,3.2rem)] font-light leading-none tabular-nums">
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.span key={v} initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '-100%' }} transition={{ duration: 0.45, ease: EASE }} className="block">
            {v}
          </motion.span>
        </AnimatePresence>
      </div>
      <span className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-mist">{label}</span>
    </div>
  )
}

const ages = [
  { label: '< 2 yrs', base: 620 },
  { label: '2–4 yrs', base: 380 },
  { label: '4+ yrs', base: 160 },
]
const conditions = [
  { label: 'Like new', k: 1 },
  { label: 'Good', k: 0.8 },
  { label: 'Worn', k: 0.55 },
]

function Chips({ items, value, set, id }: { items: { label: string }[]; value: number; set: (i: number) => void; id: string }) {
  return (
    <div className="flex gap-1 rounded-full bg-white/[0.04] p-1">
      {items.map((it, i) => (
        <button key={it.label} onClick={() => set(i)} aria-pressed={i === value} className="relative flex-1 whitespace-nowrap rounded-full px-3 py-1.5 text-xs">
          {i === value && <motion.span layoutId={id} className="absolute inset-0 rounded-full bg-white/12" transition={{ type: 'spring', stiffness: 400, damping: 32 }} />}
          <span className={`relative ${i === value ? 'text-bone' : 'text-mist'}`}>{it.label}</span>
        </button>
      ))}
    </div>
  )
}

function TradeIn() {
  const [age, setAge] = useState(0)
  const [cond, setCond] = useState(0)
  const { toast } = useStore()
  const credit = Math.round((ages[age].base * conditions[cond].k + 120) / 10) * 10

  return (
    <div className="relative flex h-full flex-col overflow-hidden rounded-[28px] border border-white/[0.07] bg-gradient-to-br from-graphite to-coal p-6 sm:p-7">
      <div className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ice">
        <Repeat2 className="h-4 w-4" /> Trade-in estimator
      </div>
      <h3 className="mt-3 text-2xl font-medium tracking-tight">Your old laptop is worth more here.</h3>
      <div className="mt-5 space-y-3">
        <div>
          <p className="mb-1.5 text-xs text-mist">Age</p>
          <Chips items={ages} value={age} set={setAge} id="age-pill" />
        </div>
        <div>
          <p className="mb-1.5 text-xs text-mist">Condition</p>
          <Chips items={conditions} value={cond} set={setCond} id="cond-pill" />
        </div>
      </div>
      <div className="mt-auto flex items-end justify-between gap-3 pt-6">
        <div>
          <p className="text-xs text-mist">Estimated credit</p>
          <motion.p key={credit} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="text-4xl font-medium tracking-tight text-ice">
            {formatPrice(credit)}
          </motion.p>
        </div>
        <button
          onClick={() => toast({ title: `${formatPrice(credit)} credit reserved`, body: 'Applied automatically at checkout for 14 days.' })}
          className="rounded-full border border-ice/40 px-4 py-2.5 text-sm text-ice transition-colors hover:bg-ice hover:text-ink"
          data-cursor="hover"
        >
          Lock it in
        </button>
      </div>
    </div>
  )
}

export function Offers() {
  const [d, h, m, s] = useCountdown()
  const shop = useShopCategory()
  const claimed = 68

  return (
    <section id="offers" className="relative mx-auto max-w-[1520px] scroll-mt-16 section-pad py-24 md:py-36">
      <SectionIntro
        eyebrow="05 — The Night Sale"
        title={[{ text: 'Rare prices,' }, { text: 'after dark.', className: 'font-serif italic font-normal text-ember' }]}
        aside={
          <span className="flex items-center gap-2">
            <Timer className="h-4 w-4 text-ember" /> Prices return to normal Sunday at midnight. No codes, no catches — every discount is already in the price.
          </span>
        }
      />

      <div className="mt-12 grid gap-4 lg:grid-cols-[1.45fr_1fr]">
        {/* Hero deal */}
        <Reveal className="h-full">
          <Tilt max={3} className="h-full rounded-[32px]">
            <div className="group relative flex h-full flex-col overflow-hidden rounded-[32px] border border-white/[0.08] bg-[radial-gradient(80%_70%_at_70%_40%,rgba(157,123,255,0.25),transparent_70%),linear-gradient(160deg,#1a1828,#0d0c16)] p-6 sm:p-9">
              <div className="flex flex-wrap items-start justify-between gap-6">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-ember">Deal of the week</p>
                  <h3 className="mt-3 text-[clamp(2rem,3.6vw,3.2rem)] font-medium leading-none tracking-[-0.04em]">
                    {deal.brand} {deal.name}
                  </h3>
                  <p className="mt-3 max-w-sm text-sm text-mist">{deal.blurb}</p>
                </div>
                <div className="flex shrink-0 gap-3 sm:gap-5" aria-label="Time left in sale">
                  <Digit value={d} label="days" />
                  <Digit value={h} label="hrs" />
                  <Digit value={m} label="min" />
                  <Digit value={s} label="sec" />
                </div>
              </div>

              <div className="relative my-4 flex-1">
                <div className="absolute -top-2 right-2 z-10 grid h-24 w-24 rotate-12 place-items-center rounded-full bg-ember text-center font-medium leading-tight text-ink shadow-[0_20px_50px_-10px_rgba(185,166,255,0.7)] transition-transform duration-700 group-hover:rotate-0 sm:h-28 sm:w-28">
                  <span>
                    <span className="block text-2xl tracking-tight sm:text-3xl">−{Math.round((1 - deal.price / deal.compareAt!) * 100)}%</span>
                    <span className="font-mono text-[9px] uppercase tracking-wider">this week</span>
                  </span>
                </div>
                <MaskReveal>
                <LazyImage
                  src={deal.image}
                  alt={`${deal.brand} ${deal.name}`}
                  ratio="4 / 3"
                  sizes="(min-width: 1024px) 640px, 92vw"
                  className="mx-auto w-full max-w-[640px]"
                  imgClassName="scale-110 transition-transform duration-1000 ease-[cubic-bezier(.16,1,.3,1)] group-hover:scale-[1.16]"
                />
                </MaskReveal>
              </div>

              <div className="flex flex-wrap items-end justify-between gap-5">
                <div className="min-w-[220px] flex-1">
                  <p className="flex items-baseline gap-3">
                    <span className="text-4xl font-medium tracking-tight">{formatPrice(deal.price)}</span>
                    <span className="text-mist line-through">{formatPrice(deal.compareAt!)}</span>
                  </p>
                  <div className="mt-3 max-w-[320px]">
                    <div className="flex justify-between font-mono text-[10px] uppercase tracking-wider text-mist">
                      <span>{claimed}% claimed</span>
                      <span>41 left</span>
                    </div>
                    <div className="mt-1.5 h-1 overflow-hidden rounded-full bg-white/[0.08]">
                      <motion.div
                        className="h-full rounded-full bg-gradient-to-r from-ember to-volt"
                        initial={{ width: 0 }}
                        whileInView={{ width: `${claimed}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 1.4, ease: EASE }}
                      />
                    </div>
                  </div>
                </div>
                <AddButton product={deal} />
              </div>
            </div>
          </Tilt>
        </Reveal>

        <div className="grid gap-4">
          <Reveal delay={0.1} className="h-full">
            <button
              onClick={() => shop('creative')}
              data-cursor="hover"
              className="group relative flex h-full min-h-[280px] w-full flex-col overflow-hidden rounded-[28px] border border-white/[0.07] bg-gradient-to-br from-[#1d1622] to-coal p-6 text-left sm:p-7"
            >
              <LazyImage
                src="/renders/silver-side.webp"
                alt=""
                ratio="4 / 3"
                sizes="220px"
                className="pointer-events-none absolute -right-8 -top-4 w-[38%] max-w-[220px] opacity-90 transition-transform duration-1000 ease-[cubic-bezier(.16,1,.3,1)] group-hover:-translate-x-2 group-hover:translate-y-1"
              />
              <p className="relative font-mono text-[10px] uppercase tracking-[0.2em] text-ember-soft">Creator bundle</p>
              <h3 className="relative mt-3 max-w-[60%] text-2xl font-medium leading-tight tracking-tight">
                Save <span className="font-serif text-3xl italic text-ember">$250</span> on the full desk setup.
              </h3>
              <ul className="relative mt-5 space-y-2 text-sm">
                {[
                  ['Vegan leather sleeve', 89],
                  ['Thunderbolt 5 dock', 249],
                  ['Wireless precision mouse', 99],
                ].map(([n, v]) => (
                  <li key={n} className="flex items-center justify-between gap-3 border-b border-white/[0.06] pb-2">
                    <span className="flex items-center gap-2 text-bone/85">
                      <Check className="h-3.5 w-3.5 text-ice" /> {n}
                    </span>
                    <span className="font-mono text-xs text-mist line-through">{formatPrice(v as number)}</span>
                  </li>
                ))}
              </ul>
              <div className="relative mt-auto flex items-end justify-between gap-3 pt-5">
                <p className="text-sm">
                  <span className="font-mono text-xl text-bone">{formatPrice(187)}</span>
                  <span className="ml-2 text-xs text-mist">with any Creative Pro laptop</span>
                </p>
                <span className="inline-flex shrink-0 items-center gap-1.5 text-sm">
                  Shop <ArrowUpRight className="h-4 w-4 transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                </span>
              </div>
            </button>
          </Reveal>
          <Reveal delay={0.2} className="h-full">
            <TradeIn />
          </Reveal>
        </div>
      </div>
    </section>
  )
}
