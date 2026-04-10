from __future__ import annotations

from sqlalchemy import text
from sqlalchemy.engine import Engine


def _has_column(engine: Engine, table: str, column: str) -> bool:
    with engine.connect() as conn:
        rows = conn.execute(text(f"PRAGMA table_info({table})")).fetchall()
    return any(r[1] == column for r in rows) 


def apply_migrations(engine: Engine) -> None:
    if _has_column(engine, "users", "id") and not _has_column(engine, "users", "token_version"):
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE users ADD COLUMN token_version INTEGER NOT NULL DEFAULT 0"))
            conn.execute(text("ALTER TABLE users ADD COLUMN refresh_token_hash VARCHAR"))
            conn.execute(text("ALTER TABLE users ADD COLUMN refresh_token_jti VARCHAR"))
            conn.execute(text("ALTER TABLE users ADD COLUMN refresh_token_expiresAt DATETIME"))

    if _has_column(engine, "bookings", "id") and not _has_column(engine, "bookings", "cancellation_request_status"):
        with engine.begin() as conn:
            conn.execute(text("ALTER TABLE bookings ADD COLUMN cancellation_request_status VARCHAR NOT NULL DEFAULT 'NONE'"))
            conn.execute(text("ALTER TABLE bookings ADD COLUMN cancellation_requested_at DATETIME"))
            conn.execute(text("ALTER TABLE bookings ADD COLUMN cancellation_reviewed_at DATETIME"))
            conn.execute(text("ALTER TABLE bookings ADD COLUMN cancellation_note TEXT"))

    with engine.begin() as conn:
        conn.execute(
            text(
                """
                CREATE TABLE IF NOT EXISTS sessions (
                    id VARCHAR PRIMARY KEY,
                    user_id INTEGER NOT NULL,
                    refresh_token_hash VARCHAR NOT NULL,
                    refresh_token_jti VARCHAR NOT NULL,
                    refresh_token_expiresAt DATETIME NOT NULL,
                    ip_address VARCHAR,
                    user_agent VARCHAR,
                    device_label VARCHAR,
                    createdAt DATETIME NOT NULL,
                    lastUsedAt DATETIME NOT NULL,
                    revokedAt DATETIME,
                    FOREIGN KEY(user_id) REFERENCES users(id)
                );
                """
            )
        )
