# CoinSight dbt Project

dbt transforms for the CoinSight crypto dashboard, organized in a **medallion architecture** (Bronze → Silver → Gold). Raw CoinGecko API payloads land in Bronze, get parsed and validated in Silver, then shaped into API-ready tables and views in Gold.

## Models

### Silver (staging)

| Model | Materialization | Description |
|-------|----------------|-------------|
| `stg_coins` | incremental | Parses `bronze.raw_coin_market` JSON payloads into typed columns. Deduplicates by `coin_id`, keeping the most recent ingestion. Incremental — subsequent runs only process new Bronze rows. |

### Gold (presentation)

| Model | Materialization | Description |
|-------|----------------|-------------|
| `fct_coins` | table | Fact table mapping to the .NET API's `CoinDto`. Adds computed columns: `price_trend` (strong_up/up/stable/down/strong_down) and `market_dominance_pct`. |
| `market_summary` | view | Single-row aggregate: total market cap, 24h volume, average change, coins up/down, BTC dominance. Powers the `/api/coins/market-summary` endpoint. |
| `top_movers` | view | Top 10 gainers and top 10 losers ranked by 24h price change. Powers the `/api/coins/top-movers` endpoint. |

## Running Locally

```bash
cd coin_dbt

# Full build
dbt run --profiles-dir profiles

# Run tests
dbt test --profiles-dir profiles

# Both (matches the Docker entrypoint behavior)
dbt run --profiles-dir profiles && dbt test --profiles-dir profiles
```

In Docker, the `dbt-runner` container runs this loop automatically on a configurable interval (`DBT_TRANSFORM_INTERVAL_SECONDS`, default 300s).

## Testing Strategy

Data quality tests are defined in `schema.yml` files per layer:

- **`stg_coins`**: `coin_id` is `not_null` + `unique`, `current_price` is `not_null`
- **`fct_coins`**: `id` is `not_null` + `unique`

Tests run after every `dbt run` in the Docker loop. Failures are logged but don't crash the container.

## Gold → .NET API Connection

The .NET API queries Gold tables/views directly via SQL Server:

- `gold.fct_coins` → `GET /api/coins` (coin list with price, trend, dominance)
- `gold.market_summary` → `GET /api/coins/market-summary`
- `gold.top_movers` → `GET /api/coins/top-movers`

Column names in `fct_coins` are aliased to match `CoinDto` fields (`id`, `price`, `change_24h`, `image`, etc.) so the API can map results directly without transformation.
