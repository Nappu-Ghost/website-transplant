from fastapi import APIRouter, Depends

from app import models, schemas
from app.dependencies import require_role
from app.utils.map_config import load_map_config, save_map_config

router = APIRouter()


@router.get("/places")
def get_places():
    config = load_map_config()
    return config.get("pins", [])


@router.post("/places")
def add_place(
    place: schemas.MapPin,
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    config = load_map_config()
    pins = list(config.get("pins", []))
    pins.append(place.model_dump())
    config["pins"] = pins
    save_map_config(config)
    return place.model_dump()