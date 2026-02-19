from __future__ import annotations

from sqlalchemy.orm import Session

from . import models
from .utils.security import get_password_hash
from .utils.settings import load_settings


def ensure_default_users(db: Session) -> None:
    settings = load_settings()
    if not settings.allow_demo_users:
        return

    defaults = [
        ("admin@example.com", "Resort Admin", models.RoleEnum.ADMIN),
        ("manager@example.com", "Resort Manager", models.RoleEnum.MANAGER),
        ("guest@example.com", "Resort Guest", models.RoleEnum.CUSTOMER),
    ]

    for email, name, role in defaults:
        existing = db.query(models.User).filter(models.User.email == email).first()
        if existing:
            continue

        user = models.User(
            email=email,
            name=name,
            role=role,
            status=models.StatusEnum.ACTIVE,
            hashed_password=get_password_hash("password"),
        )
        db.add(user)

    db.commit()
