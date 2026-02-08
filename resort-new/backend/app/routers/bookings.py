from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from app import crud, models, schemas
from app.db import get_db
from app.dependencies import get_current_active_user, require_role

router = APIRouter(tags=["Bookings"], responses={404: {"description": "Not found"}})


@router.post("/", response_model=schemas.BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking: schemas.BookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    if current_user.role not in [models.RoleEnum.ADMIN, models.RoleEnum.MANAGER] and booking.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create a booking for another user")

    db_booking = crud.create_booking(db=db, booking_in=booking)
    return (
        db.query(models.Booking)
        .options(
            joinedload(models.Booking.user),
            joinedload(models.Booking.rooms).joinedload(models.BookingRoom.room),
            joinedload(models.Booking.activities).joinedload(models.BookingActivity.activity),
            joinedload(models.Booking.ferry_ticket),
        )
        .filter(models.Booking.id == db_booking.id)
        .first()
    )


@router.get("/", response_model=List[schemas.BookingResponse])
def read_bookings(
    status: Optional[models.BookingStatusEnum] = None,
    user_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    query = (
        db.query(models.Booking)
        .options(
            joinedload(models.Booking.user),
            joinedload(models.Booking.rooms).joinedload(models.BookingRoom.room),
            joinedload(models.Booking.activities).joinedload(models.BookingActivity.activity),
            joinedload(models.Booking.ferry_ticket),
        )
    )
    if status:
        query = query.filter(models.Booking.status == status)
    if user_id:
        query = query.filter(models.Booking.user_id == user_id)
    return query.offset(skip).limit(limit).all()


@router.get("/user", response_model=List[schemas.BookingResponse])
def read_user_bookings(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
    user_id: Optional[int] = None,
):
    target_user_id = user_id or current_user.id
    if current_user.role not in [models.RoleEnum.ADMIN, models.RoleEnum.MANAGER] and target_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view these bookings")

    return (
        db.query(models.Booking)
        .options(
            joinedload(models.Booking.user),
            joinedload(models.Booking.rooms).joinedload(models.BookingRoom.room),
            joinedload(models.Booking.activities).joinedload(models.BookingActivity.activity),
            joinedload(models.Booking.ferry_ticket),
        )
        .filter(models.Booking.user_id == target_user_id)
        .order_by(models.Booking.createdAt.desc())
        .all()
    )


@router.get("/{booking_id}", response_model=schemas.BookingResponse)
def read_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    booking = (
        db.query(models.Booking)
        .options(
            joinedload(models.Booking.user),
            joinedload(models.Booking.rooms).joinedload(models.BookingRoom.room),
            joinedload(models.Booking.activities).joinedload(models.BookingActivity.activity),
            joinedload(models.Booking.ferry_ticket),
        )
        .filter(models.Booking.id == booking_id)
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.role not in [models.RoleEnum.ADMIN, models.RoleEnum.MANAGER] and booking.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this booking")

    return booking


@router.put("/{booking_id}", response_model=schemas.BookingResponse)
def update_booking_full(
    booking_id: int,
    booking: schemas.BookingUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_booking = crud.get_db_obj(db, model=models.Booking, obj_id=booking_id)
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    updated = crud.update_db_obj_generic(db=db, db_obj=db_booking, obj_in=booking)
    return (
        db.query(models.Booking)
        .options(
            joinedload(models.Booking.user),
            joinedload(models.Booking.rooms).joinedload(models.BookingRoom.room),
            joinedload(models.Booking.activities).joinedload(models.BookingActivity.activity),
            joinedload(models.Booking.ferry_ticket),
        )
        .filter(models.Booking.id == updated.id)
        .first()
    )


@router.patch("/{booking_id}", response_model=schemas.BookingResponse)
def update_booking_partial(
    booking_id: int,
    booking: schemas.BookingUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_booking = crud.get_db_obj(db, model=models.Booking, obj_id=booking_id)
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    updated = crud.update_db_obj_generic(db=db, db_obj=db_booking, obj_in=booking)
    return (
        db.query(models.Booking)
        .options(
            joinedload(models.Booking.user),
            joinedload(models.Booking.rooms).joinedload(models.BookingRoom.room),
            joinedload(models.Booking.activities).joinedload(models.BookingActivity.activity),
            joinedload(models.Booking.ferry_ticket),
        )
        .filter(models.Booking.id == updated.id)
        .first()
    )


@router.delete("/{booking_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_booking = crud.get_db_obj(db, model=models.Booking, obj_id=booking_id)
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    crud.remove_db_obj_generic(db=db, db_obj=db_booking)
    return None
