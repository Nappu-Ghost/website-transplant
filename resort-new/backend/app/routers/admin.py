from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import models, schemas
from app.db import get_db
from app.dependencies import require_role
from app.utils.homepage import load_homepage_config, save_homepage_config
from app.utils.accommodations import load_accommodations_config, save_accommodations_config
from app.utils.activities import load_activities_config, save_activities_config

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
