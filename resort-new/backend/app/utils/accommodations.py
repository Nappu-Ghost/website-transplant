from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict


def _accommodations_path() -> Path:
    return Path.cwd() / "instance" / "accommodations.json"


def _default_accommodations_config() -> Dict[str, Any]:
    return {
        "hero": {
            "kicker": "Resort stays",
            "title": "Suites and villas crafted for slow mornings",
            "description": (
                "Choose lagoon-front suites or private villas with curated in-room rituals, "
                "sunset decks, and effortless access to Azure Land."
            ),
            "cta_primary": {"label": "Plan a stay", "url": "/booking"},
            "cta_secondary": {"label": "Explore activities", "url": "/activities"},
        },
        "gallery": [
            {
                "id": "gallery-hero-1",
                "image_url": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1400&q=80",
                "label": "Lagoon suites",
                "caption": "Glass-fronted suites with private terraces.",
            },
            {
                "id": "gallery-hero-2",
                "image_url": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
                "label": "Island villas",
                "caption": "Open-air patios and twilight dining.",
            },
            {
                "id": "gallery-hero-3",
                "image_url": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1200&q=80",
                "label": "Suite interiors",
                "caption": "Calm palettes and panoramic views.",
            },
        ],
        "featured": {
            "title": "Featured stays",
            "description": "Premium suites and villas picked from live availability.",
        },
        "listing": {
            "title": "All accommodations",
            "description": "Browse the full collection and compare amenities.",
        },
    }


def _merge_dicts(defaults: Dict[str, Any], data: Dict[str, Any]) -> Dict[str, Any]:
    merged: Dict[str, Any] = {}
    for key, value in defaults.items():
        if key in data:
            if isinstance(value, dict) and isinstance(data.get(key), dict):
                merged[key] = _merge_dicts(value, data[key])
            else:
                merged[key] = data[key]
        else:
            merged[key] = value
    for key in data.keys():
        if key not in merged:
            merged[key] = data[key]
    return merged


def load_accommodations_config() -> Dict[str, Any]:
    path = _accommodations_path()
    path.parent.mkdir(parents=True, exist_ok=True)

    defaults = _default_accommodations_config()
    if not path.exists():
        path.write_text(json.dumps(defaults, indent=2), encoding="utf-8")
        return defaults

    try:
        data = json.loads(path.read_text(encoding="utf-8"))
    except Exception:
        path.write_text(json.dumps(defaults, indent=2), encoding="utf-8")
        return defaults

    if not isinstance(data, dict):
        path.write_text(json.dumps(defaults, indent=2), encoding="utf-8")
        return defaults

    merged = _merge_dicts(defaults, data)
    path.write_text(json.dumps(merged, indent=2), encoding="utf-8")
    return merged


def save_accommodations_config(payload: Dict[str, Any]) -> None:
    path = _accommodations_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
