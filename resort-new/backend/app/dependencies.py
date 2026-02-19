# app/dependencies.py
from __future__ import annotations

from datetime import datetime, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from typing import List, Tuple

from app import crud, models
from app.db import get_db
from app.utils.security import decode_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/token")


def _credentials_exception() -> HTTPException:
    return HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )


async def get_current_session(
    db: Session = Depends(get_db),
    token: str = Depends(oauth2_scheme),
) -> Tuple[models.User, models.UserSession]:
    """Return (user, session) for a valid access token.

    Hardening:
    - access tokens must be 'access'
    - user must exist + be ACTIVE
    - token_version must match user's token_version (supports 'logout all sessions')
    - session must exist, belong to user, not revoked, not expired
    """
    payload = decode_token(token)
    if payload is None or not payload.email:
        raise _credentials_exception()

    if payload.token_type not in (None, "access"):
        raise _credentials_exception()

    if not payload.session_id:
        raise _credentials_exception()

    user = crud.get_user_by_email(db, email=payload.email)
    if not user or user.status != models.StatusEnum.ACTIVE:
        raise _credentials_exception()

    # "Logout-all" kill switch
    if payload.token_version is None or int(payload.token_version) != int(user.token_version):
        raise _credentials_exception()

    session = crud.get_user_session(db, session_id=payload.session_id)
    if not session or session.user_id != user.id:
        raise _credentials_exception()

    if session.revokedAt is not None:
        raise _credentials_exception()

    # Server-side expiry check (defense-in-depth)
    if session.refresh_token_expiresAt and session.refresh_token_expiresAt < datetime.utcnow():
        raise _credentials_exception()

    # Touch last-used
    try:
        session.lastUsedAt = datetime.utcnow()
        db.add(session)
        db.commit()
    except Exception:
        # If we can't touch lastUsedAt, don't block auth.
        db.rollback()

    return user, session


async def get_current_user(
    ctx: Tuple[models.User, models.UserSession] = Depends(get_current_session),
) -> models.User:
    return ctx[0]


async def get_current_active_user(
    current_user: models.User = Depends(get_current_user),
) -> models.User:
    if current_user.status != models.StatusEnum.ACTIVE:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user")
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
