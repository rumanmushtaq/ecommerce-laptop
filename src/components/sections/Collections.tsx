import { AnimatePresence, motion } from 'motion/react'
import { ArrowUpRight } from 'lucide-react'
import { useState } from 'react'
import { categories, products } from '../../data/catalog'
import { EASE, Reveal, SectionIntro } from '../ui/primitives'
import { useShopCategory } from '../layout/Navbar'
import { LazyImage } from '../ui/LazyImage'

const countFor = (id: string) => products.filter((p) => p.category === id).length
const fromPrice = (id: string) => Math.min(...products.filter((p) => p.category === id).map((p) => p.price))

export function Collections() {
  const [active, setActive] = useState(0)
  const shop = useShopCategory()

  return (
    <section id="collections" className="relative mx-auto max-w-[1520px] section-pad py-24 md:py-36">
      <SectionIntro
        eyebrow="01 — Collections"
        title={[{ text: 'Find the machine' }, { text: 'that fits your night.', className: 'font-serif italic font-normal text-bone/90' }]}
        aside="Eight worlds, each tuned by our in-house testers. Hover a collection to step inside — every machine is benchmarked, burned in and colour-checked before it ships."
      />

      {/* Desktop: expanding panels */}
      <Reveal className="mt-14 hidden h-[560px] gap-3 lg:flex">
        {categories.map((c, i) => {
          const on = i === active
          return (
            <motion.div
              key={c.id}
              role="button"
              tabIndex={0}
              aria-expanded={on}
              aria-label={`${c.title} collection`}
              onMouseEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => (on ? shop(c.id) : setActive(i))}
              onKeyDown={(e) => e.key === 'Enter' && shop(c.id)}
              animate={{ flexGrow: on ? 4.2 : 1 }}
              transition={{ duration: 0.9, ease: EASE }}
              data-cursor="hover"
              className="group relative basis-0 cursor-pointer overflow-hidden rounded-[28px] border border-white/[0.07] bg-graphite"
            >
              <motion.div
                aria-hidden
                className="absolute inset-0"
                animate={{ opacity: on ? 1 : 0.7 }}
                transition={{ duration: 0.9 }}
                style={{ background: `radial-gradient(90% 70% at 65% 55%, ${c.accent}33, transparent 70%), linear-gradient(180deg, #1a1828, #100f1b)` }}
              />
              <div aria-hidden className="absolute inset-0 opacity-[0.15] [background-image:linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_center,black,transparent_75%)]" />

              <div className="pointer-events-none absolute inset-x-0 top-0 bottom-[34%] grid place-items-center">
                <motion.div
                  className="w-[600px] max-w-none"
                  animate={{ scale: on ? 1 : 0.62, opacity: on ? 1 : 0.8, y: on ? 30 : -20, rotate: on ? 0 : -10 }}
                  transition={{ duration: 1, ease: EASE }}
                >
                  <LazyImage src={c.image} alt={`${c.title} laptop`} ratio="4 / 3" sizes="600px" className="w-full" imgClassName="drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)]" />
                </motion.div>
              </div>

              {/* accent light pooling at the base of each panel */}
              <motion.div
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-1/2"
                animate={{ opacity: on ? 0.35 : 1 }}
                transition={{ duration: 0.9 }}
                style={{ background: `linear-gradient(to top, ${c.accent}2e, transparent)` }}
              />

              {/* collapsed label */}
              <motion.div
                className="absolute inset-x-0 bottom-6 flex flex-col items-center gap-4"
                animate={{ opacity: on ? 0 : 1 }}
                transition={{ duration: 0.4 }}
              >
                <span className="font-mono text-[10px]" style={{ color: c.accent }}>
                  0{i + 1}
                </span>
                <span className="whitespace-nowrap text-xl font-medium [writing-mode:vertical-rl] rotate-180 transition-transform duration-500 group-hover:-translate-y-1">{c.title}</span>
                <span className="font-mono text-[10px] text-mist">{countFor(c.id)} models</span>
              </motion.div>

              {/* expanded content */}
              <AnimatePresence>
                {on && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0, transition: { delay: 0.3, duration: 0.7, ease: EASE } }}
                    exit={{ opacity: 0, transition: { duration: 0.2 } }}
                    className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-6 p-8"
                  >
                    <div className="max-w-[340px]">
                      <p className="font-mono text-[11px] uppercase tracking-[0.18em]" style={{ color: c.accent }}>
                        0{i + 1} · {c.kicker}
                      </p>
                      <h3 className="mt-3 text-[2.6rem] font-medium leading-none tracking-[-0.04em]">{c.title}</h3>
                      <p className="mt-3 text-sm leading-relaxed text-bone/60">{c.copy}</p>
                    </div>
                    <div className="flex shrink-0 flex-col items-end gap-3">
                      <p className="text-right font-mono text-xs text-mist">
                        {countFor(c.id)} models · from <span className="text-bone">${fromPrice(c.id).toLocaleString()}</span>
                      </p>
                      <span className="flex items-center gap-2 rounded-full bg-bone px-5 py-3 text-sm font-medium text-ink transition-colors group-hover:bg-white">
                        Shop {c.title} <ArrowUpRight className="h-4 w-4" />
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </Reveal>

      {/* Mobile / tablet: snap carousel */}
      <div className="no-scrollbar -mx-4 mt-10 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:-mx-[4vw] sm:px-[4vw] lg:hidden">
        {categories.map((c, i) => (
          <button
            key={c.id}
            onClick={() => shop(c.id)}
            className="relative flex h-[440px] w-[80vw] max-w-[380px] shrink-0 snap-center flex-col justify-end overflow-hidden rounded-[24px] border border-white/[0.07] p-6 text-left"
            style={{ background: `radial-gradient(90% 60% at 50% 35%, ${c.accent}30, transparent 70%), linear-gradient(180deg,#1a1828,#100f1b)` }}
          >
            <LazyImage
              src={c.image}
              alt={`${c.title} laptop`}
              ratio="4 / 3"
              sizes="90vw"
              className="absolute left-1/2 top-[38%] w-[120%] max-w-none -translate-x-1/2 -translate-y-1/2"
            />
            <p className="relative font-mono text-[10px] uppercase tracking-[0.18em]" style={{ color: c.accent }}>
              0{i + 1} · {c.kicker}
            </p>
            <h3 className="relative mt-2 text-3xl font-medium tracking-[-0.03em]">{c.title}</h3>
            <p className="relative mt-2 text-sm text-bone/60">{c.copy}</p>
            <span className="relative mt-4 inline-flex items-center gap-1.5 text-sm text-bone">
              Shop {countFor(c.id)} models <ArrowUpRight className="h-4 w-4" />
            </span>
          </button>
        ))}
      </div>
    </section>
  )
}
