import { AnimatePresence, motion } from 'motion/react'
import { BadgeCheck, ChevronLeft, ChevronRight, Quote } from 'lucide-react'
import { useEffect, useState } from 'react'
import { shortReviews, testimonials } from '../../data/catalog'
import { EASE, SectionIntro, Stars } from '../ui/primitives'

const DURATION = 7000

function ReviewColumn({ items, reverse = false }: { items: typeof shortReviews; reverse?: boolean }) {
  const list = [...items, ...items]
  return (
    <div className="h-full overflow-hidden [mask-image:linear-gradient(transparent,black_15%,black_85%,transparent)]">
      <div className={`flex flex-col gap-3 animate-[marquee-y_30s_linear_infinite] hover:[animation-play-state:paused] ${reverse ? '[animation-direction:reverse]' : ''}`}>
        {list.map((r, i) => (
          <div key={i} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-4">
            <Stars value={r.rating} size={11} />
            <p className="mt-2 text-sm leading-snug text-bone/85">“{r.text}”</p>
            <p className="mt-2 font-mono text-[10px] uppercase tracking-wider text-mist">{r.name}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export function Testimonials() {
  const [[index, dir], setIndex] = useState<[number, number]>([0, 1])
  const [paused, setPaused] = useState(false)
  const t = testimonials[index]

  const go = (d: number) => setIndex(([i]) => [(i + d + testimonials.length) % testimonials.length, d])

  useEffect(() => {
    if (paused) return
    const id = setTimeout(() => go(1), DURATION)
    return () => clearTimeout(id)
  }, [index, paused])

  return (
    <section id="reviews" className="relative mx-auto max-w-[1520px] scroll-mt-16 section-pad py-24 md:py-36">
      <SectionIntro
        eyebrow="07 — Reviews"
        title={[{ text: 'Loved by people' }, { text: 'who work at night.', className: 'font-serif italic font-normal text-bone/90' }]}
        aside={
          <span className="flex items-center gap-3">
            <span className="text-4xl font-medium tracking-tight text-bone">4.9</span>
            <span>
              <Stars value={5} />
              <span className="mt-1 block text-xs">38,200 verified reviews · Trustpilot & Google</span>
            </span>
          </span>
        }
      />

      <div className="mt-14 grid gap-4 lg:grid-cols-[1.6fr_1fr]">
        <div
          className="relative flex min-h-[460px] flex-col overflow-hidden rounded-[32px] border border-white/[0.07] bg-gradient-to-br from-graphite to-coal p-7 sm:p-10"
          onMouseEnter={() => setPaused(true)}
          onMouseLeave={() => setPaused(false)}
        >
          <Quote className="h-10 w-10 text-ember" strokeWidth={1.2} />
          <div className="relative mt-6 flex-1">
            <AnimatePresence mode="wait" custom={dir}>
              <motion.div
                key={index}
                custom={dir}
                initial={{ opacity: 0, x: dir * 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: dir * -40 }}
                transition={{ duration: 0.6, ease: EASE }}
              >
                <blockquote className="font-serif text-[clamp(1.5rem,2.8vw,2.5rem)] leading-[1.18] text-bone/95">“{t.quote}”</blockquote>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <span className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-ember to-volt text-sm font-semibold text-ink">
                    {t.name.split(' ').map((n) => n[0]).join('')}
                  </span>
                  <div>
                    <p className="flex items-center gap-1.5 font-medium">
                      {t.name} <BadgeCheck className="h-4 w-4 text-ice" aria-label="Verified buyer" />
                    </p>
                    <p className="text-sm text-mist">{t.role}</p>
                  </div>
                  <div className="ml-auto text-right max-sm:ml-0 max-sm:w-full max-sm:text-left">
                    <Stars value={t.rating} />
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-wider text-mist">Bought {t.product}</p>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          <div className="mt-10 flex items-center gap-4">
            <div className="flex flex-1 gap-1.5">
              {testimonials.map((_, i) => (
                <button key={i} onClick={() => setIndex([i, i > index ? 1 : -1])} className="h-6 flex-1" aria-label={`Show review ${i + 1}`}>
                  <span className="block h-[2px] overflow-hidden rounded-full bg-white/10">
                    {i === index && (
                      <motion.span
                        key={`${index}-${paused}`}
                        className="block h-full bg-ember"
                        initial={{ width: paused ? '100%' : '0%' }}
                        animate={{ width: '100%' }}
                        transition={{ duration: paused ? 0 : DURATION / 1000, ease: 'linear' }}
                      />
                    )}
                    {i < index && <span className="block h-full w-full bg-bone/40" />}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => go(-1)} aria-label="Previous review" className="grid h-11 w-11 place-items-center rounded-full border border-white/10 transition-colors hover:bg-white/10" data-cursor="hover">
                <ChevronLeft className="h-4 w-4" />
              </button>
              <button onClick={() => go(1)} aria-label="Next review" className="grid h-11 w-11 place-items-center rounded-full border border-white/10 transition-colors hover:bg-white/10" data-cursor="hover">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        <div className="grid h-[460px] grid-cols-2 gap-3 max-lg:h-[340px]">
          <ReviewColumn items={shortReviews.slice(0, 4)} />
          <ReviewColumn items={shortReviews.slice(4)} reverse />
        </div>
      </div>
    </section>
  )
}
