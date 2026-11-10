import { motion } from 'motion/react'
import { ArrowUp } from 'lucide-react'
import { categories } from '../../data/catalog'
import { scrollToId } from '../../lib/hooks'
import { smooth } from '../../lib/smoothScroll'
import { VelocitySkew } from '../ui/motion'
import { EmailForm } from '../sections/FinalCta'
import { Logo } from '../ui/primitives'
import { useShopCategory } from './Navbar'

// Simple monochrome marks; lucide no longer ships brand icons
const socials = [
  { label: 'Instagram', href: 'https://instagram.com', d: 'M7 2h10a5 5 0 0 1 5 5v10a5 5 0 0 1-5 5H7a5 5 0 0 1-5-5V7a5 5 0 0 1 5-5Zm5 5.5a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Zm5.25-1.75a1 1 0 1 0 0 2 1 1 0 0 0 0-2Z' },
  { label: 'X', href: 'https://x.com', d: 'M4 3h4.6l4 5.6L17.4 3H20l-6.2 7.2L21 21h-4.6l-4.4-6.1L6.6 21H4l6.8-7.8L4 3Z' },
  { label: 'YouTube', href: 'https://youtube.com', d: 'M22 8.2a3 3 0 0 0-2.1-2.1C18 5.6 12 5.6 12 5.6s-6 0-7.9.5A3 3 0 0 0 2 8.2 31 31 0 0 0 1.6 12 31 31 0 0 0 2 15.8a3 3 0 0 0 2.1 2.1c1.9.5 7.9.5 7.9.5s6 0 7.9-.5a3 3 0 0 0 2.1-2.1c.4-1.2.4-3.8.4-3.8s0-2.6-.4-3.8ZM10 15.2V8.8l5.2 3.2-5.2 3.2Z' },
  { label: 'TikTok', href: 'https://tiktok.com', d: 'M16.5 2c.3 2.4 1.7 4 4 4.2v3.3a7.6 7.6 0 0 1-4-1.2v6.6A6.1 6.1 0 1 1 10.4 9v3.4a2.8 2.8 0 1 0 2.8 2.8V2h3.3Z' },
]

const payments = ['VISA', 'Mastercard', 'AMEX', 'PayPal', 'Apple Pay', 'G Pay', 'Klarna']

export function Footer() {
  const shop = useShopCategory()
  const support: [string, string][] = [
    ['Contact us', 'mailto:support@noctis.example'],
    ['Call +1 (800) 555-0199', 'tel:+18005550199'],
    ['Warranty & repairs', '#why'],
    ['Returns', '#why'],
  ]
  const info: [string, string][] = [
    ['Shipping & delivery', '#why'],
    ['Payment options', '#why'],
    ['Trade-in programme', '#offers'],
    ['Customer reviews', '#reviews'],
  ]

  const col = (title: string, items: React.ReactNode) => (
    <div>
      <p className="eyebrow mb-5">{title}</p>
      <ul className="space-y-3 text-sm">{items}</ul>
    </div>
  )
  const link = 'text-bone/70 transition-colors hover:text-bone'

  return (
    <footer className="relative overflow-hidden border-t border-white/[0.07] bg-coal/70 pt-20">
      <div className="mx-auto max-w-[1520px] section-pad">
        <div className="grid gap-12 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Logo />
            <p className="mt-5 max-w-[340px] text-sm leading-relaxed text-mist">
              A boutique for exceptional laptops. Authorised partner of ten makers, with our own warranty, lab and humans on call around the clock.
            </p>
            <div className="mt-7">
              <p className="mb-3 text-sm">Private sale alerts</p>
              <EmailForm compact />
            </div>
            <div className="mt-7 flex gap-2">
              {socials.map((s) => (
                <motion.a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noreferrer"
                  aria-label={`Noctis on ${s.label}`}
                  whileHover={{ y: -3 }}
                  className="grid h-10 w-10 place-items-center rounded-full border border-white/10 text-bone/70 transition-colors hover:border-ember hover:text-ember"
                >
                  <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden>
                    <path d={s.d} />
                  </svg>
                </motion.a>
              ))}
            </div>
          </div>
          {col(
            'Shop',
            <>
              {categories.map((c) => (
                <li key={c.id}>
                  <button onClick={() => shop(c.id)} className={link}>
                    {c.title} laptops
                  </button>
                </li>
              ))}
              <li>
                <button onClick={() => scrollToId('offers')} className={link}>
                  The Night Sale
                </button>
              </li>
            </>,
          )}
          {col(
            'Support',
            support.map(([l, h]) => (
              <li key={l}>
                <a href={h} className={link}>
                  {l}
                </a>
              </li>
            )),
          )}
          {col(
            'Shopping',
            info.map(([l, h]) => (
              <li key={l}>
                <a href={h} className={link}>
                  {l}
                </a>
              </li>
            )),
          )}
        </div>

        <div className="mt-16 flex flex-col gap-6 border-t border-white/[0.07] py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2" aria-label="Accepted payment methods">
            {payments.map((p) => (
              <span key={p} className="rounded-md border border-white/10 bg-white/[0.03] px-2.5 py-1 font-mono text-[10px] tracking-wider text-bone/70">
                {p}
              </span>
            ))}
          </div>
          <div className="flex items-center justify-between gap-6 text-xs text-mist">
            <span>© 2026 Noctis Ltd. Prices in USD incl. taxes.</span>
            <button
              onClick={() => (smooth.lenis ? smooth.lenis.scrollTo(0, { duration: 1.8 }) : window.scrollTo({ top: 0, behavior: 'smooth' }))}
              className="group flex items-center gap-2 text-bone/80 hover:text-bone"
              data-cursor="hover"
            >
              Back to top
              <span className="grid h-9 w-9 place-items-center rounded-full border border-white/15 transition-transform group-hover:-translate-y-1">
                <ArrowUp className="h-4 w-4" />
              </span>
            </button>
          </div>
        </div>
      </div>
      <VelocitySkew max={6}>
        <p aria-hidden className="pointer-events-none -mb-[4.5vw] select-none bg-gradient-to-b from-ember/[0.16] to-transparent bg-clip-text text-center text-[23vw] font-semibold leading-none tracking-[-0.07em] text-transparent">
          NOCTIS
        </p>
      </VelocitySkew>
    </footer>
  )
}
