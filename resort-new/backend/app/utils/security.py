# app/utils/security.py
from __future__ import annotations

import hashlib
import uuid
from datetime import datetime, timedelta, timezone
from typing import Optional, Literal

from jose import JWTError, jwt
from passlib.context import CryptContext

from app import schemas
from app.utils.settings import load_settings


_S = load_settings()

SECRET_KEY = _S.secret_key
ALGORITHM = _S.algorithm

ACCESS_TOKEN_EXPIRE_MINUTES = _S.access_token_minutes
REFRESH_TOKEN_EXPIRE_DAYS = _S.refresh_token_days

JWT_ISSUER = _S.jwt_issuer
JWT_AUDIENCE = _S.jwt_audience

pwd_context = CryptContext(
    schemes=["pbkdf2_sha256"],
    pbkdf2_sha256__rounds=_S.pbkdf2_rounds,
    deprecated="auto",
)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def sha256_hex(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def _encode_jwt(payload: dict) -> str:
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def create_access_token(
    *,
    subject_email: str,
    token_version: int,
    session_id: str,
    expires_delta: Optional[timedelta] = None,
) -> str:
    now = datetime.now(timezone.utc)
    expire = now + (expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES))

    payload = {
        "typ": "access",
        "sub": subject_email,
        "tv": token_version,
        "sid": session_id,
        "jti": str(uuid.uuid4()),
        "iat": now,
        "exp": expire,
        "iss": JWT_ISSUER,
        "aud": JWT_AUDIENCE,
    }
    return _encode_jwt(payload)


def create_refresh_token(*, subject_email: str, token_version: int, session_id: str) -> tuple[str, datetime, str]:
    """Return (token, expires_at, jti)."""
    now = datetime.now(timezone.utc)
    expire = now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    jti = str(uuid.uuid4())
    payload = {
        "typ": "refresh",
        "sub": subject_email,
        "tv": token_version,
        "sid": session_id,
        "jti": jti,
        "iat": now,
        "exp": expire,
        "iss": JWT_ISSUER,
        "aud": JWT_AUDIENCE,
    }
    return _encode_jwt(payload), expire, jti


def decode_token(token: str) -> Optional[schemas.TokenPayload]:
    try:
        payload = jwt.decode(
            token,
            SECRET_KEY,
            algorithms=[ALGORITHM],
            audience=JWT_AUDIENCE,
            issuer=JWT_ISSUER,
        )
        email = payload.get("sub")
        if not email:
            return None
        return schemas.TokenPayload(
            email=email,
            token_type=payload.get("typ"),
            token_version=int(payload.get("tv")) if payload.get("tv") is not None else None,
            session_id=payload.get("sid"),
            jti=payload.get("jti"),
        )
    except JWTError:
        return None
