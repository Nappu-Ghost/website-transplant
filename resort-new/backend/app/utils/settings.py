from __future__ import annotations

import json
import secrets
from dataclasses import dataclass
from pathlib import Path


@dataclass(frozen=True)
class Settings:
    secret_key: str
    algorithm: str = "HS256"
    jwt_issuer: str = "resort-api"
    jwt_audience: str = "resort-frontend"
    access_token_minutes: int = 30
    refresh_token_days: int = 14
    pbkdf2_rounds: int = 310_000
    allow_demo_users: bool = True
    bootstrap_admin_email: str = "admin@example.com"
    bootstrap_admin_name: str = "System Admin"
    bootstrap_admin_password: str | None = None


def _settings_path() -> Path:
    return Path.cwd() / "instance" / "settings.json"


def _default_settings() -> Settings:
    secret = secrets.token_urlsafe(64)
    return Settings(secret_key=secret)


def load_settings() -> Settings:
    path = _settings_path()
    path.parent.mkdir(parents=True, exist_ok=True)

    if not path.exists():
        s = _default_settings()
        path.write_text(json.dumps(s.__dict__, indent=2), encoding="utf-8")
        return s

    data = json.loads(path.read_text(encoding="utf-8"))

    secret = str(data.get("secret_key") or "").strip()
    if len(secret) < 32:
        s = _default_settings()
        path.write_text(json.dumps(s.__dict__, indent=2), encoding="utf-8")
        return s

    bootstrap_admin_email = str(data.get("bootstrap_admin_email") or "admin@example.com").strip() or "admin@example.com"
    bootstrap_admin_name = str(data.get("bootstrap_admin_name") or "System Admin").strip() or "System Admin"
    bootstrap_admin_password_raw = data.get("bootstrap_admin_password")
    bootstrap_admin_password = None
    if isinstance(bootstrap_admin_password_raw, str):
        bootstrap_admin_password = bootstrap_admin_password_raw.strip() or None

    return Settings(
        secret_key=secret,
        algorithm=str(data.get("algorithm") or "HS256"),
        jwt_issuer=str(data.get("jwt_issuer") or "resort-api"),
        jwt_audience=str(data.get("jwt_audience") or "resort-frontend"),
        access_token_minutes=int(data.get("access_token_minutes") or 30),
        refresh_token_days=int(data.get("refresh_token_days") or 14),
        pbkdf2_rounds=int(data.get("pbkdf2_rounds") or 310_000),
        allow_demo_users=bool(data.get("allow_demo_users", True)),
        bootstrap_admin_email=bootstrap_admin_email,
        bootstrap_admin_name=bootstrap_admin_name,
        bootstrap_admin_password=bootstrap_admin_password,
    )
