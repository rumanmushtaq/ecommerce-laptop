import { motion, useReducedMotion } from 'motion/react'
import { BadgeCheck, CreditCard, Headphones, RotateCcw, ShieldCheck, Truck } from 'lucide-react'
import { useState } from 'react'
import { EASE, SectionIntro } from '../ui/primitives'

const benefits = [
  { icon: BadgeCheck, title: 'Genuine, always', copy: 'Sourced only from makers and their authorised distributors. Serial-verified before it leaves us.' },
  { icon: ShieldCheck, title: '2-year warranty', copy: 'Our cover stacks on the manufacturer’s. Accidental damage plans from $9/mo.' },
  { icon: CreditCard, title: 'Secure payments', copy: 'PCI-DSS Level 1, 3-D Secure and pay-in-4 at 0% APR. We never store your card.' },
  { icon: Truck, title: '48h express', copy: 'Insured, tracked and signature-on-delivery. Free on orders over $1,500.' },
  { icon: Headphones, title: 'Humans, 24/7', copy: 'Real technicians on chat and phone — average first reply in under four minutes.' },
  { icon: RotateCcw, title: '30-day returns', copy: 'Changed your mind? We collect it from your door. No restocking fee.' },
]

function Emblem({ active }: { active: number | null }) {
  const reduce = useReducedMotion()
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[420px]">
      <div aria-hidden className="absolute inset-[18%] rounded-full bg-ember/20 blur-[70px]" />
      <svg viewBox="0 0 400 400" className="absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <path id="ring-text" d="M200,200 m-150,0 a150,150 0 1,1 300,0 a150,150 0 1,1 -300,0" />
          <linearGradient id="seal" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="#ffb4a2" />
            <stop offset="1" stopColor="#b9a6ff" />
          </linearGradient>
        </defs>
        <motion.g
          style={{ originX: '200px', originY: '200px' }}
          animate={reduce ? undefined : { rotate: 360 }}
          transition={{ duration: 40, repeat: Infinity, ease: 'linear' }}
        >
          <text className="fill-bone/50 font-mono text-[13px] uppercase" letterSpacing="6">
            <textPath href="#ring-text">Genuine · Warranted · Insured · Delivered · Supported · Returnable ·</textPath>
          </text>
        </motion.g>
        <motion.circle
          cx="200"
          cy="200"
          r="178"
          fill="none"
          stroke="rgba(255,255,255,0.12)"
          strokeDasharray="2 10"
          style={{ originX: '200px', originY: '200px' }}
          animate={reduce ? undefined : { rotate: -360 }}
          transition={{ duration: 90, repeat: Infinity, ease: 'linear' }}
        />
        <circle cx="200" cy="200" r="118" fill="none" stroke="rgba(255,255,255,0.08)" />
        {/* six nodes, one per promise */}
        {benefits.map((_, i) => {
          const a = (i / benefits.length) * Math.PI * 2 - Math.PI / 2
          const x = 200 + Math.cos(a) * 118
          const y = 200 + Math.sin(a) * 118
          const on = active === i
          return (
            <g key={i}>
              <motion.line x1="200" y1="200" x2={x} y2={y} stroke="#b9a6ff" animate={{ opacity: on ? 0.9 : 0, pathLength: on ? 1 : 0 }} transition={{ duration: 0.5 }} />
              <motion.circle cx={x} cy={y} animate={{ r: on ? 9 : 5, fill: on ? '#b9a6ff' : '#2a2b31' }} stroke="rgba(255,255,255,0.25)" transition={{ duration: 0.4 }} />
            </g>
          )
        })}
        <circle cx="200" cy="200" r="74" fill="#100f1b" stroke="url(#seal)" strokeWidth="1.5" />
        <path d="M178 226V174l44 52v-52" fill="none" stroke="url(#seal)" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  )
}

export function WhyUs() {
  const [active, setActive] = useState<number | null>(null)
  const left = benefits.slice(0, 3)
  const right = benefits.slice(3)

  const Item = ({ b, i }: { b: (typeof benefits)[number]; i: number }) => (
    <motion.li
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-10% 0px' }}
      transition={{ duration: 0.8, delay: (i % 3) * 0.08, ease: EASE }}
      onMouseEnter={() => setActive(i)}
      onMouseLeave={() => setActive(null)}
      className={`group relative border-t border-white/[0.07] py-6 transition-colors ${active === i ? 'border-ember/50' : ''}`}
    >
      <div className="flex items-start gap-4">
        <span className={`grid h-11 w-11 shrink-0 place-items-center rounded-full border transition-all duration-500 ${active === i ? 'border-ember bg-ember text-ink' : 'border-white/10 text-ember'}`}>
          <b.icon className="h-[18px] w-[18px]" strokeWidth={1.6} />
        </span>
        <div>
          <p className="flex items-baseline gap-3">
            <span className="font-mono text-[10px] text-mist">0{i + 1}</span>
            <span className="text-lg font-medium tracking-tight">{b.title}</span>
          </p>
          <p className="mt-1.5 text-sm leading-relaxed text-mist">{b.copy}</p>
        </div>
      </div>
    </motion.li>
  )

  return (
    <section id="why" className="relative mx-auto max-w-[1520px] scroll-mt-16 section-pad py-24 md:py-36">
      <SectionIntro
        eyebrow="06 — Why Noctis"
        title={[{ text: 'Six promises,' }, { text: 'kept quietly.', className: 'font-serif italic font-normal text-bone/90' }]}
        aside="We are a boutique with warehouse prices. Here is what you get with every machine, whatever it costs."
      />
      <div className="mt-14 grid items-center gap-10 lg:grid-cols-[1fr_minmax(320px,420px)_1fr] lg:gap-14">
        <ul className="order-2 lg:order-1">{left.map((b, i) => <Item key={b.title} b={b} i={i} />)}</ul>
        <div className="order-1 mx-auto w-[min(78vw,420px)] lg:order-2 lg:w-full">
          <Emblem active={active} />
        </div>
        <ul className="order-3">{right.map((b, i) => <Item key={b.title} b={b} i={i + 3} />)}</ul>
      </div>
    </section>
  )
}
