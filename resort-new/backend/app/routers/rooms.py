from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional

from app import crud, models, schemas
from app.db import get_db
from app.dependencies import require_role

router = APIRouter(tags=["Rooms"], responses={404: {"description": "Not found"}})


@router.post("/", response_model=schemas.RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(
    room: schemas.RoomCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    return crud.create_room(db=db, room=room)


@router.get("/", response_model=List[schemas.RoomResponse])
def read_rooms(
    hotel_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
):
    query = db.query(models.Room)
    if hotel_id is not None:
        query = query.filter(models.Room.hotel_id == hotel_id)
    return query.offset(skip).limit(limit).all()


@router.get("/{room_id}", response_model=schemas.RoomResponse)
def read_room(room_id: int, db: Session = Depends(get_db)):
    db_room = crud.get_db_obj(db, model=models.Room, obj_id=room_id)
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    return db_room


@router.put("/{room_id}", response_model=schemas.RoomResponse)
def update_room_full(
    room_id: int,
    room: schemas.RoomCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_room = crud.get_db_obj(db, model=models.Room, obj_id=room_id)
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    return crud.update_db_obj_generic(db=db, db_obj=db_room, obj_in=room)


@router.patch("/{room_id}", response_model=schemas.RoomResponse)
def update_room_partial(
    room_id: int,
    room: schemas.RoomUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_room = crud.get_db_obj(db, model=models.Room, obj_id=room_id)
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    return crud.update_db_obj_generic(db=db, db_obj=db_room, obj_in=room)


@router.delete("/{room_id}", response_model=schemas.RoomResponse)
def delete_room(
    room_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_room = crud.get_db_obj(db, model=models.Room, obj_id=room_id)
    if not db_room:
        raise HTTPException(status_code=404, detail="Room not found")
    return crud.remove_db_obj_generic(db=db, db_obj=db_room)
