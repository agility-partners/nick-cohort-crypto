# Data Model

All data originates from the static `mockCryptos` array in `domains/crypto/mock/cryptos.mock.ts`. There is no fetch lifecycle, caching, or async boundary involved.

---

## Mock Data Source

- **File**: `domains/crypto/mock/cryptos.mock.ts`
- **Export**: `mockCryptos` — a static array of `Crypto` objects
- **Helper**: `getCryptoById(id)` — looks up a single coin by its `id` field

---

## Type System

Domain types live in `domains/crypto/types/`.

- `interface` is used for object shapes and component props.
- `type` is used for unions, intersections, and aliases.
- No `any` is used anywhere in the codebase.

Key types include: `Crypto`, `TimeRange`, `ChartType`, `OHLCDataPoint`, `ViewMode`, and watchlist provider interfaces.

---

## Watchlist Persistence Model

- `use-watchlist.tsx` stores selected coin IDs (`string[]`) as the watchlist source of truth.
- The list is persisted to localStorage under `WATCHLIST_STORAGE_KEY`.
- Duplicate IDs are filtered during updates to keep the dataset stable.

---

## Chart Data Generation

Chart data is derived deterministically from coin properties + time range via a seeded PRNG in `generate-mock-chart-data.ts`. See [chart-system.md](chart-system.md) for full details.

---

## Image Fallback Flow

1. `CryptoLogo` renders `next/image` with the coin's remote URL.
2. On load error, `imgError` state flips → component re-renders with a styled initials avatar.
3. Remote image hosts are allowlisted in `next.config.ts`.
