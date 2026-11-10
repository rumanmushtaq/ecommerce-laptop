# Noctis — Premium Laptops, PCs & Displays

A single-page ecommerce landing experience for a premium computer store, built with **Next.js (App Router)**, **React 19**, **Tailwind CSS 4**, **Motion** and **React Three Fiber**.

## Highlights

- Cinematic 3D hero: a procedural laptop that flies in, opens and powers on, with bloom and adaptive quality.
- Every product image (laptops, desktop towers, monitors, accessories) is rendered from the site's own 3D models, so imagery is consistent and never broken.
- 3D Quick View for any product: drag to rotate, switch finish, configure memory/storage with live pricing.
- Bag + wishlist (persisted locally), command-palette search (⌘K), category filters, trade-in estimator, live sale countdown.
- Smooth scrolling (Lenis), scroll-linked motion, lazy-loaded images with blurred previews and zero layout shift.
- Fully responsive with a mobile shop bar; respects reduced-motion preferences.

## Getting started

```bash
npm install
npm run dev        # http://localhost:5188
npm run build && npm start
```

Requires Node.js 20.9 or newer.

## Regenerating product renders

Product shots in `public/renders/` come from the dev-only render studio at `/studio`:

```bash
npm run dev
npm run render     # renders every product with Playwright and saves the frames
```

## Project structure

- `src/app` — App Router layout, page, dev-only `/studio` and `/api/save-render`
- `src/components/sections` — landing page sections
- `src/components/layout` — navbar, overlays (bag, search, menu, quick view), footer
- `src/components/three` — 3D models (laptop, monitor, tower, compact, accessories), scenes, screen textures
- `src/data` — catalog and image previews
