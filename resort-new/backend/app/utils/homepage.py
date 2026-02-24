from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict


def _homepage_path() -> Path:
    return Path.cwd() / "instance" / "homepage.json"


def _default_homepage_config() -> Dict[str, Any]:
    return {
        "hero": {
            "kicker": "Welcome adventurers",
            "title": "Azure Lagoon Resort",
            "description": (
                "A dual-island destination with a luxury resort on one shore and "
                "Azure Land on the other. Seamless transfers let you shape each day "
                "around relaxation, adventure, or both."
            ),
            "cta_primary": {"label": "Plan the full journey", "url": "/booking"},
            "cta_secondary": {"label": "Explore the resort", "url": "/accommodations"},
            "cta_tertiary": {"label": "Azure Land highlights", "url": "/activities"},
        },
        "hero_cards": [
            {
                "id": "resort-island",
                "title": "Resort Island",
                "detail": "White sand beaches, chef-led dining, and waterfront suites.",
                "tag": "Luxury",
            },
            {
                "id": "azure-land",
                "title": "Azure Land",
                "detail": "Signature rides, festivals, and immersive story zones.",
                "tag": "Theme park",
            },
            {
                "id": "island-connection",
                "title": "Island Connection",
                "detail": "Seamless transfers between resort calm and park energy.",
                "tag": "Travel",
            },
        ],
        "two_island": {
            "title": "Your journey across two islands",
            "description": "Luxury on one shore, Azure Land on the other, connected by a calm lagoon ride.",
            "resort": {
                "title": "Suites, dining, and coastal rituals",
                "description": "Private cabanas, chef-driven restaurants, and sunset wellness lounges.",
                "image_url": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80",
            },
            "park": {
                "title": "Rides, festivals, and immersive zones",
                "description": "Coasters, parade nights, and family-friendly storytelling districts.",
                "image_url": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80",
            },
        },
        "ferry": {
            "title": "The ferry in between",
            "items": [
                {
                    "id": "ferry-frequency",
                    "title": "Every 20 minutes",
                    "description": "Shuttles run all day, so you can move between islands whenever the mood shifts.",
                },
                {
                    "id": "ferry-booking",
                    "title": "Pre-book your crossings",
                    "description": "Reserve priority slots with lounge seating and sunset departures.",
                },
            ],
            "cta": {"label": "Reserve ferry seats", "url": "/booking"},
        },
        "ads": [
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
                "description": "Be first in line for the sunset test rides at Azure Land.",
                "image_url": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1400&q=80",
                "cta_text": "Join the list",
                "cta_url": "/activities",
                "badge": "Azure Land",
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
        ],
        "day_planner": {
            "title": "Island day planner",
            "items": [
                {
                    "id": "planner-morning",
                    "title": "Morning calm",
                    "description": "Breakfast on the resort deck, spa rituals, and private beach time.",
                },
                {
                    "id": "planner-afternoon",
                    "title": "Afternoon thrill",
                    "description": "Hop the ferry and explore coasters, shows, and themed dining.",
                },
                {
                    "id": "planner-evening",
                    "title": "Evening glow",
                    "description": "Return for lantern-lit dinners and beachfront performances.",
                },
            ],
            "cta": {"label": "Build my itinerary", "url": "/booking"},
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


def load_homepage_config() -> Dict[str, Any]:
    path = _homepage_path()
    path.parent.mkdir(parents=True, exist_ok=True)

    defaults = _default_homepage_config()
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


def save_homepage_config(payload: Dict[str, Any]) -> None:
    path = _homepage_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
