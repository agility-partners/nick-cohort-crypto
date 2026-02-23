# Docker & Containerization

CoinSight uses Docker to containerize both the Next.js frontend and the .NET 8 API. A `docker-compose.yml` at the repo root orchestrates both services.

---

## Container Overview

| Service | Dockerfile | Base Images | Exposed Port |
| --- | --- | --- | --- |
| `api` | `api/Dockerfile` | `dotnet/sdk:8.0` (build) → `dotnet/aspnet:8.0` (runtime) | 5000 |
| `frontend` | `Dockerfile` (repo root) | `node:20-alpine` (deps, build, run) | 3000 |

Both Dockerfiles use multi-stage builds to keep final images small and exclude build tooling from the production image.

---

## API Dockerfile (`api/Dockerfile`)

```
Stage 1 — build
  Base: dotnet/sdk:8.0
  Steps: restore NuGet packages → copy source → dotnet publish (Release)

Stage 2 — final
  Base: dotnet/aspnet:8.0 (runtime only, no SDK)
  Steps: copy published output → set ASPNETCORE_URLS=http://+:5000 → run CryptoApi.dll
```

The SDK image is roughly 800MB; the runtime image is under 200MB. Multi-stage builds ensure the SDK never ships to production.

---

## Frontend Dockerfile (`Dockerfile`)

```
Stage 1 — deps
  Base: node:20-alpine
  Steps: copy package.json + lockfile → npm ci

Stage 2 — builder
  Base: node:20-alpine
  Steps: copy node_modules from deps → copy source → npm run build
  Env: NEXT_PUBLIC_API_URL passed as build arg (baked into JS bundle)

Stage 3 — runner
  Base: node:20-alpine
  Steps: create non-root user → copy standalone output + static assets → run node server.js
  Env: NODE_ENV=production, PORT=3000
```

Next.js is configured with `output: "standalone"` in `next.config.ts`, which produces a self-contained `server.js` that doesn't need `node_modules` at runtime.

---

## Docker Compose (`docker-compose.yml`)

```yaml
services:
  api:
    build: ./api
    ports: "5000:5000"

  frontend:
    build:
      context: .
      args:
        NEXT_PUBLIC_API_URL: http://api:5000
    environment:
      NEXT_PUBLIC_API_URL: http://api:5000
    ports: "3000:3000"
    depends_on: [api]

networks:
  app-net: bridge
```

Key details:

- Both services share the `app-net` bridge network.
- `NEXT_PUBLIC_API_URL` is passed as both a build arg (for client-side JS bundle) and a runtime env var (for server-side rendering).
- `depends_on` ensures the API container starts before the frontend, though it does not wait for the API to be ready to accept connections.

---

## Docker Networking

Inside the `app-net` network, containers resolve each other by service name. The frontend container reaches the API at `http://api:5000` — not `localhost:5000`. Docker's internal DNS handles the resolution.

From the host machine, both services are accessible via `localhost` through their published port mappings (`localhost:3000` for frontend, `localhost:5000` for API).

---

## Running with Docker Compose

Build and start both services:

```bash
docker compose up --build
```

Stop and remove containers:

```bash
docker compose down
```

Rebuild a single service:

```bash
docker compose build api
docker compose up api
```

---

## Running Containers Individually

API only:

```bash
cd api
docker build -t coinsight-api .
docker run --rm -p 5000:5000 coinsight-api
```

Frontend only (requires API running separately):

```bash
docker build -t coinsight-frontend --build-arg NEXT_PUBLIC_API_URL=http://localhost:5000 .
docker run --rm -p 3000:3000 coinsight-frontend
```

---

## Why Multi-Stage Builds

Multi-stage builds provide two benefits:

1. **Smaller images**: build tools (SDK, npm dev dependencies) are discarded after compilation. Only the runtime artifacts ship.
2. **Security**: fewer packages in the final image means a smaller attack surface. No compilers, no package managers, no source code.
