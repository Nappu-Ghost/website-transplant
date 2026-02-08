# app/main.py
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .routers import (
    users,
    clinics,
    doctors,
    services,
    appointments,
    shifts,
    surgery_bookings,
    auth as auth_router,
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

app = FastAPI(
    title="Dental Clinic API",
    version="0.1.0",
    description="API for managing a Dental Clinic System. Access documentation at /docs or /redoc.",
)

origins = [
    "http://localhost",
    "http://localhost:3000",
    "http://localhost:8080",
    "http://127.0.0.1:5500",
    "null",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

API_PREFIX = "/api/v1"

app.include_router(auth_router.router, prefix=API_PREFIX)
app.include_router(users.router, prefix=f"{API_PREFIX}/users", tags=["Users"])
app.include_router(clinics.router, prefix=f"{API_PREFIX}/clinics", tags=["Clinics"])
app.include_router(doctors.router, prefix=f"{API_PREFIX}/doctors", tags=["Doctors"])
app.include_router(services.router, prefix=f"{API_PREFIX}/services", tags=["Services"])
app.include_router(
    appointments.router, prefix=f"{API_PREFIX}/appointments", tags=["Appointments"]
)
app.include_router(shifts.router, prefix=f"{API_PREFIX}/shifts", tags=["Shifts"])
app.include_router(
    surgery_bookings.router,
    prefix=f"{API_PREFIX}/surgery-bookings",
    tags=["Surgery Bookings"],
)
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
    return {"status": "healthy", "message": "Dental Clinic API is operational."}


@app.get("/", include_in_schema=False)
async def root_message():
    return {
        "message": "Dental Clinic API is running.",
        "documentation_urls": [app.docs_url, app.redoc_url],
        "health_check": f"{API_PREFIX}/health",
    }
