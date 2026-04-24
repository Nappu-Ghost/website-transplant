# app/crud.py
from sqlalchemy.orm import Session, joinedload # Ensure joinedload is imported if used elsewhere
from sqlalchemy.exc import IntegrityError
from app import models, schemas
from typing import List, Optional, Type, TypeVar, Generic, Any
from pydantic import BaseModel as PydanticBaseModel
from fastapi import HTTPException, status
from app.utils.security import get_password_hash, verify_password
from app.utils import security

ModelType = TypeVar("ModelType", bound=models.Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=PydanticBaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=PydanticBaseModel)

def get_db_obj(db: Session, model: Type[ModelType], obj_id: int) -> Optional[ModelType]:
    return db.query(model).filter(model.id == obj_id).first()

def get_all_db_obj(db: Session, model: Type[ModelType], skip: int = 0, limit: int = 100) -> List[ModelType]:
    return db.query(model).offset(skip).limit(limit).all()

def create_db_obj_generic(db: Session, model: Type[ModelType], obj_in: CreateSchemaType) -> ModelType:
    obj_in_data = obj_in.model_dump()
    db_obj = model(**obj_in_data)
    try:
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
    except IntegrityError as e:
        db.rollback()
        detail = f"Database integrity error: {e.orig}"
        if "UNIQUE constraint failed" in str(e.orig).upper():
            try:
                constraint_part = str(e.orig).split("UNIQUE constraint failed: ")[1]
                failed_field = constraint_part.split('.')[1]
                detail = f"A record with this {failed_field} already exists."
            except (IndexError, AttributeError):
                detail = "A record with a unique field already exists."
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
    return db_obj

def update_db_obj_generic(db: Session, db_obj: ModelType, obj_in: UpdateSchemaType) -> ModelType:
    update_data = obj_in.model_dump(exclude_unset=True)
    for field_name, value in update_data.items():
        if hasattr(db_obj, field_name):
            setattr(db_obj, field_name, value)
    try:
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
    except IntegrityError as e:
        db.rollback()
        detail = f"Database integrity error during update: {e.orig}"
        if "UNIQUE constraint failed" in str(e.orig).upper():
            try:
                constraint_part = str(e.orig).split("UNIQUE constraint failed: ")[1]
                failed_field = constraint_part.split('.')[1]
                detail = f"Cannot update: a record with this {failed_field} already exists."
            except (IndexError, AttributeError):
                detail = "Cannot update: a record with a unique field already exists."
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=detail)
    return db_obj

def remove_db_obj_generic(db: Session, db_obj: ModelType) -> ModelType:
    try:
        db.delete(db_obj)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Cannot delete item. It might be referenced by other records: {e.orig}")
    return db_obj 


def create_audit_log(
    db: Session,
    *,
    actor_user_id: Optional[int],
    actor_name: str,
    action: str,
    entity_type: str,
    entity_id: Optional[str],
    description: str,
) -> models.AuditLog:
    log = models.AuditLog(
        actor_user_id=actor_user_id,
        actor_name=actor_name,
        action=action,
        entity_type=entity_type,
        entity_id=entity_id,
        description=description,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return log

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user_in: schemas.UserCreate) -> models.User:
    db_user_with_email = get_user_by_email(db, email=user_in.email)
    if db_user_with_email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An account with this email already exists.")
    hashed_password_val = get_password_hash(user_in.password)
    user_model_data = user_in.model_dump(exclude={"password"})
    db_model_user = models.User(**user_model_data, hashed_password=hashed_password_val)
    try:
        db.add(db_model_user)
        db.commit()
        db.refresh(db_model_user)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not create user due to a database constraint.")
    return db_model_user

def update_user(db: Session, db_user: models.User, user_in: schemas.UserUpdate) -> models.User:
    update_data = user_in.model_dump(exclude_unset=True)
    if "password" in update_data and update_data["password"] is not None:
        hashed_password = get_password_hash(update_data["password"])
        db_user.hashed_password = hashed_password
        del update_data["password"]
    if "email" in update_data and update_data["email"] != db_user.email:
        existing_email_user = get_user_by_email(db, email=update_data["email"])
        if existing_email_user and existing_email_user.id != db_user.id:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered by another user.")
        # When custom_role is assigned, auto-set the base role from the role config
        if "custom_role" in update_data:
            custom_role_id = update_data.get("custom_role")
            if custom_role_id:
                try:
                    from app.utils.roles import get_role as _get_role
                    role_cfg = _get_role(custom_role_id)
                    if role_cfg and role_cfg.get("adminAccess"):
                        update_data["role"] = models.RoleEnum.MANAGER
                    else:
                        update_data["role"] = models.RoleEnum.CUSTOMER
                except Exception:
                    pass
            else:
                # Clearing custom_role — keep existing base role unless explicitly changed
                update_data["custom_role"] = None
    for key, value in update_data.items():
        if hasattr(db_user, key):
            setattr(db_user, key, value)
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
    except IntegrityError as e:
        db.rollback()
        if "users.email" in str(e.orig).lower():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Email already registered by another user.")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Database integrity error during user update: {e.orig}")
    return db_user

# Delete a user and their resort-related dependent data
def delete_user_and_related_data(db: Session, user_to_delete: models.User) -> models.User:
    db.query(models.Booking).filter(models.Booking.user_id == user_to_delete.id).delete(synchronize_session=False)

    try:
        db.delete(user_to_delete)
        db.commit()
        return user_to_delete
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Could not delete user due to related data constraints: {str(e)}",
        )


def create_hotel(db: Session, hotel: schemas.HotelCreate) -> models.Hotel:
    return create_db_obj_generic(db, model=models.Hotel, obj_in=hotel)


def create_room(db: Session, room: schemas.RoomCreate) -> models.Room:
    db_hotel = get_db_obj(db, models.Hotel, room.hotel_id)
    if not db_hotel:
        raise HTTPException(status_code=404, detail=f"Hotel with id {room.hotel_id} not found")
    return create_db_obj_generic(db, model=models.Room, obj_in=room)


def create_activity(db: Session, activity: schemas.ActivityCreate) -> models.Activity:
    return create_db_obj_generic(db, model=models.Activity, obj_in=activity)


def create_event(db: Session, event: schemas.EventCreate) -> models.Event:
    return create_db_obj_generic(db, model=models.Event, obj_in=event)


def create_ferry(db: Session, ferry: schemas.FerryCreate) -> models.Ferry:
    return create_db_obj_generic(db, model=models.Ferry, obj_in=ferry)


def create_ferry_schedule(db: Session, schedule: schemas.FerryScheduleCreate) -> models.FerrySchedule:
    db_ferry = get_db_obj(db, models.Ferry, schedule.ferry_id)
    if not db_ferry:
        raise HTTPException(status_code=404, detail=f"Ferry with id {schedule.ferry_id} not found")
    return create_db_obj_generic(db, model=models.FerrySchedule, obj_in=schedule)


def create_booking(db: Session, booking_in: schemas.BookingCreate) -> models.Booking:
    db_user = get_db_obj(db, models.User, booking_in.user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail=f"User with id {booking_in.user_id} not found")

    if booking_in.end_date <= booking_in.start_date:
        raise HTTPException(status_code=400, detail="end_date must be after start_date")
    nights = (booking_in.end_date.date() - booking_in.start_date.date()).days
    if nights < 1:
        raise HTTPException(status_code=400, detail="Booking must be at least 1 night")

    if not booking_in.room_ids:
        raise HTTPException(status_code=400, detail="At least one room is required for a booking")

    room_ids = list(dict.fromkeys(booking_in.room_ids))
    if len(room_ids) != len(booking_in.room_ids):
        raise HTTPException(status_code=400, detail="room_ids must not contain duplicates")

    rooms = db.query(models.Room).filter(models.Room.id.in_(room_ids)).all()
    if len(rooms) != len(room_ids):
        raise HTTPException(status_code=404, detail="One or more rooms were not found")

    if any(not r.available for r in rooms):
        raise HTTPException(status_code=400, detail="One or more rooms are not available")

    hotel_ids = {r.hotel_id for r in rooms}
    if len(hotel_ids) != 1:
        raise HTTPException(status_code=400, detail="All rooms in a booking must be from the same hotel")

    db_hotel = get_db_obj(db, models.Hotel, next(iter(hotel_ids)))
    if not db_hotel:
        raise HTTPException(status_code=404, detail="Hotel not found for selected rooms")

    invalid_floors = [r.id for r in rooms if r.floor_number < 1 or r.floor_number > (db_hotel.floors or 1)]
    if invalid_floors:
        raise HTTPException(
            status_code=400,
            detail=f"One or more rooms have an invalid floor for this hotel: {invalid_floors}",
        )

    total_capacity = sum(int(r.capacity or 0) for r in rooms)
    if booking_in.number_of_guests > total_capacity:
        raise HTTPException(
            status_code=400,
            detail=f"Selected rooms can accommodate at most {total_capacity} guests",
        )

    overlapping = (
        db.query(models.BookingRoom)
        .join(models.Booking, models.BookingRoom.booking_id == models.Booking.id)
        .filter(models.BookingRoom.room_id.in_(room_ids))
        .filter(models.Booking.status != models.BookingStatusEnum.CANCELLED)
        .filter(models.Booking.start_date < booking_in.end_date)
        .filter(models.Booking.end_date > booking_in.start_date)
        .all()
    )
    if overlapping:
        conflict_room_ids = sorted({br.room_id for br in overlapping})
        raise HTTPException(
            status_code=409,
            detail=f"One or more rooms are already booked for the selected dates: {conflict_room_ids}",
        )

    activities = []
    activity_ids: list[int] = []
    if booking_in.activity_ids:
        activity_ids = list(dict.fromkeys(booking_in.activity_ids))
        if len(activity_ids) != len(booking_in.activity_ids):
            raise HTTPException(status_code=400, detail="activity_ids must not contain duplicates")
        activities = db.query(models.Activity).filter(models.Activity.id.in_(activity_ids)).all()
        if len(activities) != len(activity_ids):
            raise HTTPException(status_code=404, detail="One or more activities were not found")

    if booking_in.is_premium:
        non_premium_rooms = [r.id for r in rooms if not r.is_premium]
        non_premium_acts = [a.id for a in activities if not a.is_premium]
        if non_premium_rooms or non_premium_acts:
            raise HTTPException(
                status_code=400,
                detail=f"Premium booking requires premium rooms/activities. Non-premium rooms={non_premium_rooms}, activities={non_premium_acts}",
            )

    rooms_cost = float(sum(float(r.price or 0) for r in rooms)) * float(nights)
    activities_cost = float(sum(float(a.price or 0) for a in activities))
    ferry_cost = float(booking_in.ferry_ticket.price) if booking_in.ferry_ticket else 0.0
    computed_total = float(rooms_cost + activities_cost + ferry_cost)

    booking_data = booking_in.model_dump(exclude={"room_ids", "activity_ids", "ferry_ticket", "total_price"})
    db_booking = models.Booking(
        **booking_data,
        total_price=computed_total,
        status=models.BookingStatusEnum.CONFIRMED,
    )

    try:
        db.add(db_booking)
        db.flush()

        booking_rooms = [models.BookingRoom(booking_id=db_booking.id, room_id=room_id) for room_id in room_ids]
        db.add_all(booking_rooms)

        if activity_ids:
            booking_activities = [models.BookingActivity(booking_id=db_booking.id, activity_id=activity_id) for activity_id in activity_ids]
            db.add_all(booking_activities)

        if booking_in.ferry_ticket:
            if booking_in.ferry_ticket.number_of_tickets < booking_in.number_of_guests:
                raise HTTPException(
                    status_code=400,
                    detail="Ferry ticket count must be at least the number_of_guests",
                )
            db_ferry_ticket = models.FerryTicket(
                booking_id=db_booking.id,
                number_of_tickets=booking_in.ferry_ticket.number_of_tickets,
                price=booking_in.ferry_ticket.price,
            )
            db.add(db_ferry_ticket)

        db.commit()
        db.refresh(db_booking)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database integrity error: {e.orig}")

    return db_booking


def create_payment(db: Session, payment_in: schemas.PaymentCreate) -> models.Payment:
    db_booking = get_db_obj(db, models.Booking, payment_in.booking_id)
    if not db_booking:
        raise HTTPException(status_code=404, detail=f"Booking with id {payment_in.booking_id} not found")

    db_payment = models.Payment(**payment_in.model_dump())
    # If a payment is immediately captured, set paid_at if not provided
    if db_payment.status == models.PaymentStatusEnum.CAPTURED and not db_payment.paid_at:
        from datetime import datetime
        db_payment.paid_at = datetime.utcnow()

    try:
        db.add(db_payment)
        if payment_in.status in [
            models.PaymentStatusEnum.AUTHORIZED,
            models.PaymentStatusEnum.CAPTURED,
        ]:
            db_booking.status = models.BookingStatusEnum.PAYMENT_COMPLETED
            db.add(db_booking)
        db.commit()
        db.refresh(db_payment)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database integrity error: {e.orig}")

    return db_payment


def update_payment(db: Session, db_payment: models.Payment, payment_in: schemas.PaymentUpdate) -> models.Payment:
    update_data = payment_in.model_dump(exclude_unset=True)
    for field_name, value in update_data.items():
        if hasattr(db_payment, field_name):
            setattr(db_payment, field_name, value)

    try:
        db.add(db_payment)
        if "status" in update_data:
            if db_payment.status == models.PaymentStatusEnum.CAPTURED and not db_payment.paid_at:
                from datetime import datetime
                db_payment.paid_at = datetime.utcnow()

        if "status" in update_data and db_payment.booking_id:
            db_booking = get_db_obj(db, models.Booking, db_payment.booking_id)
            if db_booking and db_payment.status in [
                models.PaymentStatusEnum.AUTHORIZED,
                models.PaymentStatusEnum.CAPTURED,
            ]:
                db_booking.status = models.BookingStatusEnum.PAYMENT_COMPLETED
                db.add(db_booking)
        db.commit()
        db.refresh(db_payment)
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Database integrity error: {e.orig}")

    return db_payment

from datetime import datetime, timezone
import uuid


def create_user_session(
    db: Session,
    *,
    user: models.User,
    session_id: str,
    refresh_token: str,
    refresh_jti: str,
    refresh_expires_at: datetime,
    ip_address: str | None = None,
    user_agent: str | None = None,
    device_label: str | None = None,
) -> models.UserSession:
    now = datetime.utcnow()
    sess = models.UserSession(
        id=session_id,
        user_id=user.id,
        refresh_token_hash=security.sha256_hex(refresh_token),
        refresh_token_jti=refresh_jti,
        refresh_token_expiresAt=refresh_expires_at.replace(tzinfo=None),
        ip_address=ip_address,
        user_agent=user_agent,
        device_label=device_label,
        createdAt=now,
        lastUsedAt=now,
        revokedAt=None,
    )
    db.add(sess)
    db.commit()
    db.refresh(sess)
    return sess


def get_user_session(db: Session, *, session_id: str) -> models.UserSession | None:
    return db.query(models.UserSession).filter(models.UserSession.id == session_id).first()


def revoke_user_session(db: Session, *, session_id: str) -> None:
    sess = get_user_session(db, session_id=session_id)
    if not sess:
        return
    sess.revokedAt = datetime.utcnow()
    db.add(sess)
    db.commit()


def revoke_all_user_sessions(db: Session, *, user_id: int) -> int:
    now = datetime.utcnow()
    q = db.query(models.UserSession).filter(
        models.UserSession.user_id == user_id,
        models.UserSession.revokedAt.is_(None),
    )
    count = q.count()
    q.update({models.UserSession.revokedAt: now}, synchronize_session=False)
    db.commit()
    return count


def rotate_session_refresh(
    db: Session,
    *,
    session: models.UserSession,
    new_refresh_token: str,
    new_refresh_jti: str,
    new_refresh_expires_at: datetime,
) -> models.UserSession:
    session.refresh_token_hash = security.sha256_hex(new_refresh_token)
    session.refresh_token_jti = new_refresh_jti
    session.refresh_token_expiresAt = new_refresh_expires_at.replace(tzinfo=None)
    session.lastUsedAt = datetime.utcnow()
    db.add(session)
    db.commit()
    db.refresh(session)
    return session
