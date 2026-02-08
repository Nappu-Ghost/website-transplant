# app/crud.py
from sqlalchemy.orm import Session, joinedload # Ensure joinedload is imported if used elsewhere
from sqlalchemy.exc import IntegrityError
from app import models, schemas
from typing import List, Optional, Type, TypeVar, Generic, Any
from pydantic import BaseModel as PydanticBaseModel
from fastapi import HTTPException, status
from app.utils.security import get_password_hash, verify_password

ModelType = TypeVar("ModelType", bound=models.Base)
CreateSchemaType = TypeVar("CreateSchemaType", bound=PydanticBaseModel)
UpdateSchemaType = TypeVar("UpdateSchemaType", bound=PydanticBaseModel)

def get_db_obj(db: Session, model: Type[ModelType], obj_id: int) -> Optional[ModelType]:
    return db.query(model).filter(model.id == obj_id).first()

def get_all_db_obj(db: Session, model: Type[ModelType], skip: int = 0, limit: int = 100) -> List[ModelType]:
    # If fetching related data for display, add .options(joinedload(...)) here or in router
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
    # This generic version will still fail if there are unhandled foreign key constraints
    try:
        db.delete(db_obj)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Cannot delete item. It might be referenced by other records: {e.orig}")
    return db_obj # Note: db_obj is detached after commit if deletion was successful

# --- User Specific CRUD ---
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

# NEW function for deleting a user and their customer appointments
def delete_user_and_related_data(db: Session, user_to_delete: models.User) -> models.User:
    # 1. Delete appointments where this user is the customer
    #    This assumes appointments are not critical to keep if the customer is gone.
    #    If a doctor made the appointment, that link might also need consideration.
    db.query(models.Appointment).filter(models.Appointment.customer_id == user_to_delete.id).delete(synchronize_session=False)

    # 2. If the user has a doctor_profile, it should be deleted by cascade
    #    because User.doctor_profile has cascade="all, delete-orphan".
    #    If not, you would delete it manually here:
    #    if user_to_delete.doctor_profile:
    #        db.delete(user_to_delete.doctor_profile)

    # 3. Delete the user itself
    try:
        db.delete(user_to_delete)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        # This might happen if the user is still referenced by other tables
        # not handled above (e.g., if they are a doctor in a shift/surgery_booking
        # and the Doctor profile wasn't cascaded or its FKs weren't handled).
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=f"Cannot delete user. They might be referenced in other records not automatically cleared: {e.orig}")
    
    return user_to_delete # The object is detached but can be returned for confirmation

# --- Clinic Specific CRUD ---
def create_clinic(db: Session, clinic: schemas.ClinicCreate) -> models.Clinic:
    return create_db_obj_generic(db, model=models.Clinic, obj_in=clinic)

# --- Service Specific CRUD ---
def create_service(db: Session, service: schemas.ServiceCreate) -> models.Service:
    return create_db_obj_generic(db, model=models.Service, obj_in=service)

# --- Doctor Specific CRUD ---
def create_doctor(db: Session, doctor_in: schemas.DoctorCreate) -> models.Doctor:
    user_id_to_use = doctor_in.user_id
    if doctor_in.user_email:
        if not doctor_in.user_password:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Password is required when creating a new user for a doctor.")
        if get_user_by_email(db, email=doctor_in.user_email):
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Doctor's user email already exists.")
        if user_id_to_use:
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Cannot specify both new user details and existing user_id.")
        new_user_schema = schemas.UserCreate(
            email=doctor_in.user_email,
            password=doctor_in.user_password,
            name=doctor_in.user_name or f"Dr. {doctor_in.user_email.split('@')[0]}",
            role=models.RoleEnum.DOCTOR,
            status=models.StatusEnum.ACTIVE
        )
        created_user = create_user(db, new_user_schema)
        user_id_to_use = created_user.id
    elif user_id_to_use:
        user = get_db_obj(db, models.User, user_id_to_use)
        if not user:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User with id {user_id_to_use} not found.")
        existing_doctor_profile = db.query(models.Doctor).filter(models.Doctor.user_id == user_id_to_use).first()
        if existing_doctor_profile:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"User with id {user_id_to_use} is already linked to a doctor profile.")
        if user.role != models.RoleEnum.DOCTOR: # Ensure user is a doctor
            user.role = models.RoleEnum.DOCTOR
            db.add(user) # Will be committed with doctor creation
    else:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Doctor must be associated with a user. Provide user_id or new user details.")
    
    clinic = get_db_obj(db, models.Clinic, doctor_in.clinic_id)
    if not clinic:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Clinic with id {doctor_in.clinic_id} not found.")

    doctor_data_for_model = doctor_in.model_dump(exclude={"user_email", "user_password", "user_name", "user_role"})
    doctor_data_for_model["user_id"] = user_id_to_use
    
    db_doctor = models.Doctor(**doctor_data_for_model)
    try:
        db.add(db_doctor)
        db.commit()
        db.refresh(db_doctor)
    except IntegrityError as e:
        db.rollback()
        if "doctors_user_id_key" in str(e.orig) or "UNIQUE constraint failed: doctors.user_id" in str(e.orig):
             raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"User ID {user_id_to_use} is already assigned to another doctor.")
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Error creating doctor profile: {e.orig}")
    return db_doctor

# --- Appointment Specific CRUD ---
def create_appointment(db: Session, appointment_in: schemas.AppointmentCreate) -> models.Appointment:
    if not get_db_obj(db, models.User, appointment_in.customer_id):
        raise HTTPException(status_code=404, detail=f"Customer with id {appointment_in.customer_id} not found")
    db_clinic = get_db_obj(db, models.Clinic, appointment_in.clinic_id)
    if not db_clinic:
        raise HTTPException(status_code=404, detail=f"Clinic with id {appointment_in.clinic_id} not found")
    if not get_db_obj(db, models.Service, appointment_in.service_id):
        raise HTTPException(status_code=404, detail=f"Service with id {appointment_in.service_id} not found")
    db_doctor = get_db_obj(db, models.Doctor, appointment_in.doctor_id)
    if not db_doctor:
        raise HTTPException(status_code=404, detail=f"Doctor with id {appointment_in.doctor_id} not found")
    if db_doctor.clinic_id != appointment_in.clinic_id:
        raise HTTPException(status_code=400,detail=f"Doctor (ID: {db_doctor.id}) is not associated with the specified clinic (ID: {appointment_in.clinic_id}).")
    return create_db_obj_generic(db, model=models.Appointment, obj_in=appointment_in)

# --- Shift Specific CRUD ---
def create_shift(db: Session, shift_in: schemas.ShiftCreate) -> models.Shift:
    db_doctor = get_db_obj(db, models.Doctor, shift_in.doctor_id)
    if not db_doctor:
        raise HTTPException(status_code=404, detail=f"Doctor with id {shift_in.doctor_id} not found")
    db_clinic = get_db_obj(db, models.Clinic, shift_in.clinic_id)
    if not db_clinic:
        raise HTTPException(status_code=404, detail=f"Clinic with id {shift_in.clinic_id} not found")
    if db_doctor.clinic_id != shift_in.clinic_id:
        raise HTTPException(status_code=400, detail=f"Doctor (ID: {db_doctor.id}) is not associated with the specified clinic (ID: {shift_in.clinic_id}) for the shift.")
    return create_db_obj_generic(db, model=models.Shift, obj_in=shift_in)

# --- SurgeryBooking Specific CRUD ---
def create_surgery_booking(db: Session, booking_in: schemas.SurgeryBookingCreate) -> models.SurgeryBooking:
    db_clinic = get_db_obj(db, models.Clinic, booking_in.clinic_id)
    if not db_clinic:
        raise HTTPException(status_code=404, detail=f"Clinic with id {booking_in.clinic_id} not found")
    if db_clinic.surgeryRooms < 1: # Using the correct attribute name
        raise HTTPException(status_code=400, detail=f"Clinic with id {booking_in.clinic_id} has no surgery rooms available.")
    db_doctor = get_db_obj(db, models.Doctor, booking_in.doctor_id)
    if not db_doctor:
        raise HTTPException(status_code=404, detail=f"Doctor with id {booking_in.doctor_id} not found")
    if db_doctor.clinic_id != booking_in.clinic_id:
        raise HTTPException(status_code=400, detail=f"Doctor (ID: {db_doctor.id}) is not associated with the specified clinic (ID: {booking_in.clinic_id}) for the surgery booking.")
    return create_db_obj_generic(db, model=models.SurgeryBooking, obj_in=booking_in)

def delete_clinic_and_related_data(db: Session, clinic_to_delete: models.Clinic) -> models.Clinic:
    # Delete Appointments
    db.query(models.Appointment).filter(models.Appointment.clinic_id == clinic_to_delete.id).delete(synchronize_session=False)

    # Delete Shifts
    db.query(models.Shift).filter(models.Shift.clinic_id == clinic_to_delete.id).delete(synchronize_session=False)

    # Delete Surgery Bookings
    db.query(models.SurgeryBooking).filter(models.SurgeryBooking.clinic_id == clinic_to_delete.id).delete(synchronize_session=False)

    # Delete Doctors and their Users
    doctors = db.query(models.Doctor).filter(models.Doctor.clinic_id == clinic_to_delete.id).all()
    for doctor in doctors:
        user = db.query(models.User).filter(models.User.id == doctor.user_id).first()
        db.delete(doctor)
        if user:
            db.delete(user)

    try:
        db.delete(clinic_to_delete)
        db.commit()
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=f"Cannot delete clinic. It might be referenced in other records: {e.orig}"
        )
    return clinic_to_delete
