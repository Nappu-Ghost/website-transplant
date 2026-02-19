from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy.orm import Session
from typing import List

from app import crud, models, schemas
from app.db import get_db
from app.dependencies import require_role
from app.utils.uploads import validate_and_read_image, save_entity_image, delete_uploaded_file_if_managed

router = APIRouter(tags=["Hotels"], responses={404: {"description": "Not found"}})


@router.post("", response_model=schemas.HotelResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=schemas.HotelResponse, status_code=status.HTTP_201_CREATED)
def create_hotel(
    hotel: schemas.HotelCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    existing = db.query(models.Hotel).filter(models.Hotel.name == hotel.name).first()
    if existing:
        raise HTTPException(status_code=400, detail="Hotel name already exists")
    return crud.create_hotel(db=db, hotel=hotel)


@router.get("", response_model=List[schemas.HotelResponse])
@router.get("/", response_model=List[schemas.HotelResponse])
def read_hotels(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_all_db_obj(db, model=models.Hotel, skip=skip, limit=limit)


@router.get("/{hotel_id}", response_model=schemas.HotelResponse)
def read_hotel(hotel_id: int, db: Session = Depends(get_db)):
    db_hotel = crud.get_db_obj(db, model=models.Hotel, obj_id=hotel_id)
    if not db_hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return db_hotel


@router.put("/{hotel_id}", response_model=schemas.HotelResponse)
def update_hotel_full(
    hotel_id: int,
    hotel: schemas.HotelCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_hotel = crud.get_db_obj(db, model=models.Hotel, obj_id=hotel_id)
    if not db_hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    if hotel.name != db_hotel.name:
        existing = db.query(models.Hotel).filter(models.Hotel.name == hotel.name).first()
        if existing and existing.id != hotel_id:
            raise HTTPException(status_code=400, detail="Hotel name already exists")
    return crud.update_db_obj_generic(db=db, db_obj=db_hotel, obj_in=hotel)


@router.patch("/{hotel_id}", response_model=schemas.HotelResponse)
def update_hotel_partial(
    hotel_id: int,
    hotel: schemas.HotelUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_hotel = crud.get_db_obj(db, model=models.Hotel, obj_id=hotel_id)
    if not db_hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    if hotel.name:
        existing = db.query(models.Hotel).filter(models.Hotel.name == hotel.name).first()
        if existing and existing.id != hotel_id:
            raise HTTPException(status_code=400, detail="Hotel name already exists")
    return crud.update_db_obj_generic(db=db, db_obj=db_hotel, obj_in=hotel)


@router.delete("/{hotel_id}", response_model=schemas.HotelResponse)
def delete_hotel(
    hotel_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_hotel = crud.get_db_obj(db, model=models.Hotel, obj_id=hotel_id)
    if not db_hotel:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return crud.remove_db_obj_generic(db=db, db_obj=db_hotel)
@router.get("/{hotel_id}/image")
def get_hotel_image(hotel_id: int, db: Session = Depends(get_db)):
    obj = crud.get_db_obj(db, model=models.Hotel, obj_id=hotel_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Hotel not found")
    return {"image_url": obj.image_url}


@router.post("/{hotel_id}/image", status_code=200)
async def upload_hotel_image(
    request: Request,
    hotel_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    obj = crud.get_db_obj(db, model=models.Hotel, obj_id=hotel_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Hotel not found")

    data, ext = await validate_and_read_image(file)

    delete_uploaded_file_if_managed(obj.image_url)

    image_url = save_entity_image("hotels", hotel_id, file.filename, data, ext)
    obj.image_url = image_url

    db.add(obj)
    db.commit()
    db.refresh(obj)

    return {"image_url": obj.image_url}


@router.delete("/{hotel_id}/image", status_code=200)
def delete_hotel_image(
    hotel_id: int,
    db: Session = Depends(get_db),
    _user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    obj = crud.get_db_obj(db, model=models.Hotel, obj_id=hotel_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Hotel not found")

    delete_uploaded_file_if_managed(obj.image_url)
    obj.image_url = None
    db.add(obj)
    db.commit()
    db.refresh(obj)

    return {"image_url": obj.image_url}
