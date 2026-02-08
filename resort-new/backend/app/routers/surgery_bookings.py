# app/routers/surgery_bookings.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import crud, models, schemas
from app.db import get_db
from app.dependencies import get_current_active_user, require_role

router = APIRouter(
    tags=["Surgery Bookings"],
    responses={404: {"description": "Not found"}},
)


@router.post(
    "/",
    response_model=schemas.SurgeryBookingResponse,
    status_code=status.HTTP_201_CREATED,
)
def create_new_surgery_booking(
    booking: schemas.SurgeryBookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role(
            [
                models.RoleEnum.ADMIN,
                models.RoleEnum.MANAGER,
                models.RoleEnum.ADMINISTRATIVE_OFFICER,
                models.RoleEnum.DOCTOR,
            ]
        )
    ),
):
    if (
        current_user.role == models.RoleEnum.DOCTOR
        and hasattr(current_user, "doctor_profile")
        and current_user.doctor_profile
        and current_user.doctor_profile.id != booking.doctor_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Doctors can only create surgery bookings for themselves.",
        )
    return crud.create_surgery_booking(db=db, booking_in=booking)


@router.get("/", response_model=List[schemas.SurgeryBookingResponse])
def read_surgery_bookings(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role(
            [
                models.RoleEnum.ADMIN,
                models.RoleEnum.MANAGER,
                models.RoleEnum.ADMINISTRATIVE_OFFICER,
                models.RoleEnum.DOCTOR,
            ]
        )
    ),
):
    bookings = crud.get_all_db_obj(
        db, model=models.SurgeryBooking, skip=skip, limit=limit
    )
    return bookings


@router.get("/{booking_id}", response_model=schemas.SurgeryBookingResponse)
def read_surgery_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    db_booking = crud.get_db_obj(db, model=models.SurgeryBooking, obj_id=booking_id)
    if db_booking is None:
        raise HTTPException(status_code=404, detail="Surgery booking not found")
    can_view = False
    if current_user.role in [
        models.RoleEnum.ADMIN,
        models.RoleEnum.MANAGER,
        models.RoleEnum.ADMINISTRATIVE_OFFICER,
    ]:
        can_view = True
    elif (
        current_user.role == models.RoleEnum.DOCTOR
        and hasattr(current_user, "doctor_profile")
        and current_user.doctor_profile
        and db_booking.doctor_id == current_user.doctor_profile.id
    ):
        can_view = True
    if not can_view:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to view this surgery booking.",
        )
    return db_booking


@router.put("/{booking_id}", response_model=schemas.SurgeryBookingResponse)
def update_surgery_booking_full(
    booking_id: int,
    booking: schemas.SurgeryBookingCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role(
            [
                models.RoleEnum.ADMIN,
                models.RoleEnum.MANAGER,
                models.RoleEnum.ADMINISTRATIVE_OFFICER,
                models.RoleEnum.DOCTOR,
            ]
        )
    ),
):
    db_booking = crud.get_db_obj(db, model=models.SurgeryBooking, obj_id=booking_id)
    if db_booking is None:
        raise HTTPException(status_code=404, detail="Surgery booking not found")
    can_update = False
    if current_user.role in [
        models.RoleEnum.ADMIN,
        models.RoleEnum.MANAGER,
        models.RoleEnum.ADMINISTRATIVE_OFFICER,
    ]:
        can_update = True
    elif (
        current_user.role == models.RoleEnum.DOCTOR
        and hasattr(current_user, "doctor_profile")
        and current_user.doctor_profile
        and db_booking.doctor_id == current_user.doctor_profile.id
    ):
        can_update = True
    if not can_update:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this surgery booking.",
        )
    if booking.doctor_id != db_booking.doctor_id:
        if not crud.get_db_obj(db, models.Doctor, booking.doctor_id):
            raise HTTPException(
                status_code=404, detail=f"New doctor_id {booking.doctor_id} not found"
            )
    if booking.clinic_id != db_booking.clinic_id:
        if not crud.get_db_obj(db, models.Clinic, booking.clinic_id):
            raise HTTPException(
                status_code=404, detail=f"New clinic_id {booking.clinic_id} not found"
            )
    updated_doctor = crud.get_db_obj(db, models.Doctor, booking.doctor_id)
    if updated_doctor and updated_doctor.clinic_id != booking.clinic_id:
        raise HTTPException(
            status_code=400,
            detail=f"Doctor (ID: {booking.doctor_id}) is not associated with the specified clinic (ID: {booking.clinic_id}).",
        )
    return crud.update_db_obj_generic(db=db, db_obj=db_booking, obj_in=booking)


@router.patch("/{booking_id}", response_model=schemas.SurgeryBookingResponse)
def update_surgery_booking_partial(
    booking_id: int,
    booking: schemas.SurgeryBookingUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    db_booking = crud.get_db_obj(db, model=models.SurgeryBooking, obj_id=booking_id)
    if db_booking is None:
        raise HTTPException(status_code=404, detail="Surgery booking not found")
    can_update = False
    if current_user.role in [
        models.RoleEnum.ADMIN,
        models.RoleEnum.MANAGER,
        models.RoleEnum.ADMINISTRATIVE_OFFICER,
    ]:
        can_update = True
    elif (
        current_user.role == models.RoleEnum.DOCTOR
        and hasattr(current_user, "doctor_profile")
        and current_user.doctor_profile
        and db_booking.doctor_id == current_user.doctor_profile.id
    ):
        can_update = True
    if not can_update:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to update this surgery booking.",
        )
    return crud.update_db_obj_generic(db=db, db_obj=db_booking, obj_in=booking)


@router.delete(
    "/{booking_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_surgery_booking(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role(
            [
                models.RoleEnum.ADMIN,
                models.RoleEnum.MANAGER,
                models.RoleEnum.ADMINISTRATIVE_OFFICER,
                models.RoleEnum.DOCTOR,
            ]
        )
    ),
):
    db_booking = crud.get_db_obj(db, model=models.SurgeryBooking, obj_id=booking_id)
    if db_booking is None:
        raise HTTPException(status_code=404, detail="Surgery booking not found")

    can_delete = False
    if current_user.role in [
        models.RoleEnum.ADMIN,
        models.RoleEnum.MANAGER,
        models.RoleEnum.ADMINISTRATIVE_OFFICER,
    ]:
        can_delete = True
    elif (
        current_user.role == models.RoleEnum.DOCTOR
        and hasattr(current_user, "doctor_profile")
        and current_user.doctor_profile
        and db_booking.doctor_id == current_user.doctor_profile.id
    ):
        can_delete = True

    if not can_delete:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this surgery booking.",
        )

    crud.remove_db_obj_generic(db=db, db_obj=db_booking)
    
    return None