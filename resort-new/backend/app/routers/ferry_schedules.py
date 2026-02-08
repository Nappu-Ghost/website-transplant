from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app import crud, models, schemas
from app.db import get_db
from app.dependencies import require_role

router = APIRouter(tags=["Ferry Schedules"], responses={404: {"description": "Not found"}})


@router.post("/", response_model=schemas.FerryScheduleResponse, status_code=status.HTTP_201_CREATED)
def create_ferry_schedule(
    schedule: schemas.FerryScheduleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    return crud.create_ferry_schedule(db=db, schedule=schedule)


@router.get("/", response_model=List[schemas.FerryScheduleResponse])
def read_ferry_schedules(
    ferry_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(models.FerrySchedule)
    if ferry_id is not None:
        query = query.filter(models.FerrySchedule.ferry_id == ferry_id)
    return query.offset(skip).limit(limit).all()


@router.get("/{schedule_id}", response_model=schemas.FerryScheduleResponse)
def read_ferry_schedule(schedule_id: int, db: Session = Depends(get_db)):
    db_schedule = crud.get_db_obj(db, model=models.FerrySchedule, obj_id=schedule_id)
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Ferry schedule not found")
    return db_schedule


@router.put("/{schedule_id}", response_model=schemas.FerryScheduleResponse)
def update_ferry_schedule_full(
    schedule_id: int,
    schedule: schemas.FerryScheduleCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_schedule = crud.get_db_obj(db, model=models.FerrySchedule, obj_id=schedule_id)
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Ferry schedule not found")
    return crud.update_db_obj_generic(db=db, db_obj=db_schedule, obj_in=schedule)


@router.patch("/{schedule_id}", response_model=schemas.FerryScheduleResponse)
def update_ferry_schedule_partial(
    schedule_id: int,
    schedule: schemas.FerryScheduleUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_schedule = crud.get_db_obj(db, model=models.FerrySchedule, obj_id=schedule_id)
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Ferry schedule not found")
    return crud.update_db_obj_generic(db=db, db_obj=db_schedule, obj_in=schedule)


@router.delete("/{schedule_id}", response_model=schemas.FerryScheduleResponse)
def delete_ferry_schedule(
    schedule_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_schedule = crud.get_db_obj(db, model=models.FerrySchedule, obj_id=schedule_id)
    if not db_schedule:
        raise HTTPException(status_code=404, detail="Ferry schedule not found")
    return crud.remove_db_obj_generic(db=db, db_obj=db_schedule)
