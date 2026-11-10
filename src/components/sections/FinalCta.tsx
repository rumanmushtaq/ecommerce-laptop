import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'motion/react'
import { ArrowRight, Check, Copy, Loader2 } from 'lucide-react'
import { useRef, useState } from 'react'
import { scrollToId } from '../../lib/hooks'
import { useStore } from '../../lib/store'
import { EASE, MagneticButton, SplitHeading } from '../ui/primitives'
import { MaskReveal, Scramble } from '../ui/motion'
import { LazyImage } from '../ui/LazyImage'

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/

/** Shared email capture used by the final CTA and the footer. */
export function EmailForm({ compact = false }: { compact?: boolean }) {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'error' | 'loading' | 'done'>('idle')
  const { toast } = useStore()

  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!EMAIL.test(email.trim())) {
      setState('error')
      return
    }
    setState('loading')
    setTimeout(() => setState('done'), 900)
  }

  if (state === 'done')
    return (
      <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }} transition={{ ease: EASE }} className="flex flex-wrap items-center gap-3" role="status">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-emerald-400 text-ink">
          <Check className="h-5 w-5" />
        </span>
        <span className="text-sm">
          You’re on the list. Your code:
          <button
            onClick={() => {
              navigator.clipboard?.writeText('NIGHT10').catch(() => undefined)
              toast({ title: 'Code copied', body: 'NIGHT10 — 10% off your first machine' })
            }}
            className="ml-2 inline-flex items-center gap-1.5 rounded-md border border-dashed border-ember/60 px-2 py-0.5 font-mono text-ember hover:bg-ember/10"
          >
            NIGHT10 <Copy className="h-3 w-3" />
          </button>
        </span>
      </motion.div>
    )

  return (
    <form onSubmit={submit} noValidate className="w-full">
      <div
        className={`flex items-center gap-2 rounded-full border bg-white/[0.04] p-1.5 pl-5 transition-colors focus-within:border-ember/60 ${
          state === 'error' ? 'border-plasma' : 'border-white/10'
        } ${compact ? 'max-w-[380px]' : 'max-w-[520px]'}`}
      >
        <label htmlFor={compact ? 'email-footer' : 'email-cta'} className="sr-only">
          Email address
        </label>
        <input
          id={compact ? 'email-footer' : 'email-cta'}
          type="email"
          value={email}
          onChange={(e) => {
            setEmail(e.target.value)
            if (state === 'error') setState('idle')
          }}
          placeholder="you@studio.com"
          autoComplete="email"
          aria-invalid={state === 'error'}
          className={`min-w-0 flex-1 bg-transparent outline-none placeholder:text-mist/60 ${compact ? 'text-sm' : 'text-base'}`}
        />
        <button
          type="submit"
          disabled={state === 'loading'}
          className={`flex shrink-0 items-center gap-2 rounded-full bg-ember font-medium text-ink transition-colors hover:bg-ember-soft ${compact ? 'h-9 px-4 text-xs' : 'h-12 px-6 text-sm'}`}
          data-cursor="hover"
        >
          {state === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : compact ? 'Join' : <>Get 10% off <ArrowRight className="h-4 w-4" /></>}
        </button>
      </div>
      <AnimatePresence>
        {state === 'error' && (
          <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mt-2 pl-5 text-xs text-plasma" role="alert">
            Please enter a valid email address.
          </motion.p>
        )}
      </AnimatePresence>
    </form>
  )
}

export function FinalCta() {
  const ref = useRef<HTMLElement>(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] })
  const y = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [120, -120])
  const rotate = useTransform(scrollYProgress, [0, 1], reduce ? [0, 0] : [-8, 6])

  return (
    <section id="newsletter" ref={ref} className="relative overflow-hidden py-24 md:py-36">
      <div aria-hidden className="absolute inset-0 bg-[radial-gradient(55%_60%_at_75%_50%,rgba(185,166,255,0.22),transparent_70%)]" />
      <div className="relative mx-auto grid max-w-[1520px] items-center gap-10 section-pad lg:grid-cols-[1.1fr_1fr]">
        <div>
          <p className="eyebrow mb-6 flex items-center gap-3">
            <span className="h-px w-8 bg-ember" />
            <Scramble text="08 — The Night List" />
          </p>
          <SplitHeading
            className="text-[clamp(2.6rem,6.4vw,6rem)] font-medium leading-[0.95] tracking-[-0.05em]"
            segments={[{ text: 'Your next machine', br: true }, { text: 'is already' }, { text: 'waiting.', className: 'font-serif italic font-normal text-ember' }]}
          />
          <p className="mt-6 max-w-[460px] leading-relaxed text-bone/60">
            Join 210,000 people who get first access to drops, private sale prices and our monthly buying guide. One email a fortnight. Unsubscribe in a click.
          </p>
          <div className="mt-8">
            <EmailForm />
          </div>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <MagneticButton variant="light" onClick={() => scrollToId('products')}>
              Shop all laptops <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </MagneticButton>
            <MagneticButton variant="ghost" onClick={() => scrollToId('offers')}>
              See this week’s deals
            </MagneticButton>
          </div>
        </div>
        <motion.div style={{ y, rotate }} className="relative">
          <div aria-hidden className="absolute inset-[20%] rounded-full bg-ember/30 blur-[90px]" />
          <MaskReveal>
            <LazyImage src="/renders/noctis.webp" alt="Noctis Studio 16 Graphite Edition" ratio="4 / 3" sizes="(min-width: 1024px) 45vw, 92vw" className="w-full" imgClassName="scale-110" />
          </MaskReveal>
        </motion.div>
      </div>
    </section>
  )
}
