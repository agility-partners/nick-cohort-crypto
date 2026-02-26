# Component Hierarchy

Render trees for each page in the app. See [state-management.md](state-management.md) for which components own state.

---

## App Shell (`app/layout.tsx`)

```
RootLayout
  → ThemeProvider               (dark/light via next-themes)
  → Background blobs            (decorative, aria-hidden)
  → Header                      (shared/components/header.tsx)
      → CoinSightLogo
      → ThemeToggle
  → Navbar                      (shared/components/navbar.tsx, Suspense-wrapped)
  → {children}
```

### Shell render details

1. `Header` renders the brand logo and theme toggle. It does not fetch or compute data.
2. `Navbar` reads `useSearchParams` to highlight the active view tab. Navigation items come from `NAV_ITEMS` in `domains/crypto/constants.ts`.

---

## Home Page (`app/page.tsx`)

```
Home → Suspense
  → HomeContent                 (domains/crypto/components/home-content.tsx)
    → Header actions
      → Sort order toggle   (market views only)
      → Add to watchlist link
      → Watchlist
          → CryptoGrid
              → CryptoCard × N
                  → CryptoLogo  (next/image + fallback)
                  → PriceDisplay
```

## Add Watchlist Page (`app/watchlist/add/page.tsx`)

```
AddToWatchlistPage
  → WatchlistAddContent
    → Multi-select coin list (checkbox grid)
    → Inline validation/error text
    → Submit button (pending state)
    → Cancel link
```

---

## Detail Page (`app/crypto/[id]/page.tsx`)

```
CryptoDetailPage               (server component, force-dynamic, fetches from API)
  → Back link
  → Coin header + PriceDisplay (size="lg")
  → Market metric cards (Market Cap, 24h Volume, 24h Change)
  → ChartSection               (client component)
      → Watchlist toggle        (add/remove star button)
      → Chart-type toggle       (Line / Candle)
      → PriceChart              (interactive SVG)
          → ChartGrid           (axis lines + labels)
          → LineChartLayer       (polyline + gradient fill)
          → CandlestickLayer    (OHLC wicks + bodies)
```
