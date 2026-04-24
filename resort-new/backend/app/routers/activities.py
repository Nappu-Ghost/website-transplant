from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Request
from sqlalchemy.orm import Session
from typing import List

from app import crud, models, schemas
from app.db import get_db
from app.dependencies import require_role
from app.utils.uploads import validate_and_read_image, save_entity_image, delete_uploaded_file_if_managed

router = APIRouter(tags=["Activities"], responses={404: {"description": "Not found"}})


@router.post("", response_model=schemas.ActivityResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=schemas.ActivityResponse, status_code=status.HTTP_201_CREATED)
def create_activity(
    activity: schemas.ActivityCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    created = crud.create_activity(db=db, activity=activity)
    actor_name = (current_user.name or current_user.email or f"user:{current_user.id}").strip()
    crud.create_audit_log(
        db,
        actor_user_id=current_user.id,
        actor_name=actor_name,
        action="create",
        entity_type="activity",
        entity_id=str(created.id),
        description=f"{actor_name} created activity {created.name}.",
    )
    return created


@router.get("", response_model=List[schemas.ActivityResponse])
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
    updated = crud.update_db_obj_generic(db=db, db_obj=db_activity, obj_in=activity)
    actor_name = (current_user.name or current_user.email or f"user:{current_user.id}").strip()
    crud.create_audit_log(
        db,
        actor_user_id=current_user.id,
        actor_name=actor_name,
        action="update",
        entity_type="activity",
        entity_id=str(updated.id),
        description=f"{actor_name} updated activity {updated.name}.",
    )
    return updated


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
    updated = crud.update_db_obj_generic(db=db, db_obj=db_activity, obj_in=activity)
    actor_name = (current_user.name or current_user.email or f"user:{current_user.id}").strip()
    crud.create_audit_log(
        db,
        actor_user_id=current_user.id,
        actor_name=actor_name,
        action="update",
        entity_type="activity",
        entity_id=str(updated.id),
        description=f"{actor_name} updated activity {updated.name}.",
    )
    return updated


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
    activity_name = db_activity.name
    deleted = crud.remove_db_obj_generic(db=db, db_obj=db_activity)
    actor_name = (current_user.name or current_user.email or f"user:{current_user.id}").strip()
    crud.create_audit_log(
        db,
        actor_user_id=current_user.id,
        actor_name=actor_name,
        action="delete",
        entity_type="activity",
        entity_id=str(activity_id),
        description=f"{actor_name} deleted activity {activity_name}.",
    )
    return deleted
@router.get("/{activity_id}/image")
def get_activitie_image(activity_id: int, db: Session = Depends(get_db)):
    obj = crud.get_db_obj(db, model=models.Activity, obj_id=activity_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Activitie not found")
    return {"image_url": obj.image_url}


@router.post("/{activity_id}/image", status_code=200)
async def upload_activitie_image(
    request: Request,
    activity_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    _user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    obj = crud.get_db_obj(db, model=models.Activity, obj_id=activity_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Activitie not found")

    data, ext = await validate_and_read_image(file)

    delete_uploaded_file_if_managed(obj.image_url)

    image_url = save_entity_image("activities", activity_id, file.filename, data, ext)
    obj.image_url = image_url

    db.add(obj)
    db.commit()
    db.refresh(obj)

    return {"image_url": obj.image_url}


@router.delete("/{activity_id}/image", status_code=200)
def delete_activitie_image(
    activity_id: int,
    db: Session = Depends(get_db),
    _user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    obj = crud.get_db_obj(db, model=models.Activity, obj_id=activity_id)
    if obj is None:
        raise HTTPException(status_code=404, detail="Activitie not found")

    delete_uploaded_file_if_managed(obj.image_url)
    obj.image_url = None
    db.add(obj)
    db.commit()
    db.refresh(obj)

    return {"image_url": obj.image_url}
