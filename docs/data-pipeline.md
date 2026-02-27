# Data Pipeline

CoinSight uses a **Medallion Architecture** (Bronze → Silver → Gold) to ingest, transform, and serve live cryptocurrency data. Raw API responses land in a Bronze table, dbt transforms them through Silver into Gold analytical views, and the .NET API reads from Gold.

---

## Architecture Overview

```
CoinGecko API
    │
    ▼  (every 5 minutes)
scripts/ingest_coins.py
    │
    ▼
Bronze: CoinSightDB.bronze.raw_coin_market
    │  (raw JSON blob + ingestion timestamp)
    │
    ▼  (dbt run — manual from host)
Silver: CoinSightDB.silver.stg_coins
    │  (parsed, typed, validated, deduplicated per coin)
    │
    ▼
Gold:   CoinSightDB.gold.fct_coins          ← primary fact table (materialized)
        CoinSightDB.gold.market_summary     ← aggregate metrics (view)
        CoinSightDB.gold.top_movers         ← top 10 gainers + losers (view)
    │
    ▼
.NET 8 API (DatabaseCoinService)
    │
    ▼
Next.js Frontend
```

---

## Bronze Layer

**Table**: `bronze.raw_coin_market`

**Populated by**: `scripts/ingest_coins.py` (running inside the `ingest` Docker service)

The ingestion script calls the CoinGecko `/coins/markets` endpoint (top 50 coins by market cap, USD) and inserts the entire response as a single JSON blob per run.

| Column | Type | Description |
| --- | --- | --- |
| `id` | int (identity) | Auto-incremented primary key |
| `ingested_at` | datetime2 | UTC timestamp of the insert (default: `GETUTCDATE()`) |
| `source_api` | nvarchar(100) | API source identifier (default: `'coingecko'`) |
| `raw_json` | nvarchar(max) | Full CoinGecko JSON array for all 50 coins |
| `coin_count` | int | Number of coins in the payload (for quick auditing) |

### Application tables

**Table**: `dbo.watchlist`

Stores user watchlist selections. Created by `scripts/init-db.sql` and queried by `DatabaseCoinService`.

| Column | Type | Description |
| --- | --- | --- |
| `id` | uniqueidentifier | Primary key (default: `NEWID()`) |
| `coin_id` | nvarchar(100) | Coin ID (unique constraint — one entry per coin) |
| `added_at` | datetime2 | UTC timestamp when the coin was added (default: `GETUTCDATE()`) |

### Ingestion loop

The `ingest` Docker service runs `/entrypoint.sh`, which executes `ingest_coins.py` immediately on startup and then repeats every 300 seconds:

```
startup → ingest → sleep 300s → ingest → sleep 300s → ...
```

Each run logs its start and completion timestamps to stdout:

```
[2026-02-26T17:44:52Z] Starting ingestion run...
Ingestion successful at 2026-02-26T17:44:53.253831+00:00. Inserted 50 coins.
[2026-02-26T17:44:53Z] Run complete. Sleeping 300 seconds...
```

### Connection string selection

`ingest_coins.py` detects its environment via the `DOCKER_ENV` variable:

| Environment | Hosts tried |
| --- | --- |
| `DOCKER_ENV=true` (Docker) | `sqlserver,1433` |
| Not set (local dev) | `localhost,1433` then `127.0.0.1,1433` |

`COINSIGHT_DB_SERVERS` can override this list entirely for custom deployments.

---

## Silver Layer

**View**: `silver.stg_coins`

**Populated by**: `dbt run` (must be run manually from the host after ingestion)

The Silver layer transforms the raw Bronze JSON into a clean, typed, deduplicated row per coin. It uses SQL Server's `OPENJSON` and `CROSS APPLY` to explode the JSON array, then applies `TRY_CAST` for safe numeric parsing, validates data quality, and picks the most recent row per `coin_id`.

### Transformation steps

1. **Explode** — `CROSS APPLY OPENJSON(raw_json)` turns the JSON array into individual coin rows
2. **Parse** — `JSON_VALUE` + `TRY_CAST` extracts and types each field
3. **Validate** — filters out rows where `coin_id IS NULL`, `current_price <= 0`, or `|price_change_pct| >= 1000`
4. **Deduplicate** — `ROW_NUMBER() OVER (PARTITION BY coin_id ORDER BY ingested_at DESC)` keeps only the most recent snapshot per coin

### Output columns

`coin_id`, `name`, `symbol`, `current_price`, `market_cap`, `total_volume`, `price_change_percentage_24h`, `image_url`, `circulating_supply`, `ath`, `atl`, `ingested_at`

---

## Gold Layer

Gold models are defined in `coin_dbt/models/gold/` and built on top of `stg_coins`.

### `gold.fct_coins` (materialized table)

The primary fact table consumed by the .NET API. Selects and renames Silver columns to match the API's `CoinDto` shape, adds a categorical `price_trend` column, and computes each coin's share of total market cap.

| Added column | Logic |
| --- | --- |
| `price_trend` | `strong_up` / `up` / `stable` / `down` / `strong_down` based on 24h % change |
| `market_dominance_pct` | `market_cap / SUM(market_cap) OVER () * 100` |

Column renames from Silver → Gold:

| Silver | Gold |
| --- | --- |
| `coin_id` | `id` |
| `current_price` | `price` |
| `price_change_percentage_24h` | `change_24h` |
| `total_volume` | `volume_24h` |
| `image_url` | `image` |
| `ath` | `all_time_high` |
| `atl` | `all_time_low` |

### `gold.market_summary` (view)

Aggregate market-level metrics derived from `fct_coins`.

| Column | Description |
| --- | --- |
| `total_coins` | Count of tracked coins |
| `total_market_cap` | Sum of all market caps |
| `total_24h_volume` | Sum of all 24h trading volumes |
| `avg_24h_change_pct` | Mean 24h price change across all coins |
| `coins_up` | Count of coins with positive 24h change |
| `coins_down` | Count of coins with negative 24h change |
| `btc_dominance_pct` | Bitcoin's share of total market cap |

### `gold.top_movers` (view)

Top 10 gainers and top 10 losers from `fct_coins`, ranked by `change_24h`. Each row includes `id`, `symbol`, `name`, `price`, `market_cap`, `change_24h`, `category` (`gainer` / `loser`), and `rank`.

---

## Running dbt

dbt connects to SQL Server on the host machine. A Python virtual environment is required.

```bash
# One-time setup
python -m venv ~/dbt-env
source ~/dbt-env/bin/activate
pip install dbt-sqlserver

# Run dbt (from the project root)
source ~/dbt-env/bin/activate
cd coin_dbt
dbt run
```

`dbt run` rebuilds all three Gold models: `fct_coins` (table), `market_summary` (view), and `top_movers` (view). The API will serve updated data on the next request after `dbt run` completes.

### dbt project structure

```
coin_dbt/
  dbt_project.yml           ← project name: coin_dbt, profile: coin_dbt
  models/
    silver/
      stg_coins.sql         ← view: parse + validate + deduplicate Bronze JSON
      schema.yml            ← column docs + data tests
    gold/
      fct_coins.sql         ← table: business-ready coin rows
      market_summary.sql    ← view: aggregate market metrics
      top_movers.sql        ← view: top 10 gainers + losers
      schema.yml            ← column docs + data tests
    bronze/
      bronze-sources.yml    ← declares bronze.raw_coin_market as a source
```

---

## End-to-End Data Flow

```
1. docker compose up --build
       └─ ingest service starts → first ingestion fires immediately
              → 50 rows inserted into bronze.raw_coin_market

2. source ~/dbt-env/bin/activate && cd coin_dbt && dbt run
       └─ silver.stg_coins view created/replaced
       └─ gold.fct_coins table created/replaced  (50 typed + enriched rows)
       └─ gold.market_summary view created/replaced
       └─ gold.top_movers view created/replaced

3. API requests (GET /api/coins, GET /api/coins/{id}, watchlist endpoints)
       └─ DatabaseCoinService queries gold.fct_coins + dbo.watchlist
       └─ Returns CoinDto[] to Next.js frontend

4. Ingest loop continues: new Bronze row every 5 minutes
       └─ Re-run dbt to refresh Silver + Gold with latest data
```

---

## Environment Variables

| Variable | Where used | Default | Description |
| --- | --- | --- | --- |
| `SA_PASSWORD` | ingest (Python), API (.NET), sqlserver | required | SQL Server SA password |
| `DOCKER_ENV` | ingest (Python) | not set | Set to `true` in Docker to use `sqlserver` hostname |
| `COINSIGHT_DB_DRIVER` | ingest (Python) | `ODBC Driver 18 for SQL Server` | pyodbc driver name |
| `COINSIGHT_DB_NAME` | ingest (Python) | `CoinSightDB` | Target database name |
| `COINSIGHT_DB_USER` | ingest (Python) | `SA` | Database username |
| `COINSIGHT_DB_PASSWORD` | ingest (Python) | falls back to `SA_PASSWORD` | Explicit DB password override |
| `COINSIGHT_DB_ENCRYPT` | ingest (Python) | `yes` | pyodbc `Encrypt` option |
| `COINSIGHT_DB_TRUST_CERT` | ingest (Python) | `yes` | pyodbc `TrustServerCertificate` option |
| `COINSIGHT_DB_SERVERS` | ingest (Python) | auto (see above) | Semicolon-separated `host,port` overrides |
