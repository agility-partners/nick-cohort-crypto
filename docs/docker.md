# Docker & Containerization

CoinSight containerizes all four services — SQL Server, the Python ingestion loop, the .NET 8 API, and the Next.js frontend — in a single `docker-compose.yml` at the repo root.

---

## Container Overview

| Service | Dockerfile | Base Image(s) | Exposed Port | Restart |
| --- | --- | --- | --- | --- |
| `sqlserver` | (official image) | `mcr.microsoft.com/azure-sql-edge` | 1433 | — |
| `ingest` | `scripts/Dockerfile.ingest` | `python:3.12-slim` | — | `unless-stopped` |
| `api` | `api/Dockerfile` | `dotnet/sdk:8.0` → `dotnet/aspnet:8.0` | 5000 | — |
| `frontend` | `Dockerfile` (repo root) | `node:20-alpine` (3 stages) | 3000 | — |

The API and frontend Dockerfiles use multi-stage builds to keep final images small. The ingest Dockerfile is single-stage.

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

## Ingest Dockerfile (`scripts/Dockerfile.ingest`)

```
Base: python:3.12-slim (Debian 12 / bookworm)

Step 1 — install Microsoft ODBC Driver 18:
  - curl Microsoft GPG key → /usr/share/keyrings/microsoft-prod.gpg
  - curl Debian 12 package list → /etc/apt/sources.list.d/mssql-release.list
  - ACCEPT_EULA=Y apt-get install msodbcsql18 unixodbc-dev

Step 2 — app:
  WORKDIR /app
  COPY ingest_coins.py
  pip install requests pyodbc

Step 3 — entrypoint:
  Write /entrypoint.sh (loop: ingest immediately → log → sleep 300 → repeat)
  chmod +x /entrypoint.sh
  ENTRYPOINT ["/entrypoint.sh"]
```

The container runs forever: it executes `ingest_coins.py` on startup, logs the timestamp, sleeps 5 minutes, and repeats. The `restart: unless-stopped` policy ensures the loop resumes automatically if the container exits unexpectedly.

---

## Docker Compose (`docker-compose.yml`)

```yaml
services:
  sqlserver:
    image: mcr.microsoft.com/azure-sql-edge:latest
    ports: "1433:1433"
    environment:
      SA_PASSWORD: ${SA_PASSWORD}
      ACCEPT_EULA: ${ACCEPT_EULA:-Y}
    volumes: sqlserver-data:/var/opt/mssql
    networks: [app-net]

  ingest:
    build:
      context: ./scripts
      dockerfile: Dockerfile.ingest
    depends_on: [sqlserver]
    environment:
      SA_PASSWORD: ${SA_PASSWORD}
      DOCKER_ENV: "true"
    restart: unless-stopped
    networks: [app-net]

  api:
    build: ./api
    ports: "5000:5000"
    depends_on: [sqlserver]
    environment:
      ConnectionStrings__CoinSightDb: "Server=sqlserver,1433;Database=CoinSightDB;User Id=SA;Password=${SA_PASSWORD};..."
    networks: [app-net]

  frontend:
    build:
      context: .
      args:
        NEXT_PUBLIC_API_URL: http://api:5000
    environment:
      NEXT_PUBLIC_API_URL: http://api:5000
    ports: "3000:3000"
    depends_on: [api]
    networks: [app-net]

networks:
  app-net:
    driver: bridge

volumes:
  sqlserver-data:
```

Key details:

- All services share the `app-net` bridge network and resolve each other by service name.
- `DOCKER_ENV=true` tells `ingest_coins.py` to connect to `sqlserver,1433` instead of `localhost`.
- `SA_PASSWORD` is forwarded from the host `.env` file to `sqlserver`, `ingest`, and `api` (via the connection string).
- `ConnectionStrings__CoinSightDb` tells the API to use `DatabaseCoinService` (live SQL) instead of the in-memory fallback.
- `NEXT_PUBLIC_API_URL` is passed as both a build arg (baked into the Next.js JS bundle) and a runtime env var (for SSR requests).
- `depends_on` controls start order but does not wait for services to be ready.

---

## Docker Networking

Inside `app-net`, containers resolve each other by service name:

- `ingest` connects to SQL Server at `sqlserver,1433`
- `api` connects to SQL Server at `Server=sqlserver,1433` (via `ConnectionStrings__CoinSightDb` environment variable in `docker-compose.yml`)
- `frontend` reaches the API at `http://api:5000`

From the host machine, services are accessible through their published port mappings:

| Service | Host URL |
| --- | --- |
| Frontend | http://localhost:3000 |
| API | http://localhost:5000 |
| Swagger | http://localhost:5000/swagger |
| SQL Server | localhost:1433 |

---

## Running with Docker Compose

Build and start all four services:

```bash
docker compose up --build
```

Stop and remove containers:

```bash
docker compose down
```

View ingest loop output:

```bash
docker compose logs ingest
docker compose logs -f ingest   # follow
```

Rebuild a single service:

```bash
docker compose build ingest
docker compose up ingest
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
