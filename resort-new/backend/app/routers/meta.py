from __future__ import annotations

from fastapi import APIRouter
from app.utils.settings import load_settings, load_homepage_ads

router = APIRouter()

@router.get("/meta")
def get_meta() -> dict:
    settings = load_settings()
    return {"demo_mode": bool(settings.allow_demo_users)}


@router.get("/meta/homepage")
def get_homepage() -> dict:
    return {"ads": load_homepage_ads()}
