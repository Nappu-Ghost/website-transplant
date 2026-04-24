# app/routers/users.py
from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from typing import List, Optional

from app import crud, models, schemas
from app.db import get_db
from app.dependencies import get_current_active_user, require_role

router = APIRouter(
    tags=["Users"],
    responses={404: {"description": "Not found"}},
)

@router.post("", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def create_new_user(
    user: schemas.UserCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    created = crud.create_user(db=db, user_in=user) # CHANGED 'user=user' to 'user_in=user'
    actor_name = (current_user.name or current_user.email or f"user:{current_user.id}").strip()
    crud.create_audit_log(
        db,
        actor_user_id=current_user.id,
        actor_name=actor_name,
        action="create",
        entity_type="user",
        entity_id=str(created.id),
        description=f"{actor_name} created user {created.email}.",
    )
    return created

@router.get("", response_model=List[schemas.UserResponse])
@router.get("/", response_model=List[schemas.UserResponse])
def read_users_list(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
    role: Optional[models.RoleEnum] = None,
    status: Optional[models.StatusEnum] = None,
    email: Optional[str] = None,
    name: Optional[str] = None,
):
    query = db.query(models.User)
    if role:
        query = query.filter(models.User.role == role)
    if status:
        query = query.filter(models.User.status == status)
    if email:
        query = query.filter(models.User.email.ilike(f"%{email}%"))
    if name:
        query = query.filter(models.User.name.ilike(f"%{name}%"))
    
    users = query.offset(skip).limit(limit).all()
    return users

@router.get("/me", response_model=schemas.UserResponse)
async def read_current_user_me(current_user: models.User = Depends(get_current_active_user)):
    return current_user

@router.get("/{user_id}", response_model=schemas.UserResponse)
def read_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_user = crud.get_db_obj(db, model=models.User, obj_id=user_id)
    if db_user is None:
        raise HTTPException(status_code=404, detail="User not found")
    if not (current_user.role in [models.RoleEnum.ADMIN, models.RoleEnum.MANAGER] or current_user.id == user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this user's details")
    return db_user

@router.put("/{user_id}", response_model=schemas.UserResponse)
def update_user_put(
    user_id: int,
    user_in: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_user_to_update = crud.get_db_obj(db, model=models.User, obj_id=user_id)
    if not db_user_to_update:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not (current_user.role in [models.RoleEnum.ADMIN, models.RoleEnum.MANAGER] or current_user.id == user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this user")
    if current_user.role not in [models.RoleEnum.ADMIN, models.RoleEnum.MANAGER]:
        if user_in.role is not None and user_in.role != db_user_to_update.role:
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to change user role.")
        if user_in.status is not None and user_in.status != db_user_to_update.status:
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to change user status.")
    updated = crud.update_user(db=db, db_user=db_user_to_update, user_in=user_in)
    if current_user.role in [models.RoleEnum.ADMIN, models.RoleEnum.MANAGER]:
        actor_name = (current_user.name or current_user.email or f"user:{current_user.id}").strip()
        crud.create_audit_log(
            db,
            actor_user_id=current_user.id,
            actor_name=actor_name,
            action="update",
            entity_type="user",
            entity_id=str(updated.id),
            description=f"{actor_name} updated user {updated.email}.",
        )
    return updated

@router.patch("/{user_id}", response_model=schemas.UserResponse)
def update_user_patch(
    user_id: int,
    user_in: schemas.UserUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user)
):
    db_user_to_update = crud.get_db_obj(db, model=models.User, obj_id=user_id)
    if not db_user_to_update:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if not (current_user.role in [models.RoleEnum.ADMIN, models.RoleEnum.MANAGER] or current_user.id == user_id):
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to update this user")
    if current_user.role not in [models.RoleEnum.ADMIN, models.RoleEnum.MANAGER]:
        if user_in.role is not None and user_in.role != db_user_to_update.role:
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to change user role.")
        if user_in.status is not None and user_in.status != db_user_to_update.status:
             raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to change user status.")
    updated = crud.update_user(db=db, db_user=db_user_to_update, user_in=user_in)
    if current_user.role in [models.RoleEnum.ADMIN, models.RoleEnum.MANAGER]:
        actor_name = (current_user.name or current_user.email or f"user:{current_user.id}").strip()
        crud.create_audit_log(
            db,
            actor_user_id=current_user.id,
            actor_name=actor_name,
            action="update",
            entity_type="user",
            entity_id=str(updated.id),
            description=f"{actor_name} updated user {updated.email}.",
        )
    return updated

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user_by_id(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN]))
):
    db_user_to_delete = crud.get_db_obj(db, model=models.User, obj_id=user_id)
    if db_user_to_delete is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")
    if db_user_to_delete.id == current_user.id:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Admin cannot delete their own account via this endpoint.")
    deleted_email = db_user_to_delete.email
    try:
        crud.delete_user_and_related_data(db=db, user_to_delete=db_user_to_delete)
        actor_name = (current_user.name or current_user.email or f"user:{current_user.id}").strip()
        crud.create_audit_log(
            db,
            actor_user_id=current_user.id,
            actor_name=actor_name,
            action="delete",
            entity_type="user",
            entity_id=str(user_id),
            description=f"{actor_name} deleted user {deleted_email}.",
        )
    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Unexpected error during user deletion (ID: {user_id}): {e}")
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not delete user due to an internal error.")
    return Response(status_code=status.HTTP_204_NO_CONTENT)