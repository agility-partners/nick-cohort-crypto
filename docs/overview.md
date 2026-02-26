# CoinSight Overview

CoinSight is a full-stack crypto dashboard with a live data pipeline. A Python ingestion service pulls cryptocurrency data from CoinGecko every 5 minutes into SQL Server. dbt transforms the raw data through a medallion architecture (Bronze → Silver → Gold). A **C# / .NET 8 REST API** reads from the Gold layer and serves it to a **Next.js 16 App Router** frontend. All four services run in Docker Compose.

---

## Data Pipeline

```
CoinGecko API
    │  every 5 min (ingest Docker service)
    ▼
Bronze  bronze.raw_coin_market     — raw JSON blob per run
    │  dbt run (manual, from host)
    ▼
Silver  silver.stg_coins           — parsed, validated, deduplicated
    ▼
Gold    gold.fct_coins             — business-ready fact table
        gold.market_summary        — aggregate market metrics
        gold.top_movers            — top 10 gainers + losers
    │
    ▼
.NET 8 API → Next.js frontend
```

See [data-pipeline.md](data-pipeline.md) for the complete pipeline reference.

---

## Tech Stack

### Frontend

| Package                       | Purpose              |
| ----------------------------- | -------------------- |
| `next` 16.1.6                 | Framework & routing  |
| `react` / `react-dom` 19.2.3 | UI library           |
| `next-themes` ^0.4            | Dark/light mode      |
| `tailwindcss` v4              | Utility CSS          |
| `prettier` 3.8.1              | Code formatting      |
| `eslint` 9 + config-next      | Linting              |

No external charting, state management, or data-fetching libraries are used on the frontend.

### Backend

| Component | Detail |
| --- | --- |
| `.NET 8` (ASP.NET Core) | REST API framework |
| `C# 12` | Language |
| Swashbuckle | Swagger / OpenAPI documentation |

### Data pipeline

| Component | Detail |
| --- | --- |
| `Python 3.12` | CoinGecko ingestion script |
| `SQL Server` (azure-sql-edge) | Storage for all three layers |
| `dbt` (`dbt-sqlserver`) | Silver + Gold transformations |
| `pyodbc` + ODBC Driver 18 | Python → SQL Server connectivity |

### Infrastructure

| Tool | Purpose |
| --- | --- |
| Docker | Multi-stage container builds |
| Docker Compose | 4-service orchestration (sqlserver, ingest, api, frontend) |

---

## Related Docs

| Doc | What it covers |
| --- | -------------- |
| [data-pipeline.md](data-pipeline.md) | Medallion architecture, Bronze/Silver/Gold layers, dbt, ingestion loop |
| [folder-structure.md](folder-structure.md) | Project layout and naming conventions |
| [routing.md](routing.md) | Route map, layout hierarchy, query params, API proxy rewrite |
| [component-hierarchy.md](component-hierarchy.md) | Render trees for shell, home, and detail pages |
| [state-management.md](state-management.md) | State ownership, API-backed watchlist, sort/view lifecycle |
| [chart-system.md](chart-system.md) | Chart architecture, data generation, SVG layers, interactions |
| [theming.md](theming.md) | Theme toggle flow, CSS custom properties, hydration safety |
| [playwright-testing.md](playwright-testing.md) | E2E setup, commands, suite coverage, and full-stack smoke test |
| [data-model.md](data-model.md) | Data flow from API through frontend, type system, chart data generation |
| [api-architecture.md](api-architecture.md) | .NET 8 API structure, endpoints, DI, CORS, middleware pipeline |
| [docker.md](docker.md) | Dockerfiles, Docker Compose services map, networking |
| [decisions.md](decisions.md) | Key architectural decisions |
| [roadmap.md](roadmap.md) | Known gaps and evolution path |
