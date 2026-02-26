# Data Model

All coin data flows from the live data pipeline through the .NET 8 REST API to the Next.js frontend via HTTP. The frontend fetches data through `domains/crypto/services/crypto-api.ts`, which wraps the API endpoints. Chart data is generated client-side using a deterministic seeded PRNG.

---

## Full Data Flow

```
CoinGecko API
  → ingest_coins.py (every 5 min)
    → bronze.raw_coin_market (SQL Server)
      → dbt run (silver.stg_coins → gold.fct_coins)
        → DatabaseCoinService (SELECT FROM gold.fct_coins)
          → CoinDto[] over HTTP
            → crypto-api.ts (fetch wrapper)
              → React components (state + render)
```

The frontend never imports mock data directly into components. All coin and watchlist data comes from the API, which reads from the live Gold layer.

See [data-pipeline.md](data-pipeline.md) for the complete Bronze → Silver → Gold pipeline reference.

---

## API Data Source

The API reads live data from SQL Server:

- **Coins**: `DatabaseCoinService` queries `gold.fct_coins` (built by dbt from ingested CoinGecko data), ordered by market cap descending.
- **Watchlist**: persisted in `dbo.watchlist` (SQL Server table with a unique constraint on `coin_id`). `GetWatchlist()` joins `gold.fct_coins` with `dbo.watchlist`; add/remove operations issue INSERT/DELETE against the table. Data survives API restarts and container rebuilds.
- **Mapping**: `MapReaderToCoinDto()` converts `SqlDataReader` columns to `CoinDto`. Controllers and the frontend never see raw SQL types.

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
- Watchlist state persists across page refreshes, API restarts, and container rebuilds because it is stored in the `dbo.watchlist` SQL Server table.

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
