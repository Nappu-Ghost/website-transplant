# app/routers/services.py
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Any
from app import crud, models, schemas
from app.db import get_db
from app.dependencies import get_current_active_user, require_role

router = APIRouter(
    tags=["Services"],
    responses={404: {"description": "Not found"}},
)


@router.post(
    "/", response_model=schemas.ServiceResponse, status_code=status.HTTP_201_CREATED
)
def create_new_service(
    service: schemas.ServiceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_service_by_name = (
        db.query(models.Service).filter(models.Service.name == service.name).first()
    )
    if db_service_by_name:
        raise HTTPException(status_code=400, detail="Service name already exists")
    return crud.create_service(db=db, service=service)


@router.get("/", response_model=List[schemas.ServiceResponse])
def read_services(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    services_db = crud.get_all_db_obj(db, model=models.Service, skip=skip, limit=limit)
    return services_db


@router.get("/{service_id}", response_model=schemas.ServiceResponse)
def read_service(service_id: int, db: Session = Depends(get_db)):
    db_service = crud.get_db_obj(db, model=models.Service, obj_id=service_id)
    if db_service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return db_service


@router.put("/{service_id}", response_model=schemas.ServiceResponse)
def update_service_full(
    service_id: int,
    service: schemas.ServiceCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_service = crud.get_db_obj(db, model=models.Service, obj_id=service_id)
    if db_service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    if service.name != db_service.name:
        existing_service = (
            db.query(models.Service).filter(models.Service.name == service.name).first()
        )
        if existing_service and existing_service.id != service_id:
            raise HTTPException(status_code=400, detail="Service name already exists")
    return crud.update_db_obj_generic(db=db, db_obj=db_service, obj_in=service)


@router.patch("/{service_id}", response_model=schemas.ServiceResponse)
def update_service_partial(
    service_id: int,
    service: schemas.ServiceUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_service = crud.get_db_obj(db, model=models.Service, obj_id=service_id)
    if db_service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    if service.name and service.name != db_service.name:
        existing_service = (
            db.query(models.Service).filter(models.Service.name == service.name).first()
        )
        if existing_service and existing_service.id != service_id:
            raise HTTPException(status_code=400, detail="Service name already exists")
    return crud.update_db_obj_generic(db=db, db_obj=db_service, obj_in=service)


@router.delete("/{service_id}", response_model=schemas.ServiceResponse)
def delete_service(
    service_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    db_service = crud.get_db_obj(db, model=models.Service, obj_id=service_id)
    if db_service is None:
        raise HTTPException(status_code=404, detail="Service not found")
    return crud.remove_db_obj_generic(db=db, db_obj=db_service)
