import os
import time
import sys

import psycopg2


def build_dsn():
    database_url = os.environ.get("DATABASE_URL")
    if database_url:
        # Allow enforcing SSL via env
        if os.environ.get("DB_SSL_REQUIRE", "False").lower() in {"1", "true", "yes"} and "sslmode" not in database_url:
            # Append sslmode=require if not present
            sep = "?" if "?" not in database_url else "&"
            database_url = f"{database_url}{sep}sslmode=require"
        return database_url

    # Fall back to individual variables
    name = os.environ.get("DB_NAME", "verdelle_nails")
    user = os.environ.get("DB_USER", "postgres")
    password = os.environ.get("DB_PASSWORD", "postgres")
    host = os.environ.get("DB_HOST", "localhost")
    port = os.environ.get("DB_PORT", "5432")
    sslmode = "require" if os.environ.get("DB_SSL_REQUIRE", "False").lower() in {"1", "true", "yes"} else None

    dsn = f"dbname={name} user={user} password={password} host={host} port={port}"
    if sslmode:
        dsn += f" sslmode={sslmode}"
    return dsn


def wait_for_db(timeout_seconds: int = 120, interval_seconds: float = 2.0):
    dsn = build_dsn()
    start = time.time()
    last_error = None
    while time.time() - start < timeout_seconds:
        try:
            conn = psycopg2.connect(dsn)
            conn.close()
            print("Database is available.")
            return True
        except Exception as e:
            last_error = e
            print(f"Waiting for database... ({e})")
            time.sleep(interval_seconds)

    print("Timed out waiting for database.")
    if last_error:
        print(f"Last error: {last_error}")
    return False


if __name__ == "__main__":
    ok = wait_for_db()
    sys.exit(0 if ok else 1)
