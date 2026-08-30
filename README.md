# Portfolio

Personal portfolio site.

## Stack

| Concern    | Choice                                            |
| ---------- | ------------------------------------------------- |
| Build      | Vite 8 (rolldown) + React 19 + React Compiler      |
| Language   | TypeScript 6, strict project references            |
| Styling    | Tailwind CSS v4 (`@tailwindcss/vite`, CSS-first)   |
| Animation  | Motion (`motion/react`)                            |
| Structure  | Single page, anchored scroll sections              |
| Lint       | oxlint                                             |
| E2E        | Playwright (Chromium, desktop + mobile viewports)  |

Design tokens live in the `@theme` block of `src/styles/index.css`; anything
declared there is available as a Tailwind utility. `@/*` is aliased to `src/*`.

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
e2e/            Playwright specs
src/components/ reusable UI primitives
src/sections/   page sections (hero, work, about, contact …)
src/hooks/      shared React hooks
src/lib/        framework-free helpers
src/styles/     global stylesheet + design tokens
```
