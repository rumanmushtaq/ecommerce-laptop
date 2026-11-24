import { VelocityMarquee } from '../ui/motion'

const WORDS = ['Laptops', 'Desktops', 'Displays', 'Gear', 'Gaming rigs', 'Creator studios']

/** Two oversized text tapes crossing in an X; they run faster (and reverse) with scroll speed. */
export function KineticTapes() {
  return (
    <section aria-hidden className="relative -my-6 h-[230px] overflow-hidden md:h-[300px]">
      {/* Gradient tape */}
      <div className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 -rotate-[4deg] bg-[linear-gradient(90deg,#5ce1ff,#a78bfa_45%,#f472b6)] py-3 shadow-[0_20px_60px_-20px_rgba(139,92,246,0.8)] md:py-4">
        <VelocityMarquee baseSpeed={2.4}>
          <div className="flex items-center">
            {WORDS.map((w) => (
              <span key={w} className="flex items-center gap-8 pr-8 text-[clamp(2rem,5vw,4.2rem)] font-black uppercase leading-none tracking-[-0.03em] text-ink">
                {w}
                <span className="text-[0.55em]">✦</span>
              </span>
            ))}
          </div>
        </VelocityMarquee>
      </div>
      {/* Outline tape crossing the other way */}
      <div className="absolute inset-x-[-5%] top-1/2 -translate-y-1/2 rotate-[3deg] border-y border-white/10 bg-ink/85 py-3 md:py-4">
        <VelocityMarquee baseSpeed={-1.8}>
          <div className="flex items-center">
            {WORDS.map((w) => (
              <span
                key={w}
                className="flex items-center gap-8 pr-8 text-[clamp(2rem,5vw,4.2rem)] font-black uppercase leading-none tracking-[-0.03em] text-transparent [-webkit-text-stroke:1.5px_rgba(165,240,255,0.75)]"
              >
                {w}
                <span className="text-[0.55em] text-ember [-webkit-text-stroke:0]">✦</span>
              </span>
            ))}
          </div>
        </VelocityMarquee>
      </div>
    </section>
  )
}
