# CoinSight Architecture

## Overview

CoinSight uses a simple client-driven architecture:

- presentation and interaction logic live in the App Router page and React components
- data is a local in-repo typed module (`src/data/mockCryptos.ts`)
- there is no backend service, API route, persistence, or server action

This keeps the runtime deterministic and easy to reason about while the UI and interaction model are developed.

## Runtime Architecture

### Framework Layer

- Next.js App Router provides application shell and page routing
- `app/layout.tsx` defines the global HTML body structure, metadata, and visual background layers
- `app/page.tsx` is the current primary interactive surface
- `app/crypto/[id]/page.tsx` handles dynamic coin detail rendering
- `app/crypto/[id]/not-found.tsx` handles invalid detail route IDs

### UI Composition Layer

Component hierarchy for the home page:

`Home (app/page.tsx)`
→ `SortControls`
→ `Watchlist`
→ `CryptoGrid`
→ `CryptoCard`
→ `PriceDisplay`

Each component has a narrow responsibility and receives typed props.

### Data Layer

- `src/data/mockCryptos.ts` defines:
  - `Crypto` interface
  - `mockCryptos` array (source of truth for rendered assets)
  - `getCryptoById(id)` utility
- Data is imported directly into page-level client logic

### Styling Layer

- Tailwind CSS v4 utilities handle most visual styling
- `app/globals.css` defines:
  - custom CSS variables for dark theme tokens
  - body/base styles
  - animated background blob effects
  - subtle texture overlay

## Module Responsibilities

## `app/layout.tsx`

- sets metadata (`title`, `description`)
- loads Geist Sans and Geist Mono fonts
- mounts decorative background layers once at app root

## `app/page.tsx`

- marked `"use client"` to support local interaction state
- owns sort state (`sortKey`, `sortDirection`)
- contains pure sorting function `sortCryptos()`
- memoizes sorted output with `useMemo`
- composes top-level UI sections

## `app/crypto/[id]/page.tsx`

- server-rendered dynamic route for coin detail pages
- uses `params.id` and `getCryptoById(id)` to resolve record data
- calls `notFound()` when ID is not in the dataset
- defines `generateStaticParams()` for known mock coin IDs
- defines route-specific metadata with `generateMetadata()`

## `app/crypto/[id]/not-found.tsx`

- provides route-level fallback UI for invalid or unknown crypto IDs
- includes path back to home watchlist

## `src/components/SortControls.tsx`

- typed sort control API (`SortKey`, `SortDirection`)
- renders select input for key and button for direction toggle
- emits changes to parent via callbacks

## `src/components/Watchlist.tsx`

- thin boundary that forwards data to grid layer

## `src/components/CryptoGrid.tsx`

- renders responsive card grid
- handles empty-state branch

## `src/components/CryptoCard.tsx`

- presents a single crypto summary card
- uses `next/image` for logos and local fallback initials on image error
- links to `/crypto/${id}` detail path

## `src/components/PriceDisplay.tsx`

- formats USD values using `Intl.NumberFormat`
- conditionally renders change badge with directional indicator

## Cross-Cutting Decisions

## Type Safety

- strict TypeScript settings in `tsconfig.json`
- shared domain type (`Crypto`) avoids prop shape drift

## Performance

- sorting work is memoized and recalculated only on sort input changes
- static data import removes network variability

## Accessibility

- explicit labels and aria attributes on interactive controls
- semantic structure (`header`, `section`, article-like card content)

## Image Security and Delivery

- `next.config.ts` restricts remote image sources to known hostnames

## Known Architectural Gaps

- no API/data service abstraction yet
- no test harness currently included
- no persistence (watchlist preferences/sort state reset on refresh)

## Evolution Path

Recommended next architecture increments:

1. Introduce data gateway (`src/lib/cryptoRepository.ts`) with static and API adapters.
2. Add test coverage for sorting and component rendering behavior.
3. Add runtime data refresh strategy (polling, revalidation, or streaming).
4. Persist view preferences in URL params or local storage.