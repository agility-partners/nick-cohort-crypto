import json
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

BASE_CONNECTION_STRING = (
    "DRIVER={ODBC Driver 18 for SQL Server};"
    "DATABASE=CoinSightDB;"
    "UID=sa;"
    "PWD=CoinSight_Dev123!;"
    "Encrypt=yes;"
    "TrustServerCertificate=yes;"
)
SERVER_CANDIDATES = ["localhost,1433", "127.0.0.1,1433"]


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

    last_error: pyodbc.Error | None = None

    for server in SERVER_CANDIDATES:
        connection_string = f"{BASE_CONNECTION_STRING}SERVER={server};"
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

    timestamp = datetime.now(timezone.utc).isoformat()
    print(f"Ingestion successful at {timestamp}. Inserted {coin_count} coins.")


if __name__ == "__main__":
    main()
