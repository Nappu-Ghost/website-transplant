from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import crud, models, schemas
from app.db import get_db
from app.dependencies import require_role

router = APIRouter(tags=["Activities"], responses={404: {"description": "Not found"}})


@router.post("/", response_model=schemas.ActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(
    activity: schemas.ActivityCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    return crud.create_activity(db=db, activity=activity)


@router.get("/", response_model=List[schemas.ActivityResponse])
def read_activities(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_all_db_obj(db, model=models.Activity, skip=skip, limit=limit)


@router.get("/{activity_id}", response_model=schemas.ActivityResponse)
def read_activity(activity_id: int, db: Session = Depends(get_db)):
    db_activity = crud.get_db_obj(db, model=models.Activity, obj_id=activity_id)
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return db_activity


@router.put("/{activity_id}", response_model=schemas.ActivityResponse)
def update_activity_full(
    activity_id: int,
    activity: schemas.ActivityCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_activity = crud.get_db_obj(db, model=models.Activity, obj_id=activity_id)
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return crud.update_db_obj_generic(db=db, db_obj=db_activity, obj_in=activity)


@router.patch("/{activity_id}", response_model=schemas.ActivityResponse)
def update_activity_partial(
    activity_id: int,
    activity: schemas.ActivityUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_activity = crud.get_db_obj(db, model=models.Activity, obj_id=activity_id)
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return crud.update_db_obj_generic(db=db, db_obj=db_activity, obj_in=activity)


@router.delete("/{activity_id}", response_model=schemas.ActivityResponse)
def delete_activity(
    activity_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_activity = crud.get_db_obj(db, model=models.Activity, obj_id=activity_id)
    if not db_activity:
        raise HTTPException(status_code=404, detail="Activity not found")
    return crud.remove_db_obj_generic(db=db, db_obj=db_activity)
