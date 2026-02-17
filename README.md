# CoinSight

CoinSight is a Next.js App Router application that renders a crypto watchlist UI from local mock data. The app supports client-side sorting by market cap, price, 24h change, and name, and displays each asset in a responsive card grid.

## Purpose

This project is currently an MVP focused on:

- clean React component composition
- typed data modeling with TypeScript
- deterministic local rendering without external API dependency
- polished visual styling using Tailwind CSS v4

## Tech Stack

- Next.js 16 (App Router)
- React 19
- TypeScript 5
- Tailwind CSS v4 (`@tailwindcss/postcss`)
- ESLint 9 (`eslint-config-next`)

## Quick Start

### Prerequisites

- Node.js 20+
- npm 10+

### Install

```bash
npm install
```

### Run in development

```bash
npm run dev
```

Open `http://localhost:3000`.

### Lint

```bash
npm run lint
```

### Production build

```bash
npm run build
npm run start
```

## Project Structure

```text
app/
	globals.css          Global theme tokens, background visuals, base styles
	layout.tsx           Root layout + metadata + decorative background wrappers
	page.tsx             Home page state, sorting logic, top-level composition
	crypto/
		[id]/
			page.tsx         Dynamic crypto detail page
			not-found.tsx    Invalid crypto id fallback UI

src/
	components/
		SortControls.tsx   Sort key selector + direction toggle
		Watchlist.tsx      Watchlist boundary component
		CryptoGrid.tsx     Responsive grid + empty-state rendering
		CryptoCard.tsx     Individual coin card + logo fallback handling
		PriceDisplay.tsx   Price and 24h change formatting/presentation
	data/
		mockCryptos.ts     Crypto type + local mock dataset + helper lookup

next.config.ts         Next.js config (remote image host allowlist)
```

## Implemented Features

- Static crypto dataset typed via `Crypto` interface
- Stable client-side sorting with `useMemo`
- Configurable sort key and direction controls
- Card-based watchlist UI with responsive breakpoints
- Dynamic coin detail route (`/crypto/[id]`)
- Custom not-found state for invalid coin IDs
- Price formatting via `Intl.NumberFormat`
- Positive/negative change indicator styling
- Remote logo rendering using Next Image with fallback initials
- Animated, theme-consistent background visuals

## App Logic Summary

1. `app/page.tsx` initializes `sortKey` and `sortDirection` state.
2. `sortCryptos()` sorts `mockCryptos` by selected key and direction.
3. `useMemo` recomputes sorted data only when sort state changes.
4. Sorted data is passed to `Watchlist`.
5. `Watchlist` renders `CryptoGrid`, which maps items into `CryptoCard`.
6. Each `CryptoCard` renders metadata and delegates price/chg UI to `PriceDisplay`.

Detailed docs:

- `docs/architecture.md`
- `docs/logic-flow.md`

## Configuration Notes

- `next.config.ts` allows remote images from:
	- `assets.coingecko.com`
	- `cryptologos.cc`
- TypeScript path alias `@/*` is configured in `tsconfig.json`.

## Current Limitations

- `CryptoCard` links to `/crypto/[id]`, but no route is currently implemented for that path.
- Data is static and local; no server or client data fetching is implemented.
- No tests are currently present.

## Suggested Next Milestones

- Introduce a typed data access layer for API integration.
- Add unit tests for sorting and formatting logic.
- Add component or end-to-end tests for critical user flows.
