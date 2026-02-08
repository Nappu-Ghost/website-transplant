# app/dependencies.py
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import Optional, List
from app import crud, models, schemas
from app.db import get_db
from app.utils.security import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/token")


async def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(oauth2_scheme)
) -> models.User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    token_payload: Optional[schemas.TokenData] = decode_access_token(token)
    if token_payload is None or token_payload.email is None:
        raise credentials_exception
    user = crud.get_user_by_email(db, email=token_payload.email)
    if user is None:
        raise credentials_exception
    return user


async def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if current_user.status != models.StatusEnum.ACTIVE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    return current_user


def require_role(required_roles: List[models.RoleEnum]):
    async def role_checker(
        current_user: models.User = Depends(get_current_active_user),
    ):
        if current_user.role not in required_roles:
            roles_str = ", ".join([role.value for role in required_roles])
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation not permitted. User does not have required role(s): {roles_str}",
            )
        return current_user

    return role_checker
