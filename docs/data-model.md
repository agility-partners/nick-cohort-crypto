# Data Model

All coin data flows from the .NET 8 REST API to the Next.js frontend via HTTP. The frontend fetches data through `domains/crypto/services/crypto-api.ts`, which wraps the API endpoints. Chart data is still generated client-side using a deterministic seeded PRNG.

---

## Data Flow

```
.NET API (CoinService)
  → JSON over HTTP
    → crypto-api.ts (fetch wrapper)
      → React components (state + render)
```

The frontend never imports mock data directly into components. All coin and watchlist data comes from the API.

---

## API Data Source

The API stores coin data in-memory:

- **Coins**: a `static List<Coin>` seeded with 23 cryptocurrencies in `CoinService.cs`.
- **Watchlist**: an instance-level `List<WatchlistItem>` managed per request (scoped DI lifetime).
- **Mapping**: internal `Coin` objects are mapped to `CoinDto` before leaving the service layer. Controllers and the frontend never see the internal model.

---

## Frontend API Client

`domains/crypto/services/crypto-api.ts` provides five functions:

| Function | HTTP Call | Returns |
| --- | --- | --- |
| `fetchAllCoins()` | `GET /api/coins` | `Crypto[]` |
| `fetchCoinById(id)` | `GET /api/coins/{id}` | `Crypto \| null` |
| `fetchWatchlist()` | `GET /api/watchlist` | `Crypto[]` |
| `addToWatchlist(coinId)` | `POST /api/watchlist` | Result with conflict detection |
| `removeFromWatchlist(coinId)` | `DELETE /api/watchlist/{coinId}` | `boolean` |

The client handles SSR vs browser contexts: server-side requests go directly to the API URL (`NEXT_PUBLIC_API_URL`), while browser requests use the `/backend-api` rewrite proxy to avoid CORS.

---

## Type System

Domain types live in `domains/crypto/types/`.

- `interface` is used for object shapes and component props.
- `type` is used for unions, intersections, and aliases.
- No `any` is used anywhere in the codebase.

Key types include: `Crypto`, `TimeRange`, `ChartType`, `OHLCDataPoint`, `ViewMode`, and watchlist provider interfaces.

The frontend `Crypto` interface and the API `CoinDto` class share the same shape (id, name, symbol, price, change24h, marketCap, volume24h, image, circulatingSupply, allTimeHigh, allTimeLow), ensuring type-safe data flow across the stack.

---

## Watchlist Persistence

- The `WatchlistProvider` in `use-watchlist.tsx` fetches the current watchlist from the API on mount.
- Add and remove operations call the API, then update local React state to keep the UI responsive.
- Watchlist state persists across page refreshes because the API maintains it server-side.

---

## Mock Data (Retained)

The original `mockCryptos` array in `domains/crypto/mock/cryptos.mock.ts` is still present in the codebase. It is used for chart data generation via the seeded PRNG in `generate-mock-chart-data.ts`. Components no longer import it directly for coin listings or display.

---

## Chart Data Generation

Chart data is derived deterministically from coin properties + time range via a seeded PRNG in `generate-mock-chart-data.ts`. See [chart-system.md](chart-system.md) for full details.

---

## Image Fallback Flow

1. `CryptoLogo` renders `next/image` with the coin's remote URL.
2. On load error, `imgError` state flips and the component re-renders with a styled initials avatar.
3. Remote image hosts are allowlisted in `next.config.ts`.
