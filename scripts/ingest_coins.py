import json
import os
from datetime import datetime, timezone

import pyodbc
import requests

COINGECKO_URL = "https://api.coingecko.com/api/v3/coins/markets"
REQUEST_PARAMS = {
    "vs_currency": "usd",
    "order": "market_cap_desc",
    "per_page": 50,
    "page": 1,
    "sparkline": "false",
}

SQL_DRIVER = os.getenv("COINSIGHT_DB_DRIVER", "ODBC Driver 18 for SQL Server")
DB_NAME = os.getenv("COINSIGHT_DB_NAME", "CoinSightDB")
DB_USER = os.getenv("COINSIGHT_DB_USER", "SA")
DB_PASSWORD = os.getenv("COINSIGHT_DB_PASSWORD") or os.getenv("SA_PASSWORD")
DB_ENCRYPT = os.getenv("COINSIGHT_DB_ENCRYPT", "yes")
DB_TRUST_CERT = os.getenv("COINSIGHT_DB_TRUST_CERT", "yes")
SERVER_CANDIDATES = os.getenv(
    "COINSIGHT_DB_SERVERS", "localhost,1433;127.0.0.1,1433"
).split(";")


def fetch_coin_market_data() -> list[dict]:
    response = requests.get(COINGECKO_URL, params=REQUEST_PARAMS, timeout=30)
    response.raise_for_status()

    data = response.json()
    if not isinstance(data, list):
        raise ValueError("Unexpected API response format: expected a list of coins.")

    return data


def insert_raw_payload(raw_json: str, coin_count: int) -> None:
    insert_query = """
        INSERT INTO bronze.raw_coin_market (raw_json, coin_count)
        VALUES (?, ?)
    """

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
            with pyodbc.connect(connection_string, timeout=10) as connection:
                with connection.cursor() as cursor:
                    cursor.execute(insert_query, (raw_json, coin_count))
                connection.commit()
            return
        except pyodbc.Error as error:
            last_error = error

    if last_error is not None:
        raise last_error


def main() -> None:
    try:
        coins = fetch_coin_market_data()
    except requests.exceptions.RequestException as error:
        print(f"API request failed: {error}")
        return
    except ValueError as error:
        print(f"API response error: {error}")
        return

    raw_json = json.dumps(coins)
    coin_count = len(coins)

    try:
        insert_raw_payload(raw_json, coin_count)
    except pyodbc.Error as error:
        print(f"Database connection/insert failed: {error}")
        return
    except ValueError as error:
        print(f"Configuration error: {error}")
        return

    timestamp = datetime.now(timezone.utc).isoformat()
    print(f"Ingestion successful at {timestamp}. Inserted {coin_count} coins.")


if __name__ == "__main__":
    main()
