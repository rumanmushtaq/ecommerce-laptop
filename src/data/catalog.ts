import type { ModelKind } from '../components/three/ProductModel'

export type Category = 'gaming' | 'business' | 'creative' | 'everyday' | 'ultrabook' | 'desktop' | 'monitor' | 'accessory'

export interface Spec {
  label: string
  value: string
}

export interface Product {
  id: string
  brand: string
  name: string
  category: Category
  blurb: string
  price: number
  compareAt?: number
  rating: number
  reviews: number
  badge?: string
  image: string
  /** Glow colour behind the product shot */
  glow: string
  specs: Spec[]
  /** Units left when stock is low (shows urgency on the card) */
  stock?: number
  /** 3D model kind (defaults to laptop) and its preset, used by the Quick View */
  model?: ModelKind
  variant: string
  /** Chassis finishes offered in the Quick View; the first is the shot's colour */
  finishes: { name: string; color: string }[]
}

/** Upgrade tiers offered on every machine (Quick View configurator). */
export const UPGRADE = { memory: 400, storage: 300 }

/** Memory/storage choices derived from the base spec, e.g. "32GB · 2TB". */
export function configOptions(p: Product) {
  // Only computers with a memory/storage spec are configurable (not monitors or accessories)
  const spec = p.specs.find((s) => s.label === 'Memory')?.value
  if (!spec) return null
  const [mem, sto] = spec.split(' · ')
  const double = (v: string) => {
    const n = parseInt(v)
    if (v.endsWith('GB') && n * 2 >= 1024) return `${(n * 2) / 1024}TB`
    return `${n * 2}${v.replace(/\d+/, '')}`
  }
  return { memory: [mem, double(mem)], storage: [sto, double(sto)] }
}

export interface LineConfig {
  finish: number
  memory: number
  storage: number
}
export const unitPrice = (p: Product, c: LineConfig) => p.price + c.memory * UPGRADE.memory + c.storage * UPGRADE.storage

const r = (name: string) => `/renders/${name}.webp`

export const products: Product[] = [
  {
    id: 'noctis-studio-16',
    stock: 7,
    brand: 'Noctis',
    name: 'Studio 16 — Graphite Edition',
    category: 'creative',
    blurb: 'Our house-tuned flagship. Calibrated OLED, copper-cut chassis, silent under load.',
    price: 2899,
    compareAt: 3199,
    rating: 4.9,
    reviews: 1284,
    badge: 'Exclusive',
    image: r('noctis'),
    glow: '#b9a6ff',
    variant: 'noctis',
    finishes: [{ name: 'Graphite', color: '#1f1d2b' }, { name: 'Lunar', color: '#c9c6d6' }, { name: 'Dusk Violet', color: '#3a3060' }],
    specs: [
      { label: 'CPU', value: 'Core Ultra 9 285H' },
      { label: 'GPU', value: 'RTX 5070 Ti' },
      { label: 'Display', value: '16″ 3.2K OLED 120Hz' },
      { label: 'Memory', value: '32GB · 2TB' },
    ],
  },
  {
    id: 'macbook-pro-16',
    brand: 'Apple',
    name: 'MacBook Pro 16″ M4 Max',
    category: 'creative',
    blurb: 'Studio-grade performance with up to 24 hours of battery on a Liquid Retina XDR.',
    price: 3299,
    compareAt: 3499,
    rating: 4.9,
    reviews: 2184,
    badge: 'Bestseller',
    image: r('silver'),
    glow: '#b48cff',
    variant: 'silver',
    finishes: [{ name: 'Silver', color: '#c8cad0' }, { name: 'Space Black', color: '#2a2a2e' }],
    specs: [
      { label: 'Chip', value: 'M4 Max 16-core' },
      { label: 'GPU', value: '40-core GPU' },
      { label: 'Display', value: '16.2″ XDR 120Hz' },
      { label: 'Memory', value: '48GB · 1TB' },
    ],
  },
  {
    id: 'rog-zephyrus-g16',
    brand: 'ASUS ROG',
    name: 'Zephyrus G16',
    category: 'gaming',
    blurb: 'A 1.85 kg aluminium gaming machine with a dot-matrix lid and a 240Hz OLED.',
    price: 2199,
    compareAt: 2499,
    rating: 4.8,
    reviews: 962,
    image: r('eclipse'),
    glow: '#9d7bff',
    variant: 'eclipse',
    finishes: [{ name: 'Eclipse Gray', color: '#2d2f36' }, { name: 'Platinum White', color: '#d6d6da' }],
    specs: [
      { label: 'CPU', value: 'Ryzen AI 9 HX 370' },
      { label: 'GPU', value: 'RTX 5080 16GB' },
      { label: 'Display', value: '16″ 2.5K OLED 240Hz' },
      { label: 'Memory', value: '32GB · 2TB' },
    ],
  },
  {
    id: 'thinkpad-x1-carbon',
    brand: 'Lenovo',
    name: 'ThinkPad X1 Carbon Gen 13',
    category: 'business',
    blurb: 'Carbon-fibre weave, 986 g, and the keyboard every executive still swears by.',
    price: 1899,
    compareAt: 2149,
    rating: 4.7,
    reviews: 741,
    image: r('carbon'),
    glow: '#ff8fa3',
    variant: 'carbon',
    finishes: [{ name: 'Deep Black', color: '#141416' }, { name: 'Carbon Weave', color: '#26262b' }],
    specs: [
      { label: 'CPU', value: 'Core Ultra 7 268V' },
      { label: 'Security', value: 'vPro · IR + FPR' },
      { label: 'Display', value: '14″ 2.8K OLED' },
      { label: 'Memory', value: '32GB · 1TB' },
    ],
  },
  {
    id: 'razer-blade-16',
    stock: 6,
    brand: 'Razer',
    name: 'Blade 16',
    category: 'gaming',
    blurb: 'CNC-milled unibody, per-key RGB and a dual-mode mini-LED at 15.9 mm thin.',
    price: 2999,
    rating: 4.8,
    reviews: 588,
    badge: 'New',
    image: r('stealth'),
    glow: '#9ee6cf',
    variant: 'stealth',
    finishes: [{ name: 'Black', color: '#0c0d0e' }, { name: 'Mercury', color: '#b8bbc2' }],
    specs: [
      { label: 'CPU', value: 'Ryzen AI 9 HX 370' },
      { label: 'GPU', value: 'RTX 5090 24GB' },
      { label: 'Display', value: '16″ QHD+ OLED 240Hz' },
      { label: 'Memory', value: '32GB · 2TB' },
    ],
  },
  {
    id: 'xps-14',
    brand: 'Dell',
    name: 'XPS 14',
    category: 'ultrabook',
    blurb: 'Edge-to-edge keyboard, invisible haptic trackpad and a glass-smooth graphite shell.',
    price: 1699,
    compareAt: 1899,
    rating: 4.6,
    reviews: 1103,
    image: r('graphite'),
    glow: '#8fb8ff',
    variant: 'graphite',
    finishes: [{ name: 'Graphite', color: '#3a3c42' }, { name: 'Platinum', color: '#c4c6cc' }],
    specs: [
      { label: 'CPU', value: 'Core Ultra 7 255H' },
      { label: 'GPU', value: 'RTX 4050 6GB' },
      { label: 'Display', value: '14.5″ 3.2K OLED' },
      { label: 'Memory', value: '32GB · 1TB' },
    ],
  },
  {
    id: 'spectre-x360-14',
    brand: 'HP',
    name: 'Spectre x360 14',
    category: 'business',
    blurb: 'Gem-cut convertible with copper accents, pen included, 2.8K OLED that folds flat.',
    price: 1549,
    compareAt: 1749,
    rating: 4.6,
    reviews: 473,
    image: r('copper'),
    glow: '#f2b8a0',
    variant: 'copper',
    finishes: [{ name: 'Nightfall Black', color: '#1b1c22' }, { name: 'Slate Blue', color: '#3b4a63' }],
    specs: [
      { label: 'CPU', value: 'Core Ultra 7 155H' },
      { label: 'Form', value: '360° convertible' },
      { label: 'Display', value: '14″ 2.8K OLED touch' },
      { label: 'Memory', value: '16GB · 1TB' },
    ],
  },
  {
    id: 'surface-laptop-7',
    brand: 'Microsoft',
    name: 'Surface Laptop 7',
    category: 'everyday',
    blurb: 'Copilot+ PC with all-day battery, a PixelSense touch display and a soft sage finish.',
    price: 1199,
    compareAt: 1299,
    rating: 4.7,
    reviews: 1520,
    image: r('sage'),
    glow: '#9ee6cf',
    variant: 'sage',
    finishes: [{ name: 'Sage', color: '#aab4a8' }, { name: 'Dune', color: '#cbb8a0' }, { name: 'Sapphire', color: '#3c4f78' }],
    specs: [
      { label: 'Chip', value: 'Snapdragon X Elite' },
      { label: 'Battery', value: 'Up to 20 hrs' },
      { label: 'Display', value: '13.8″ PixelSense 120Hz' },
      { label: 'Memory', value: '16GB · 512GB' },
    ],
  },
  {
    id: 'msi-titan-18',
    stock: 4,
    brand: 'MSI',
    name: 'Titan 18 HX',
    category: 'gaming',
    blurb: 'A desktop replacement with an 18″ 4K mini-LED, mechanical keys and 270 W of headroom.',
    price: 4299,
    compareAt: 4799,
    rating: 4.8,
    reviews: 312,
    badge: 'Flagship',
    image: r('titan'),
    glow: '#ff7ab6',
    variant: 'titan',
    finishes: [{ name: 'Core Black', color: '#101113' }],
    specs: [
      { label: 'CPU', value: 'Core Ultra 9 285HX' },
      { label: 'GPU', value: 'RTX 5090 24GB' },
      { label: 'Display', value: '18″ 4K mini-LED 120Hz' },
      { label: 'Memory', value: '96GB · 6TB' },
    ],
  },
  {
    id: 'noctis-forge-x',
    stock: 5,
    brand: 'Noctis',
    name: 'Forge X Gaming Tower',
    category: 'desktop',
    blurb: 'Our house-built tower: tuned airflow, silent at idle, 4K at 240 fps when it matters.',
    price: 3899,
    compareAt: 4299,
    rating: 4.9,
    reviews: 642,
    badge: 'Exclusive',
    image: r('forge'),
    glow: '#b9a6ff',
    model: 'tower',
    variant: 'forge',
    finishes: [{ name: 'Obsidian', color: '#17161f' }, { name: 'Frost', color: '#e6e4ec' }],
    specs: [
      { label: 'CPU', value: 'Ryzen 9 9950X3D' },
      { label: 'GPU', value: 'RTX 5090 32GB' },
      { label: 'Cooling', value: '360mm AIO · 7 fans' },
      { label: 'Memory', value: '64GB · 4TB' },
    ],
  },
  {
    id: 'legion-tower-7i',
    brand: 'Lenovo',
    name: 'Legion Tower 7i',
    category: 'desktop',
    blurb: 'Tool-less, frost-white gaming tower with a glass side and whisper-quiet Coldfront cooling.',
    price: 2799,
    compareAt: 3099,
    rating: 4.7,
    reviews: 388,
    image: r('frost'),
    glow: '#9ee6cf',
    model: 'tower',
    variant: 'frost',
    finishes: [{ name: 'Frost White', color: '#e6e4ec' }, { name: 'Storm Grey', color: '#3a3946' }],
    specs: [
      { label: 'CPU', value: 'Core Ultra 9 285K' },
      { label: 'GPU', value: 'RTX 5080 16GB' },
      { label: 'Cooling', value: '280mm AIO' },
      { label: 'Memory', value: '32GB · 2TB' },
    ],
  },
  {
    id: 'mac-studio',
    brand: 'Apple',
    name: 'Mac Studio M4 Max',
    category: 'desktop',
    blurb: 'A desktop the size of a hardback book with the power of a render farm. Silent under load.',
    price: 1999,
    rating: 4.9,
    reviews: 1176,
    badge: 'Bestseller',
    image: r('compact'),
    glow: '#c9cbd1',
    model: 'compact',
    variant: 'compact',
    finishes: [{ name: 'Silver', color: '#c9cbd1' }],
    specs: [
      { label: 'Chip', value: 'M4 Max 16-core' },
      { label: 'GPU', value: '40-core GPU' },
      { label: 'Ports', value: '4× TB5 · 10GbE' },
      { label: 'Memory', value: '36GB · 512GB' },
    ],
  },
  {
    id: 'odyssey-oled-g9',
    brand: 'Samsung',
    name: 'Odyssey OLED G9 49″',
    category: 'monitor',
    blurb: 'Two QHD screens in one seamless 1800R curve. Wraps your entire field of view.',
    price: 1299,
    compareAt: 1799,
    rating: 4.8,
    reviews: 903,
    badge: '-28%',
    image: r('odyssey'),
    glow: '#ff7ab6',
    model: 'monitor',
    variant: 'odyssey',
    finishes: [{ name: 'Silver White', color: '#e8e7ee' }, { name: 'Graphite', color: '#2a2934' }],
    specs: [
      { label: 'Panel', value: '49″ QD-OLED 1800R' },
      { label: 'Resolution', value: '5120 × 1440' },
      { label: 'Refresh', value: '240Hz · 0.03ms' },
      { label: 'HDR', value: 'True Black 400' },
    ],
  },
  {
    id: 'studio-display',
    brand: 'Apple',
    name: 'Studio Display 27″ 5K',
    category: 'monitor',
    blurb: 'A 5K Retina panel, 600 nits, studio-quality mics and a 12MP Center Stage camera.',
    price: 1599,
    rating: 4.7,
    reviews: 1388,
    image: r('studio-display'),
    glow: '#c9cbd1',
    model: 'monitor',
    variant: 'studio',
    finishes: [{ name: 'Silver', color: '#c9cbd1' }],
    specs: [
      { label: 'Panel', value: '27″ 5K Retina' },
      { label: 'Brightness', value: '600 nits' },
      { label: 'Camera', value: '12MP Center Stage' },
      { label: 'Ports', value: 'TB3 + 3× USB-C' },
    ],
  },
  {
    id: 'ultrafine-32-oled',
    brand: 'LG',
    name: 'UltraFine 32″ 4K OLED',
    category: 'monitor',
    blurb: 'Factory-calibrated OLED for colourists: true blacks and 99% DCI-P3 out of the box.',
    price: 1149,
    compareAt: 1299,
    rating: 4.6,
    reviews: 412,
    image: r('ultrafine'),
    glow: '#b9a6ff',
    model: 'monitor',
    variant: 'ultrafine',
    finishes: [{ name: 'Black', color: '#1b1a22' }],
    specs: [
      { label: 'Panel', value: '31.5″ 4K OLED' },
      { label: 'Colour', value: '99% DCI-P3' },
      { label: 'Refresh', value: '60Hz · ΔE<1' },
      { label: 'Ports', value: 'TB4 · 90W' },
    ],
  },
  {
    id: 'rog-swift-27',
    brand: 'ASUS ROG',
    name: 'Swift 27″ 480Hz OLED',
    category: 'monitor',
    blurb: 'The fastest OLED you can buy: 480Hz, 0.03ms and a glow ring on the back.',
    price: 999,
    rating: 4.8,
    reviews: 577,
    badge: 'New',
    image: r('swift'),
    glow: '#ff7ab6',
    model: 'monitor',
    variant: 'swift',
    finishes: [{ name: 'Black', color: '#121116' }],
    specs: [
      { label: 'Panel', value: '27″ QHD OLED' },
      { label: 'Refresh', value: '480Hz' },
      { label: 'Response', value: '0.03ms GtG' },
      { label: 'HDR', value: 'DisplayHDR TB 400' },
    ],
  },
  {
    id: 'noctis-keys-75',
    brand: 'Noctis',
    name: 'Keys 75 Mechanical',
    category: 'accessory',
    blurb: 'Gasket-mounted aluminium 75% board with hot-swap linear switches and pastel underglow.',
    price: 189,
    rating: 4.8,
    reviews: 2210,
    badge: 'Exclusive',
    image: r('keyboard'),
    glow: '#b9a6ff',
    model: 'keyboard',
    variant: 'keyboard',
    finishes: [{ name: 'Midnight', color: '#2a2838' }, { name: 'Lavender', color: '#b9a6ff' }, { name: 'Silver', color: '#c9cbd1' }],
    specs: [
      { label: 'Switches', value: 'Hot-swap linear' },
      { label: 'Layout', value: '75% aluminium' },
      { label: 'Connect', value: '2.4GHz · BT · USB-C' },
      { label: 'Battery', value: '4000 mAh' },
    ],
  },
  {
    id: 'mx-master-4',
    brand: 'Logitech',
    name: 'MX Master 4',
    category: 'accessory',
    blurb: 'The productivity mouse, refined: 8K DPI on glass, haptic thumb rest, 70-day battery.',
    price: 119,
    compareAt: 129,
    rating: 4.8,
    reviews: 5320,
    image: r('mouse'),
    glow: '#9a96ad',
    model: 'mouse',
    variant: 'mouse',
    finishes: [{ name: 'Graphite', color: '#4a4756' }, { name: 'Pale Grey', color: '#d6d3de' }],
    specs: [
      { label: 'Sensor', value: '8K DPI' },
      { label: 'Battery', value: '70 days' },
      { label: 'Connect', value: 'Bolt · BT' },
      { label: 'Buttons', value: '7 programmable' },
    ],
  },
  {
    id: 'wh-1000xm6',
    brand: 'Sony',
    name: 'WH-1000XM6',
    category: 'accessory',
    blurb: 'Industry-leading noise cancelling, 40-hour battery and a fold-flat case for flights.',
    price: 449,
    compareAt: 499,
    rating: 4.7,
    reviews: 3104,
    image: r('headphones'),
    glow: '#d9d5e6',
    model: 'headphones',
    variant: 'headphones',
    finishes: [{ name: 'Platinum', color: '#d9d5e6' }, { name: 'Midnight', color: '#2a2934' }],
    specs: [
      { label: 'ANC', value: 'Adaptive · 12 mics' },
      { label: 'Battery', value: '40 hrs' },
      { label: 'Codec', value: 'LDAC · Hi-Res' },
      { label: 'Weight', value: '254 g' },
    ],
  },
  {
    id: 't9-ssd-2tb',
    brand: 'Samsung',
    name: 'T9 Portable SSD 2TB',
    category: 'accessory',
    blurb: '2,000 MB/s in your pocket. Rubberised, 3-metre drop-proof and USB-C 20Gbps.',
    price: 219,
    compareAt: 259,
    rating: 4.8,
    reviews: 2687,
    badge: 'Deal',
    image: r('ssd'),
    glow: '#b9a6ff',
    model: 'ssd',
    variant: 'ssd',
    finishes: [{ name: 'Lavender', color: '#b9a6ff' }, { name: 'Black', color: '#1c1b22' }],
    specs: [
      { label: 'Speed', value: '2,000 MB/s' },
      { label: 'Port', value: 'USB-C 20Gbps' },
      { label: 'Capacity', value: '2TB' },
      { label: 'Drop', value: '3 m rated' },
    ],
  },
  {
    id: 'ts5-plus-dock',
    brand: 'CalDigit',
    name: 'TS5 Plus Thunderbolt Dock',
    category: 'accessory',
    blurb: 'One cable for everything: 20 ports, 140W charging and dual 8K displays.',
    price: 449,
    rating: 4.7,
    reviews: 860,
    image: r('dock'),
    glow: '#8f7bff',
    model: 'dock',
    variant: 'dock',
    finishes: [{ name: 'Space Grey', color: '#1c1b24' }],
    specs: [
      { label: 'Ports', value: '20' },
      { label: 'Interface', value: 'Thunderbolt 5' },
      { label: 'Charging', value: '140W' },
      { label: 'Displays', value: '2× 8K' },
    ],
  },
]

export const categories: {
  id: Category
  title: string
  kicker: string
  copy: string
  image: string
  accent: string
}[] = [
  {
    id: 'gaming',
    title: 'Gaming',
    kicker: '240Hz · RTX 50',
    copy: 'Desktop-class frames, vapour-chamber cooling and per-key RGB.',
    image: r('stealth'),
    accent: '#ff7ab6',
  },
  {
    id: 'creative',
    title: 'Creative Pro',
    kicker: 'OLED · Colour-calibrated',
    copy: 'Factory-calibrated panels and silicon built for 8K timelines.',
    image: r('silver-side'),
    accent: '#b48cff',
  },
  {
    id: 'business',
    title: 'Business',
    kicker: 'vPro · 3-yr on-site',
    copy: 'Fleet-ready security, legendary keyboards and featherweight builds.',
    image: r('carbon'),
    accent: '#9ee6cf',
  },
  {
    id: 'ultrabook',
    title: 'Ultrabooks',
    kicker: 'Under 1.4 kg',
    copy: 'All-day battery in chassis thinner than a notebook.',
    image: r('graphite'),
    accent: '#b9a6ff',
  },
  {
    id: 'everyday',
    title: 'Everyday',
    kicker: 'From $799',
    copy: 'Quiet, light and fast enough for everything else.',
    image: r('sage'),
    accent: '#9ee6cf',
  },
  {
    id: 'desktop',
    title: 'Desktop PCs',
    kicker: 'RTX 5090 · Silent',
    copy: 'Hand-built towers and tiny studios, tuned and burned in by our lab.',
    image: r('forge'),
    accent: '#ff7ab6',
  },
  {
    id: 'monitor',
    title: 'Monitors',
    kicker: 'OLED · 5K · 480Hz',
    copy: 'Colour-true LCD and OLED displays, from 27″ studios to 49″ curves.',
    image: r('odyssey'),
    accent: '#b9a6ff',
  },
  {
    id: 'accessory',
    title: 'Accessories',
    kicker: 'Keyboards · Audio · Docks',
    copy: 'Everything around the machine: keyboards, mice, audio, storage, docks.',
    image: r('keyboard'),
    accent: '#ffb4a2',
  },
]

export const categoryLabel = (c: Category) => categories.find((x) => x.id === c)!.title

export const testimonials = [
  {
    name: 'Amara Okafor',
    role: 'Colourist, Lagos',
    product: 'MacBook Pro 16″ M4 Max',
    rating: 5,
    quote:
      'The machine arrived calibrated, with a printed Delta-E report in the box. I graded a feature on it the same week. Nobody else does that.',
  },
  {
    name: 'Daniel Reyes',
    role: 'Competitive FPS player',
    product: 'Razer Blade 16',
    rating: 5,
    quote:
      'Ordered at midnight, it was on my desk 31 hours later. Their team even re-pasted the CPU before shipping — temps are 7°C lower than my old one.',
  },
  {
    name: 'Hannah Lindqvist',
    role: 'CTO, Northwind Labs',
    product: 'ThinkPad X1 Carbon Gen 13',
    rating: 5,
    quote:
      'We rolled out forty units through their business desk. Imaged, asset-tagged and delivered per office. It felt like having an extra IT team.',
  },
  {
    name: 'Kenji Watanabe',
    role: 'Architect, Osaka',
    product: 'Noctis Studio 16',
    rating: 5,
    quote:
      'The Graphite Edition is the quietest 16-inch I have ever rendered on. The copper edge catches the light in a way photos do not show.',
  },
  {
    name: 'Priya Raman',
    role: 'Medical student',
    product: 'Surface Laptop 7',
    rating: 4,
    quote:
      'Student pricing plus the trade-in on my old laptop took almost $400 off. Battery easily lasts a full hospital shift.',
  },
]

export const shortReviews = [
  { name: 'Leo M.', text: 'Packaging felt like unboxing jewellery.', rating: 5 },
  { name: 'Sofia K.', text: 'Swapped my order at 2am — support answered in 4 minutes.', rating: 5 },
  { name: 'Marcus T.', text: 'Price-matched another store, no questions asked.', rating: 5 },
  { name: 'Ines B.', text: 'Return pickup came to my office. Painless.', rating: 4 },
  { name: 'Theo R.', text: 'Zero dead pixels — they check every panel.', rating: 5 },
  { name: 'Yara S.', text: 'The trade-in quote was higher than anywhere else.', rating: 5 },
  { name: 'Jonas P.', text: 'Express delivery actually meant express.', rating: 5 },
  { name: 'Mei L.', text: 'Felt like a boutique, priced like a warehouse.', rating: 5 },
]

export const brands = ['Apple', 'ASUS ROG', 'Lenovo', 'Razer', 'Dell', 'MSI', 'HP', 'Microsoft', 'Acer Predator', 'Samsung']

export const formatPrice = (n: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(n)
