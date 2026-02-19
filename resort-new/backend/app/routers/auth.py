# app/routers/auth.py
from __future__ import annotations

from datetime import timedelta
import uuid

from fastapi import APIRouter, Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from pydantic import BaseModel

from app import crud, schemas, models
from app.utils import security
from app.utils.rate_limit import InMemoryRateLimiter
from app.db import get_db
from app.dependencies import get_current_user, get_current_session

router = APIRouter(tags=["Authentication"])

_limiter = InMemoryRateLimiter()

_DUMMY_HASH = security.get_password_hash("this_is_a_dummy_password_not_used")


def _client_ip(request: Request) -> str:
    return request.client.host if request.client else "unknown"


@router.post("/register", response_model=schemas.UserResponse, status_code=status.HTTP_201_CREATED)
def register_user(user: schemas.UserCreate, db: Session = Depends(get_db)):
    user_data = user.model_dump()
    user_data["role"] = models.RoleEnum.CUSTOMER
    user_data["status"] = models.StatusEnum.ACTIVE
    sanitized_user = schemas.UserCreate(**user_data)
    return crud.create_user(db=db, user_in=sanitized_user)


@router.post("/token", response_model=schemas.Token)
async def login_for_access_token(
    request: Request,
    db: Session = Depends(get_db),
    form_data: OAuth2PasswordRequestForm = Depends(),
):
    ip = _client_ip(request)
    email = (form_data.username or "").strip().lower()

    ip_key = f"ip:{ip}"
    user_key = f"user:{email}"

    allowed_ip, _, lock_ip = _limiter.check(ip_key)
    allowed_user, _, lock_user = _limiter.check(user_key)
    if not allowed_ip or not allowed_user:
        lock_for = max(lock_ip, lock_user)
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many login attempts. Try again in {lock_for} seconds.",
        )

    user = crud.get_user_by_email(db, email=email)

    if not user:
        security.verify_password(form_data.password, _DUMMY_HASH)
        _limiter.record_failure(ip_key)
        _limiter.record_failure(user_key)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if user.status != models.StatusEnum.ACTIVE:
        _limiter.record_failure(ip_key)
        _limiter.record_failure(user_key)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account is inactive.",
        )

    if not security.verify_password(form_data.password, user.hashed_password):
        _limiter.record_failure(ip_key)
        _limiter.record_failure(user_key)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    _limiter.record_success(ip_key)
    _limiter.record_success(user_key)

    session_id = str(uuid.uuid4())

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject_email=user.email,
        token_version=int(user.token_version or 0),
        session_id=session_id,
        expires_delta=access_token_expires,
    )

    refresh_token, refresh_expires_at, refresh_jti = security.create_refresh_token(
        subject_email=user.email,
        token_version=int(user.token_version or 0),
        session_id=session_id,
    )

    crud.create_user_session(
        db,
        user=user,
        session_id=session_id,
        refresh_token=refresh_token,
        refresh_jti=refresh_jti,
        refresh_expires_at=refresh_expires_at,
        ip_address=ip,
        user_agent=request.headers.get("user-agent"),
        device_label=request.headers.get("x-device-label"),
    )

    return {"access_token": access_token, "token_type": "bearer", "refresh_token": refresh_token}


class RefreshRequest(BaseModel):
    refresh_token: str


@router.post("/refresh", response_model=schemas.Token)
def refresh_access_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    token_payload = security.decode_token(payload.refresh_token)
    if not token_payload or token_payload.token_type != "refresh":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    if not token_payload.session_id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    user = crud.get_user_by_email(db, email=token_payload.email)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    if token_payload.token_version is None or int(token_payload.token_version) != int(user.token_version):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

    session = crud.get_user_session(db, session_id=token_payload.session_id)
    if not session or session.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")

    if session.revokedAt is not None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

    if security.sha256_hex(payload.refresh_token) != session.refresh_token_hash:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

    if token_payload.jti and token_payload.jti != session.refresh_token_jti:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token expired")

    access_token_expires = timedelta(minutes=security.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = security.create_access_token(
        subject_email=user.email,
        token_version=int(user.token_version or 0),
        session_id=session.id,
        expires_delta=access_token_expires,
    )

    new_refresh, new_refresh_expires_at, new_refresh_jti = security.create_refresh_token(
        subject_email=user.email,
        token_version=int(user.token_version or 0),
        session_id=session.id,
    )

    crud.rotate_session_refresh(
        db,
        session=session,
        new_refresh_token=new_refresh,
        new_refresh_jti=new_refresh_jti,
        new_refresh_expires_at=new_refresh_expires_at,
    )

    return {"access_token": access_token, "token_type": "bearer", "refresh_token": new_refresh}


@router.post("/logout")
def logout(ctx=Depends(get_current_session), db: Session = Depends(get_db)):
    user, session = ctx
    crud.revoke_user_session(db, session_id=session.id)
    return {"status": "ok"}


@router.post("/logout-all")
def logout_all(current_user: models.User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.token_version = int(current_user.token_version or 0) + 1
    db.add(current_user)
    db.commit()

    revoked = crud.revoke_all_user_sessions(db, user_id=current_user.id)
    return {"status": "ok", "revoked_sessions": revoked}
