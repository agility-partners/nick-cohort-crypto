# Architectural Decisions

Key decisions made in CoinSight and the reasoning behind them.

---

## Frontend Decisions

| Decision | Detail |
| --- | --- |
| **Folder structure** | Domain-based: `domains/<feature>/`, `shared/`, `app/` (routing only). No flat `src/` dump. |
| **Type system** | Domain model types are centralized in `domains/crypto/types/`. `interface` is used for props/object shapes, `type` for unions/aliases. No `any`. |
| **Theming** | `next-themes` with class-based switching; dual CSS custom-property palettes in `globals.css` (`:root` light, `.dark` dark); includes `--candle-up` / `--candle-down` for chart colors. |
| **View modes** | URL-driven via `?view=` param. Top tabs expose `watchlist` (only when populated), `all`, and `compare`. |
| **Sorting** | Home uses a simple high/low order toggle for market views; watchlist is always alphabetical by coin name. |
| **Form UX states** | Add-to-watchlist form includes validation, submit pending feedback, and inline error messaging. |
| **Route states** | `app/watchlist/add` includes route-level `loading.tsx` and `error.tsx` boundaries for resilient UX. |
| **Charts** | `ChartSection` manages state; `generate-mock-chart-data.ts` produces deterministic data via seeded PRNG; `chart-helpers.ts` handles geometry; `PriceChart` orchestrates SVG rendering via `ChartGrid`, `LineChartLayer`, and `CandlestickLayer`. No charting library. |
| **Image handling** | `CryptoLogo` wraps `next/image` with fallback initials on error; remote hosts allowlisted in `next.config.ts`. |
| **Hydration safety** | `Suspense` wraps `useSearchParams` consumers; `suppressHydrationWarning` is set on `<html>`; `ThemeToggle` uses `useSyncExternalStore` client detection to avoid hydration mismatch. |
| **Code quality** | Prettier (semi, double quotes, 2-space indent, 100 print width) + ESLint with `eslint-config-next` and `eslint-config-prettier`. |

## API & Integration Decisions

| Decision | Detail |
| --- | --- |
| **Separate API project** | The .NET 8 API lives in `api/` as a sibling to the frontend, not embedded as Next.js API routes. This enforces a clear backend boundary and allows independent deployment. |
| **Interface-based DI** | Controllers depend on `ICoinService`, not `CoinService`. Enables swapping implementations (e.g., in-memory → database) by changing one line in `Program.cs`. |
| **DTOs over models** | The API exposes `CoinDto` to consumers, not the internal `Coin` model. Mapping happens in the service layer. This decouples the API contract from internal data structures. |
| **Scoped DI lifetime** | `ICoinService` is registered as `AddScoped` — one instance per HTTP request. `Program.cs` conditionally selects `DatabaseCoinService` (when a connection string is present) or `CoinService` (fallback for local dev / tests). |
| **CORS + rewrite proxy** | CORS is configured on the API for direct access. The frontend also uses a Next.js rewrite (`/backend-api → API`) so browser requests appear same-origin, avoiding CORS for client-side fetches. |
| **force-dynamic detail pages** | Detail pages (`/crypto/[id]`) use `export const dynamic = "force-dynamic"` instead of `generateStaticParams()`. Pages are server-rendered on each request to reflect current API state. |
| **API-backed watchlist** | Watchlist state moved from localStorage to API calls. The `WatchlistProvider` fetches on mount and syncs local React state with POST/DELETE responses for immediate UI updates. In production, `DatabaseCoinService` persists watchlist entries in `dbo.watchlist` (SQL Server table with a unique constraint on `coin_id`), so data survives API restarts and container rebuilds. |
| **Data Annotations for validation** | `[Required]` on `AddWatchlistRequest.CoinId` lets ASP.NET Core return 400 automatically. No manual validation code in controllers. |
| **Correct HTTP status codes** | 200 (success), 201 with `CreatedAtAction` (created), 204 (deleted), 400 (validation), 404 (not found), 409 (duplicate watchlist entry). |
| **RESTful route naming** | Nouns, plural: `/api/coins`, `/api/watchlist`. No verbs in routes. |
| **Centralized error handling** | Custom `ErrorHandlingMiddleware` catches unhandled exceptions and returns consistent JSON with a `requestId` for correlation. In Development, includes exception details; in Production, generic message only. Runs first in the pipeline so it wraps everything downstream. |
| **Built-in logging only** | Uses ASP.NET Core's `ILogger<T>` — no external packages (Serilog, NLog). Both `CoinService` and `DatabaseCoinService` log business operations at Information/Warning level; middleware logs exceptions at Error level. Structured log parameters (e.g., `{CoinId}`) for machine-readable output. |
| **Integration tests over unit tests** | Tests use `WebApplicationFactory<Program>` to spin up the full API in-memory. This tests the real middleware pipeline, routing, DI, and serialization — catching issues that isolated unit tests would miss. |
| **Custom test factory for stateful tests** | `CoinSightApiFactory` re-registers `CoinService` as Singleton so watchlist state persists across requests within a single test. Production stays Scoped. Each test creates its own factory for isolation. |
| **`public partial class Program`** | Top-level statements generate an implicit `Program` class that's `internal` by default. The `partial` declaration makes it `public` so the test project can reference it via `WebApplicationFactory<Program>`. |

## Docker Decisions

| Decision | Detail |
| --- | --- |
| **Multi-stage builds** | Both Dockerfiles use multi-stage builds to separate build tools from runtime images. Reduces image size and attack surface. |
| **Docker Compose orchestration** | A single `docker-compose.yml` runs all four services (sqlserver, ingest, api, frontend) on a shared bridge network. Services resolve each other by name (e.g., `http://api:5000`). |
| **Standalone Next.js output** | `next.config.ts` sets `output: "standalone"` to produce a self-contained `server.js` that runs without `node_modules`. |
| **Build arg + env var for API URL** | `NEXT_PUBLIC_API_URL` is passed as both a Docker build arg (baked into the JS bundle at build time) and a runtime env var (for server-side rendering). |
