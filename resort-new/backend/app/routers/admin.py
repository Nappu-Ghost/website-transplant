from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func

from app import models, schemas
from app.db import get_db
from app.dependencies import require_role
from app.utils.settings import load_homepage_ads, save_homepage_ads

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
    return {"ads": load_homepage_ads()}


@router.put("/homepage")
def update_homepage_settings(
    payload: schemas.HomepageConfig,
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    ads = [ad.model_dump() for ad in payload.ads]
    save_homepage_ads(ads)
    return {"ads": ads}
