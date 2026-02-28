from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict


def _activities_path() -> Path:
    return Path.cwd() / "instance" / "activities.json"


def _default_activities_config() -> Dict[str, Any]:
    return {
        "hero": {
            "kicker": "Island experiences",
            "title": "Activities built for calm, thrill, and connection",
            "description": (
                "From lagoon rituals to skyline rides, every experience is paced for your group and "
                "guided by hosts who know the islands best."
            ),
            "cta_primary": {"label": "Plan an itinerary", "url": "/booking"},
            "cta_secondary": {"label": "Browse stays", "url": "/accommodations"},
        },
        "gallery": [
            {
                "id": "activities-hero-1",
                "image_url": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
                "label": "Lagoon rituals",
                "caption": "Morning cruises and sound baths on the water.",
            },
            {
                "id": "activities-hero-2",
                "image_url": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
                "label": "Skyline thrills",
                "caption": "Signature coasters and sunset rides.",
            },
            {
                "id": "activities-hero-3",
                "image_url": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80",
                "label": "Chef-led dining",
                "caption": "Seasonal menus and guided tastings.",
            },
        ],
        "featured": {
            "title": "Featured experiences",
            "description": "Premium and top-rated experiences from the live roster.",
        },
        "listing": {
            "title": "All activities",
            "description": "Explore the full lineup and plan your day.",
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


def load_activities_config() -> Dict[str, Any]:
    path = _activities_path()
    path.parent.mkdir(parents=True, exist_ok=True)

    defaults = _default_activities_config()
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


def save_activities_config(payload: Dict[str, Any]) -> None:
    path = _activities_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
