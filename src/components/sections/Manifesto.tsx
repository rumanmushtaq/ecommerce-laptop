import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from 'motion/react'
import { useRef } from 'react'

// *Starred* phrases are lit in orange serif; every other word just brightens as you read
const TEXT =
  'We don’t sell laptops. We hand over *machines* — unboxed, *tuned,* burned in for twenty-four hours and signed off by a human. So the first time you lift the lid, it feels like it was *made for you alone.*'

const words = (() => {
  const out: { w: string; accent: boolean }[] = []
  let accent = false
  for (const raw of TEXT.split(' ')) {
    const opens = raw.startsWith('*')
    const closes = raw.endsWith('*') || raw.endsWith('*.') || raw.endsWith('*,')
    if (opens) accent = true
    out.push({ w: raw.replace(/\*/g, ''), accent })
    if (closes) accent = false
  }
  return out
})()

function Word({ w, accent, i, n, progress }: { w: string; accent: boolean; i: number; n: number; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, [i / n, (i + 1.5) / n], [0.14, 1])
  return (
    <motion.span
      style={{ opacity }}
      className={accent ? 'font-serif font-normal italic tracking-[-0.01em] text-ember' : ''}
    >
      {w}{' '}
    </motion.span>
  )
}

/** Brand statement read word by word: each word lights up as it scrolls through the reading line. */
export function Manifesto() {
  const ref = useRef<HTMLDivElement>(null)
  const reduce = !!useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.85', 'end 0.55'] })
  return (
    <section id="manifesto" className="relative overflow-hidden py-28 md:py-44" aria-label="The Noctis way">
      <div aria-hidden className="absolute -left-[20%] top-1/2 h-[70%] w-[70%] -translate-y-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,122,26,0.10),transparent)]" />
      <div className="relative mx-auto grid max-w-[1520px] gap-10 section-pad lg:grid-cols-[240px_1fr] lg:gap-16">
        <div className="flex flex-col gap-4 lg:pt-4">
          <p className="eyebrow">00 — The Noctis way</p>
          <span className="h-px w-16 bg-gradient-to-r from-ember to-transparent" />
          <p className="hidden font-mono text-[11px] leading-relaxed text-mist/80 lg:block">
            Lab · Rotterdam
            <br />
            Est. 2014
            <br />
            120,418 machines handed over
          </p>
        </div>
        <div ref={ref}>
          <p className="text-[clamp(1.85rem,4.3vw,4.4rem)] font-medium leading-[1.08] tracking-[-0.035em] text-bone">
            {reduce
              ? words.map((x, i) => (
                  <span key={i} className={x.accent ? 'font-serif font-normal italic text-ember' : ''}>
                    {x.w}{' '}
                  </span>
                ))
              : words.map((x, i) => <Word key={i} {...x} i={i} n={words.length} progress={scrollYProgress} />)}
          </p>
          <div className="mt-12 flex items-center gap-5">
            <span className="grid h-12 w-12 place-items-center rounded-full border border-white/10 bg-gradient-to-br from-graphite to-ink font-serif text-xl italic text-ember">
              N
            </span>
            <div>
              <p className="font-serif text-2xl italic text-bone/90">Lena Hartmann</p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">Founder &amp; head of the lab</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
