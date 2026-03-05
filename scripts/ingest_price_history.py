import argparse
import os
import time
from datetime import datetime, timezone

import pyodbc
import requests

COINGECKO_BASE_URL = "https://api.coingecko.com/api/v3/coins"
COINGECKO_API_KEY = os.getenv("COINGECKO_API_KEY")

SQL_DRIVER = os.getenv("COINSIGHT_DB_DRIVER", "ODBC Driver 18 for SQL Server")
DB_NAME = os.getenv("COINSIGHT_DB_NAME", "CoinSightDB")
DB_USER = os.getenv("COINSIGHT_DB_USER", "SA")
DB_PASSWORD = os.getenv("COINSIGHT_DB_PASSWORD") or os.getenv("SA_PASSWORD")
DB_ENCRYPT = os.getenv("COINSIGHT_DB_ENCRYPT", "yes")
DB_TRUST_CERT = os.getenv("COINSIGHT_DB_TRUST_CERT", "yes")
_default_servers = (
    "sqlserver,1433" if os.getenv("DOCKER_ENV") else "localhost,1433;127.0.0.1,1433"
)
SERVER_CANDIDATES = os.getenv("COINSIGHT_DB_SERVERS", _default_servers).split(";")

RATE_LIMIT_SLEEP = 2.5


def get_connection() -> pyodbc.Connection:
    if not DB_PASSWORD:
        raise ValueError("Missing COINSIGHT_DB_PASSWORD (or SA_PASSWORD) environment variable.")

    base_connection_string = (
        f"DRIVER={{{SQL_DRIVER}}};"
        f"DATABASE={DB_NAME};"
        f"UID={DB_USER};"
        f"PWD={DB_PASSWORD};"
        f"Encrypt={DB_ENCRYPT};"
        f"TrustServerCertificate={DB_TRUST_CERT};"
    )

    last_error: pyodbc.Error | None = None

    for server in SERVER_CANDIDATES:
        connection_string = f"{base_connection_string}SERVER={server.strip()};"
        try:
            return pyodbc.connect(connection_string, timeout=10)
        except pyodbc.Error as error:
            last_error = error

    if last_error is not None:
        raise last_error


def fetch_coin_ids_from_db(connection: pyodbc.Connection) -> list[str]:
    with connection.cursor() as cursor:
        cursor.execute("SELECT id FROM gold.fct_coins ORDER BY id")
        return [row[0] for row in cursor.fetchall()]


def fetch_price_history(coin_id: str, days: int) -> dict:
    url = f"{COINGECKO_BASE_URL}/{coin_id}/market_chart"
    params = {"vs_currency": "usd", "days": days}
    headers = {}
    if COINGECKO_API_KEY:
        headers["x-cg-demo-api-key"] = COINGECKO_API_KEY

    response = requests.get(url, params=params, headers=headers, timeout=30)
    response.raise_for_status()

    data = response.json()
    if not isinstance(data, dict) or "prices" not in data:
        raise ValueError(f"Unexpected API response format for {coin_id}.")

    return data


def upsert_price_data(connection: pyodbc.Connection, coin_id: str, data: dict) -> int:
    prices = data.get("prices", [])
    market_caps = data.get("market_caps", [])
    total_volumes = data.get("total_volumes", [])

    cap_lookup = {int(ts): val for ts, val in market_caps}
    vol_lookup = {int(ts): val for ts, val in total_volumes}

    upsert_query = """
        INSERT INTO bronze.raw_price_history
            (coin_id, timestamp_utc, price, market_cap, total_volume)
        SELECT ?, ?, ?, ?, ?
        WHERE NOT EXISTS (
            SELECT 1 FROM bronze.raw_price_history
            WHERE coin_id = ? AND timestamp_utc = ?
        )
    """

    inserted = 0
    with connection.cursor() as cursor:
        for ts_ms, price in prices:
            ts_ms_int = int(ts_ms)
            timestamp_utc = datetime.fromtimestamp(ts_ms_int / 1000, tz=timezone.utc)
            market_cap = cap_lookup.get(ts_ms_int)
            total_volume = vol_lookup.get(ts_ms_int)

            cursor.execute(
                upsert_query,
                (
                    coin_id, timestamp_utc, price, market_cap, total_volume,
                    coin_id, timestamp_utc,
                ),
            )
            inserted += cursor.rowcount

    connection.commit()
    return inserted


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Ingest CoinGecko price history into bronze.raw_price_history")
    parser.add_argument("--days", type=int, default=365, help="Number of days of history to fetch (default: 365)")
    parser.add_argument("--coins", type=str, default=None, help="Comma-separated coin IDs (default: fetch from gold.fct_coins)")
    return parser.parse_args()


def main() -> None:
    args = parse_args()

    try:
        connection = get_connection()
    except pyodbc.Error as error:
        print(f"Database connection failed: {error}")
        return
    except ValueError as error:
        print(f"Configuration error: {error}")
        return

    if args.coins:
        coin_ids = [c.strip() for c in args.coins.split(",")]
    else:
        try:
            coin_ids = fetch_coin_ids_from_db(connection)
        except pyodbc.Error as error:
            print(f"Failed to fetch coin IDs from gold.fct_coins: {error}")
            connection.close()
            return

    if not coin_ids:
        print("No coins to process.")
        connection.close()
        return

    print(f"Fetching {args.days} days of price history for {len(coin_ids)} coins.")

    total_inserted = 0
    for i, coin_id in enumerate(coin_ids):
        print(f"[{i + 1}/{len(coin_ids)}] Fetching {coin_id}...", end=" ")

        try:
            data = fetch_price_history(coin_id, args.days)
        except requests.exceptions.RequestException as error:
            print(f"API error: {error}")
            if i < len(coin_ids) - 1:
                time.sleep(RATE_LIMIT_SLEEP)
            continue
        except ValueError as error:
            print(f"Response error: {error}")
            if i < len(coin_ids) - 1:
                time.sleep(RATE_LIMIT_SLEEP)
            continue

        try:
            inserted = upsert_price_data(connection, coin_id, data)
        except pyodbc.Error as error:
            print(f"DB insert error: {error}")
            if i < len(coin_ids) - 1:
                time.sleep(RATE_LIMIT_SLEEP)
            continue

        total_inserted += inserted
        data_points = len(data.get("prices", []))
        print(f"{data_points} data points fetched, {inserted} new rows inserted.")

        if i < len(coin_ids) - 1:
            time.sleep(RATE_LIMIT_SLEEP)

    connection.close()

    timestamp = datetime.now(timezone.utc).isoformat()
    print(f"Ingestion complete at {timestamp}. Total new rows inserted: {total_inserted}.")


if __name__ == "__main__":
    main()
