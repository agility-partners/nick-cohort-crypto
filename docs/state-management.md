# State Management

State is owned by the nearest component that needs it. CoinSight uses local component state plus a small domain provider for watchlist persistence; no external global-state library is used.

---

## State Ownership

| Owner | State | Scope |
| ----- | ----- | ----- |
| `WatchlistProvider` | `watchlistIds` | Domain-level watchlist selection, shared across routes and persisted to localStorage |
| `HomeContent` | `sortOrder` (`asc`/`desc`) | User-adjustable on market views; watchlist ignores this and stays alphabetical |
| `WatchlistAddContent` | `selectedIds`, `formError`, `isPending` | Form selection, validation feedback, and submit transition state |
| `CryptoLogo` | `imgError` | Local UI fallback |
| `ChartSection` | `timeRange`, `chartType` | Time-range selector (1D–ALL) and line/candlestick toggle |
| `PriceChart` | `activeIndex` | Hover tooltip tracking |
| `ThemeProvider` | theme (`dark`/`light`) | Global, persisted in localStorage by `next-themes` |

---

## Home Page — View & Order Flow

1. `app/page.tsx` renders `HomeContent` inside `<Suspense>` — the route file contains zero logic.
2. `HomeContent` reads `?view=` and resolves a default view:
   - `watchlist` when watchlist has data
   - `all` when watchlist is empty
3. Tab visibility is data-aware: `watchlist` tab is hidden until at least one coin has been added.
4. Ordering rules:
   - `watchlist` → always alphabetical by coin name
   - `all`, `gainers`, `volume` → high/low toggle controls direction
5. Final list flows through `Watchlist` → `CryptoGrid` → `CryptoCard`.

### User clicks a Navbar tab

`next/link` navigates to `/?view=<view>` → URL change triggers `HomeContent` to re-read params → list recalculates and grid re-renders.

### User adds coins to watchlist

`HomeContent` → `Add to watchlist` link → `app/watchlist/add/page.tsx` → form submit updates `WatchlistProvider` → route transitions back to `/?view=watchlist`.

The provider de-duplicates IDs and persists them in localStorage for refresh-safe continuity.

---

## Detail Page

1. `app/crypto/[id]/page.tsx` is a **server component** that resolves `params.id` and calls `getCryptoById(id)`.
2. If not found → `notFound()` renders `not-found.tsx` with a link home.
3. If found → renders coin header, market metric cards, and `ChartSection` (client component) with `cryptoId`, `symbol`, `price`, and `change24h` as props.

---

## Design Principles

- Use `useState` / `useReducer` for local component state.
- Keep state as close to where it's used as possible.
- Derive values with `useMemo` instead of storing computed data in state.
- Lift state up only when sibling components need to share it.
- Add explicit validation/loading/error states for form-based interactions.
