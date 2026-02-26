# State Management

State is owned by the nearest component that needs it. CoinSight uses local component state plus a domain-level provider for watchlist persistence. The watchlist provider is backed by API calls to the .NET backend; no external global-state library is used.

---

## State Ownership

| Owner | State | Scope |
| ----- | ----- | ----- |
| `WatchlistProvider` | `watchlistIds` | Domain-level watchlist selection, shared across routes. Fetched from and persisted to the .NET API. |
| `HomeContent` | `allCryptos` | All coins fetched from the API on mount |
| `HomeContent` | `sortOrder` (`asc`/`desc`), `allCoinsSortBy`, `searchQuery` | User-adjustable on market views; watchlist ignores sort and stays alphabetical |
| `WatchlistAddContent` | `selectedIds`, `formError`, `isPending` | Form selection, validation feedback, and submit transition state |
| `CryptoLogo` | `imgError` | Local UI fallback |
| `ChartSection` | `chartType` | Line/candlestick toggle (chart always shows all-time trend) |
| `PriceChart` | `activeIndex` | Hover tooltip tracking |
| `ThemeProvider` | theme (`dark`/`light`) | Global, persisted in localStorage by `next-themes` |

---

## Watchlist — API-Backed State

The watchlist provider (`use-watchlist.tsx`) has been rewired from localStorage to API calls:

1. **On mount**: `useEffect` calls `fetchWatchlist()` from `crypto-api.ts` and populates `watchlistIds` state.
2. **Add coin**: calls `addToWatchlist(coinId)` via the API, then updates local state on success. The API handles duplicate detection (409) and missing coin validation (404).
3. **Remove coin**: calls `removeFromWatchlist(coinId)` via the API, then removes the ID from local state on success.
4. **Bulk add**: `addManyToWatchlist` calls `addToWatchlist` for each ID in parallel using `Promise.all`.

Local React state is kept in sync with the API to ensure the UI updates immediately without waiting for a re-fetch.

---

## Home Page — Data & View Flow

1. `app/page.tsx` renders `HomeContent` inside `<Suspense>` — the route file contains zero logic.
2. `HomeContent` fetches all coins from the API on mount via `fetchAllCoins()` and stores them in `allCryptos` state.
3. It reads `?view=` and resolves a default view:
   - `watchlist` when watchlist has data
   - `all` when watchlist is empty
4. Tab visibility is data-aware: `watchlist` tab is hidden until at least one coin has been added.
5. Ordering rules:
   - `watchlist` → always alphabetical by coin name
   - `all`, `gainers`, `volume` → high/low toggle controls direction
6. Final list flows through `Watchlist` → `CryptoGrid` → `CryptoCard`.

### User clicks a Navbar tab

`next/link` navigates to `/?view=<view>` → URL change triggers `HomeContent` to re-read params → list recalculates and grid re-renders.

### User adds coins to watchlist

`HomeContent` → `Add to watchlist` link → `app/watchlist/add/page.tsx` → form submit calls API via `WatchlistProvider` → route transitions back to `/?view=watchlist`.

---

## Detail Page

1. `app/crypto/[id]/page.tsx` is a **server component** with `export const dynamic = "force-dynamic"`.
2. It calls `fetchCoinById(id)` from `crypto-api.ts`, which fetches from the .NET API.
3. If not found → `notFound()` renders `not-found.tsx` with a link home.
4. If found → renders coin header, market metric cards, and `ChartSection` (client component) with `cryptoId`, `symbol`, `price`, and `change24h` as props.

---

## Design Principles

- Use `useState` / `useReducer` for local component state.
- Keep state as close to where it's used as possible.
- Derive values with `useMemo` instead of storing computed data in state.
- Lift state up only when sibling components need to share it.
- Add explicit validation/loading/error states for form-based interactions.
- Sync local state with API responses to keep the UI responsive while maintaining server-side persistence.
