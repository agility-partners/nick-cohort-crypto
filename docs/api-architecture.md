# API Architecture

CoinSight's backend is a C# / .NET 8 REST API that serves coin data and manages watchlist state. It lives in the `api/` folder alongside the Next.js frontend.

---

## Tech Stack

| Component | Detail |
| --- | --- |
| Runtime | .NET 8 (ASP.NET Core) |
| Language | C# 12 |
| API style | REST with controller-based routing |
| Documentation | Swagger / OpenAPI via Swashbuckle |
| Containerization | Docker (multi-stage build) |

---

## Project Structure

```
api/
  Controllers/
    CoinsController.cs         ← GET /api/coins, GET /api/coins/{id}
    WatchlistController.cs     ← GET /api/watchlist, POST /api/watchlist, DELETE /api/watchlist/{coinId}
  Middleware/
    ErrorHandlingMiddleware.cs ← Catches unhandled exceptions, returns consistent JSON errors
  Services/
    ICoinService.cs            ← Interface defining all business logic methods
    CoinService.cs             ← In-memory implementation (24 seeded coins, used by integration tests)
    DatabaseCoinService.cs     ← Live implementation — queries gold.fct_coins + dbo.watchlist via SqlConnection
  Models/
    Coin.cs                    ← Internal domain model (all coin properties)
    WatchlistItem.cs           ← Internal model (Id, CoinId, AddedAt)
  DTOs/
    CoinDto.cs                 ← API response shape (matches frontend Crypto type)
    AddWatchlistRequest.cs     ← POST body with [Required] validation on CoinId
    AddToWatchlistResult.cs    ← Internal result type with IsConflict flag
  Program.cs                   ← DI registration, CORS, Swagger, middleware pipeline
  Dockerfile                   ← Multi-stage build (SDK → ASP.NET runtime)
  CryptoApi.csproj             ← Project file targeting net8.0

api-tests/
  CoinSightApiFactory.cs     ← Custom WebApplicationFactory (Singleton DI + suppressed logging)
  CoinsEndpointTests.cs      ← 5 tests for coin endpoints
  WatchlistEndpointTests.cs  ← 8 tests for watchlist endpoints
  ErrorHandlingTests.cs      ← 2 tests for error response formats
  CryptoApi.Tests.csproj     ← Test project (xUnit, Microsoft.AspNetCore.Mvc.Testing)
```

---

## Endpoints

| Method | Route | Success | Failure | Description |
| --- | --- | --- | --- | --- |
| GET | `/api/coins` | 200 + `CoinDto[]` | — | List all coins from `gold.fct_coins` |
| GET | `/api/coins/{id}` | 200 + `CoinDto` | 404 | Get single coin by ID |
| GET | `/api/watchlist` | 200 + `CoinDto[]` | — | List watchlisted coins |
| POST | `/api/watchlist` | 201 + `CoinDto` | 400 (validation), 404 (coin not found), 409 (duplicate) | Add coin to watchlist |
| DELETE | `/api/watchlist/{coinId}` | 204 | 404 (not in watchlist) | Remove coin from watchlist |

---

## Layered Architecture

```
HTTP Request
  → Middleware Pipeline (Error handling → HTTPS redirect → CORS → Routing)
    → Controller (HTTP concerns only: status codes, ActionResult)
      → Service Interface (ICoinService — business logic contract)
        → Service Implementation (CoinService or DatabaseCoinService — data access + mapping + logging)
          → Models (internal domain objects)
          → DTOs (external API contracts)
```

Controllers never contain business logic. They call the service and translate the result into an HTTP response. Services never know about HTTP — they return domain objects and result types. Logging is handled at two levels: the service layer logs business operations, and the error handling middleware logs unhandled exceptions.

---

## Dependency Injection

Services are registered in `Program.cs` with a conditional swap:

```csharp
var coinSightDbConnectionString = builder.Configuration.GetConnectionString("CoinSightDb");
if (string.IsNullOrWhiteSpace(coinSightDbConnectionString))
    builder.Services.AddScoped<ICoinService, CoinService>();
else
    builder.Services.AddScoped<ICoinService, DatabaseCoinService>();
```

When a `CoinSightDb` connection string is present (Docker / production), the API uses `DatabaseCoinService` which queries SQL Server. Without it (local dev, integration tests), it falls back to the in-memory `CoinService`. Controllers depend on `ICoinService` (the interface) and are unaware of which implementation is active.

---

## CORS Configuration

The API allows cross-origin requests from the Next.js frontend:

```csharp
policy.WithOrigins("http://localhost:3000")
      .AllowAnyHeader()
      .AllowAnyMethod();
```

In practice, the frontend uses a Next.js rewrite proxy (`/backend-api → API`), so browser requests appear same-origin. CORS is still configured for direct API access during development and for server-side rendering requests.

---

## Middleware Pipeline Order

```csharp
app.UseMiddleware<ErrorHandlingMiddleware>(); // 1. Catch unhandled exceptions → JSON error response
app.UseHttpsRedirection();                    // 2. Redirect HTTP → HTTPS
app.UseCors(FrontendCorsPolicy);             // 3. Handle CORS preflight before routing
app.MapControllers();                         // 4. Route to controller actions
```

Order matters: the error handling middleware runs first so it wraps everything downstream — any exception thrown during CORS, routing, or controller execution is caught and converted to a consistent JSON response. CORS must run before routing so that `OPTIONS` preflight requests are answered before they reach controllers.

---

## Error Handling

`ErrorHandlingMiddleware` catches all unhandled exceptions in the pipeline. On error it:

1. Generates a `requestId` (GUID) for correlation
2. Logs the exception at `Error` level with the request path and ID
3. Returns a JSON response with status 500:
   ```json
   { "error": "An error occurred processing your request.", "requestId": "..." }
   ```
4. In Development only: includes a `message` field with exception details

This ensures clients always receive JSON (never HTML stack traces) and that every error is logged with a traceable ID.

---

## Logging

The API uses ASP.NET Core's built-in `ILogger<T>` — no external packages.

**Service layer**: Both `CoinService` and `DatabaseCoinService` log business operations via `ILogger<T>`:

| Operation | Level | Example |
| --- | --- | --- |
| Fetch all coins | Information | `Fetched all coins. Total: 24` |
| Retrieve coin by ID | Information | `Retrieved coin: bitcoin` |
| Coin not found | Warning | `Coin not found: fakecoin` |
| Add to watchlist | Information | `Coin added to watchlist: bitcoin` |
| Watchlist duplicate | Warning | `Add to watchlist conflict — already exists: bitcoin` |
| Watchlist coin missing | Warning | `Add to watchlist failed — coin not found: fakecoin` |
| Remove from watchlist | Information | `Coin removed from watchlist: bitcoin` |
| Remove not found | Warning | `Remove from watchlist failed — not found: bitcoin` |

**Middleware** (`ErrorHandlingMiddleware`): logs unhandled exceptions at `Error` level with the request path and correlation ID.

Log levels follow ASP.NET Core conventions: `Information` for successful operations, `Warning` for expected business failures (404, 409), `Error` for unhandled exceptions.

---

## Data Layer

The API has two `ICoinService` implementations registered in `Program.cs`:

**`DatabaseCoinService`** (active in production / Docker):
- Queries `gold.fct_coins` via `SqlConnection` using `Microsoft.Data.SqlClient`
- Connection string is injected via the `ConnectionStrings__CoinSightDb` environment variable in `docker-compose.yml`; locally it comes from `appsettings.Development.json`
- Returns live data ingested by the Python service and transformed by dbt
- Watchlist is persisted in `dbo.watchlist` (SQL Server table) — survives API restarts and container rebuilds
- `GetWatchlist()` joins `gold.fct_coins` with `dbo.watchlist`; `AddToWatchlist()` and `RemoveFromWatchlist()` issue INSERT/DELETE against `dbo.watchlist`

**`CoinService`** (used by integration tests):
- Static `List<Coin>` seeded with 24 cryptocurrencies
- No database dependency — allows tests to run without Docker or SQL Server

The interface-based design (`ICoinService`) means swapping implementations requires only changing one line in `Program.cs`.

### SQL queries

**`GetAllCoins`** — list all coins:

```sql
SELECT id, name, symbol, price, change_24h, market_cap, volume_24h,
       image, circulating_supply, all_time_high, all_time_low
FROM gold.fct_coins
ORDER BY market_cap DESC
```

**`GetWatchlist`** — list watchlisted coins (joins fact table with watchlist):

```sql
SELECT c.id, c.name, c.symbol, c.price, c.change_24h, c.market_cap,
       c.volume_24h, c.image, c.circulating_supply, c.all_time_high, c.all_time_low
FROM gold.fct_coins c
INNER JOIN dbo.watchlist w ON c.id = w.coin_id
ORDER BY w.added_at DESC
```

---

## Input Validation

The `AddWatchlistRequest` DTO uses Data Annotations:

```csharp
[Required]
public string CoinId { get; set; } = string.Empty;
```

ASP.NET Core automatically returns 400 with validation errors when the `[Required]` constraint is violated. No manual validation code is needed in the controller.

---

## Integration Tests

The `api-tests/` project uses xUnit with `WebApplicationFactory<Program>` to spin up the API in-memory — no network, no Docker required. Tests send real HTTP requests through the full middleware pipeline, making them true integration tests.

**Test project**: `api-tests/CryptoApi.Tests.csproj` references the API project and includes xUnit, `Microsoft.AspNetCore.Mvc.Testing`, and the test SDK.

**Program access**: `Program.cs` includes `public partial class Program { }` so `WebApplicationFactory<Program>` can reference the entry-point class from the test assembly.

**Custom factory**: `CoinSightApiFactory` overrides `ConfigureWebHost` to re-register `ICoinService` as `Singleton` instead of `Scoped`. This is needed because the in-memory watchlist lives on the `CoinService` instance — with `Scoped` lifetime, each HTTP request gets a fresh empty watchlist, which breaks multi-step test flows (add → verify duplicate, add → delete). Each test creates its own factory so tests don't leak state between each other.

**Test coverage** (15 tests total):

| File | Tests | What it covers |
| --- | --- | --- |
| `CoinsEndpointTests.cs` | 5 | GET all coins (count, DTO shape), GET by ID (valid, invalid, case-insensitive) |
| `WatchlistEndpointTests.cs` | 8 | Empty list, add (201 + location header), invalid coin (404), empty body (400), duplicate (409), remove (204), remove not-in-list (404) |
| `ErrorHandlingTests.cs` | 2 | Unknown route returns 404 (not HTML), invalid JSON body returns 400 as `application/problem+json` |

**Run tests**: `dotnet test` from the `api-tests/` directory (or the project root if a solution file exists).
