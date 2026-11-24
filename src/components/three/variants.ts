import type { ScreenSpec } from './screenTexture'

export type LogoKind = 'ring' | 'dot' | 'bar' | 'matrix' | 'none'

export interface LaptopVariant {
  /** Chassis colour */
  body: string
  metalness: number
  roughness: number
  /** Optional trim colour along the lid edge (diamond-cut look) */
  trim?: string
  /** Keyboard deck and keycap colour */
  deck: string
  keys: string
  /** Backlight under the keys; 'rgb' paints a spectrum */
  backlight?: string | 'rgb'
  logo: LogoKind
  logoColor: string
  /** Base thickness in scene units (width is always 3.2) */
  thickness: number
  gaming?: boolean
  screen: ScreenSpec
}

/** Every laptop on the page is drawn from one of these presets, so all
 *  imagery shares the same lighting, angle and material language. */
export const variants = {
  noctis: {
    body: '#1a2030',
    metalness: 0.85,
    roughness: 0.32,
    trim: '#7ee8ff',
    deck: '#141519',
    keys: '#0d0d10',
    backlight: '#f472b6',
    logo: 'ring',
    logoColor: '#5ce1ff',
    thickness: 0.11,
    screen: { app: 'video', photo: 'dune', accent: '#5ce1ff' },
  },
  silver: {
    body: '#c8cad0',
    metalness: 0.95,
    roughness: 0.28,
    deck: '#bfc1c7',
    keys: '#111114',
    logo: 'dot',
    logoColor: '#f5f5f7',
    thickness: 0.1,
    screen: { app: 'photo', photo: 'fjord', accent: '#f472b6' },
  },
  graphite: {
    body: '#3a3c42',
    metalness: 0.9,
    roughness: 0.3,
    deck: '#2c2e33',
    keys: '#101113',
    backlight: '#dfe8ff',
    logo: 'bar',
    logoColor: '#d9dce3',
    thickness: 0.1,
    screen: { app: 'code', photo: 'highlands', accent: '#5ce1ff' },
  },
  carbon: {
    body: '#141416',
    metalness: 0.2,
    roughness: 0.75,
    deck: '#141416',
    keys: '#0b0b0c',
    logo: 'dot',
    logoColor: '#ff2a2a',
    thickness: 0.12,
    screen: { app: 'dashboard', photo: 'towers', accent: '#8b5cf6' },
  },
  eclipse: {
    body: '#2d2f36',
    metalness: 0.75,
    roughness: 0.4,
    deck: '#22242a',
    keys: '#0e0f12',
    backlight: '#f4f6ff',
    logo: 'matrix',
    logoColor: '#f4f6ff',
    thickness: 0.14,
    gaming: true,
    screen: { app: 'game', photo: 'city', accent: '#ff5db1' },
  },
  stealth: {
    body: '#0c0d0e',
    metalness: 0.7,
    roughness: 0.38,
    deck: '#0f1011',
    keys: '#08090a',
    backlight: 'rgb',
    logo: 'ring',
    logoColor: '#a78bfa',
    thickness: 0.14,
    gaming: true,
    screen: { app: 'game', photo: 'valley', accent: '#a78bfa' },
  },
  copper: {
    body: '#1b1c22',
    metalness: 0.85,
    roughness: 0.3,
    trim: '#d29a6a',
    deck: '#1b1c22',
    keys: '#0e0e11',
    backlight: '#ffd2a8',
    logo: 'bar',
    logoColor: '#d29a6a',
    thickness: 0.1,
    screen: { app: 'browser', photo: 'canal', accent: '#f472b6' },
  },
  sage: {
    body: '#aab4a8',
    metalness: 0.8,
    roughness: 0.38,
    deck: '#9aa598',
    keys: '#1a1c1a',
    logo: 'ring',
    logoColor: '#e8eee6',
    thickness: 0.1,
    screen: { app: 'desktop', photo: 'river', accent: '#a78bfa' },
  },
  titan: {
    body: '#101113',
    metalness: 0.6,
    roughness: 0.45,
    deck: '#151619',
    keys: '#07080a',
    backlight: 'rgb',
    logo: 'matrix',
    logoColor: '#ff5db1',
    thickness: 0.2,
    gaming: true,
    screen: { app: 'game', photo: 'peaks', accent: '#ff5db1' },
  },
} satisfies Record<string, LaptopVariant>

export type VariantKey = keyof typeof variants
