"""Wait for SQL Server to be ready, then execute init-db.sql."""

import os
import re
import sys
import time

import pyodbc

SQL_DRIVER = os.getenv("COINSIGHT_DB_DRIVER", "ODBC Driver 18 for SQL Server")
DB_USER = os.getenv("COINSIGHT_DB_USER", "SA")
DB_PASSWORD = os.getenv("SA_PASSWORD")
DB_SERVER = os.getenv("COINSIGHT_DB_SERVER", "sqlserver,1433")
DB_ENCRYPT = os.getenv("COINSIGHT_DB_ENCRYPT", "yes")
DB_TRUST_CERT = os.getenv("COINSIGHT_DB_TRUST_CERT", "yes")

MAX_RETRIES = int(os.getenv("DB_INIT_MAX_RETRIES", "30"))
RETRY_INTERVAL = int(os.getenv("DB_INIT_RETRY_INTERVAL", "2"))

SQL_FILE = os.getenv("SQL_INIT_FILE", "/app/init-db.sql")

CONNECTION_STRING = (
    f"DRIVER={{{SQL_DRIVER}}};"
    f"SERVER={DB_SERVER};"
    f"UID={DB_USER};"
    f"PWD={DB_PASSWORD};"
    f"Encrypt={DB_ENCRYPT};"
    f"TrustServerCertificate={DB_TRUST_CERT};"
)


def wait_for_sql_server() -> pyodbc.Connection:
    """Retry connecting to SQL Server until it's ready."""
    for attempt in range(1, MAX_RETRIES + 1):
        try:
            conn = pyodbc.connect(CONNECTION_STRING, timeout=5, autocommit=True)
            print(f"Connected to SQL Server on attempt {attempt}.")
            return conn
        except pyodbc.Error as exc:
            print(f"Attempt {attempt}/{MAX_RETRIES}: SQL Server not ready — {exc}")
            time.sleep(RETRY_INTERVAL)

    print("Could not connect to SQL Server after max retries. Exiting.")
    sys.exit(1)


def execute_sql_file(conn: pyodbc.Connection, path: str) -> None:
    """Read a SQL file and execute each GO-delimited batch."""
    with open(path) as f:
        sql = f.read()

    # Split on GO statements that appear on their own line
    batches = re.split(r"^\s*GO\s*$", sql, flags=re.MULTILINE | re.IGNORECASE)

    cursor = conn.cursor()
    for i, batch in enumerate(batches, 1):
        batch = batch.strip()
        if not batch:
            continue
        try:
            cursor.execute(batch)
            print(f"  Batch {i} executed successfully.")
        except pyodbc.Error as exc:
            print(f"  Batch {i} failed: {exc}")
            sys.exit(1)
    cursor.close()


def main() -> None:
    if not DB_PASSWORD:
        print("SA_PASSWORD environment variable is required.")
        sys.exit(1)

    print(f"Waiting for SQL Server at {DB_SERVER}...")
    conn = wait_for_sql_server()

    print(f"Running SQL init script: {SQL_FILE}")
    execute_sql_file(conn, SQL_FILE)
    conn.close()

    print("Database initialization complete.")


if __name__ == "__main__":
    main()
