from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from app import crud, models, schemas
from app.db import get_db
from app.dependencies import get_current_active_user, require_role

router = APIRouter(tags=["Bookings"], responses={404: {"description": "Not found"}})


@router.post("", response_model=schemas.BookingResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=schemas.BookingResponse, status_code=status.HTTP_201_CREATED)
def create_booking(
    booking: schemas.BookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    if current_user.role not in [models.RoleEnum.ADMIN, models.RoleEnum.MANAGER]:
        booking = booking.model_copy(update={"user_id": current_user.id})

    db_booking = crud.create_booking(db=db, booking_in=booking)
    return (
        db.query(models.Booking)
        .options(
            joinedload(models.Booking.user),
            joinedload(models.Booking.rooms).joinedload(models.BookingRoom.room),
            joinedload(models.Booking.activities).joinedload(models.BookingActivity.activity),
            joinedload(models.Booking.ferry_ticket),
            joinedload(models.Booking.payments),
        )
        .filter(models.Booking.id == db_booking.id)
        .first()
    )


@router.get("", response_model=List[schemas.BookingResponse])
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
            joinedload(models.Booking.payments),
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
            joinedload(models.Booking.payments),
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
            joinedload(models.Booking.payments),
        )
        .filter(models.Booking.id == booking_id)
        .first()
    )
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.role not in [models.RoleEnum.ADMIN, models.RoleEnum.MANAGER] and booking.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this booking")

    return booking


@router.post("/{booking_id}/request-cancellation", response_model=schemas.BookingResponse)
def request_booking_cancellation(
    booking_id: int,
    payload: schemas.BookingCancellationRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    db_booking = crud.get_db_obj(db, model=models.Booking, obj_id=booking_id)
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.role not in [models.RoleEnum.ADMIN, models.RoleEnum.MANAGER] and db_booking.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this booking")

    if db_booking.status == models.BookingStatusEnum.CANCELLED:
        raise HTTPException(status_code=400, detail="Booking is already cancelled")

    if db_booking.status == models.BookingStatusEnum.CHECKED_OUT:
        raise HTTPException(status_code=400, detail="Checked-out bookings cannot be cancelled")

    db_booking.cancellation_request_status = models.CancellationRequestStatusEnum.PENDING
    db_booking.cancellation_requested_at = datetime.utcnow()
    db_booking.cancellation_reviewed_at = None
    db_booking.cancellation_note = None
    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    return (
        db.query(models.Booking)
        .options(
            joinedload(models.Booking.user),
            joinedload(models.Booking.rooms).joinedload(models.BookingRoom.room),
            joinedload(models.Booking.activities).joinedload(models.BookingActivity.activity),
            joinedload(models.Booking.ferry_ticket),
            joinedload(models.Booking.payments),
        )
        .filter(models.Booking.id == db_booking.id)
        .first()
    )


@router.post("/{booking_id}/review-cancellation", response_model=schemas.BookingResponse)
def review_booking_cancellation(
    booking_id: int,
    review: schemas.BookingCancellationReview,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_booking = crud.get_db_obj(db, model=models.Booking, obj_id=booking_id)
    if not db_booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if db_booking.cancellation_request_status != models.CancellationRequestStatusEnum.PENDING:
        raise HTTPException(status_code=400, detail="This booking has no pending cancellation request")

    db_booking.cancellation_request_status = review.decision
    db_booking.cancellation_reviewed_at = datetime.utcnow()
    db_booking.cancellation_note = (review.note or "").strip() or None

    if review.decision == models.CancellationRequestStatusEnum.APPROVED:
        db_booking.status = models.BookingStatusEnum.CANCELLED

    db.add(db_booking)
    db.commit()
    db.refresh(db_booking)

    return (
        db.query(models.Booking)
        .options(
            joinedload(models.Booking.user),
            joinedload(models.Booking.rooms).joinedload(models.BookingRoom.room),
            joinedload(models.Booking.activities).joinedload(models.BookingActivity.activity),
            joinedload(models.Booking.ferry_ticket),
            joinedload(models.Booking.payments),
        )
        .filter(models.Booking.id == db_booking.id)
        .first()
    )


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
            joinedload(models.Booking.payments),
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
