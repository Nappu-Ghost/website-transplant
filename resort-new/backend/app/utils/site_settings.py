from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict

_NAVBAR_KEYS = [
    "about",
    "accommodations",
    "activities",
    "booking",
    "map",
    "contact",
]


def _site_settings_path() -> Path:
    return Path.cwd() / "instance" / "site_settings.json"


def _default_site_settings() -> Dict[str, Any]:
    return {
        "navbar": {key: True for key in _NAVBAR_KEYS},
    }


def _normalize_navbar(raw: Any) -> Dict[str, bool]:
    defaults = {key: True for key in _NAVBAR_KEYS}
    if not isinstance(raw, dict):
        return defaults

    normalized = dict(defaults)
    for key in _NAVBAR_KEYS:
        if key in raw:
            normalized[key] = bool(raw[key])
    return normalized


def load_site_settings() -> Dict[str, Any]:
    path = _site_settings_path()
    path.parent.mkdir(parents=True, exist_ok=True)

    defaults = _default_site_settings()
    if not path.exists():
        path.write_text(json.dumps(defaults, indent=2), encoding="utf-8")
        return defaults

    try:
        raw = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        path.write_text(json.dumps(defaults, indent=2), encoding="utf-8")
        return defaults

    data = raw if isinstance(raw, dict) else {}
    merged = {
        "navbar": _normalize_navbar(data.get("navbar")),
    }

    path.write_text(json.dumps(merged, indent=2), encoding="utf-8")
    return merged


def save_site_settings(payload: Dict[str, Any]) -> None:
    normalized = {
        "navbar": _normalize_navbar(payload.get("navbar")),
    }

    path = _site_settings_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(normalized, indent=2), encoding="utf-8")


def load_navbar_settings() -> Dict[str, bool]:
    return load_site_settings().get("navbar", _default_site_settings()["navbar"])


def save_navbar_settings(navbar: Dict[str, bool]) -> Dict[str, bool]:
    settings = load_site_settings()
    settings["navbar"] = _normalize_navbar(navbar)
    save_site_settings(settings)
    return settings["navbar"]
