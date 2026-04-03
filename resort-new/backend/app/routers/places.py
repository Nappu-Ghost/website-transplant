from fastapi import APIRouter
from pydantic import BaseModel
import sqlite3

router = APIRouter()

class Place(BaseModel):
    name: str
    lat: float
    lng: float

def get_db():
    return sqlite3.connect("places.db")

@router.get("/places")
def get_places():
    conn = get_db()
    cur = conn.cursor()

    cur.execute("""
        CREATE TABLE IF NOT EXISTS places (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            lat REAL,
            lng REAL
        )
    """)

    rows = cur.execute("SELECT name, lat, lng FROM places").fetchall()
    conn.close()

    return [{"name": r[0], "lat": r[1], "lng": r[2]} for r in rows]

@router.post("/places")
def add_place(place: Place):
    conn = get_db()
    cur = conn.cursor()

    cur.execute(
        "INSERT INTO places (name, lat, lng) VALUES (?, ?, ?)",
        (place.name, place.lat, place.lng),
    )

    conn.commit()
    conn.close()

    return {"status": "ok"}