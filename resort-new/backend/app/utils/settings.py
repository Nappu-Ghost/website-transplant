from __future__ import annotations

import json
import secrets
from dataclasses import dataclass, field
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
    homepage_ads: list[dict] = field(default_factory=list)


def _default_homepage_ads() -> list[dict]:
    return [
        {
            "id": "lagoon-dining-week",
            "title": "Lagoon Dining Week",
            "description": "Chef collaborations, oceanfront tastings, and a closing night under lanterns.",
            "image_url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1400&q=80",
            "cta_text": "Reserve a table",
            "cta_url": "/booking",
            "badge": "Limited series",
        },
        {
            "id": "skyline-ride",
            "title": "Skyline Coaster Preview",
            "description": "Be first in line for the sunset test rides on the theme park island.",
            "image_url": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
            "cta_text": "Join the list",
            "cta_url": "/activities",
            "badge": "Theme park",
        },
        {
            "id": "ferry-sprint",
            "title": "Ferry Sprint Pass",
            "description": "Priority boarding between islands with lounge seating and mocktail service.",
            "image_url": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80",
            "cta_text": "Upgrade my trip",
            "cta_url": "/booking",
            "badge": "Fast track",
        },
    ]


def _settings_path() -> Path:
    return Path.cwd() / "instance" / "settings.json"


def _default_settings() -> Settings:
    secret = secrets.token_urlsafe(64)
    return Settings(secret_key=secret, homepage_ads=_default_homepage_ads())


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

    homepage_ads_raw = data.get("homepage_ads")
    homepage_ads = homepage_ads_raw if isinstance(homepage_ads_raw, list) else _default_homepage_ads()

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
        homepage_ads=homepage_ads,
    )


def load_homepage_ads() -> list[dict]:
    settings = load_settings()
    ads = settings.homepage_ads or []
    if not ads:
        ads = _default_homepage_ads()
        save_homepage_ads(ads)
    return ads


def save_homepage_ads(ads: list[dict]) -> None:
    path = _settings_path()
    if not path.exists():
        settings = _default_settings()
        path.write_text(json.dumps(settings.__dict__, indent=2), encoding="utf-8")

    data = json.loads(path.read_text(encoding="utf-8"))
    data["homepage_ads"] = ads
    path.write_text(json.dumps(data, indent=2), encoding="utf-8")
