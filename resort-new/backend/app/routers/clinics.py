# app/routers/clinics.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import crud, models, schemas
from app.db import get_db
from app.dependencies import get_current_active_user, require_role

router = APIRouter(
    tags=["Clinics"],
    responses={404: {"description": "Not found"}},
)


@router.post(
    "/", response_model=schemas.ClinicResponse, status_code=status.HTTP_201_CREATED
)
def create_clinic(
    clinic: schemas.ClinicCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_clinic_by_name = (
        db.query(models.Clinic).filter(models.Clinic.name == clinic.name).first()
    )
    if db_clinic_by_name:
        raise HTTPException(status_code=400, detail="Clinic name already registered")
    return crud.create_clinic(db=db, clinic=clinic)


@router.get("/", response_model=List[schemas.ClinicResponse])
def read_clinics(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    clinics = crud.get_all_db_obj(db, model=models.Clinic, skip=skip, limit=limit)
    return clinics


@router.get("/{clinic_id}", response_model=schemas.ClinicResponse)
def read_clinic(clinic_id: int, db: Session = Depends(get_db)):
    db_clinic = crud.get_db_obj(db, model=models.Clinic, obj_id=clinic_id)
    if db_clinic is None:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return db_clinic


@router.put("/{clinic_id}", response_model=schemas.ClinicResponse)
def update_clinic_full(
    clinic_id: int,
    clinic: schemas.ClinicCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_clinic = crud.get_db_obj(db, model=models.Clinic, obj_id=clinic_id)
    if db_clinic is None:
        raise HTTPException(status_code=404, detail="Clinic not found")
    if clinic.name != db_clinic.name:
        existing_clinic = (
            db.query(models.Clinic).filter(models.Clinic.name == clinic.name).first()
        )
        if existing_clinic and existing_clinic.id != clinic_id:
            raise HTTPException(status_code=400, detail="Clinic name already exists")
    return crud.update_db_obj_generic(db=db, db_obj=db_clinic, obj_in=clinic)


@router.patch("/{clinic_id}", response_model=schemas.ClinicResponse)
def update_clinic_partial(
    clinic_id: int,
    clinic: schemas.ClinicUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_clinic = crud.get_db_obj(db, model=models.Clinic, obj_id=clinic_id)
    if db_clinic is None:
        raise HTTPException(status_code=404, detail="Clinic not found")
    if clinic.name:
        existing_clinic = (
            db.query(models.Clinic).filter(models.Clinic.name == clinic.name).first()
        )
        if existing_clinic and existing_clinic.id != clinic_id:
            raise HTTPException(status_code=400, detail="Clinic name already exists")
    return crud.update_db_obj_generic(db=db, db_obj=db_clinic, obj_in=clinic)


@router.delete("/{clinic_id}", response_model=schemas.ClinicResponse)
def delete_clinic(
    clinic_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_clinic = crud.get_db_obj(db, model=models.Clinic, obj_id=clinic_id)
    if db_clinic is None:
        raise HTTPException(status_code=404, detail="Clinic not found")
    return crud.delete_clinic_and_related_data(db=db, clinic_to_delete=db_clinic)

