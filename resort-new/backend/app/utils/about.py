from __future__ import annotations

import json
from pathlib import Path
from typing import Any, Dict


def _about_path() -> Path:
    return Path.cwd() / "instance" / "about.json"


def _default_about_config() -> Dict[str, Any]:
    return {
        "hero": {
            "kicker": "About Azure Lagoon",
            "title": "A tranquil retreat shaped by sea and light",
            "description": (
                "Azure Lagoon is an intimate island sanctuary where modern luxury meets quiet discovery. "
                "Every stay is paced with curated rituals, warm hospitality, and effortless transitions."
            ),
            "cta_primary": {"label": "Plan a stay", "url": "/booking"},
            "cta_secondary": {"label": "Explore stays", "url": "/accommodations"},
        },
        "gallery": [
            {
                "id": "about-hero-1",
                "image_url": "https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1600&q=80",
                "label": "Lagoon views",
                "caption": "Soft light and open horizons.",
            },
            {
                "id": "about-hero-2",
                "image_url": "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80",
                "label": "Island calm",
                "caption": "Private decks and slow mornings.",
            },
            {
                "id": "about-hero-3",
                "image_url": "https://images.unsplash.com/photo-1469474968028-56623f02e42e?auto=format&fit=crop&w=1600&q=80",
                "label": "Evening glow",
                "caption": "Golden-hour rituals by the sea.",
            },
        ],
        "intro": {
            "title": "Resort story",
            "description": "Designed around calm, comfort, and quiet exploration.",
            "paragraphs": [
                "Azure Lagoon Resort is an intimate island sanctuary where modern luxury meets quiet discovery. Each stay is paced with curated itineraries, coastal rituals, and a concierge team that anticipates every transition.",
                "From lagoon suites to garden villas, every space is designed with light, natural textures, and soft transitions between indoor and outdoor living. We focus on effortless arrivals, gentle adventures, and restful departures.",
            ],
            "highlight": "Thoughtful service, always at an unhurried pace.",
        },
        "stats": {
            "title": "Resort at a glance",
            "items": [
                {"label": "Suites + Villas", "value": "42"},
                {"label": "Curated experiences", "value": "18"},
                {"label": "Dining concepts", "value": "3"},
                {"label": "Wellness rituals", "value": "Daily"},
                {"label": "Guest-to-host ratio", "value": "3:1"},
            ],
        },
        "amenities_section": {
            "title": "Amenities and rituals",
            "description": "Every detail is curated for calm, comfort, and gentle exploration.",
        },
        "amenities": [
            {
                "title": "Lagoon access",
                "description": "Private decks, gentle tides, and sunrise paddling routes.",
            },
            {
                "title": "Wellness rituals",
                "description": "Spa suites, meditation terraces, and daily breathwork.",
            },
            {
                "title": "Chef-led dining",
                "description": "Tasting menus shaped by island harvests and tide cycles.",
            },
            {
                "title": "Golden-hour views",
                "description": "Skyline lounges and curated sunset itineraries.",
            },
        ],
        "team_section": {
            "title": "Meet the hosts",
            "description": "A team of guides, chefs, and wellness specialists rooted in the island.",
        },
        "team": [
            {
                "name": "Elena Shore",
                "role": "General Manager",
                "bio": "Hospitality leader focused on calm, intuitive guest journeys.",
                "image_url": "/images/gallery/hotels/hotel1.jpg",
            },
            {
                "name": "Mateo Kai",
                "role": "Experience Curator",
                "bio": "Designs wellness and adventure itineraries with local guides.",
                "image_url": "/images/gallery/rooms/room1.jpg",
            },
            {
                "name": "Ayla Noor",
                "role": "Culinary Director",
                "bio": "Leads the kitchen with seasonal menus and shoreline sourcing.",
                "image_url": "/images/gallery/hotels/hotel3.jpg",
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


def load_about_config() -> Dict[str, Any]:
    path = _about_path()
    path.parent.mkdir(parents=True, exist_ok=True)

    defaults = _default_about_config()
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


def save_about_config(payload: Dict[str, Any]) -> None:
    path = _about_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, indent=2), encoding="utf-8")
