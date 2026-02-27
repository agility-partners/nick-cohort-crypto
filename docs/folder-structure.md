# Folder Structure

The codebase follows a **domain-based folder architecture** with strict separation of concerns. The project is split into a Next.js frontend, a .NET 8 API backend, a Python ingestion service, and a dbt transformation layer — all orchestrated by Docker Compose.

---

## Layout

```
api/                              ← C# / .NET 8 REST API
  Controllers/
    CoinsController.cs            ← GET /api/coins, GET /api/coins/{id}
    WatchlistController.cs        ← GET /api/watchlist, POST /api/watchlist, DELETE /api/watchlist/{coinId}
  Middleware/
    ErrorHandlingMiddleware.cs    ← Catches unhandled exceptions, returns JSON errors
  Services/
    ICoinService.cs               ← Business logic interface
    CoinService.cs                ← In-memory implementation (24 seeded coins, used by integration tests)
    DatabaseCoinService.cs        ← Live implementation — queries gold.fct_coins + dbo.watchlist via SqlConnection
  Models/
    Coin.cs                       ← Internal domain model
    WatchlistItem.cs              ← Watchlist entry (Id, CoinId, AddedAt)
  DTOs/
    CoinDto.cs                    ← API response shape (matches frontend Crypto type)
    AddWatchlistRequest.cs        ← POST body with [Required] validation
    AddToWatchlistResult.cs       ← Internal result with conflict flag
  Program.cs                      ← DI, CORS, Swagger, middleware pipeline
  Dockerfile                      ← Multi-stage build (SDK → runtime)
  CryptoApi.csproj                ← .NET project file

api-tests/                        ← xUnit integration tests
  CoinSightApiFactory.cs          ← Custom WebApplicationFactory (Singleton DI for stateful tests)
  CoinsEndpointTests.cs           ← 5 tests: list all, DTO shape, get by ID, 404, case-insensitive
  WatchlistEndpointTests.cs       ← 8 tests: empty list, add, location header, 404, 400, 409, delete, delete-not-found
  ErrorHandlingTests.cs           ← 2 tests: unknown route 404, invalid JSON 400
  CryptoApi.Tests.csproj          ← Test project (xUnit, Microsoft.AspNetCore.Mvc.Testing)

app/                              ← Routing only (thin wrappers)
  layout.tsx                      ← Root shell: ThemeProvider, Header, Navbar
  page.tsx                        ← Home route → Suspense → HomeContent
  watchlist/add/
    page.tsx                      ← Add-to-watchlist route wrapper
    loading.tsx                   ← Route-level loading skeleton
    error.tsx                     ← Route-level error boundary UI
  crypto/[id]/
    page.tsx                      ← Detail route (server component, force-dynamic)
    not-found.tsx                 ← 404 fallback for unknown coin IDs

domains/crypto/                   ← Feature domain
  services/
    crypto-api.ts                 ← API client (fetchAllCoins, fetchCoinById, watchlist operations)
  hooks/
    use-watchlist.tsx             ← Watchlist state provider + hook (API-backed)
    use-compare-list.ts           ← Compare list state (localStorage, max 3 assets)
  types/
    crypto.types.ts               ← Core domain model types (Crypto, TimeRange, ChartType, etc.)
    watchlist.types.ts            ← Watchlist provider interfaces
    compare.types.ts              ← Compare list interfaces
  constants.ts                    ← Named constants (view modes, chart dims, storage keys)
  mock/cryptos.mock.ts            ← Static mock data (retained for chart data generation)
  components/
    home-content.tsx              ← Smart component: view/order state, fetches coins from API
    watchlist-add-content.tsx     ← Add-form UI with validation/loading/error states
    watchlist.tsx                 ← Presentational: section wrapper for grid
    crypto-grid.tsx               ← Presentational: responsive card grid
    crypto-card.tsx               ← Presentational: single coin card
    crypto-logo.tsx               ← next/image with fallback initials
    crypto-detail-watchlist-toggle.tsx ← Add/remove watchlist button on detail page
    price-display.tsx             ← Formatted price + change badge
    chart-section.tsx             ← Smart component: chart-type state (all-time trend)
    chart-config.ts               ← Chart range configs and label mappings
    generate-mock-chart-data.ts   ← Seeded PRNG mock data generator
    chart-helpers.ts              ← Pure geometry/coordinate/tooltip utilities
    price-chart.tsx               ← Interactive SVG chart (delegates to layers)
    chart-grid.tsx                ← SVG grid lines + axis labels
    line-chart-layer.tsx          ← SVG polyline + gradient fill layer
    candlestick-layer.tsx         ← SVG OHLC wick + body layer
    compare-mode.tsx              ← Compare mode UI logic
    compare-selector.tsx          ← Selector dropdown for compare coins
    compare-chart.tsx             ← Multi-coin comparison chart

shared/                           ← Cross-cutting reusable components
  components/
    header.tsx                    ← Brand logo and theme toggle
    stat-chip.tsx                 ← Reusable stat badge
    navbar.tsx                    ← View-mode tab navigation (watchlist tab is data-aware)
    theme-provider.tsx            ← next-themes wrapper
    theme-toggle.tsx              ← Dark/light toggle button
    coin-sight-logo.tsx           ← SVG brand logo

scripts/
  ingest_coins.py                ← CoinGecko → bronze.raw_coin_market ingestion
  init-db.sql                    ← Creates CoinSightDB, Bronze schema, and watchlist table
  Dockerfile.ingest              ← python:3.12-slim + ODBC Driver 18 + loop entrypoint
  requirements.txt               ← Python dependencies (requests, pyodbc)
  full-stack-smoke.mjs           ← End-to-end smoke test (API + browser)

coin_dbt/                         ← dbt transformation project
  dbt_project.yml                ← Project config (profile: coin_dbt)
  models/
    bronze/
      bronze-sources.yml         ← Declares bronze.raw_coin_market as a source
    silver/
      stg_coins.sql              ← View: parse + validate + deduplicate Bronze JSON
      schema.yml                 ← Column docs + data tests
    gold/
      fct_coins.sql              ← Table: business-ready coin rows
      market_summary.sql         ← View: aggregate market metrics
      top_movers.sql             ← View: top 10 gainers + losers
      schema.yml                 ← Column docs + data tests

e2e/                              ← Playwright E2E tests
  home-navigation.spec.ts        ← Home page tabs, sort, search tests
  watchlist-flow.spec.ts         ← Add/remove watchlist tests
  crypto-detail.spec.ts          ← Detail page and chart interaction tests
  state-resilience.spec.ts       ← State persistence tests
  utils/test-logging.ts          ← E2E logging utilities

docs/                             ← Architecture and implementation documentation

Dockerfile                        ← Frontend multi-stage build (deps → build → standalone)
docker-compose.yml                ← Orchestrates all 4 services (sqlserver, ingest, api, frontend)
```

---

## Conventions

- All frontend files use **kebab-case** naming (e.g., `price-chart.tsx`, not `PriceChart.tsx`).
- API files use **PascalCase** per C# conventions (e.g., `CoinsController.cs`).
- One component per file. Components stay under **150 lines**; complex logic is extracted into `.ts` utility files.
- Route files (`app/`) contain no business logic — they import a content component and render it.
- Types live in dedicated `.types.ts` files, not scattered across components.
- Magic numbers and strings are replaced with named constants in `constants.ts`.

---

## Domain Organization

Inside each domain folder (`domains/<feature>/`):

| Subfolder | Purpose |
| --------- | ------- |
| `components/` | UI components (smart and presentational) |
| `services/` | API client functions |
| `hooks/` | React hooks and context providers |
| `types/` | TypeScript interfaces and type aliases |
| `constants.ts` | Named constants for the domain |
| `mock/` | Static mock data (used for chart data generation) |

The `shared/` folder holds cross-cutting, reusable UI components that are not specific to any single domain.

---

## API Organization

Inside `api/`:

| Folder | Purpose |
| --- | --- |
| `Controllers/` | HTTP layer — routes requests, returns status codes |
| `Middleware/` | Cross-cutting concerns — error handling |
| `Services/` | Business logic — interface + implementation + logging |
| `Models/` | Internal domain objects (not exposed to API consumers) |
| `DTOs/` | API contracts — request/response shapes |
