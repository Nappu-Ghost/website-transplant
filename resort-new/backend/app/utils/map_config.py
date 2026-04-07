from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict


def _map_path() -> Path:
    return Path.cwd() / "instance" / "map.json"


def _default_map_config() -> Dict[str, Any]:
    return {
        "enabled": True,
        "title": "Explore the resort map",
        "description": (
            "Preview key locations across Azure Lagoon Resort. Hover over a pin for the name, "
            "then click to view details and gallery images."
        ),
        "background_image_url": "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1600&q=80",
        "default_zoom": 1.0,
        "pins": [
            {
                "id": "arrival-jetty",
                "name": "Arrival Jetty",
                "description": "Main arrival point with concierge welcome and quick ferry access.",
                "x": 18,
                "y": 72,
                "images": [
                    {
                        "id": "arrival-jetty-1",
                        "url": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
                        "alt": "Arrival jetty",
                        "caption": "Guests are welcomed here before check-in.",
                    }
                ],
            },
            {
                "id": "lagoon-spa",
                "name": "Lagoon Spa",
                "description": "Wellness pavilion for sunrise treatments and evening rituals.",
                "x": 56,
                "y": 34,
                "images": [
                    {
                        "id": "lagoon-spa-1",
                        "url": "https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80",
                        "alt": "Lagoon spa",
                        "caption": "Ocean-facing wellness rooms and quiet lounges.",
                    }
                ],
            },
            {
                "id": "sunset-dining",
                "name": "Sunset Dining Deck",
                "description": "Signature dinner spot for golden-hour meals over the water.",
                "x": 78,
                "y": 58,
                "images": [
                    {
                        "id": "sunset-dining-1",
                        "url": "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
                        "alt": "Sunset dining deck",
                        "caption": "Chef-led dinners with panoramic lagoon views.",
                    }
                ],
            },
        ],
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


def load_map_config() -> Dict[str, Any]:
    path = _map_path()
    path.parent.mkdir(parents=True, exist_ok=True)

    defaults = _default_map_config()
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


def save_map_config(payload: Dict[str, Any]) -> None:
    path = _map_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
