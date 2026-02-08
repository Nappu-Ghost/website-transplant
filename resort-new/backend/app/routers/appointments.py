from fastapi import APIRouter, Depends, HTTPException, status, Response, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from datetime import date as PyDate, datetime

from app import crud, models, schemas
from app.db import get_db
from app.dependencies import get_current_active_user, require_role

router = APIRouter(
    tags=["Appointments"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.AppointmentResponse, status_code=status.HTTP_201_CREATED)
def create_new_appointment(
    booking: schemas.AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role([
        models.RoleEnum.ADMIN, models.RoleEnum.MANAGER,
        models.RoleEnum.ADMINISTRATIVE_OFFICER, models.RoleEnum.DOCTOR, models.RoleEnum.CUSTOMER
    ]))
):
    if current_user.role == models.RoleEnum.CUSTOMER and current_user.id != booking.customer_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Customers can only create appointments for themselves."
        )
    return crud.create_appointment(db=db, appointment_in=booking)


@router.get("/", response_model=List[schemas.AppointmentResponse])
def read_appointments_list(
    skip: int = 0, limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
    customer_id: Optional[int] = Query(None, alias="customerId"),
    doctor_id: Optional[int] = Query(None, alias="doctorId"),
    clinic_id: Optional[int] = Query(None, alias="clinicId"),
    status: Optional[schemas.AppointmentStatusEnum] = Query(None),
    date_from: Optional[PyDate] = Query(None, alias="dateFrom"),
    date_to: Optional[PyDate] = Query(None, alias="dateTo")
):
    query = db.query(models.Appointment)

    if current_user.role == models.RoleEnum.CUSTOMER:
        query = query.filter(models.Appointment.customer_id == current_user.id)
    elif current_user.role == models.RoleEnum.DOCTOR:
        if hasattr(current_user, "doctor_profile") and current_user.doctor_profile:
            query = query.filter(models.Appointment.doctor_id == current_user.doctor_profile.id)
        else:
            return []

    if customer_id is not None:
        if current_user.role not in [models.RoleEnum.ADMIN, models.RoleEnum.MANAGER, models.RoleEnum.ADMINISTRATIVE_OFFICER]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to filter by customer ID")
        query = query.filter(models.Appointment.customer_id == customer_id)
    if doctor_id is not None:
        query = query.filter(models.Appointment.doctor_id == doctor_id)
    if clinic_id is not None:
        query = query.filter(models.Appointment.clinic_id == clinic_id)
    if status:
        query = query.filter(models.Appointment.status == status)
    if date_from:
        query = query.filter(models.Appointment.appointment_time >= datetime.combine(date_from, datetime.min.time()))
    if date_to:
        query = query.filter(models.Appointment.appointment_time <= datetime.combine(date_to, datetime.max.time()))
    
    query = query.options(
        joinedload(models.Appointment.customer),
        joinedload(models.Appointment.clinic),
        joinedload(models.Appointment.service),
        joinedload(models.Appointment.doctor).joinedload(models.Doctor.user)
    ).order_by(models.Appointment.appointment_time.desc())
    
    appointments = query.offset(skip).limit(limit).all()
    return appointments


@router.get("/{booking_id_or_ref}", response_model=schemas.AppointmentResponse)
def read_appointment_by_id_or_ref(
    booking_id_or_ref: str,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    query = db.query(models.Appointment).options(
        joinedload(models.Appointment.customer),
        joinedload(models.Appointment.clinic),
        joinedload(models.Appointment.service),
        joinedload(models.Appointment.doctor).joinedload(models.Doctor.user)
    )
    try:
        booking_id_int = int(booking_id_or_ref)
        db_appointment = query.filter(models.Appointment.id == booking_id_int).first()
    except ValueError:
        db_appointment = query.filter(models.Appointment.bookingReference == booking_id_or_ref).first()

    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")

    can_view = False
    if current_user.role in [models.RoleEnum.ADMIN, models.RoleEnum.MANAGER, models.RoleEnum.ADMINISTRATIVE_OFFICER]:
        can_view = True
    elif current_user.role == models.RoleEnum.CUSTOMER and db_appointment.customer_id == current_user.id:
        can_view = True
    elif (current_user.role == models.RoleEnum.DOCTOR and hasattr(current_user, "doctor_profile") and
            current_user.doctor_profile and db_appointment.doctor_id == current_user.doctor_profile.id):
        can_view = True
    
    if not can_view:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this appointment.")
    return db_appointment


@router.put("/{booking_reference_str}", response_model=schemas.AppointmentResponse)
def update_appointment_by_booking_reference(
    booking_reference_str: str,
    appointment_in: schemas.AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_appointment = db.query(models.Appointment).filter(
        models.Appointment.bookingReference == booking_reference_str
    ).first()

    if db_appointment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")

    can_update = False
    allowed_staff_roles = [models.RoleEnum.ADMIN, models.RoleEnum.MANAGER, models.RoleEnum.ADMINISTRATIVE_OFFICER]
    if current_user.role in allowed_staff_roles:
        can_update = True
    
    if not can_update:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this appointment.")

    if not crud.get_db_obj(db, models.User, appointment_in.customer_id):
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"User with customer_id {appointment_in.customer_id} not found")
    if not crud.get_db_obj(db, models.Clinic, appointment_in.clinic_id):
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Clinic with clinic_id {appointment_in.clinic_id} not found")
    if not crud.get_db_obj(db, models.Service, appointment_in.service_id):
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Service with service_id {appointment_in.service_id} not found")
    if not crud.get_db_obj(db, models.Doctor, appointment_in.doctor_id):
         raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Doctor with doctor_id {appointment_in.doctor_id} not found")

    updated_appointment = crud.update_db_obj_generic(db=db, db_obj=db_appointment, obj_in=appointment_in)
    return updated_appointment


@router.patch("/{appointment_id}", response_model=schemas.AppointmentResponse)
def update_appointment_partial(
    appointment_id: int,
    appointment_in: schemas.AppointmentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_appointment = crud.get_db_obj(db, model=models.Appointment, obj_id=appointment_id)
    if db_appointment is None:
        raise HTTPException(status_code=404, detail="Appointment not found")

    can_update = False
    if current_user.role in [models.RoleEnum.ADMIN, models.RoleEnum.MANAGER, models.RoleEnum.ADMINISTRATIVE_OFFICER]:
        can_update = True
    elif current_user.id == db_appointment.customer_id:
        update_data = appointment_in.model_dump(exclude_unset=True)
        allowed_customer_fields = {"status", "notes"}
        if any(field not in allowed_customer_fields for field in update_data.keys()):
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customers can only update status or notes.")
        if "status" in update_data and update_data["status"] != schemas.AppointmentStatusEnum.CANCELLED: # Example strict rule
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Customers can only cancel appointments via PATCH.")
        can_update = True
    
    if not can_update:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this appointment.")
        
    return crud.update_db_obj_generic(db=db, db_obj=db_appointment, obj_in=appointment_in)


@router.delete("/{appointment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_appointment_by_id(
    appointment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER]))
):
    db_appointment = crud.get_db_obj(db, model=models.Appointment, obj_id=appointment_id)
    if db_appointment is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Appointment not found")
    
    crud.remove_db_obj_generic(db=db, db_obj=db_appointment)
    return Response(status_code=status.HTTP_204_NO_CONTENT)