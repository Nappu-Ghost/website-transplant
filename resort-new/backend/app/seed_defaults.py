from __future__ import annotations

import secrets
from pathlib import Path

from sqlalchemy.orm import Session

from . import models
from .utils.security import get_password_hash
from .utils.settings import load_settings


def _instance_dir() -> Path:
    return Path.cwd() / "instance"


def _generate_bootstrap_password() -> str:
    alphabet = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
    symbols = "!@#$%^&*()-_=+[]{};:,.?/"
    base = alphabet + symbols
    while True:
        pw = "".join(secrets.choice(base) for _ in range(20))
        if any(c.islower() for c in pw) and any(c.isupper() for c in pw) and any(c.isdigit() for c in pw) and any(c in symbols for c in pw):
            return pw


def ensure_bootstrap_admin(db: Session) -> None:
    settings = load_settings()

    any_admin = db.query(models.User).filter(models.User.role == models.RoleEnum.ADMIN).first()
    if any_admin:
        return

    any_user = db.query(models.User).count()
    if any_user:
        return

    email = (settings.bootstrap_admin_email or "admin@example.com").strip().lower()
    name = (settings.bootstrap_admin_name or "System Admin").strip() or "System Admin"

    password = settings.bootstrap_admin_password
    generated = False
    if not password:
        password = _generate_bootstrap_password()
        generated = True

    user = models.User(
        email=email,
        name=name,
        role=models.RoleEnum.ADMIN,
        status=models.StatusEnum.ACTIVE,
        hashed_password=get_password_hash(password),
    )
    db.add(user)
    db.commit()

    if generated:
        instance = _instance_dir()
        instance.mkdir(parents=True, exist_ok=True)
        (instance / "bootstrap_admin_credentials.txt").write_text(
            f"email: {email}\npassword: {password}\n",
            encoding="utf-8",
        )


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
            hashed_password=get_password_hash("Password123!"),
        )
        db.add(user)

    db.commit()


def ensure_default_catalog(db: Session) -> None:
    settings = load_settings()
    if not settings.allow_demo_users:
        return

    existing_hotels = db.query(models.Hotel).count()
    existing_rooms = db.query(models.Room).count()
    existing_activities = db.query(models.Activity).count()

    if existing_hotels or existing_rooms or existing_activities:
        return

    hotels = [
        models.Hotel(
            name="Coral Haven Resort",
            location="Malé, Maldives",
            description="Lagoon-side villas with sunset views and easy ferry access.",
            image_url="https://loremflickr.com/640/480/hotel?lock=101",
            floors=3,
        ),
        models.Hotel(
            name="Teal Breeze Boutique",
            location="Hulhumalé, Maldives",
            description="Modern boutique stay near the beach with premium suites.",
            image_url="https://loremflickr.com/640/480/hotel?lock=102",
            floors=4,
        ),
    ]

    db.add_all(hotels)
    db.flush()

    rooms = [
        models.Room(
            hotel_id=hotels[0].id,
            name="Lagoon View Standard",
            type="Standard",
            price=180,
            capacity=2,
            description="Bright room with balcony and lagoon breeze.",
            image_url="https://loremflickr.com/640/480/hotel?lock=201",
            floor_number=1,
            available=True,
            is_premium=False,
        ),
        models.Room(
            hotel_id=hotels[0].id,
            name="Sunset Premium Suite",
            type="Suite",
            price=420,
            capacity=3,
            description="Premium suite with dedicated lounge area.",
            image_url="https://loremflickr.com/640/480/hotel?lock=202",
            floor_number=2,
            available=True,
            is_premium=True,
        ),
        models.Room(
            hotel_id=hotels[1].id,
            name="City Escape Double",
            type="Double",
            price=160,
            capacity=2,
            description="Comfort-focused room close to Hulhumalé attractions.",
            image_url="https://loremflickr.com/640/480/hotel?lock=203",
            floor_number=2,
            available=True,
            is_premium=False,
        ),
        models.Room(
            hotel_id=hotels[1].id,
            name="Ocean Premium Loft",
            type="Loft",
            price=460,
            capacity=4,
            description="Spacious loft with premium amenities and sea views.",
            image_url="https://loremflickr.com/640/480/hotel?lock=204",
            floor_number=4,
            available=True,
            is_premium=True,
        ),
    ]

    activities = [
        models.Activity(
            name="Reef Snorkeling",
            activity_type="Water",
            price=55,
            capacity=12,
            image_url="https://loremflickr.com/640/480/hotel?lock=301",
            is_premium=False,
        ),
        models.Activity(
            name="Sunset Dolphin Cruise",
            activity_type="Cruise",
            price=95,
            capacity=20,
            image_url="https://loremflickr.com/640/480/hotel?lock=302",
            is_premium=True,
        ),
        models.Activity(
            name="Island Cooking Class",
            activity_type="Culture",
            price=40,
            capacity=10,
            image_url="https://loremflickr.com/640/480/hotel?lock=303",
            is_premium=False,
        ),
        models.Activity(
            name="Private Sandbank Picnic",
            activity_type="Premium",
            price=220,
            capacity=4,
            image_url="https://loremflickr.com/640/480/hotel?lock=304",
            is_premium=True,
        ),
    ]

    db.add_all(rooms)
    db.add_all(activities)
    db.commit()
