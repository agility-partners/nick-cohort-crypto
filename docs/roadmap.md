# Roadmap

## Completed

- API / data-service abstraction layer (.NET 8 REST API with 5 endpoints)
- Frontend wired to API (crypto-api.ts service layer replaces direct mock imports)
- Watchlist persistence via API (replaced localStorage-based approach)
- Docker containerization (multi-stage builds for API and frontend)
- Docker Compose orchestration (single command runs all 4 services)
- Full-stack smoke test (scripts/full-stack-smoke.mjs — 10 API + 5 browser tests)
- Error handling middleware (centralized exception handling with JSON responses and requestId correlation)
- Structured logging (ILogger<T> at service and middleware layers)
- xUnit integration tests (15 tests covering all endpoints, error handling, and DTO shape validation)
- SQL Server backend (azure-sql-edge, persistent volume, Bronze schema)
- Python ingestion service (CoinGecko → bronze.raw_coin_market, Dockerized with 5-min loop)
- dbt transformation layer (silver.stg_coins → gold.fct_coins, market_summary, top_movers)
- DatabaseCoinService (live API reads from gold.fct_coins via SqlConnection)
- 4-service Docker Compose (sqlserver + ingest + api + frontend, all on app-net)
- Watchlist persisted to SQL Server (`dbo.watchlist` table) — survives API restarts and container rebuilds

---

## Known Gaps

- Sort/view state not persisted across sessions (theme is persisted by `next-themes` via localStorage)
- No authentication or user-specific watchlists
- No health check endpoint for Docker readiness probes (sqlserver ready before ingest/api connect)
- dbt must be run manually from the host; no automated trigger after each ingestion cycle
- No CI/CD pipeline

---

## Evolution Path

1. Add a Docker service or cron job to run `dbt run` automatically after each ingestion cycle
2. Add health check endpoint (`/health`) and Docker `healthcheck` + `depends_on: condition: service_healthy` for proper startup ordering
3. Replace mock price series in charts with real historical data (CoinGecko `/coins/{id}/market_chart`)
4. Add authentication to support per-user watchlists
5. Persist view/sort preferences in URL params or localStorage
6. Set up CI/CD pipeline (GitHub Actions for lint, test, build, and Docker image push)
