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
3. If found → `createMockSeries(crypto)` generates a deterministic 7-day price series using a seeded PRNG derived from the coin ID.
4. Page renders coin header, market metric cards, and `PriceChart` with the mock series.

### PriceChart hover interaction

1. `onMouseMove` maps the cursor's x-position to the nearest data point index.
2. A crosshair line and tooltip (price + date label) render at that point.
3. Tooltip flips sides when near the chart edge to avoid clipping.
4. `onMouseLeave` clears the active index.

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
| `PriceChart` | `activeIndex` | hover tooltip tracking |
| `ThemeProvider` | theme (`dark`/`light`) | global, persisted in localStorage by `next-themes` |

## Data Flow

All data originates from the static `mockCryptos` array. There is no fetch lifecycle, caching, or async boundary involved.