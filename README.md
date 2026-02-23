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
docker compose up --build
```

Open http://localhost:3000 (frontend) and http://localhost:5000/swagger (API docs)

### Useful commands

```bash
npm run lint
npm run build
npm run start
```

## End-to-end tests (Playwright)

Run the Playwright suite:

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

A comprehensive smoke test script covers all 5 API endpoints (10 tests) and frontend integration (5 browser tests):

```bash
node scripts/full-stack-smoke.mjs
```

Requires both the API (port 5000) and frontend (port 3000) to be running.

## Project shape

- `app/`: route files only (`page.tsx`, `layout.tsx`, route-level `not-found.tsx`)
- `domains/crypto/`: feature logic, UI components, types, and API service layer
- `shared/components/`: reusable cross-feature UI (header, nav, theme primitives)
- `api/`: C# / .NET 8 REST API (controllers, services, models, DTOs)
- `scripts/`: full-stack smoke test
- `docs/`: source-of-truth architecture and implementation notes

## Key constraints

- No external charting, state management, or data-fetching libraries on the frontend
- Frontend fetches all data from the .NET API (no hardcoded mock imports in components)
- Keep route files thin; place logic/state in `domains/` or `shared/`
- API controllers contain no business logic; services handle all data operations

## Documentation map

- `docs/overview.md`
- `docs/folder-structure.md`
- `docs/routing.md`
- `docs/component-hierarchy.md`
- `docs/state-management.md`
- `docs/chart-system.md`
- `docs/data-model.md`
- `docs/theming.md`
- `docs/playwright-testing.md`
- `docs/decisions.md`
- `docs/roadmap.md`
- `docs/api-architecture.md`
- `docs/docker.md`
