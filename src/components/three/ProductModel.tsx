import type { LaptopDrive } from './Laptop'
import { Laptop } from './Laptop'
import { Compact, Monitor, Tower, type MonitorKey, type TowerKey } from './Desktop'
import { Dock, Headphones, Keyboard, Mouse, Ssd } from './Accessories'
import type { VariantKey } from './variants'

export type ModelKind = 'laptop' | 'monitor' | 'tower' | 'compact' | 'keyboard' | 'mouse' | 'headphones' | 'ssd' | 'dock'

/** Renders any product's 3D model from its kind + preset, so studio shots and the Quick View share one source. */
export function ProductModel({
  model,
  variant,
  body,
  lid,
  drive,
  spin,
}: {
  model: ModelKind
  variant: string
  body?: string
  lid?: number
  drive?: LaptopDrive
  spin?: boolean
}) {
  switch (model) {
    case 'laptop':
      return <Laptop variant={variant as VariantKey} body={body} lid={lid} drive={drive} />
    case 'monitor':
      return <Monitor variant={variant as MonitorKey} body={body} />
    case 'tower':
      return <Tower variant={variant as TowerKey} body={body} spin={spin} />
    case 'compact':
      return <Compact body={body} />
    case 'keyboard':
      return <Keyboard body={body} />
    case 'mouse':
      return <Mouse body={body} />
    case 'headphones':
      return <Headphones body={body} />
    case 'ssd':
      return <Ssd body={body} />
    case 'dock':
      return <Dock body={body} />
  }
}

/** How each kind is framed: camera position, look-at height, turntable angle and ground height. */
export const framing: Record<ModelKind, { cam: [number, number, number]; look: number; rotY: number; ground: number }> = {
  laptop: { cam: [0, 2.4, 7.2], look: 0.45, rotY: -0.55, ground: -0.09 },
  monitor: { cam: [0, 2.6, 9.4], look: 1.9, rotY: -0.38, ground: 0 },
  tower: { cam: [0, 2.4, 8.4], look: 1.05, rotY: -0.62, ground: 0 },
  compact: { cam: [0, 2.6, 6.6], look: 0.45, rotY: -0.5, ground: 0 },
  keyboard: { cam: [0, 3.1, 5.2], look: 0.1, rotY: -0.3, ground: 0 },
  mouse: { cam: [0, 2.1, 3.7], look: 0.2, rotY: -0.5, ground: 0 },
  headphones: { cam: [0, 1.4, 5.0], look: 0.75, rotY: -0.45, ground: 0 },
  ssd: { cam: [0, 2.2, 3.9], look: 0.05, rotY: -0.45, ground: 0 },
  dock: { cam: [0, 1.9, 4.2], look: 0.1, rotY: -0.35, ground: 0 },
}
