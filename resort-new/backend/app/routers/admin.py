from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import crud, models, schemas
from app.db import get_db
from app.dependencies import require_role
from app.utils.homepage import load_homepage_config, save_homepage_config
from app.utils.accommodations import load_accommodations_config, save_accommodations_config
from app.utils.activities import load_activities_config, save_activities_config
from app.utils.about import load_about_config, save_about_config
from app.utils.map_config import load_map_config, save_map_config
from app.utils.site_settings import load_navbar_settings, save_navbar_settings

router = APIRouter(tags=["Admin"], responses={404: {"description": "Not found"}})


@router.get("/overview")
def get_admin_overview(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    total_users = db.query(func.count(models.User.id)).scalar() or 0
    total_bookings = db.query(func.count(models.Booking.id)).scalar() or 0
    total_hotels = db.query(func.count(models.Hotel.id)).scalar() or 0
    total_rooms = db.query(func.count(models.Room.id)).scalar() or 0
    total_activities = db.query(func.count(models.Activity.id)).scalar() or 0
    total_payments = db.query(func.count(models.Payment.id)).scalar() or 0
    revenue_collected = (
        db.query(func.coalesce(func.sum(models.Payment.amount), 0.0))
        .filter(models.Payment.status == models.PaymentStatusEnum.CAPTURED)
        .scalar()
        or 0.0
    )

    return {
        "totals": {
            "users": total_users,
            "bookings": total_bookings,
            "hotels": total_hotels,
            "rooms": total_rooms,
            "activities": total_activities,
            "payments": total_payments,
        },
        "revenue_collected": float(revenue_collected),
    }


@router.get("/homepage")
def get_homepage_settings(
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    return load_homepage_config()


@router.put("/homepage")
def update_homepage_settings(
    payload: schemas.HomepageConfig,
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    config = payload.model_dump()
    save_homepage_config(config)
    return config


@router.get("/accommodations-page")
def get_accommodations_settings(
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    return load_accommodations_config()


@router.put("/accommodations-page")
def update_accommodations_settings(
    payload: schemas.AccommodationsConfig,
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    config = payload.model_dump()
    save_accommodations_config(config)
    return config


@router.get("/activities-page")
def get_activities_settings(
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    return load_activities_config()


@router.put("/activities-page")
def update_activities_settings(
    payload: schemas.ActivitiesConfig,
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    config = payload.model_dump()
    save_activities_config(config)
    return config


@router.get("/about-page")
def get_about_settings(
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    return load_about_config()


@router.put("/about-page")
def update_about_settings(
    payload: schemas.AboutConfig,
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    config = payload.model_dump()
    save_about_config(config)
    return config


@router.get("/map-page")
def get_map_settings(
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    return load_map_config()


@router.put("/map-page")
def update_map_settings(
    payload: schemas.MapConfig,
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    config = payload.model_dump()
    save_map_config(config)
    return config


@router.get("/site-settings/navbar", response_model=schemas.SiteNavbarSettings)
def get_navbar_settings(
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    return load_navbar_settings()


@router.put("/site-settings/navbar", response_model=schemas.SiteNavbarSettings)
def update_navbar_settings(
    payload: schemas.SiteNavbarSettings,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    updated = save_navbar_settings(payload.model_dump())

    actor_name = (current_user.name or current_user.email or f"user:{current_user.id}").strip()
    enabled_items = [k for k, v in updated.items() if v]
    disabled_items = [k for k, v in updated.items() if not v]
    description = (
        f"{actor_name} updated navbar visibility. "
        f"Enabled: {', '.join(enabled_items) if enabled_items else 'none'}. "
        f"Disabled: {', '.join(disabled_items) if disabled_items else 'none'}."
    )
    crud.create_audit_log(
        db,
        actor_user_id=current_user.id,
        actor_name=actor_name,
        action="update",
        entity_type="navbar",
        entity_id="site-navbar",
        description=description,
    )

    return updated
