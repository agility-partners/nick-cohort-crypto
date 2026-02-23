# CoinSight Overview

CoinSight is a full-stack crypto dashboard built on **Next.js 16 App Router** with **React 19** on the frontend and a **C# / .NET 8 REST API** on the backend. The frontend fetches all data from the API — coin listings, individual coin details, and watchlist state. Both services are containerized with Docker and orchestrated via Docker Compose.

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

### Infrastructure

| Tool | Purpose |
| --- | --- |
| Docker | Multi-stage container builds |
| Docker Compose | Service orchestration (frontend + API) |

---

## Related Docs

| Doc | What it covers |
| --- | -------------- |
| [folder-structure.md](folder-structure.md) | Project layout and naming conventions |
| [routing.md](routing.md) | Route map, layout hierarchy, query params, API proxy rewrite |
| [component-hierarchy.md](component-hierarchy.md) | Render trees for shell, home, and detail pages |
| [state-management.md](state-management.md) | State ownership, API-backed watchlist, sort/view lifecycle |
| [chart-system.md](chart-system.md) | Chart architecture, data generation, SVG layers, interactions |
| [theming.md](theming.md) | Theme toggle flow, CSS custom properties, hydration safety |
| [playwright-testing.md](playwright-testing.md) | E2E setup, commands, suite coverage, and full-stack smoke test |
| [data-model.md](data-model.md) | Data flow from API through frontend, type system, chart data generation |
| [api-architecture.md](api-architecture.md) | .NET 8 API structure, endpoints, DI, CORS, middleware pipeline |
| [docker.md](docker.md) | Dockerfiles, Docker Compose, multi-stage builds, networking |
| [decisions.md](decisions.md) | Key architectural decisions |
| [roadmap.md](roadmap.md) | Known gaps and evolution path |
