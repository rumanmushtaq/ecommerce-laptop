import { createContext, useCallback, useContext, useEffect, useMemo, useReducer, useRef, type ReactNode } from 'react'
import { configOptions, products, unitPrice, type Category, type LineConfig, type Product } from '../data/catalog'

type Panel = 'cart' | 'wishlist' | 'search' | 'menu' | 'quick' | null
export type Filter = Category | 'all'

interface Toast {
  id: number
  title: string
  body: string
  image?: string
}

interface State {
  cart: Record<string, number>
  wishlist: string[]
  panel: Panel
  filter: Filter
  toasts: Toast[]
  /** Product shown in the 3D Quick View */
  quickId: string | null
  /** Increments on every add so the cart icon can replay its bump animation */
  cartPulse: number
}

type Action =
  | { type: 'add'; id: string }
  | { type: 'setQty'; id: string; qty: number }
  | { type: 'remove'; id: string }
  | { type: 'toggleWish'; id: string }
  | { type: 'panel'; panel: Panel }
  | { type: 'quick'; id: string }
  | { type: 'filter'; filter: Filter }
  | { type: 'toast'; toast: Toast }
  | { type: 'dismiss'; id: number }
  | { type: 'hydrate'; saved: Pick<State, 'cart' | 'wishlist'> }

const STORAGE_KEY = 'noctis-bag-v1'

function load(): Pick<State, 'cart' | 'wishlist'> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) return JSON.parse(raw)
  } catch {
    /* storage unavailable: start empty */
  }
  return { cart: {}, wishlist: [] }
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'add':
      return {
        ...state,
        cart: { ...state.cart, [action.id]: (state.cart[action.id] ?? 0) + 1 },
        cartPulse: state.cartPulse + 1,
      }
    case 'setQty': {
      const cart = { ...state.cart }
      if (action.qty <= 0) delete cart[action.id]
      else cart[action.id] = Math.min(action.qty, 9)
      return { ...state, cart }
    }
    case 'remove': {
      const cart = { ...state.cart }
      delete cart[action.id]
      return { ...state, cart }
    }
    case 'toggleWish':
      return {
        ...state,
        wishlist: state.wishlist.includes(action.id)
          ? state.wishlist.filter((x) => x !== action.id)
          : [...state.wishlist, action.id],
      }
    case 'panel':
      return { ...state, panel: action.panel }
    case 'quick':
      return { ...state, panel: 'quick', quickId: action.id }
    case 'filter':
      return { ...state, filter: action.filter }
    case 'toast':
      return { ...state, toasts: [...state.toasts.slice(-2), action.toast] }
    case 'hydrate':
      return { ...state, ...action.saved }
    case 'dismiss':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) }
  }
}

function useStoreValue() {
  const [state, dispatch] = useReducer(reducer, undefined, () => ({
    cart: {},
    wishlist: [] as string[],
    panel: null,
    quickId: null,
    filter: 'all' as Filter,
    toasts: [],
    cartPulse: 0,
  }))
  const toastId = useRef(0)

  const hydrated = useRef(false)
  useEffect(() => {
    dispatch({ type: 'hydrate', saved: load() })
    hydrated.current = true
  }, [])

  useEffect(() => {
    if (!hydrated.current) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ cart: state.cart, wishlist: state.wishlist }))
    } catch {
      /* ignore */
    }
  }, [state.cart, state.wishlist])

  // Lock page scroll while an overlay panel is open
  useEffect(() => {
    document.documentElement.style.overflow = state.panel ? 'hidden' : ''
  }, [state.panel])

  const toast = useCallback((t: Omit<Toast, 'id'>) => {
    const id = ++toastId.current
    dispatch({ type: 'toast', toast: { ...t, id } })
    setTimeout(() => dispatch({ type: 'dismiss', id }), 3800)
  }, [])

  /** Cart keys are `id` for the stock spec, or `id|finish|memory|storage` for a configured machine. */
  const addToCart = useCallback(
    (p: Product, config?: LineConfig) => {
      const custom = config && (config.finish || config.memory || config.storage)
      dispatch({ type: 'add', id: custom ? `${p.id}|${config.finish}|${config.memory}|${config.storage}` : p.id })
      toast({ title: 'Added to bag', body: `${p.brand} ${p.name}`, image: p.image })
    },
    [toast],
  )

  const toggleWish = useCallback(
    (p: Product) => {
      const had = state.wishlist.includes(p.id)
      dispatch({ type: 'toggleWish', id: p.id })
      toast({ title: had ? 'Removed from wishlist' : 'Saved to wishlist', body: `${p.brand} ${p.name}`, image: p.image })
    },
    [state.wishlist, toast],
  )

  const lines = useMemo(
    () =>
      Object.entries(state.cart)
        .map(([key, qty]) => {
          const [id, f = '0', m = '0', st = '0'] = key.split('|')
          const product = products.find((p) => p.id === id)
          if (!product) return null
          const config: LineConfig = { finish: +f, memory: +m, storage: +st }
          const opts = configOptions(product)
          const label =
            key.includes('|')
              ? [product.finishes[config.finish]?.name, opts?.memory[config.memory], opts?.storage[config.storage]].filter(Boolean).join(' · ')
              : null
          return { key, product, qty, config, label, unit: unitPrice(product, config) }
        })
        .filter((l) => l !== null),
    [state.cart],
  )
  const count = lines.reduce((n, l) => n + l.qty, 0)
  const subtotal = lines.reduce((n, l) => n + l.qty * l.unit, 0)

  return {
    ...state,
    lines,
    count,
    subtotal,
    addToCart,
    toggleWish,
    toast,
    isWished: (id: string) => state.wishlist.includes(id),
    setQty: (id: string, qty: number) => dispatch({ type: 'setQty', id, qty }),
    remove: (id: string) => dispatch({ type: 'remove', id }),
    open: (panel: Panel) => dispatch({ type: 'panel', panel }),
    openQuick: (id: string) => dispatch({ type: 'quick', id }),
    close: () => dispatch({ type: 'panel', panel: null }),
    setFilter: (filter: Filter) => dispatch({ type: 'filter', filter }),
    dismiss: (id: number) => dispatch({ type: 'dismiss', id }),
  }
}

const StoreContext = createContext<ReturnType<typeof useStoreValue> | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const value = useStoreValue()
  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export function useStore() {
  const ctx = useContext(StoreContext)
  if (!ctx) throw new Error('useStore must be used inside <StoreProvider>')
  return ctx
}
