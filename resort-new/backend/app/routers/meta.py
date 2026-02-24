from __future__ import annotations

from fastapi import APIRouter
from app.utils.settings import load_settings
from app.utils.homepage import load_homepage_config

router = APIRouter()

@router.get("/meta")
def get_meta() -> dict:
    settings = load_settings()
    return {"demo_mode": bool(settings.allow_demo_users)}


@router.get("/meta/homepage")
def get_homepage() -> dict:
    return load_homepage_config()
