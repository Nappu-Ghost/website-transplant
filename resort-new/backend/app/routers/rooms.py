from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy.orm import Session
from typing import List, Optional

from app import crud, models, schemas
from app.db import get_db
from app.dependencies import require_role
from app.utils.uploads import validate_and_read_image, save_entity_image, delete_uploaded_file_if_managed

router = APIRouter(tags=["Rooms"], responses={404: {"description": "Not found"}})


@router.post("", response_model=schemas.RoomResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=schemas.RoomResponse, status_code=status.HTTP_201_CREATED)
def create_room(
    room: schemas.RoomCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    return crud.create_room(db=db, room=room)


@router.get("", response_model=List[schemas.RoomResponse])
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
@router.get("/{room_id}/image")
def get_room_image(room_id: int, db: Session = Depends(get_db)):
    obj = crud.get_db_obj(db, model=models.Room, obj_id=room_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Room not found")
    return {"image_url": obj.image_url}


@router.post("/{room_id}/image", status_code=200)
async def upload_room_image(
    request: Request,
    room_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    obj = crud.get_db_obj(db, model=models.Room, obj_id=room_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Room not found")

    data, ext = await validate_and_read_image(file)

    delete_uploaded_file_if_managed(obj.image_url)

    image_url = save_entity_image("rooms", room_id, file.filename, data, ext)
    obj.image_url = image_url

    db.add(obj)
    db.commit()
    db.refresh(obj)

    return {"image_url": obj.image_url}


@router.delete("/{room_id}/image", status_code=200)
def delete_room_image(
    room_id: int,
    db: Session = Depends(get_db),
    _user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    obj = crud.get_db_obj(db, model=models.Room, obj_id=room_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Room not found")

    delete_uploaded_file_if_managed(obj.image_url)
    obj.image_url = None
    db.add(obj)
    db.commit()
    db.refresh(obj)

    return {"image_url": obj.image_url}
