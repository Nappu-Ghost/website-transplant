from __future__ import annotations

import json
import os
import re
from typing import Optional

_INSTANCE_DIR = os.path.join(
    os.path.dirname(os.path.dirname(os.path.dirname(__file__))), "instance"
)
ROLES_FILE = os.path.join(_INSTANCE_DIR, "roles.json")

# Pages that can be assigned permissions (must match the slug used in admin URLs)
ADMIN_PAGES = [
    "dashboard",
    "bookings",
    "activities",
    "payments",
    "map-editor",
    "users",
    "reports",
    "settings",
    "hotels",
    "accommodations",
    "customize-pages",
    "roles",
]

DEFAULT_ROLES: list[dict] = [
    {
        "id": "ADMIN",
        "label": "Admin",
        "isSystem": True,
        "adminAccess": True,
        "allPages": True,
        "pages": [],
    },
    {
        "id": "MANAGER",
        "label": "Manager",
        "isSystem": False,
        "adminAccess": True,
        "allPages": False,
        "pages": [
            "dashboard",
            "bookings",
            "activities",
            "payments",
            "map-editor",
            "users",
            "reports",
            "settings",
            "hotels",
            "accommodations",
            "customize-pages",
        ],
    },
    {
        "id": "CUSTOMER",
        "label": "Customer",
        "isSystem": False,
        "adminAccess": False,
        "allPages": False,
        "pages": [],
    },
]


def _load() -> dict:
    if not os.path.exists(ROLES_FILE):
        return {"roles": [r.copy() for r in DEFAULT_ROLES]}
    try:
        with open(ROLES_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"roles": [r.copy() for r in DEFAULT_ROLES]}


def _save(config: dict) -> None:
    os.makedirs(_INSTANCE_DIR, exist_ok=True)
    with open(ROLES_FILE, "w", encoding="utf-8") as f:
        json.dump(config, f, indent=2)


def load_roles() -> list[dict]:
    return _load().get("roles", [])


def save_roles(roles: list[dict]) -> None:
    _save({"roles": roles})


def get_role(role_id: str) -> Optional[dict]:
    for role in load_roles():
        if role["id"] == role_id:
            return role
    return None


def get_effective_permissions(base_role: str, custom_role: Optional[str] = None) -> dict:
    """Return {adminAccess, allPages, pages} for a user."""
    if base_role == "ADMIN":
        return {"adminAccess": True, "allPages": True, "pages": []}

    lookup_id = custom_role if custom_role else base_role
    role = get_role(lookup_id)
    if not role:
        return {"adminAccess": False, "allPages": False, "pages": []}

    return {
        "adminAccess": bool(role.get("adminAccess", False)),
        "allPages": bool(role.get("allPages", False)),
        "pages": list(role.get("pages", [])),
    }


def slugify(label: str) -> str:
    """Create a URL-safe id from a label."""
    slug = label.lower().strip()
    slug = re.sub(r"[^a-z0-9]+", "-", slug)
    slug = slug.strip("-")
    return slug or "custom-role"
