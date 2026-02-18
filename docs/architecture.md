# CoinSight Architecture

## Overview

CoinSight is a client-driven crypto dashboard built on **Next.js 16 App Router** with **React 19**. All data comes from a static in-repo mock module — there is no backend, API route, or persistence layer. This keeps the runtime deterministic while the UI is developed.

## Project Structure

The codebase follows a **domain-based folder architecture** with strict separation of concerns:

```
app/                          ← Routing only (thin wrappers)
  layout.tsx                  ← Root shell: ThemeProvider, Header, Navbar
  page.tsx                    ← Home route → Suspense → HomeContent
  crypto/[id]/
    page.tsx                  ← Detail route (server component, static params)
    not-found.tsx             ← 404 fallback for unknown coin IDs

domains/crypto/               ← Feature domain
  types/crypto.types.ts       ← All domain model types (Crypto, SortKey, TimeRange, etc.)
  constants.ts                ← Named constants (view modes, chart dims, PRNG params)
  mock/cryptos.mock.ts        ← Static mock data + getCryptoById() helper
  components/
    home-content.tsx           ← Smart component: view/sort state, data flow
    sort-controls.tsx          ← Presentational: sort key + direction controls
    watchlist.tsx              ← Presentational: section wrapper for grid
    crypto-grid.tsx            ← Presentational: responsive card grid
    crypto-card.tsx            ← Presentational: single coin card
    crypto-logo.tsx            ← next/image with fallback initials
    price-display.tsx          ← Formatted price + change badge
    chart-section.tsx          ← Smart component: time-range & chart-type state
    chart-config.ts            ← Chart range configs and label mappings
    generate-mock-chart-data.ts← Seeded PRNG mock data generator
    chart-helpers.ts           ← Pure geometry/coordinate/tooltip utilities
    price-chart.tsx            ← Interactive SVG chart (delegates to layers)
    chart-grid.tsx             ← SVG grid lines + axis labels
    line-chart-layer.tsx       ← SVG polyline + gradient fill layer
    candlestick-layer.tsx      ← SVG OHLC wick + body layer

shared/                       ← Cross-cutting reusable components
  components/
    header.tsx                 ← Brand logo, market snapshot chips, theme toggle
    stat-chip.tsx              ← Reusable stat badge (extracted from Header)
    navbar.tsx                 ← View-mode tab navigation
    theme-provider.tsx         ← next-themes wrapper
    theme-toggle.tsx           ← Dark/light toggle button
    coin-sight-logo.tsx        ← SVG brand logo
```

**Conventions:**
- All files use **kebab-case** naming (e.g., `price-chart.tsx`, not `PriceChart.tsx`).
- One component per file. Components stay under **150 lines**; complex logic is extracted into `.ts` utility files.
- Route files (`app/`) contain no business logic — they import a content component and render it.
- Types live in dedicated `.types.ts` files, not scattered across components.
- Magic numbers and strings are replaced with named constants in `constants.ts`.

## Component Hierarchy

### App Shell (`app/layout.tsx`)

```
RootLayout
  → ThemeProvider               (dark/light via next-themes)
  → Background blobs            (decorative, aria-hidden)
  → Header                      (shared/components/header.tsx)
      → CoinSightLogo
      → StatChip × 3            (Coins, Total MCap, Avg 24h)
      → ThemeToggle
  → Navbar                      (shared/components/navbar.tsx, Suspense-wrapped)
  → {children}
```

### Home Page (`app/page.tsx`)

```
Home → Suspense
  → HomeContent                 (domains/crypto/components/home-content.tsx)
      → SortControls            (sort key dropdown + direction toggle)
      → Watchlist
          → CryptoGrid
              → CryptoCard × N
                  → CryptoLogo  (next/image + fallback)
                  → PriceDisplay
```

### Detail Page (`app/crypto/[id]/page.tsx`)

```
CryptoDetailPage               (server component, generates static params)
  → Back link
  → Coin header + PriceDisplay (size="lg")
  → Market metric cards (Market Cap, 24h Volume, 24h Change)
  → ChartSection               (client component)
      → Time-range pill bar     (1D, 7D, 30D, 90D, 1Y, ALL)
      → Chart-type toggle       (Line / Candle)
      → PriceChart              (interactive SVG)
          → ChartGrid           (axis lines + labels)
          → LineChartLayer       (polyline + gradient fill)
          → CandlestickLayer    (OHLC wicks + bodies)
```

## Key Architectural Decisions

| Decision             | Detail |
| -------------------- | ------ |
| **Folder structure** | Domain-based: `domains/<feature>/`, `shared/`, `app/` (routing only). No flat `src/` dump. |
| **Data source**      | Static `mockCryptos` array in `domains/crypto/mock/cryptos.mock.ts` with `Crypto` interface and `getCryptoById()` helper. |
| **Type system**      | All domain types in `domains/crypto/types/crypto.types.ts`. `interface` for shapes/props, `type` for unions/aliases. No `any`. |
| **Theming**          | `next-themes` with class-based switching; dual CSS custom-property palettes in `globals.css` (`:root` light, `.dark` dark); includes `--candle-up` / `--candle-down` for chart colors. |
| **View modes**       | URL-driven via `?view=` param — `all`, `gainers`, `losers`, `volume`. Constants defined in `domains/crypto/constants.ts`. |
| **Sorting**          | Pure `sortCryptos()` in `home-content.tsx`, memoized with `useMemo`. Keys: `name`, `price`, `change24h`, `marketCap`, `volume24h`. |
| **Charts**           | `ChartSection` manages state; `generate-mock-chart-data.ts` produces deterministic data via seeded PRNG; `chart-helpers.ts` handles geometry; `PriceChart` orchestrates SVG rendering via `ChartGrid`, `LineChartLayer`, and `CandlestickLayer`. No charting library. |
| **Static generation**| Detail pages use `generateStaticParams()` to pre-render all coin routes at build time. |
| **Image handling**   | `CryptoLogo` wraps `next/image` with fallback initials on error; remote hosts allowlisted in `next.config.ts`. |
| **Hydration safety** | `Suspense` around `useSearchParams` consumers; `suppressHydrationWarning` on `<html>`; `ThemeToggle` defers render until mounted. |
| **Code quality**     | Prettier (semi, double quotes, 2-space indent, 100 print width) + ESLint with `eslint-config-next` and `eslint-config-prettier`. |

## Dependencies

| Package                       | Purpose              |
| ----------------------------- | -------------------- |
| `next` 16.1.6                 | Framework & routing  |
| `react` / `react-dom` 19.2.3 | UI library           |
| `next-themes` ^0.4            | Dark/light mode      |
| `tailwindcss` v4              | Utility CSS          |
| `prettier` 3.8.1              | Code formatting      |
| `eslint` 9 + config-next      | Linting              |

No external charting, state management, or data-fetching libraries are used.

## Known Gaps

- No API or data-service abstraction layer
- No test harness
- Sort/view state not persisted across sessions (theme is persisted by `next-themes` via localStorage)
- Chart time-range and type selections reset on navigation

## Evolution Path

1. Introduce a data gateway with static and API adapters
2. Add test coverage for sorting, view logic, and rendering
3. Add runtime data refresh (polling, revalidation, or streaming)
4. Replace mock price series with real historical data
5. Persist view/sort preferences in URL params or local storage
