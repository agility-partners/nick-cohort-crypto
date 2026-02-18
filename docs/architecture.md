# CoinSight Architecture

## Overview

CoinSight is a client-driven crypto dashboard built on Next.js App Router. All data comes from a static in-repo module (`src/data/mockCryptos.ts`) — there is no backend, API route, or persistence layer. This keeps the runtime deterministic while the UI is developed.

## Component Hierarchy

### App Shell (`app/layout.tsx`)

```
RootLayout
→ ThemeProvider          (dark / light via next-themes)
→ background blobs
→ Header                 (brand logo, market snapshot stats, ThemeToggle)
→ Navbar                 (view-mode tabs, Suspense-wrapped)
→ {children}
```

### Home Page (`app/page.tsx`)

```
Home → Suspense
  → HomeContent          (reads ?view= param, owns sort state)
    → SortControls
    → Watchlist → CryptoGrid → CryptoCard
                              → CryptoLogo
                              → PriceDisplay
```

### Detail Page (`app/crypto/[id]/page.tsx`)

```
CryptoDetailPage
→ back link
→ coin header + PriceDisplay (lg)
→ market metrics (market cap, volume, 24h change)
→ ChartSection            (client; owns time-range & chart-type state)
  → time-range pill bar   (1D, 7D, 30D, 90D, 1Y, ALL)
  → chart-type toggle     (Line / Candle)
  → PriceChart            (interactive SVG; line or candlestick mode)
```

## Key Architectural Decisions

| Decision | Detail |
|---|---|
| **Data source** | Static `mockCryptos` array with `Crypto` interface and `getCryptoById()` helper |
| **Theming** | `next-themes` with class-based switching; dual CSS custom-property palettes in `globals.css` (`:root` light, `.dark` dark); includes `--candle-up` / `--candle-down` variables for candlestick chart colors |
| **View modes** | URL-driven via `?view=` param — `all`, `gainers`, `losers`, `volume`; each view sets a default sort key/direction |
| **Sorting** | Pure `sortCryptos()` fn, memoized; keys: `name`, `price`, `change24h`, `marketCap`, `volume24h` |
| **Charts** | `ChartSection` (client) manages time-range and chart-type state; generates mock data via seeded PRNG per coin + range. `PriceChart` renders either a line chart (gradient fill + polyline) or a candlestick chart (OHLC wicks + bodies) as pure SVG — no charting library |
| **Image handling** | `CryptoLogo` wraps `next/image` with fallback initials on error; allowed remote hosts configured in `next.config.ts` |
| **Hydration safety** | `Suspense` around `useSearchParams` consumers; `suppressHydrationWarning` on `<html>` for theme class injection; `ThemeToggle` defers render until mounted |

## Dependencies

| Package | Purpose |
|---|---|
| `next` 16.1.6 | Framework & routing |
| `react` / `react-dom` 19.2.3 | UI library |
| `next-themes` 0.4.x | Dark/light mode |
| `tailwindcss` v4 | Utility CSS |

No external charting library is used.

## Known Gaps

- No API / data-service abstraction
- No test harness
- Sort and view state are not persisted (theme is persisted by `next-themes` via localStorage)
- Chart time-range and type selections are not persisted across navigation

## Evolution Path

1. Introduce a data gateway with static and API adapters
2. Add test coverage for sorting, view logic, and rendering
3. Add runtime data refresh (polling, revalidation, or streaming)
4. Replace mock price series with real historical data
5. Persist view/sort preferences in URL params or local storage