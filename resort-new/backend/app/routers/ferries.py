from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import crud, models, schemas
from app.db import get_db
from app.dependencies import require_role

router = APIRouter(tags=["Ferries"], responses={404: {"description": "Not found"}})


@router.post("/", response_model=schemas.FerryResponse, status_code=status.HTTP_201_CREATED)
def create_ferry(
    ferry: schemas.FerryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    return crud.create_ferry(db=db, ferry=ferry)


@router.get("/", response_model=List[schemas.FerryResponse])
def read_ferries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_all_db_obj(db, model=models.Ferry, skip=skip, limit=limit)


@router.get("/{ferry_id}", response_model=schemas.FerryResponse)
def read_ferry(ferry_id: int, db: Session = Depends(get_db)):
    db_ferry = crud.get_db_obj(db, model=models.Ferry, obj_id=ferry_id)
    if not db_ferry:
        raise HTTPException(status_code=404, detail="Ferry not found")
    return db_ferry


@router.put("/{ferry_id}", response_model=schemas.FerryResponse)
def update_ferry_full(
    ferry_id: int,
    ferry: schemas.FerryCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_ferry = crud.get_db_obj(db, model=models.Ferry, obj_id=ferry_id)
    if not db_ferry:
        raise HTTPException(status_code=404, detail="Ferry not found")
    return crud.update_db_obj_generic(db=db, db_obj=db_ferry, obj_in=ferry)


@router.patch("/{ferry_id}", response_model=schemas.FerryResponse)
def update_ferry_partial(
    ferry_id: int,
    ferry: schemas.FerryUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_ferry = crud.get_db_obj(db, model=models.Ferry, obj_id=ferry_id)
    if not db_ferry:
        raise HTTPException(status_code=404, detail="Ferry not found")
    return crud.update_db_obj_generic(db=db, db_obj=db_ferry, obj_in=ferry)


@router.delete("/{ferry_id}", response_model=schemas.FerryResponse)
def delete_ferry(
    ferry_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_ferry = crud.get_db_obj(db, model=models.Ferry, obj_id=ferry_id)
    if not db_ferry:
        raise HTTPException(status_code=404, detail="Ferry not found")
    return crud.remove_db_obj_generic(db=db, db_obj=db_ferry)
