import sys
import os
from datetime import datetime, timedelta

project_root = os.path.abspath(os.path.dirname(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.db import Base, engine, SessionLocal
from app.models import (
    User,
    RoleEnum,
    StatusEnum,
    Hotel,
    Room,
    Activity,
    Booking,
    BookingRoom,
    BookingActivity,
    BookingStatusEnum,
)
from app.utils.security import get_password_hash


def reset_db(db):
    db.query(BookingActivity).delete()
    db.query(BookingRoom).delete()
    db.query(Booking).delete()
    db.query(Room).delete()
    db.query(Activity).delete()
    db.query(Hotel).delete()
    db.query(User).delete()
    db.commit()


def seed_users(db):
    demo = User(
    name="Demo User",
    email="demo.user@example.com",
    hashed_password=get_password_hash("Riv3r!Stone#2026"),
    role=RoleEnum.CUSTOMER,
    status=StatusEnum.ACTIVE,
    profileImage=None,
    )

    admin = User(
        name="Admin",
        email="admin.user@example.com",
        hashed_password=get_password_hash("Gl0w!Maple@7261"),
        role=RoleEnum.ADMIN,
        status=StatusEnum.ACTIVE,
        profileImage=None,
    )

    manager = User(
        name="Manager",
        email="manager.user@example.com",
        hashed_password=get_password_hash("C0balt!Harbor#5512"),
        role=RoleEnum.MANAGER,
        status=StatusEnum.ACTIVE,
        profileImage=None,
    )

    db.add_all([demo, admin, manager])
    db.commit()
    db.refresh(demo)
    db.refresh(admin)
    db.refresh(manager)
    return demo, admin, manager


def seed_hotels(db):
    hotels = [
        Hotel(
            name="Azure Paradise Resort",
            description="Overwater villas with lagoon views, private decks, and sunset dining.",
            location="Malé Atoll",
            image_url="/uploads/hotels/azure.jpg",
            floors=3,
        ),
        Hotel(
            name="Sunset Lagoon Villas",
            description="Family-friendly villas, coral gardens, and beachfront cafés.",
            location="Addu City",
            image_url="/uploads/hotels/sunset.jpg",
            floors=2,
        ),
        Hotel(
            name="Coral Reef Retreat",
            description="Boutique stays with dive access and reef-side suites.",
            location="Kulhudhuffushi",
            image_url="/uploads/hotels/coral.jpg",
            floors=4,
        ),
    ]
    db.add_all(hotels)
    db.commit()
    for h in hotels:
        db.refresh(h)
    return hotels


def seed_rooms(db, hotels):
    rooms = [
        Room(
            hotel_id=hotels[0].id,
            name="Lagoon Suite",
            type="Suite",
            price=450.0,
            capacity=2,
            description="Lagoon-facing suite with private deck and sunrise view.",
            image_url="/uploads/rooms/lagoon-suite.jpg",
            floor_number=1,
            available=True,
            is_premium=True,
        ),
        Room(
            hotel_id=hotels[0].id,
            name="Ocean View Deluxe",
            type="Deluxe",
            price=320.0,
            capacity=3,
            description="High-floor room with ocean panorama and balcony seating.",
            image_url="/uploads/rooms/ocean-deluxe.jpg",
            floor_number=2,
            available=True,
            is_premium=False,
        ),
        Room(
            hotel_id=hotels[1].id,
            name="Sunset Villa",
            type="Villa",
            price=520.0,
            capacity=4,
            description="Spacious villa with sunset deck and direct beach access.",
            image_url="/uploads/rooms/sunset-villa.jpg",
            floor_number=1,
            available=True,
            is_premium=True,
        ),
        Room(
            hotel_id=hotels[1].id,
            name="Garden Bungalow",
            type="Bungalow",
            price=260.0,
            capacity=2,
            description="Cozy bungalow nestled in tropical gardens.",
            image_url="/uploads/rooms/garden-bungalow.jpg",
            floor_number=1,
            available=True,
            is_premium=False,
        ),
        Room(
            hotel_id=hotels[2].id,
            name="Coral Suite",
            type="Suite",
            price=390.0,
            capacity=3,
            description="Reef-inspired suite with lounge area and minibar.",
            image_url="/uploads/rooms/coral-suite.jpg",
            floor_number=3,
            available=True,
            is_premium=True,
        ),
        Room(
            hotel_id=hotels[2].id,
            name="Standard Twin",
            type="Standard",
            price=180.0,
            capacity=2,
            description="Simple, clean twin room for budget stays.",
            image_url="/uploads/rooms/standard-twin.jpg",
            floor_number=2,
            available=True,
            is_premium=False,
        ),
    ]
    db.add_all(rooms)
    db.commit()
    for r in rooms:
        db.refresh(r)
    return rooms


def seed_activities(db):
    activities = [
        Activity(
            name="Snorkeling Adventure",
            activity_type="water",
            price=80.0,
            capacity=10,
            image_url="/uploads/activities/snorkeling.jpg",
            is_premium=False,
        ),
        Activity(
            name="Sunset Dolphin Cruise",
            activity_type="cruise",
            price=120.0,
            capacity=20,
            image_url="/uploads/activities/dolphin-cruise.jpg",
            is_premium=True,
        ),
        Activity(
            name="Scuba Diving Experience",
            activity_type="diving",
            price=200.0,
            capacity=6,
            image_url="/uploads/activities/scuba.jpg",
            is_premium=True,
        ),
        Activity(
            name="Island Hopping Tour",
            activity_type="tour",
            price=95.0,
            capacity=15,
            image_url="/uploads/activities/island-hopping.jpg",
            is_premium=False,
        ),
        Activity(
            name="Night Fishing",
            activity_type="fishing",
            price=70.0,
            capacity=8,
            image_url="/uploads/activities/night-fishing.jpg",
            is_premium=False,
        ),
        Activity(
            name="Spa & Wellness Package",
            activity_type="wellness",
            price=160.0,
            capacity=5,
            image_url="/uploads/activities/spa.jpg",
            is_premium=True,
        ),
    ]
    db.add_all(activities)
    db.commit()
    for a in activities:
        db.refresh(a)
    return activities


def seed_booking(db, user, rooms, activities):
    check_in = datetime.utcnow() + timedelta(days=5)
    check_out = check_in + timedelta(days=4)

    chosen_room = rooms[0]
    chosen_activities = [activities[0], activities[3]]

    total = float(chosen_room.price) + sum(float(a.price) for a in chosen_activities)

    booking = Booking(
        user_id=user.id,
        number_of_guests=2,
        status=BookingStatusEnum.CONFIRMED,
        total_price=total,
        start_date=check_in,
        end_date=check_out,
        is_premium=bool(chosen_room.is_premium or any(a.is_premium for a in chosen_activities)),
    )
    db.add(booking)
    db.commit()
    db.refresh(booking)

    db.add(BookingRoom(booking_id=booking.id, room_id=chosen_room.id))
    for a in chosen_activities:
        db.add(BookingActivity(booking_id=booking.id, activity_id=a.id))
    db.commit()


def run_seed():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        reset_db(db)

        demo, admin, manager = seed_users(db)
        hotels = seed_hotels(db)
        rooms = seed_rooms(db, hotels)
        activities = seed_activities(db)
        seed_booking(db, demo, rooms, activities)

        print("Seeding completed.")
        print("Users:")
        print("  demo@island.local / Riv3r!Stone#2026")
        print("  admin@island.local / Gl0w!Maple@7261")
        print("  manager@island.local / C0balt!Harbor#5512")
    finally:
        db.close()


if __name__ == "__main__":
    run_seed()