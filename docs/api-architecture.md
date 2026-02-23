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
    CoinsController.cs       ← GET /api/coins, GET /api/coins/{id}
    WatchlistController.cs   ← GET /api/watchlist, POST /api/watchlist, DELETE /api/watchlist/{coinId}
  Middleware/
    ErrorHandlingMiddleware.cs ← Catches unhandled exceptions, returns consistent JSON errors
  Services/
    ICoinService.cs          ← Interface defining all business logic methods
    CoinService.cs           ← In-memory implementation with 23 seeded coins + ILogger
  Models/
    Coin.cs                  ← Internal domain model (all coin properties)
    WatchlistItem.cs         ← Internal model (Id, CoinId, AddedAt)
  DTOs/
    CoinDto.cs               ← API response shape (matches frontend Crypto type)
    AddWatchlistRequest.cs   ← POST body with [Required] validation on CoinId
    AddToWatchlistResult.cs  ← Internal result type with IsConflict flag
  Program.cs                 ← DI registration, CORS, Swagger, middleware pipeline
  Dockerfile                 ← Multi-stage build (SDK → ASP.NET runtime)
  CryptoApi.csproj           ← Project file targeting net8.0
```

---

## Endpoints

| Method | Route | Success | Failure | Description |
| --- | --- | --- | --- | --- |
| GET | `/api/coins` | 200 + `CoinDto[]` | — | List all 23 coins |
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
        → Service Implementation (CoinService — data access + mapping + logging)
          → Models (internal domain objects)
          → DTOs (external API contracts)
```

Controllers never contain business logic. They call the service and translate the result into an HTTP response. Services never know about HTTP — they return domain objects and result types. Logging is handled at two levels: the service layer logs business operations, and the error handling middleware logs unhandled exceptions.

---

## Dependency Injection

Services are registered in `Program.cs`:

```csharp
builder.Services.AddScoped<ICoinService, CoinService>();
```

`AddScoped` creates one `CoinService` instance per HTTP request. Controllers depend on `ICoinService` (the interface), not `CoinService` (the concrete class). This allows swapping implementations (e.g., database-backed service) by changing one line in `Program.cs`.

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

**Service layer** (`CoinService`): logs all business operations via `ILogger<CoinService>`:

| Operation | Level | Example |
| --- | --- | --- |
| Fetch all coins | Information | `Fetched all coins. Total: 23` |
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

The current implementation uses in-memory data:

- **Coins**: a `static List<Coin>` seeded with 23 cryptocurrencies matching the frontend mock data.
- **Watchlist**: an instance-level `List<WatchlistItem>` that resets per request (scoped lifetime).
- **Mapping**: a private `MapToCoinDto()` method converts internal `Coin` objects to `CoinDto` responses.

This is intentionally simple. The interface-based design means a database-backed implementation can replace `CoinService` without touching any controller code.

---

## Input Validation

The `AddWatchlistRequest` DTO uses Data Annotations:

```csharp
[Required]
public string CoinId { get; set; } = string.Empty;
```

ASP.NET Core automatically returns 400 with validation errors when the `[Required]` constraint is violated. No manual validation code is needed in the controller.
