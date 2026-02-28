from __future__ import annotations

from fastapi import APIRouter
from app.utils.settings import load_settings
from app.utils.homepage import load_homepage_config
from app.utils.accommodations import load_accommodations_config
from app.utils.activities import load_activities_config

router = APIRouter()

@router.get("/meta")
def get_meta() -> dict:
    settings = load_settings()
    return {"demo_mode": bool(settings.allow_demo_users)}


@router.get("/meta/homepage")
def get_homepage() -> dict:
    return load_homepage_config()


@router.get("/meta/accommodations")
def get_accommodations() -> dict:
    return load_accommodations_config()


@router.get("/meta/activities")
def get_activities() -> dict:
    return load_activities_config()
