# CoinSight

CoinSight is a client-driven crypto dashboard built with Next.js App Router and React 19. It intentionally runs on static in-repo mock data only (no backend, no API routes, no persistence) so UI behavior stays deterministic during development.

## What this project is

- A frontend-first crypto dashboard MVP
- Strongly typed TypeScript domain model
- App Router routes with domain-based feature organization
- Theme-aware UI using Tailwind v4 + `next-themes`

## Tech stack

- `next` 16.1.6
- `react` / `react-dom` 19.2.3
- `typescript` 5
- `tailwindcss` v4
- `next-themes` ^0.4
- `eslint` 9 (`eslint-config-next`)
- `prettier` 3.8.1

## Run locally

Prerequisites: Node.js 20+ and npm 10+

```bash
npm install
npm run dev
```

Open http://localhost:3000

Useful commands:

```bash
npm run lint
npm run build
npm run start
```

## End-to-end tests (Playwright)

Run the Playwright suite:

```bash
npm run test:e2e
```

Additional modes:

```bash
npm run test:e2e:headed
npm run test:e2e:ui
npm run test:e2e:debug
```

After running, open the HTML report:

```bash
npx playwright show-report
```

## Project shape

- `app/`: route files only (`page.tsx`, `layout.tsx`, route-level `not-found.tsx`)
- `domains/crypto/`: feature logic, UI components, mock data, and types
- `shared/components/`: reusable cross-feature UI (header, nav, theme primitives)
- `docs/`: source-of-truth architecture and implementation notes

## Key constraints

- No external charting, state management, or data-fetching libraries
- No server-side data source (all data is local mock)
- Keep route files thin; place logic/state in `domains/` or `shared/`

## Documentation map

- `docs/overview.md`
- `docs/folder-structure.md`
- `docs/routing.md`
- `docs/component-hierarchy.md`
- `docs/state-management.md`
- `docs/chart-system.md`
- `docs/data-model.md`
- `docs/theming.md`
- `docs/playwright-testing.md`
- `docs/decisions.md`
- `docs/roadmap.md`
