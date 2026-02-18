# State Management

All state is local to the owning component. No global state library is used. State is lifted only to the nearest common parent when siblings need shared data.

---

## State Ownership

| Owner | State | Scope |
| ----- | ----- | ----- |
| `HomeContent` | `sortKey`, `sortDirection` | Derived from active view, user-adjustable via `SortControls` |
| `CryptoLogo` | `imgError` | Local UI fallback |
| `ChartSection` | `timeRange`, `chartType` | Time-range selector (1D–ALL) and line/candlestick toggle |
| `PriceChart` | `activeIndex` | Hover tooltip tracking |
| `ThemeProvider` | theme (`dark`/`light`) | Global, persisted in localStorage by `next-themes` |

---

## Home Page — View & Sort Flow

1. `app/page.tsx` renders `HomeContent` inside `<Suspense>` — the route file contains zero logic.
2. `HomeContent` reads `?view=` from the URL (defaults to `"all"`).
3. `getDefaultSort(view)` determines the natural sort key and direction per view:
   - `all` → `marketCap` desc
   - `gainers` → `change24h` desc
   - `losers` → `change24h` asc
   - `volume` → `volume24h` desc
4. A `useEffect` resets sort state whenever the view changes.
5. `sortCryptos()` produces a sorted copy via `useMemo` — base sort is ascending; descending reverses.
6. The sorted array flows: `Watchlist` → `CryptoGrid` → `CryptoCard`.

### User changes sort key or direction

`SortControls` emits via callbacks → `HomeContent` state updates → `useMemo` recomputes → grid re-renders.

### User clicks a Navbar tab

`next/link` navigates to `/?view=<view>` → URL change triggers `HomeContent` to re-read params → `useEffect` resets sort → grid re-renders with new ordering.

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
