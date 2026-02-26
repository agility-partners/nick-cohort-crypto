# CoinSight

CoinSight is a full-stack crypto dashboard with a live data pipeline. A Python ingestion service pulls from CoinGecko every 5 minutes into SQL Server, dbt transforms the raw data through a medallion architecture (Bronze → Silver → Gold), a .NET 8 REST API reads from the Gold layer, and a Next.js 16 frontend displays the results. Every layer runs in Docker Compose.

## What this project is

- Full-stack crypto dashboard: Next.js frontend + .NET 8 API
- Live data pipeline: Python ingest → SQL Server → dbt → API → frontend
- Medallion architecture: Bronze (raw JSON) → Silver (parsed/validated) → Gold (analytical)
- Strongly typed across all layers (TypeScript frontend, C# backend)
- App Router routes with domain-based feature organization
- REST API with controller-service-model architecture and interface-based DI
- Theme-aware UI using Tailwind v4 + `next-themes`
- Dockerized with multi-stage builds and Docker Compose

## Tech stack

### Frontend

- `next` 16.1.6
- `react` / `react-dom` 19.2.3
- `typescript` 5
- `tailwindcss` v4
- `next-themes` ^0.4
- `eslint` 9 (`eslint-config-next`)
- `prettier` 3.8.1

### Backend

- `.NET 8` (ASP.NET Core Web API)
- `C# 12`
- Swagger / OpenAPI (Swashbuckle)

### Data pipeline

- `Python 3.12` — CoinGecko ingestion script (`scripts/ingest_coins.py`)
- `SQL Server` — storage (via `mcr.microsoft.com/azure-sql-edge`)
- `dbt` (`dbt-sqlserver`) — Silver and Gold transformations (`coin_dbt/`)
- `pyodbc` + ODBC Driver 18 for SQL Server — database connectivity

### Infrastructure

- Docker (multi-stage builds)
- Docker Compose (4 services: `sqlserver`, `ingest`, `api`, `frontend`)

---

## Medallion architecture

```
CoinGecko API
    │  every 5 min (ingest Docker service)
    ▼
Bronze  bronze.raw_coin_market     — raw JSON blob per run
    │  dbt run (manual, from host)
    ▼
Silver  silver.stg_coins           — parsed, validated, deduplicated
    ▼
Gold    gold.fct_coins             — business-ready fact table (table)
        gold.market_summary        — aggregate market metrics (view)
        gold.top_movers            — top 10 gainers + losers (view)
    │
    ▼
.NET API  GET /api/coins  →  Next.js frontend
```

See [docs/data-pipeline.md](docs/data-pipeline.md) for the full pipeline reference.

---

## Run the full stack

### Prerequisites

- Docker Desktop

### Steps

```bash
# 1. Copy and fill in environment variables
cp .env.example .env
# Edit .env — set SA_PASSWORD (must meet SQL Server complexity requirements)

# 2. Start all four services (sqlserver, ingest, api, frontend)
docker compose up --build
```

The `ingest` service fires its first ingestion immediately. You will see in its logs:

```
[2026-02-26T17:44:52Z] Starting ingestion run...
Ingestion successful at 2026-02-26T17:44:53.253831+00:00. Inserted 50 coins.
[2026-02-26T17:44:53Z] Run complete. Sleeping 300 seconds...
```

### Run dbt to populate Silver and Gold

dbt runs from the host machine (not in Docker). Set it up once:

```bash
python -m venv ~/dbt-env
source ~/dbt-env/bin/activate
pip install dbt-sqlserver
```

After ingestion has run at least once:

```bash
source ~/dbt-env/bin/activate
cd coin_dbt
dbt run
```

This builds `silver.stg_coins`, `gold.fct_coins`, `gold.market_summary`, and `gold.top_movers`. The API serves from `gold.fct_coins` — re-run `dbt run` any time you want to refresh Silver and Gold with the latest Bronze data.

### Verify

| URL | What you should see |
| --- | --- |
| http://localhost:3000 | Frontend displaying live coin data |
| http://localhost:5000/api/coins | JSON array of coins from `gold.fct_coins` |
| http://localhost:5000/swagger | Swagger UI with all 5 endpoints |

---

## Run locally (no Docker)

### Frontend + API

Prerequisites: Node.js 20+, .NET 8 SDK

```bash
# Terminal 1 — API
cd api
dotnet run

# Terminal 2 — frontend
npm install
npm run dev
```

### Ingestion script (local)

Prerequisites: Python 3.10+, ODBC Driver 18 for SQL Server, SQL Server on `localhost:1433`

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt
export COINSIGHT_DB_PASSWORD="your-sa-password"
python3 scripts/ingest_coins.py
```

### Useful commands

```bash
npm run lint
npm run build
npm run start
docker compose down        # stop and remove containers
docker compose logs ingest # view ingest service output
docker compose logs -f api # tail API logs
```

---

## Tests

### API integration tests (xUnit)

15 tests covering all endpoints, error handling, and DTO shape validation. Runs in-memory via `WebApplicationFactory` — no Docker or running server needed.

```bash
cd api-tests
dotnet test
```

### End-to-end tests (Playwright)

```bash
npm run test:e2e
npm run test:e2e:headed
npm run test:e2e:ui
npm run test:e2e:debug
npx playwright show-report
```

### Full-stack smoke test

Covers all 5 API endpoints (10 tests) and frontend integration (5 browser tests). Requires both the API (port 5000) and frontend (port 3000) to be running.

```bash
node scripts/full-stack-smoke.mjs
```

---

## Project shape

```
app/                         — Next.js route files (page.tsx, layout.tsx)
domains/crypto/              — feature logic, UI components, types, API service
shared/components/           — reusable cross-feature UI (header, nav, theme)
api/                         — C# / .NET 8 REST API (controllers, services, DTOs)
  Services/
    DatabaseCoinService.cs   — reads from gold.fct_coins via SqlConnection
scripts/
  ingest_coins.py            — CoinGecko → bronze.raw_coin_market
  Dockerfile.ingest          — python:3.12-slim + ODBC Driver 18 + loop entrypoint
coin_dbt/
  models/silver/stg_coins.sql    — parse + validate + deduplicate Bronze JSON
  models/gold/fct_coins.sql      — business-ready fact table
  models/gold/market_summary.sql — aggregate market metrics
  models/gold/top_movers.sql     — top 10 gainers + losers
docs/                        — source-of-truth architecture and implementation notes
```

## Key constraints

- No external charting, state management, or data-fetching libraries on the frontend
- Frontend fetches all data from the .NET API (no hardcoded mock imports in components)
- Keep route files thin; place logic/state in `domains/` or `shared/`
- API controllers contain no business logic; services handle all data operations

---

## Documentation map

| Doc | What it covers |
| --- | --- |
| [overview.md](docs/overview.md) | Tech stack, high-level architecture, and links to all other docs |
| [data-pipeline.md](docs/data-pipeline.md) | Medallion architecture, Bronze/Silver/Gold layers, dbt, ingestion loop |
| [folder-structure.md](docs/folder-structure.md) | Project layout, naming conventions, domain organization |
| [routing.md](docs/routing.md) | Route map, layout hierarchy, API proxy rewrite, query-param navigation |
| [component-hierarchy.md](docs/component-hierarchy.md) | Render trees for shell, home, and detail pages |
| [state-management.md](docs/state-management.md) | State ownership, API-backed watchlist, sort/view lifecycle |
| [chart-system.md](docs/chart-system.md) | Chart architecture, seeded PRNG data generation, SVG layers |
| [data-model.md](docs/data-model.md) | Data flow from API to frontend, type system, image fallbacks |
| [theming.md](docs/theming.md) | Theme toggle flow, CSS custom properties, hydration safety |
| [api-architecture.md](docs/api-architecture.md) | .NET 8 API structure, endpoints, DI, CORS, middleware, logging, tests |
| [docker.md](docs/docker.md) | Dockerfiles, Docker Compose services map, networking |
| [playwright-testing.md](docs/playwright-testing.md) | E2E setup, commands, suite coverage, full-stack smoke test |
| [decisions.md](docs/decisions.md) | Key architectural decisions and reasoning |
| [roadmap.md](docs/roadmap.md) | Completed work, known gaps, and evolution path |
