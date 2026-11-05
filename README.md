# D'Green Resto & Coffee — website prototype

Pitch prototype built with Next.js (App Router), GSAP ScrollTrigger and Lenis smooth scroll.

```bash
npm install
npm run dev   # http://localhost:3000
```

## Sections
- **Hero** (`src/components/Hero.tsx`): arched gate with leaves; scrolling zooms through the gate.
- **Menu book** (`src/components/MenuBook.tsx`): the 2025 menu (`public/menu/p-01.jpg … p-42.jpg`) turns page by page on scroll.
- **Visit** (`src/components/Visit.tsx`): address, hours, reservations.

## Leaves
Hero leaves are generated SVG illustrations (`src/components/leaves/`), placed in `src/data/heroLeaves.ts`.
To use real cut-out leaves instead, put a transparent PNG/WebP in `public/leaves/` (stem at the bottom
centre, tip at the top) and change an entry to:

```ts
{ kind: "image", src: "/leaves/banana-1.webp", aspect: 0.45, x: -80, y: 880, rotate: 68, size: 780 }
```

`aspect` is the image's width ÷ height.

`legacy-static/` holds the first plain HTML version for reference. Its `menu/` images and the menu PDF in `wireframe/` are kept out of git; copy `public/menu/` into `legacy-static/menu/` to open it.
