from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from app import crud, models, schemas
from app.db import get_db
from app.dependencies import require_role

router = APIRouter(tags=["Hotels"], responses={404: {"description": "Not found"}})


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
