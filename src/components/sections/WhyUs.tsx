import { motion, useReducedMotion } from 'motion/react'
import { BadgeCheck, CreditCard, Headphones, Lock, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import type { ReactNode } from 'react'
import { EASE, SectionIntro } from '../ui/primitives'

/** One bento tile: its own tinted glass, gradient edge and a live illustration on top. */
function Tile({
  tint,
  icon: Icon,
  title,
  copy,
  className = '',
  delay = 0,
  children,
}: {
  tint: string
  icon: typeof Truck
  title: string
  copy: string
  className?: string
  delay?: number
  children: ReactNode
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-8% 0px' }}
      transition={{ duration: 0.8, delay, ease: EASE }}
      whileHover={{ y: -4 }}
      className={`group relative flex flex-col overflow-hidden rounded-[28px] border border-transparent p-6 ${className}`}
      style={{
        background: `radial-gradient(90% 70% at 100% 0%, ${tint}38, transparent 65%), linear-gradient(165deg, #10172d, #0a0e1c) padding-box, linear-gradient(150deg, ${tint}, rgba(255,255,255,0.05) 45%, ${tint}55) border-box`,
      }}
    >
      <span aria-hidden className="holo-edge" />
      <div className="relative min-h-[150px] flex-1">{children}</div>
      <div className="relative mt-5 flex items-start gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${tint}22`, color: tint }}>
          <Icon className="h-5 w-5" strokeWidth={1.7} />
        </span>
        <div>
          <p className="text-lg font-medium tracking-tight">{title}</p>
          <p className="mt-1 text-sm leading-relaxed text-mist">{copy}</p>
        </div>
      </div>
    </motion.div>
  )
}

/** Animated route: a parcel travels from the Noctis lab to the customer's door. */
function DeliveryMap({ reduce }: { reduce: boolean }) {
  const path = 'M30 120 C 120 20, 220 150, 310 70 S 470 40, 520 96'
  return (
    <div className="relative h-full min-h-[150px]">
      <svg viewBox="0 0 560 160" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <linearGradient id="route" x1="0" x2="1">
            <stop offset="0" stopColor="#5ce1ff" />
            <stop offset="1" stopColor="#a78bfa" />
          </linearGradient>
        </defs>
        {/* city grid dots */}
        {Array.from({ length: 70 }, (_, i) => (
          <circle key={i} cx={20 + (i % 14) * 40} cy={18 + Math.floor(i / 14) * 32} r="1.4" fill="rgba(255,255,255,0.12)" />
        ))}
        <path d={path} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" strokeLinecap="round" />
        <motion.path
          d={path}
          fill="none"
          stroke="url(#route)"
          strokeWidth="3"
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          whileInView={{ pathLength: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 2, ease: EASE }}
        />
        <circle cx="30" cy="120" r="7" fill="#5ce1ff" />
        <circle cx="520" cy="96" r="9" fill="none" stroke="#a78bfa" strokeWidth="2" />
        <circle cx="520" cy="96" r="4" fill="#a78bfa" />
        {!reduce && (
          <circle r="6" fill="#eef4ff">
            <animateMotion dur="4.5s" repeatCount="indefinite" path={path} />
          </circle>
        )}
      </svg>
      <div className="absolute left-0 top-0 flex flex-wrap gap-2 font-mono text-[10px] uppercase tracking-wider">
        <span className="rounded-full bg-ember/15 px-2.5 py-1 text-ember">Lab · dispatched 18:04</span>
        <span className="rounded-full bg-ice/15 px-2.5 py-1 text-ice">Your door · in 48h</span>
      </div>
    </div>
  )
}

/** Support chat that types itself out when scrolled into view. */
function Chat() {
  const msgs = [
    { me: true, text: 'Is the Blade 16 in stock in black?' },
    { me: false, text: 'Yes! 6 left — ships today, arrives Thursday ✦' },
    { me: true, text: 'Can you pre-install my apps?' },
    { me: false, text: 'Of course. Our lab sets it up free.' },
  ]
  return (
    <div className="flex h-full flex-col justify-end gap-2.5">
      <div className="mb-1 flex items-center gap-2">
        <span className="relative grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-ember to-ice text-xs font-semibold text-ink">
          SA
          <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-coal bg-emerald-400" />
        </span>
        <div>
          <p className="text-sm font-medium">Sara · Noctis tech</p>
          <p className="font-mono text-[10px] text-mist">replies in ~4 min</p>
        </div>
      </div>
      {msgs.map((m, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 12, scale: 0.96 }}
          whileInView={{ opacity: 1, y: 0, scale: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 + i * 0.55, duration: 0.5, ease: EASE }}
          className={`max-w-[85%] rounded-2xl px-3.5 py-2 text-sm ${
            m.me ? 'self-end rounded-br-md bg-ember text-ink' : 'self-start rounded-bl-md border border-white/10 bg-white/[0.06] text-bone'
          }`}
        >
          {m.text}
        </motion.div>
      ))}
      <div className="flex w-14 items-center justify-center gap-1 self-start rounded-2xl rounded-bl-md bg-white/[0.06] py-2.5" aria-hidden>
        {[0, 1, 2].map((d) => (
          <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-bone/60" style={{ animationDelay: `${d * 0.15}s` }} />
        ))}
      </div>
    </div>
  )
}

export function WhyUs() {
  const reduce = !!useReducedMotion()
  return (
    <section id="why" className="relative mx-auto max-w-[1520px] scroll-mt-16 section-pad py-24 md:py-36">
      <SectionIntro
        eyebrow="06 — Why Noctis"
        title={[{ text: 'Six promises,' }, { text: 'kept quietly.', className: 'font-serif italic font-normal text-bone/90' }]}
        aside="We are a boutique with warehouse prices. Here is what you get with every machine, whatever it costs."
      />

      {/* Bento: 4×2 on desktop — delivery (wide), live chat (tall), four single tiles */}
      <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-flow-dense lg:grid-cols-4 lg:grid-rows-[310px_310px]">
        <Tile tint="#5ce1ff" icon={Truck} title="48h express, insured" copy="Tracked and signature-on-delivery. Free on orders over $1,500." className="sm:col-span-2" delay={0}>
          <DeliveryMap reduce={reduce} />
        </Tile>

        <Tile tint="#a78bfa" icon={Headphones} title="Humans, 24/7" copy="Real technicians on chat and phone — not bots." className="sm:col-span-2 lg:col-span-1 lg:col-start-3 lg:row-span-2" delay={0.08}>
          <Chat />
        </Tile>

        <Tile tint="#f472b6" icon={BadgeCheck} title="Genuine, always" copy="Authorised stock only, serial-verified before it ships." delay={0.12}>
          <div className="relative grid h-full place-items-center">
            <div className="relative w-full max-w-[210px] overflow-hidden rounded-xl border border-white/10 bg-white/[0.04] px-3 py-3 font-mono text-[11px] text-bone/80">
              <p className="text-mist">SERIAL</p>
              <p className="tracking-widest">NX-7Q4-29KD-11</p>
              <p className="mt-2 flex items-center gap-1.5 text-emerald-400">
                <BadgeCheck className="h-3.5 w-3.5" /> Verified with maker
              </p>
              {!reduce && <span aria-hidden className="absolute inset-x-0 top-0 h-6 animate-[scan_2.6s_ease-in-out_infinite] bg-gradient-to-b from-plasma/40 to-transparent" />}
            </div>
          </div>
        </Tile>

        <Tile tint="#8b5cf6" icon={ShieldCheck} title="2-year warranty" copy="Stacks on the maker’s. Damage cover from $9/mo." delay={0.16}>
          <div className="grid h-full place-items-center">
            <div className="relative grid h-28 w-28 place-items-center">
              <svg viewBox="0 0 100 100" className={`absolute inset-0 h-full w-full ${reduce ? '' : 'animate-[spin-slow_18s_linear_infinite]'}`} aria-hidden>
                <defs>
                  <path id="seal-ring" d="M50,50 m-38,0 a38,38 0 1,1 76,0 a38,38 0 1,1 -76,0" />
                </defs>
                <text className="fill-bone/60 font-mono text-[7.5px] uppercase" letterSpacing="2.6">
                  <textPath href="#seal-ring">Noctis care · Noctis care · Noctis care ·</textPath>
                </text>
              </svg>
              <span className="grid h-16 w-16 place-items-center rounded-full bg-gradient-to-br from-volt to-ember text-ink">
                <span className="text-center font-semibold leading-none">
                  2<span className="block font-mono text-[9px] tracking-wider">YEARS</span>
                </span>
              </span>
            </div>
          </div>
        </Tile>

        <Tile tint="#22d3ee" icon={CreditCard} title="Secure payments" copy="PCI-DSS Level 1, 3-D Secure, pay-in-4 at 0% APR." delay={0.2}>
          <div className="relative grid h-full place-items-center">
            {['#5ce1ff', '#a78bfa', '#f472b6'].map((c, i) => (
              <motion.div
                key={c}
                initial={{ rotate: 0, x: 0 }}
                whileInView={{ rotate: (i - 1) * 9, x: (i - 1) * 26 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.9, ease: EASE }}
                className="absolute h-20 w-32 rounded-xl border border-white/15 p-2.5 shadow-xl"
                style={{ background: `linear-gradient(135deg, ${c}, ${c}55)`, zIndex: i }}
              >
                <span className="block h-3 w-5 rounded-sm bg-white/60" />
                <span className="mt-6 block font-mono text-[9px] tracking-widest text-ink/80">•••• 42{i}9</span>
              </motion.div>
            ))}
            <span className="absolute -bottom-1 right-2 z-10 grid h-9 w-9 place-items-center rounded-full bg-ink/80 text-emerald-400 ring-1 ring-white/10">
              <Lock className="h-4 w-4" />
            </span>
          </div>
        </Tile>

        <Tile tint="#f472b6" icon={RotateCcw} title="30-day returns" copy="We collect from your door. No restocking fee." className="lg:col-start-4" delay={0.24}>
          <div className="grid h-full place-items-center">
            <div className="relative grid h-24 w-24 place-items-center">
              <RotateCcw className={`h-20 w-20 text-plasma/80 ${reduce ? '' : 'animate-[spin-slow_9s_linear_infinite_reverse]'}`} strokeWidth={1} />
              <span className="absolute font-mono text-sm font-semibold">30d</span>
            </div>
          </div>
        </Tile>
      </div>
    </section>
  )
}
