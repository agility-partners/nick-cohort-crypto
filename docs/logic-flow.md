# CoinSight Logic Flow

## Scope

Runtime logic flows for the home (`/`), view navigation, coin detail (`/crypto/[id]`), and theme switching experiences.

## App Shell Render

1. `app/layout.tsx` wraps the page tree in `ThemeProvider` → `Header` → `Navbar` → `{children}`.
2. `Header` computes aggregate stats (total coins, market cap, avg 24h change) from the static `mockCryptos` array at render time.
3. `Navbar` reads `useSearchParams` to highlight the active view tab.

## Home Page — View & Sort Flow

1. `Home` renders `HomeContent` inside `Suspense`.
2. `HomeContent` reads `?view=` from the URL (defaults to `"all"`).
3. `getDefaultSort(view)` determines the natural sort key and direction per view:
   - `all` → `marketCap` desc
   - `gainers` → `change24h` desc
   - `losers` → `change24h` asc
   - `volume` → `volume24h` desc
4. A `useEffect` resets sort state whenever the view changes.
5. `sortCryptos()` produces a sorted copy — base sort is ascending; descending reverses the result.
6. The sorted array flows through `Watchlist` → `CryptoGrid` → `CryptoCard` → `CryptoLogo` + `PriceDisplay`.

### User changes sort key or direction

- `SortControls` emits via callbacks → `HomeContent` state updates → `useMemo` recomputes → grid re-renders.

### User clicks a Navbar tab

- `next/link` navigates to `/?view=<view>` → URL change triggers `HomeContent` to re-read params → `useEffect` resets sort → grid re-renders with new ordering.

## Detail Page — `/crypto/[id]`

1. Server component reads `params.id`, calls `getCryptoById(id)`.
2. If not found → `notFound()` renders `not-found.tsx` with a link home.
3. If found → page renders coin header, market metric cards, and `ChartSection` (a client component receiving `cryptoId`, `symbol`, `price`, and `change24h`).

### ChartSection — Time-Range & Chart-Type Controls

1. `ChartSection` owns two pieces of state: `timeRange` (default `"7D"`) and `chartType` (default `"line"`).
2. When `timeRange` or coin props change, a `useMemo` calls `generateMockData()` which:
   a. Uses a seeded PRNG derived from the coin ID **plus** the selected time range, producing a unique but deterministic series per combination.
   b. Generates close-price values with range-specific point counts (24 for 1D … 60 for ALL) and volatility.
   c. Derives OHLC data from the close prices for candlestick rendering.
   d. Formats date labels with range-appropriate `Intl.DateTimeFormat` options.
3. The pill-bar buttons update `timeRange` state → triggers re-memo → `PriceChart` re-renders with new data.
4. The Line/Candle toggle buttons update `chartType` state → `PriceChart` switches rendering mode.

### PriceChart — Line Mode Hover Interaction

1. `onMouseMove` maps the cursor's x-position to the nearest data point index.
2. A crosshair line and tooltip (price + date label) render at that point.
3. Tooltip flips sides when near the chart edge to avoid clipping.
4. `onMouseLeave` clears the active index.

### PriceChart — Candlestick Mode Hover Interaction

1. `onMouseMove` calculates which candle column the cursor falls within based on the candle step width.
2. A dashed crosshair line and a semi-transparent highlight band render over the active candle.
3. The tooltip displays four labelled rows — Open, High, Low, Close — color-coded with `--candle-up` (green) and `--candle-down` (red) variables, plus the date.
4. Tooltip repositions to avoid clipping at chart edges, same as line mode.
5. `onMouseLeave` clears the active index.

## Theme Toggle Flow

1. User clicks `ThemeToggle` → `setTheme()` from `next-themes` toggles between `"dark"` and `"light"`.
2. `next-themes` updates the `class` attribute on `<html>` and persists the choice in localStorage.
3. CSS custom properties swap via the `.dark` selector in `globals.css`, updating all themed surfaces.
4. `ThemeToggle` defers icon rendering until after mount to avoid hydration mismatch.

## Image Fallback Flow

1. `CryptoLogo` renders `next/image` with the coin's remote URL.
2. On load error, `imgError` state flips → component re-renders with a styled initials avatar.

## State Ownership

| Owner | State | Scope |
|---|---|---|
| `HomeContent` | `sortKey`, `sortDirection` | derived from active view, user-adjustable |
| `CryptoLogo` | `imgError` | local UI fallback |
| `ChartSection` | `timeRange`, `chartType` | time-range selector (1D–ALL) and line/candlestick toggle |
| `PriceChart` | `activeIndex` | hover tooltip tracking |
| `ThemeProvider` | theme (`dark`/`light`) | global, persisted in localStorage by `next-themes` |

## Data Flow

All data originates from the static `mockCryptos` array. There is no fetch lifecycle, caching, or async boundary involved.