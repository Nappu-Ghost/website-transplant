from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import crud, models, schemas
from app.db import get_db
from app.dependencies import require_role

router = APIRouter(tags=["Events"], responses={404: {"description": "Not found"}})


@router.post("", response_model=schemas.EventResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=schemas.EventResponse, status_code=status.HTTP_201_CREATED)
def create_event(
    event: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    return crud.create_event(db=db, event=event)


@router.get("", response_model=List[schemas.EventResponse])
@router.get("/", response_model=List[schemas.EventResponse])
def read_events(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_all_db_obj(db, model=models.Event, skip=skip, limit=limit)


@router.get("/{event_id}", response_model=schemas.EventResponse)
def read_event(event_id: int, db: Session = Depends(get_db)):
    db_event = crud.get_db_obj(db, model=models.Event, obj_id=event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    return db_event


@router.put("/{event_id}", response_model=schemas.EventResponse)
def update_event_full(
    event_id: int,
    event: schemas.EventCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_event = crud.get_db_obj(db, model=models.Event, obj_id=event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    return crud.update_db_obj_generic(db=db, db_obj=db_event, obj_in=event)


@router.patch("/{event_id}", response_model=schemas.EventResponse)
def update_event_partial(
    event_id: int,
    event: schemas.EventUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_event = crud.get_db_obj(db, model=models.Event, obj_id=event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    return crud.update_db_obj_generic(db=db, db_obj=db_event, obj_in=event)


@router.delete("/{event_id}", response_model=schemas.EventResponse)
def delete_event(
    event_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_event = crud.get_db_obj(db, model=models.Event, obj_id=event_id)
    if not db_event:
        raise HTTPException(status_code=404, detail="Event not found")
    return crud.remove_db_obj_generic(db=db, db_obj=db_event)
