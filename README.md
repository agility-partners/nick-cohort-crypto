# CoinSight

CoinSight is a full-stack crypto dashboard with a Next.js 16 frontend and a C# / .NET 8 REST API backend. The frontend displays coin data, charts, and a user-managed watchlist. The backend serves coin data and persists watchlist state through 5 REST endpoints. Both services are containerized with Docker and orchestrated via Docker Compose.

## What this project is

- Full-stack crypto dashboard: Next.js frontend + .NET 8 API
- Strongly typed across both layers (TypeScript frontend, C# backend)
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

### Infrastructure

- Docker (multi-stage builds)
- Docker Compose

## Run locally

### Frontend + API (no Docker)

Prerequisites: Node.js 20+, npm 10+, .NET 8 SDK

```bash
# Terminal 1 — start the API
cd api
dotnet run

# Terminal 2 — start the frontend
npm install
npm run dev
```

Open http://localhost:3000 (frontend) and http://localhost:5000/swagger (API docs)

### With Docker Compose

Prerequisites: Docker

```bash
cp .env.example .env
docker compose up --build
```

Open http://localhost:3000 (frontend) and http://localhost:5000/swagger (API docs)

### Useful commands

```bash
npm run lint
npm run build
npm run start
```

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
```

Additional modes:

```bash
npm run test:e2e:headed
npm run test:e2e:ui
npm run test:e2e:debug
```

After running, open the HTML report:

```bash
npx playwright show-report
```

### Full-stack smoke test

Covers all 5 API endpoints (10 tests) and frontend integration (5 browser tests). Requires both the API (port 5000) and frontend (port 3000) to be running.

```bash
node scripts/full-stack-smoke.mjs
```

### SQL ingestion script (CoinGecko -> SQL Server)

Prerequisites: Python 3.10+, running SQL Server container on `localhost:1433`

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r scripts/requirements.txt
export COINSIGHT_DB_PASSWORD="your-sa-password"
python3 scripts/ingest_coins.py
```

## Project shape

- `app/`: route files only (`page.tsx`, `layout.tsx`, route-level `not-found.tsx`)
- `domains/crypto/`: feature logic, UI components, types, and API service layer
- `shared/components/`: reusable cross-feature UI (header, nav, theme primitives)
- `api/`: C# / .NET 8 REST API (controllers, services, models, DTOs)
- `scripts/`: smoke test and SQL ingestion utilities
- `docs/`: source-of-truth architecture and implementation notes

## Key constraints

- No external charting, state management, or data-fetching libraries on the frontend
- Frontend fetches all data from the .NET API (no hardcoded mock imports in components)
- Keep route files thin; place logic/state in `domains/` or `shared/`
- API controllers contain no business logic; services handle all data operations

## Documentation map

| Doc | What it covers |
| --- | --- |
| [overview.md](docs/overview.md) | Tech stack, high-level architecture, and links to all other docs |
| [folder-structure.md](docs/folder-structure.md) | Project layout, naming conventions, domain organization |
| [routing.md](docs/routing.md) | Route map, layout hierarchy, API proxy rewrite, query-param navigation |
| [component-hierarchy.md](docs/component-hierarchy.md) | Render trees for shell, home, and detail pages |
| [state-management.md](docs/state-management.md) | State ownership, API-backed watchlist, sort/view lifecycle |
| [chart-system.md](docs/chart-system.md) | Chart architecture, seeded PRNG data generation, SVG layers |
| [data-model.md](docs/data-model.md) | Data flow from API to frontend, type system, image fallbacks |
| [theming.md](docs/theming.md) | Theme toggle flow, CSS custom properties, hydration safety |
| [api-architecture.md](docs/api-architecture.md) | .NET 8 API structure, endpoints, DI, CORS, middleware, logging, tests |
| [docker.md](docs/docker.md) | Dockerfiles, Docker Compose, multi-stage builds, networking |
| [playwright-testing.md](docs/playwright-testing.md) | E2E setup, commands, suite coverage, full-stack smoke test |
| [decisions.md](docs/decisions.md) | Key architectural decisions and reasoning |
| [roadmap.md](docs/roadmap.md) | Completed work, known gaps, and evolution path |
