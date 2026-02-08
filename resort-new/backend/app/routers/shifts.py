# app/routers/shifts.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app import crud, models, schemas
from app.db import get_db
from app.dependencies import get_current_active_user, require_role

router = APIRouter(
    tags=["Shifts"],
    responses={404: {"description": "Not found"}},
)


@router.post(
    "/", response_model=schemas.ShiftResponse, status_code=status.HTTP_201_CREATED
)
def create_new_shift(
    shift: schemas.ShiftCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role(
            [
                models.RoleEnum.ADMIN,
                models.RoleEnum.MANAGER,
                models.RoleEnum.ADMINISTRATIVE_OFFICER,
            ]
        )
    ),
):
    return crud.create_shift(db=db, shift_in=shift)


@router.get("/", response_model=List[schemas.ShiftResponse])
def read_shifts(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    shifts = crud.get_all_db_obj(db, model=models.Shift, skip=skip, limit=limit)
    return shifts


@router.get("/{shift_id}", response_model=schemas.ShiftResponse)
def read_shift(
    shift_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    db_shift = crud.get_db_obj(db, model=models.Shift, obj_id=shift_id)
    if db_shift is None:
        raise HTTPException(status_code=404, detail="Shift not found")
    return db_shift


@router.put("/{shift_id}", response_model=schemas.ShiftResponse)
def update_shift_full(
    shift_id: int,
    shift: schemas.ShiftCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role(
            [
                models.RoleEnum.ADMIN,
                models.RoleEnum.MANAGER,
                models.RoleEnum.ADMINISTRATIVE_OFFICER,
            ]
        )
    ),
):
    db_shift = crud.get_db_obj(db, model=models.Shift, obj_id=shift_id)
    if db_shift is None:
        raise HTTPException(status_code=404, detail="Shift not found")
    if shift.doctor_id != db_shift.doctor_id:
        doctor = crud.get_db_obj(db, models.Doctor, shift.doctor_id)
        if not doctor:
            raise HTTPException(
                status_code=404, detail=f"New doctor_id {shift.doctor_id} not found"
            )
        if doctor.clinic_id != shift.clinic_id:
            raise HTTPException(
                status_code=400,
                detail=f"Doctor (ID: {doctor.id}) is not associated with the specified clinic (ID: {shift.clinic_id}).",
            )
    if shift.clinic_id != db_shift.clinic_id:
        if not crud.get_db_obj(db, models.Clinic, shift.clinic_id):
            raise HTTPException(
                status_code=404, detail=f"New clinic_id {shift.clinic_id} not found"
            )
        if (
            shift.doctor_id == db_shift.doctor_id
            and db_shift.doctor.clinic_id != shift.clinic_id
        ):
            raise HTTPException(
                status_code=400,
                detail=f"Doctor (ID: {db_shift.doctor_id}) is not associated with the new clinic (ID: {shift.clinic_id}).",
            )
    return crud.update_db_obj_generic(db=db, db_obj=db_shift, obj_in=shift)


@router.patch("/{shift_id}", response_model=schemas.ShiftResponse)
def update_shift_partial(
    shift_id: int,
    shift: schemas.ShiftUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role(
            [
                models.RoleEnum.ADMIN,
                models.RoleEnum.MANAGER,
                models.RoleEnum.ADMINISTRATIVE_OFFICER,
            ]
        )
    ),
):
    db_shift = crud.get_db_obj(db, model=models.Shift, obj_id=shift_id)
    if db_shift is None:
        raise HTTPException(status_code=404, detail="Shift not found")
    return crud.update_db_obj_generic(db=db, db_obj=db_shift, obj_in=shift)


@router.delete(
    "/{shift_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_shift(
    shift_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role(
            [
                models.RoleEnum.ADMIN,
                models.RoleEnum.MANAGER,
                models.RoleEnum.ADMINISTRATIVE_OFFICER,
            ]
        )
    ),
):
    db_shift = crud.get_db_obj(db, model=models.Shift, obj_id=shift_id)
    if db_shift is None:
        raise HTTPException(status_code=404, detail="Shift not found")
    
    crud.remove_db_obj_generic(db=db, db_obj=db_shift)
    
    return None