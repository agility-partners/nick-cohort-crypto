# Roadmap

## Completed

- API / data-service abstraction layer (.NET 8 REST API with 5 endpoints)
- Frontend wired to API (crypto-api.ts service layer replaces direct mock imports)
- Watchlist persistence via API (replaced localStorage-based approach)
- Docker containerization (multi-stage builds for both services)
- Docker Compose orchestration (single command to run the full stack)
- Full-stack smoke test (scripts/full-stack-smoke.mjs — 10 API + 5 browser tests)
- Error handling middleware (centralized exception handling with JSON responses and requestId correlation)
- Structured logging (ILogger<T> at service and middleware layers)
- xUnit integration tests (15 tests covering all endpoints, error handling, and DTO shape validation)

---

## Known Gaps

- Watchlist state resets between API restarts (in-memory storage, no database)
- Sort/view state not persisted across sessions (theme is persisted by `next-themes` via localStorage)
- Chart time-range and type selections reset on navigation
- No authentication or user-specific watchlists
- No health check endpoint for Docker readiness probes
- No CI/CD pipeline

---

## Evolution Path

1. Add a database backend (PostgreSQL via Entity Framework Core) to persist watchlist state across API restarts
2. Add health check endpoint (`/health`) for Docker and orchestrator readiness probes
3. Add runtime data refresh (polling, revalidation, or streaming) for live price updates
4. Replace mock price series with real historical data (CoinGecko or similar API)
5. Add authentication to support per-user watchlists
6. Persist view/sort preferences in URL params or localStorage
7. Set up CI/CD pipeline (GitHub Actions for lint, test, build, and Docker image push)
