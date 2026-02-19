# Folder Structure

The codebase follows a **domain-based folder architecture** with strict separation of concerns.

---

## Layout

```
app/                          ← Routing only (thin wrappers)
  layout.tsx                  ← Root shell: ThemeProvider, Header, Navbar
  page.tsx                    ← Home route → Suspense → HomeContent
  watchlist/add/
    page.tsx                  ← Add-to-watchlist route wrapper
    loading.tsx               ← Route-level loading skeleton
    error.tsx                 ← Route-level error boundary UI
  crypto/[id]/
    page.tsx                  ← Detail route (server component, static params)
    not-found.tsx             ← 404 fallback for unknown coin IDs

domains/crypto/               ← Feature domain
  hooks/
    use-watchlist.tsx         ← Watchlist state provider + hook (localStorage persistence)
  types/
    crypto.types.ts           ← Core domain model types (Crypto, TimeRange, ChartType, etc.)
    watchlist.types.ts        ← Watchlist provider interfaces
  constants.ts                ← Named constants (view modes, chart dims, PRNG params)
  mock/cryptos.mock.ts        ← Static mock data + getCryptoById() helper
  components/
    home-content.tsx           ← Smart component: view/order state, data flow
    watchlist-add-content.tsx  ← Add-form UI with validation/loading/error states
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
    navbar.tsx                 ← View-mode tab navigation (watchlist tab is data-aware)
    theme-provider.tsx         ← next-themes wrapper
    theme-toggle.tsx           ← Dark/light toggle button
    coin-sight-logo.tsx        ← SVG brand logo
```

---

## Conventions

- All files use **kebab-case** naming (e.g., `price-chart.tsx`, not `PriceChart.tsx`).
- One component per file. Components stay under **150 lines**; complex logic is extracted into `.ts` utility files.
- Route files (`app/`) contain no business logic — they import a content component and render it.
- Types live in dedicated `.types.ts` files, not scattered across components.
- Magic numbers and strings are replaced with named constants in `constants.ts`.

---

## Domain Organization

Inside each domain folder (`domains/<feature>/`):

| Subfolder | Purpose |
| --------- | ------- |
| `components/` | UI components (smart and presentational) |
| `types/` | TypeScript interfaces and type aliases |
| `constants.ts` | Named constants for the domain |
| `mock/` | Static mock data and data helpers |

The `shared/` folder holds cross-cutting, reusable UI components that are not specific to any single domain.
