# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os
from fastapi.staticfiles import StaticFiles
from app.utils.uploads import uploads_root_dir
from .routers import (
    users,
    auth as auth_router,
    meta,
    hotels,
    rooms,
    activities,
    bookings,
    events,
    ferries,
    ferry_schedules,
    ferry_tickets,
    payments,
    admin,
)
from .db import engine, Base
from .db import SessionLocal
from .seed_defaults import ensure_bootstrap_admin, ensure_default_users, ensure_default_catalog
from .db_migrations import apply_migrations

app = FastAPI(
    title="Resort API",
    version="0.1.0",
    description="API for managing Azure Lagoon Resort operations. Access documentation at /docs or /redoc.",
)

# NOTE:
origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://127.0.0.1:3000",
    "http://localhost:8080",
    "http://127.0.0.1:5500",
    "http://192.168.56.1",
    "http://192.168.56.1:3000",
    "null",
]

# Allow common LAN dev origins (e.g. http://192.168.x.x:3000) so booking/payment requests
# don't silently fail due to CORS when accessed from another device.
allow_origin_regex = os.getenv(
    "CORS_ALLOW_ORIGIN_REGEX",
    r"^https?://(localhost|127\.0\.0\.1|10\.|192\.168\.|172\.(1[6-9]|2\d|3[0-1])\.)[0-9.]*(:\d+)?$",
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_origin_regex=allow_origin_regex,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


uploads_dir = uploads_root_dir()
uploads_dir.mkdir(parents=True, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=str(uploads_dir)), name="uploads")

API_PREFIX = "/api/v1"


@app.on_event("startup")
def _startup_create_tables() -> None:
    """Ensure the SQLite schema exists.

    The frontend expects the API to be usable immediately after running uvicorn.
    Creating tables on startup removes the extra manual step of running init_db.py.
    """
    Base.metadata.create_all(bind=engine)

    apply_migrations(engine)

    db = SessionLocal()
    try:
        ensure_bootstrap_admin(db)
        ensure_default_users(db)
        ensure_default_catalog(db)
    finally:
        db.close()

app.include_router(auth_router.router, prefix=API_PREFIX, tags=["Authentication"])
app.include_router(meta.router, prefix=API_PREFIX, tags=["Meta"])
app.include_router(users.router, prefix=f"{API_PREFIX}/users", tags=["Users"])

app.include_router(hotels.router, prefix=f"{API_PREFIX}/hotels", tags=["Hotels"])
app.include_router(rooms.router, prefix=f"{API_PREFIX}/rooms", tags=["Rooms"])
app.include_router(activities.router, prefix=f"{API_PREFIX}/activities", tags=["Activities"])
app.include_router(bookings.router, prefix=f"{API_PREFIX}/bookings", tags=["Bookings"])
app.include_router(events.router, prefix=f"{API_PREFIX}/events", tags=["Events"])
app.include_router(ferries.router, prefix=f"{API_PREFIX}/ferries", tags=["Ferries"])
app.include_router(
    ferry_schedules.router,
    prefix=f"{API_PREFIX}/ferry-schedules",
    tags=["Ferry Schedules"],
)
app.include_router(
    ferry_tickets.router,
    prefix=f"{API_PREFIX}/ferry-tickets",
    tags=["Ferry Tickets"],
)
app.include_router(payments.router, prefix=f"{API_PREFIX}/payments", tags=["Payments"])
app.include_router(admin.router, prefix=f"{API_PREFIX}/admin", tags=["Admin"])


@app.get(f"{API_PREFIX}/health", tags=["Health Check"])
async def health_check():
    return {"status": "healthy", "message": "Resort API is operational."}


@app.get("/", include_in_schema=False)
async def root_message():
    return {
        "message": "Resort API is running.",
        "documentation_urls": [app.docs_url, app.redoc_url],
        "health_check": f"{API_PREFIX}/health",
    }
