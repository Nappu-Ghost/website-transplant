# app/routers/doctors.py
from fastapi import APIRouter, Depends, HTTPException, status, Query, Response
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from app import crud, models, schemas
from app.db import get_db
from app.dependencies import get_current_active_user, require_role

router = APIRouter(
    # No prefix here, it will be set in app/main.py (e.g., /api/v1/doctors)
    tags=["Doctors"],
    responses={404: {"description": "Not found"}},
)

@router.post("/", response_model=schemas.DoctorResponse, status_code=status.HTTP_201_CREATED)
def create_new_doctor(
    doctor: schemas.DoctorCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER]))
):
    # crud.create_doctor should handle linking/creating user and doctor profile
    return crud.create_doctor(db=db, doctor_in=doctor)


@router.get("/", response_model=List[schemas.DoctorResponse])
def read_doctors_list(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    # Authentication dependency removed to make this endpoint public as per previous request
    # If it needs to be protected, add:
    # current_user: models.User = Depends(get_current_active_user),

    # Query parameters for filtering
    clinic_id: Optional[int] = Query(None, description="Filter by clinic ID"), # Expects 'clinic_id' query param
    status: Optional[models.StatusEnum] = Query(None, description="Filter by status (ACTIVE/INACTIVE)"),
    specialty: Optional[str] = Query(None, description="Filter by specialty (partial match)")
):
    query = db.query(models.Doctor)
    if clinic_id is not None:
        query = query.filter(models.Doctor.clinic_id == clinic_id)
    if status:
        query = query.filter(models.Doctor.status == status)
    if specialty:
        query = query.filter(models.Doctor.specialty.ilike(f"%{specialty}%"))
    
    # Eager load related user and clinic data for the response model
    query = query.options(
        joinedload(models.Doctor.user),
        joinedload(models.Doctor.clinic)
    ).order_by(models.Doctor.id) # Added default ordering for consistency
    
    doctors = query.offset(skip).limit(limit).all()
    return doctors


@router.get("/{doctor_id}", response_model=schemas.DoctorResponse)
def read_doctor_by_id(
    doctor_id: int,
    db: Session = Depends(get_db)
    # Authentication dependency removed to make this public as per previous request
    # If it needs to be protected, add:
    # current_user: models.User = Depends(get_current_active_user),
):
    db_doctor = db.query(models.Doctor).options(
        joinedload(models.Doctor.user),
        joinedload(models.Doctor.clinic)
    ).filter(models.Doctor.id == doctor_id).first()

    if db_doctor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    
    # If you re-add auth, you might add authorization checks here:
    # if not (current_user.role == models.RoleEnum.ADMIN or current_user.doctor_profile.id == doctor_id):
    #     raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized")
    return db_doctor


@router.put("/{doctor_id}", response_model=schemas.DoctorResponse)
def update_doctor_full(
    doctor_id: int,
    doctor_in: schemas.DoctorCreate, # Using DoctorCreate for PUT, implies all fields are sent for replacement
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER]))
):
    db_doctor = crud.get_db_obj(db, model=models.Doctor, obj_id=doctor_id)
    if db_doctor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    # Validation for user_id if present in the update (DoctorCreate might not have it if new user details are given)
    # This logic might be better placed in a specific crud.update_doctor function
    if doctor_in.user_id and doctor_in.user_id != db_doctor.user_id:
        target_user = crud.get_db_obj(db, models.User, doctor_in.user_id)
        if not target_user:
            raise HTTPException(status_code=404, detail=f"User with ID {doctor_in.user_id} not found for linking.")
        # Check if new user_id is already linked to another doctor
        existing_doctor_link = db.query(models.Doctor).filter(models.Doctor.user_id == doctor_in.user_id).first()
        if existing_doctor_link and existing_doctor_link.id != doctor_id:
            raise HTTPException(status_code=400, detail=f"User ID {doctor_in.user_id} is already linked to another doctor.")
    
    # Validate clinic_id
    if doctor_in.clinic_id is not None: # clinic_id is mandatory in DoctorCreate
        target_clinic = crud.get_db_obj(db, models.Clinic, doctor_in.clinic_id)
        if not target_clinic:
            raise HTTPException(status_code=404, detail=f"Clinic with ID {doctor_in.clinic_id} not found.")
    
    # Note: DoctorCreate schema might not be ideal for PUT if you don't want to re-send user_email etc.
    # Consider a DoctorUpdatePut schema. For now, using generic update.
    return crud.update_db_obj_generic(db=db, db_obj=db_doctor, obj_in=doctor_in)


@router.patch("/{doctor_id}", response_model=schemas.DoctorResponse)
def update_doctor_partial(
    doctor_id: int,
    doctor_in: schemas.DoctorUpdate, # Using DoctorUpdate for PATCH
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER]))
):
    db_doctor = crud.get_db_obj(db, model=models.Doctor, obj_id=doctor_id)
    if db_doctor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")

    update_data = doctor_in.model_dump(exclude_unset=True)

    # Validate user_id if being changed in PATCH
    if "user_id" in update_data and update_data["user_id"] is not None:
        if update_data["user_id"] != db_doctor.user_id:
            target_user = crud.get_db_obj(db, models.User, update_data["user_id"])
            if not target_user:
                raise HTTPException(status_code=404, detail=f"User with ID {update_data['user_id']} not found for linking.")
            existing_doctor_link = db.query(models.Doctor).filter(models.Doctor.user_id == update_data["user_id"]).first()
            if existing_doctor_link and existing_doctor_link.id != doctor_id:
                raise HTTPException(status_code=400, detail=f"User ID {update_data['user_id']} is already linked to another doctor.")
    
    # Validate clinic_id if being changed in PATCH
    if "clinic_id" in update_data and update_data["clinic_id"] is not None:
        target_clinic = crud.get_db_obj(db, models.Clinic, update_data["clinic_id"])
        if not target_clinic:
            raise HTTPException(status_code=404, detail=f"Clinic with ID {update_data['clinic_id']} not found.")

    return crud.update_db_obj_generic(db=db, db_obj=db_doctor, obj_in=doctor_in)


@router.delete("/{doctor_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_doctor_by_id(
    doctor_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER]))
):
    db_doctor = crud.get_db_obj(db, model=models.Doctor, obj_id=doctor_id)
    if db_doctor is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Doctor not found")
    
    # Add checks here if doctor has active shifts/appointments before deletion if necessary
    
    crud.remove_db_obj_generic(db=db, db_obj=db_doctor)
    return Response(status_code=status.HTTP_204_NO_CONTENT)