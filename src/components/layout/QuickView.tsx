import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from 'motion/react'
import { Clock, Hand, RotateCcw, ShieldCheck, Truck, X } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { configOptions, formatPrice, products, UPGRADE, unitPrice, type LineConfig } from '../../data/catalog'
import { useWebGL } from '../../lib/hooks'
import { useStore } from '../../lib/store'
import { AddButton } from '../sections/FeaturedProducts'
import { EASE, Stars } from '../ui/primitives'
import dynamic from 'next/dynamic'

const QuickViewScene = dynamic(() => import('../three/QuickViewScene'), { ssr: false })

function Segmented({ id, options, value, onChange, extra }: { id: string; options: string[]; value: number; onChange: (i: number) => void; extra: number }) {
  return (
    <div className="grid grid-cols-2 gap-1 rounded-2xl bg-white/[0.04] p-1">
      {options.map((o, i) => (
        <button key={o} onClick={() => onChange(i)} aria-pressed={i === value} className="relative rounded-xl px-3 py-2.5 text-left" data-cursor="hover">
          {i === value && <motion.span layoutId={id} className="absolute inset-0 rounded-xl bg-white/10 ring-1 ring-ember/50" transition={{ type: 'spring', stiffness: 420, damping: 34 }} />}
          <span className="relative block text-sm font-medium">{o}</span>
          <span className="relative block font-mono text-[10px] text-mist">{i === 0 ? 'Included' : `+ ${formatPrice(extra)}`}</span>
        </button>
      ))}
    </div>
  )
}

/** Delivery promise: order within the window before 6pm cut-off. */
function useDeliveryCountdown() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000)
    return () => clearInterval(id)
  }, [])
  const cutoff = new Date(now)
  cutoff.setHours(18, 0, 0, 0)
  if (now > cutoff) cutoff.setDate(cutoff.getDate() + 1)
  const mins = Math.floor((cutoff.getTime() - now.getTime()) / 60000)
  const arrive = new Date(cutoff)
  arrive.setDate(arrive.getDate() + 2)
  return { left: `${Math.floor(mins / 60)}h ${mins % 60}m`, day: arrive.toLocaleDateString('en-US', { weekday: 'long' }) }
}

export function QuickView() {
  const { panel, quickId, close, isWished, toggleWish } = useStore()
  const reduce = !!useReducedMotion()
  const product = products.find((p) => p.id === quickId)
  const visible = panel === 'quick' && !!product
  const [config, setConfig] = useState<LineConfig>({ finish: 0, memory: 0, storage: 0 })
  const [sceneReady, setSceneReady] = useState(false)
  const delivery = useDeliveryCountdown()
  const webgl = useWebGL()

  // `close` is recreated on every store update, so read it through a ref to keep these effects stable
  const closeRef = useRef(close)
  closeRef.current = close

  useEffect(() => {
    if (!visible) return
    setConfig({ finish: 0, memory: 0, storage: 0 })
    setSceneReady(false)
  }, [visible, quickId])

  useEffect(() => {
    if (!visible) return
    const on = (e: KeyboardEvent) => e.key === 'Escape' && closeRef.current()
    window.addEventListener('keydown', on)
    return () => window.removeEventListener('keydown', on)
  }, [visible])

  const opts = product ? configOptions(product) : null
  const price = product ? unitPrice(product, config) : 0
  const wished = product ? isWished(product.id) : false

  return (
    <AnimatePresence>
      {visible && product && (
        <motion.div
          key="qv"
          className="fixed inset-0 z-[80] flex items-end justify-center bg-black/70 backdrop-blur-md sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          onClick={close}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={`${product.brand} ${product.name} quick view`}
            onClick={(e) => e.stopPropagation()}
            initial={{ y: 60, opacity: 0, scale: 0.97 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: 40, opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.7, ease: EASE }}
            className="relative grid max-h-[94svh] w-full max-w-[1240px] overflow-hidden rounded-t-[28px] border border-white/10 bg-coal/95 shadow-[0_80px_200px_-40px_rgba(0,0,0,1)] sm:rounded-[32px] lg:grid-cols-[1.25fr_1fr]"
          >
            {/* Viewer */}
            <div
              className="relative h-[42svh] min-h-[280px] cursor-grab active:cursor-grabbing lg:h-[640px]"
              style={{ background: `radial-gradient(70% 60% at 50% 55%, ${product.glow}33, transparent 70%)` }}
            >
              {webgl ? (
                <>
                  <motion.img
                    layoutId={`shot-${product.id}`}
                    src={product.image}
                    alt=""
                    className="pointer-events-none absolute inset-0 m-auto h-[80%] w-[80%] object-contain"
                    animate={{ opacity: sceneReady ? 0 : 1 }}
                    transition={{ duration: 0.6, delay: sceneReady ? 0.4 : 0 }}
                  />
                  <>
                    <motion.div className="absolute inset-0" initial={{ opacity: 0 }} animate={{ opacity: sceneReady ? 1 : 0 }} transition={{ duration: 0.8 }}>
                      <QuickViewScene
                        key={product.id}
                        model={product.model ?? 'laptop'}
                        variant={product.variant}
                        body={product.finishes[config.finish].color}
                        reduced={reduce}
                        onReady={() => setSceneReady(true)}
                      />
                    </motion.div>
                  </>
                  <p className="pointer-events-none absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded-full bg-black/40 px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider text-bone/70 backdrop-blur">
                    <Hand className="h-3.5 w-3.5" /> Drag to rotate · scroll to zoom
                  </p>
                </>
              ) : (
                <motion.img layoutId={`shot-${product.id}`} src={product.image} alt={`${product.brand} ${product.name}`} className="absolute inset-0 m-auto h-[85%] w-[85%] object-contain" />
              )}
            </div>

            {/* Details */}
            <div className="flex max-h-[52svh] flex-col overflow-y-auto border-white/[0.07] p-6 pb-0 sm:p-8 sm:pb-0 lg:max-h-[640px] lg:border-l" data-lenis-prevent>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-mist">{product.brand}</p>
                  <h2 className="mt-1 text-[1.9rem] font-medium leading-tight tracking-[-0.03em]">{product.name}</h2>
                  <p className="mt-2 flex items-center gap-2 text-xs text-mist">
                    <Stars value={product.rating} size={12} /> {product.rating} · {product.reviews.toLocaleString()} reviews
                  </p>
                </div>
                <button onClick={close} aria-label="Close quick view" className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 hover:bg-white/10" data-cursor="hover">
                  <X className="h-5 w-5" />
                </button>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-bone/65">{product.blurb}</p>

              <LayoutGroup id="qv">
                <p className="mt-6 text-xs text-mist">
                  Finish · <span className="text-bone">{product.finishes[config.finish].name}</span>
                </p>
                <div className="mt-2 flex gap-3">
                  {product.finishes.map((f, i) => (
                    <button
                      key={f.name}
                      onClick={() => setConfig((c) => ({ ...c, finish: i }))}
                      aria-label={f.name}
                      aria-pressed={config.finish === i}
                      className="relative grid h-11 w-11 place-items-center"
                      data-cursor="hover"
                    >
                      {config.finish === i && <motion.span layoutId="finish-ring" className="absolute inset-0 rounded-full border-2 border-ember" transition={{ type: 'spring', stiffness: 420, damping: 30 }} />}
                      <span className="h-8 w-8 rounded-full border border-white/20 shadow-inner" style={{ background: `linear-gradient(135deg, ${f.color}, ${f.color}aa)` }} />
                    </button>
                  ))}
                </div>

                {opts && (
                  <>
                  <p className="mt-6 mb-2 text-xs text-mist">Memory</p>
                  <Segmented id="mem-pill" options={opts.memory} value={config.memory} extra={UPGRADE.memory} onChange={(i) => setConfig((c) => ({ ...c, memory: i }))} />
                  <p className="mt-4 mb-2 text-xs text-mist">Storage</p>
                  <Segmented id="sto-pill" options={opts.storage} value={config.storage} extra={UPGRADE.storage} onChange={(i) => setConfig((c) => ({ ...c, storage: i }))} />
                  </>
                )}
              </LayoutGroup>

              <dl className="mt-6 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-white/[0.06] bg-white/[0.06] text-[12px]">
                {product.specs.map((s) => (
                  <div key={s.label} className="bg-coal px-3 py-2.5">
                    <dt className="font-mono text-[9px] uppercase tracking-[0.16em] text-mist">{s.label}</dt>
                    <dd className="mt-0.5 truncate text-bone/90">{s.label === 'Memory' && opts ? `${opts.memory[config.memory]} · ${opts.storage[config.storage]}` : s.value}</dd>
                  </div>
                ))}
              </dl>

              <div className="mt-6 mb-6 space-y-2 text-xs text-mist">
                <p className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-ice" /> Order within <span className="text-bone">{delivery.left}</span> — arrives {delivery.day}
                </p>
                <p className="flex items-center gap-2">
                  <ShieldCheck className="h-3.5 w-3.5 text-ice" /> 2-year Noctis warranty included
                </p>
                <p className="flex items-center gap-2">
                  <RotateCcw className="h-3.5 w-3.5 text-ice" /> 30-day free returns · <Truck className="h-3.5 w-3.5 text-ice" /> insured delivery
                </p>
              </div>

              <div className="sticky bottom-0 -mx-6 mt-auto flex items-end justify-between gap-4 border-t border-white/[0.07] bg-coal/95 px-6 pb-1 pt-5 backdrop-blur-xl sm:-mx-8 sm:px-8">
                <div>
                  {product.compareAt && <p className="text-sm text-mist line-through">{formatPrice(product.compareAt + (price - product.price))}</p>}
                  <div className="relative h-9 overflow-hidden text-3xl font-medium tracking-tight">
                    <AnimatePresence mode="popLayout" initial={false}>
                      <motion.span key={price} className="block" initial={{ y: 30, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: -30, opacity: 0 }} transition={{ duration: 0.4, ease: EASE }}>
                        {formatPrice(price)}
                      </motion.span>
                    </AnimatePresence>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleWish(product)}
                    aria-pressed={wished}
                    aria-label={wished ? 'Remove from wishlist' : 'Save to wishlist'}
                    className={`h-11 rounded-full border px-4 text-sm transition-colors ${wished ? 'border-plasma text-plasma' : 'border-white/15 text-bone/80 hover:border-white/30'}`}
                  >
                    {wished ? 'Saved' : 'Save'}
                  </button>
                  <AddButton product={product} config={config} />
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
