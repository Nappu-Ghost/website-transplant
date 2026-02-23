from __future__ import annotations

from fastapi import APIRouter
from app.utils.settings import load_settings

router = APIRouter()

@router.get("/meta")
def get_meta() -> dict:
    settings = load_settings()
    return {"demo_mode": bool(settings.allow_demo_users)}
