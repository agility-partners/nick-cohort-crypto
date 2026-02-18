# CoinSight Logic Flow

## Scope

Runtime logic flows for the home page (`/`), view navigation, coin detail (`/crypto/[id]`), theme switching, and chart interactions.

---

## Routing Map

Routing is handled by the Next.js App Router via files in `app/`. Route files stay thin and delegate UI/state to domain components.

| URL | Route file | Type | Rendered content |
| --- | --- | --- | --- |
| `/` | `app/page.tsx` | Static route | Wraps and renders `HomeContent` in `<Suspense>` |
| `/crypto/[id]` | `app/crypto/[id]/page.tsx` | Dynamic segment | Resolves `id`, renders detail header + `ChartSection` |
| `/crypto/[id]` not found | `app/crypto/[id]/not-found.tsx` | Segment 404 UI | Shown when `notFound()` is triggered |

### Layout hierarchy

1. `app/layout.tsx` is the global shell for every route.
2. It renders `ThemeProvider` → `Header` → `Navbar` → route `children`.
3. Shared navigation and theme behavior are therefore consistent across home and detail pages.

### Query-param routing on home

Home sub-views are URL-driven through `?view=` (not separate route files):

- `/?view=all`
- `/?view=gainers`
- `/?view=losers`
- `/?view=volume`

`Navbar` links write these query params, and `HomeContent` reads them using `useSearchParams` to update default sorting and title.

### Dynamic detail route behavior

1. `generateStaticParams()` returns every known coin id from `mockCryptos`.
2. Next.js pre-renders `/crypto/<id>` pages at build time for those ids.
3. On request, the page resolves `params.id` and looks up data with `getCryptoById(id)`.
4. Missing ids call `notFound()`, which renders the segment-level not-found UI.

---

## App Shell Render

1. `app/layout.tsx` wraps the page tree in `ThemeProvider` → `Header` → `Navbar` → `{children}`.
2. `Header` (`shared/components/header.tsx`) computes aggregate stats from the static `mockCryptos` array at render time:
   - Total coins count
   - Total market cap (compact-formatted)
   - Average 24h change (color-coded via `StatChip`)
3. `Navbar` (`shared/components/navbar.tsx`) reads `useSearchParams` to highlight the active view tab. Navigation items come from `NAV_ITEMS` in `domains/crypto/constants.ts`.

---

## Home Page — View & Sort Flow

1. `app/page.tsx` renders `HomeContent` inside `<Suspense>` — the route file contains zero logic.
2. `HomeContent` (`domains/crypto/components/home-content.tsx`) reads `?view=` from the URL (defaults to `"all"`).
3. `getDefaultSort(view)` determines the natural sort key and direction per view:
   - `all` → `marketCap` desc
   - `gainers` → `change24h` desc
   - `losers` → `change24h` asc
   - `volume` → `volume24h` desc
4. A `useEffect` resets sort state whenever the view changes.
5. `sortCryptos()` produces a sorted copy via `useMemo` — base sort is ascending; descending reverses.
6. The sorted array flows: `Watchlist` → `CryptoGrid` → `CryptoCard` (with `CryptoLogo` + `PriceDisplay`).

### User changes sort key or direction

`SortControls` emits via callbacks → `HomeContent` state updates → `useMemo` recomputes → grid re-renders.

### User clicks a Navbar tab

`next/link` navigates to `/?view=<view>` → URL change triggers `HomeContent` to re-read params → `useEffect` resets sort → grid re-renders with new ordering.

---

## Detail Page — `/crypto/[id]`

1. `app/crypto/[id]/page.tsx` is a **server component** that:
   - Calls `generateStaticParams()` to pre-render all coin routes at build time.
   - Reads `params.id`, calls `getCryptoById(id)` from `domains/crypto/mock/cryptos.mock.ts`.
2. If not found → `notFound()` renders `not-found.tsx` with a link home.
3. If found → renders coin header, market metric cards, and `ChartSection` (client component) with `cryptoId`, `symbol`, `price`, and `change24h` as props.

---

## Chart System

The chart system is split into four layers for separation of concerns:

### ChartSection — State & Data

`domains/crypto/components/chart-section.tsx` owns two pieces of state:
- `timeRange` (default `"7D"`) — which time window to display
- `chartType` (default `"line"`) — line or candlestick mode

When state or coin props change, `useMemo` calls `generateMockData()` from `generate-mock-chart-data.ts`:

1. A **seeded PRNG** (Linear Congruential Generator) derives a seed from the coin ID + time range, producing a unique but deterministic series per combination.
2. Generates **close-price values** with range-specific point counts (24 for 1D → 60 for ALL) and volatility settings from `chart-config.ts`.
3. Derives **OHLC candlestick data** from the close prices (open = previous close, high/low spread by volatility).
4. Formats **date labels** with range-appropriate `Intl.DateTimeFormat` options.

The pill-bar buttons update `timeRange` → re-memo → new chart data.
The Line/Candle toggle updates `chartType` → `PriceChart` switches rendering mode.

### PriceChart — SVG Orchestration

`domains/crypto/components/price-chart.tsx` receives data and delegates:
- Calls `chart-helpers.ts` pure functions to compute chart geometry, coordinate mapping, and tooltip positioning.
- Renders `<svg>` containing `ChartGrid`, then conditionally `LineChartLayer` or `CandlestickLayer`.
- Owns a single `activeIndex` state for hover tracking.

### Chart Sub-Layers

| Layer | File | Responsibility |
| ----- | ---- | -------------- |
| `ChartGrid` | `chart-grid.tsx` | Horizontal grid lines, Y-axis price labels, X-axis date labels |
| `LineChartLayer` | `line-chart-layer.tsx` | SVG polyline, gradient fill area, crosshair line, hover dot, tooltip |
| `CandlestickLayer` | `candlestick-layer.tsx` | OHLC wick lines, candle bodies, highlight band, OHLC tooltip |

### Hover Interaction (both modes)

1. `onMouseMove` on the SVG maps cursor x-position to the nearest data point index.
2. **Line mode**: crosshair line + dot + price/date tooltip at the active point.
3. **Candlestick mode**: dashed crosshair + highlight band + four-row OHLC tooltip (Open, High, Low, Close) color-coded with `--candle-up`/`--candle-down`.
4. Tooltip flips sides when near chart edges to avoid clipping.
5. `onMouseLeave` clears the active index.

---

## Theme Toggle Flow

1. User clicks `ThemeToggle` → `setTheme()` from `next-themes` toggles between `"dark"` and `"light"`.
2. `next-themes` updates the `class` attribute on `<html>` and persists the choice in localStorage.
3. CSS custom properties swap via the `.dark` selector in `globals.css`, updating all themed surfaces.
4. `ThemeToggle` defers icon rendering until after mount to avoid hydration mismatch.

---

## Image Fallback Flow

1. `CryptoLogo` renders `next/image` with the coin's remote URL.
2. On load error, `imgError` state flips → component re-renders with a styled initials avatar.

---

## State Ownership

| Owner | State | Scope |
| ----- | ----- | ----- |
| `HomeContent` | `sortKey`, `sortDirection` | Derived from active view, user-adjustable via `SortControls` |
| `CryptoLogo` | `imgError` | Local UI fallback |
| `ChartSection` | `timeRange`, `chartType` | Time-range selector (1D–ALL) and line/candlestick toggle |
| `PriceChart` | `activeIndex` | Hover tooltip tracking |
| `ThemeProvider` | theme (`dark`/`light`) | Global, persisted in localStorage by `next-themes` |

All state is local to the owning component. No global state library is used. State is lifted only to the nearest common parent when siblings need shared data.

---

## Data Flow

All data originates from the static `mockCryptos` array in `domains/crypto/mock/cryptos.mock.ts`. There is no fetch lifecycle, caching, or async boundary involved. Chart data is derived deterministically from coin properties + time range via seeded PRNG.
