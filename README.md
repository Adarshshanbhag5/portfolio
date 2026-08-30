# Portfolio

Personal portfolio for Adarsh Shanbhag — a single scrolling page with ten live
canvas scenes, a cold-start intro and a handful of hidden interactions.

## Stack

| Concern   | Choice                                              |
| --------- | --------------------------------------------------- |
| Build     | Vite 8 (rolldown) + React 19 + React Compiler        |
| Language  | TypeScript 6, strict project references              |
| Styling   | Tailwind CSS v4 (`@tailwindcss/vite`, CSS-first)     |
| Animation | Motion (`motion/react`), plus CSS for ambient loops  |
| Fonts     | Space Grotesk + JetBrains Mono, self-hosted          |
| Lint      | oxlint                                               |
| E2E       | Playwright — Chromium, desktop and mobile viewports  |
| Deploy    | GitHub Pages via GitHub Actions                      |

## Scripts

```
npm run dev              # vite dev server on :5173 (strict port)
npm run build            # tsc -b && vite build
npm run lint             # oxlint
npm run test:e2e         # playwright test (boots the dev server itself)
npm run test:e2e:ui      # playwright interactive UI mode
npm run test:e2e:headed  # watch the browser drive
npm run test:e2e:report  # open the last HTML report
```

## Layout

```
e2e/              Playwright specs
src/components/   shell and reusable UI
src/content/      copy and data, kept out of the components
src/context/      theme, page effects, résumé overlay
src/hooks/        canvas mounting, scroll, pointer and text effects
src/lib/          framework-free helpers (ticker, canvas, palette)
src/scenes/       canvas draw functions, one per widget
src/sections/     hero, work, systems, stack, builds, contact
src/styles/       global stylesheet, design tokens, ambient keyframes
```

## How it fits together

**Theme.** Both palettes live in `src/styles/index.css` under
`:root[data-theme]`, so switching is one attribute flip. `@theme inline` keeps
the Tailwind utilities pointing at the custom properties rather than baking in
today's values. Canvas scenes cannot read custom properties, so the same
palettes are mirrored as plain objects in `src/lib/theme.ts` — keep the two in
step. An inline script in `index.html` applies the stored choice before first
paint.

**Canvas scenes.** Each scene is a `{ create, draw }` pair with no React in it.
`useCanvasScene` mounts one: it sizes the canvas to the device pixel ratio,
rebuilds state on resize, pauses it off-screen, and drives it from a single
shared `requestAnimationFrame` loop in `src/lib/ticker.ts`. Scenes publish their
live numbers through `emit`, which writes straight to a DOM node — those values
change every frame and a re-render each time would cost far more.

**Motion vs CSS.** Anything with a beginning and an end is Motion, so React owns
its lifecycle: reveals, the intro, the theme wipe, the résumé overlay. Endless
ambient loops — drifting glows, the tool marquee, blinking status dots — are CSS
keyframes, which cost nothing to run.

**Reduced motion.** `prefers-reduced-motion` skips the intro, stops every canvas
scene, disables the wipe and the résumé overlay, and drops the text effects.

## Deployment

Pushing to `main` runs lint and the full Playwright suite, then builds and
publishes to GitHub Pages. The Pages base path is derived from
`GITHUB_REPOSITORY` at build time, so renaming the repo cannot break asset URLs;
set `VITE_BASE` to override (a custom domain wants `VITE_BASE=/`).

Repo settings → Pages → Source must be set to **GitHub Actions**.
