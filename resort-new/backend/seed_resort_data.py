import os
import sys
from datetime import datetime, timedelta

project_root = os.path.abspath(os.path.dirname(__file__))
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from app.db import SessionLocal, Base, engine
from app import models
from app.utils.security import get_password_hash


def get_or_create_user(session, email: str, name: str, role: models.RoleEnum) -> models.User:
    user = session.query(models.User).filter(models.User.email == email).first()
    if user:
        return user
    user = models.User(
        email=email,
        name=name,
        role=role,
        status=models.StatusEnum.ACTIVE,
        hashed_password=get_password_hash("Password123!"),
    )
    session.add(user)
    session.flush()
    return user


def get_or_create_hotel(session, name: str) -> models.Hotel:
    hotel = session.query(models.Hotel).filter(models.Hotel.name == name).first()
    if hotel:
        return hotel
    hotel = models.Hotel(
        name=name,
        description="Oceanfront resort with lagoon villas.",
        location="Baa Atoll",
        image_url="/images/hotels/azure-lagoon.jpg",
        floors=3,
    )
    session.add(hotel)
    session.flush()
    return hotel


def get_or_create_room(session, hotel_id: int, name: str, room_type: str, price: float) -> models.Room:
    room = (
        session.query(models.Room)
        .filter(models.Room.hotel_id == hotel_id, models.Room.name == name)
        .first()
    )
    if room:
        return room
    room = models.Room(
        hotel_id=hotel_id,
        name=name,
        type=room_type,
        price=price,
        capacity=2,
        description="King bed with private deck.",
        image_url="/images/rooms/lagoon-suite.jpg",
        floor_number=2,
        available=True,
        is_premium=room_type.lower().startswith("premium"),
    )
    session.add(room)
    session.flush()
    return room


def get_or_create_activity(session, name: str) -> models.Activity:
    activity = session.query(models.Activity).filter(models.Activity.name == name).first()
    if activity:
        return activity
    activity = models.Activity(
        name=name,
        activity_type="Adventure",
        price=120.0,
        capacity=12,
        image_url="/images/activities/snorkel.jpg",
        is_premium=False,
    )
    session.add(activity)
    session.flush()
    return activity


def get_or_create_event(session, name: str) -> models.Event:
    event = session.query(models.Event).filter(models.Event.name == name).first()
    if event:
        return event
    event = models.Event(
        name=name,
        start_date=datetime.utcnow() + timedelta(days=5),
        end_date=datetime.utcnow() + timedelta(days=6),
        is_premium=True,
    )
    session.add(event)
    session.flush()
    return event


def get_or_create_ferry(session, name: str) -> models.Ferry:
    ferry = session.query(models.Ferry).filter(models.Ferry.name == name).first()
    if ferry:
        return ferry
    ferry = models.Ferry(
        name=name,
        description="Speedboat transfer service.",
        capacity=48,
        price=85.0,
        schedule="Every 2 hours",
        image_url="/images/ferries/speedboat.jpg",
    )
    session.add(ferry)
    session.flush()
    return ferry


def get_or_create_ferry_schedule(session, ferry_id: int) -> models.FerrySchedule:
    schedule = session.query(models.FerrySchedule).filter(models.FerrySchedule.ferry_id == ferry_id).first()
    if schedule:
        return schedule
    schedule = models.FerrySchedule(
        ferry_id=ferry_id,
        departure=datetime.utcnow() + timedelta(days=1, hours=3),
        arrival=datetime.utcnow() + timedelta(days=1, hours=4),
        route="Male -> Baa Atoll",
        price=85.0,
        available=True,
    )
    session.add(schedule)
    session.flush()
    return schedule


def create_booking_with_extras(
    session,
    user: models.User,
    room: models.Room,
    activity: models.Activity,
) -> models.Booking:
    existing = session.query(models.Booking).filter(models.Booking.user_id == user.id).first()
    if existing:
        return existing

    booking = models.Booking(
        user_id=user.id,
        number_of_guests=2,
        status=models.BookingStatusEnum.CONFIRMED,
        total_price=room.price + activity.price,
        start_date=datetime.utcnow() + timedelta(days=14),
        end_date=datetime.utcnow() + timedelta(days=17),
        is_premium=room.is_premium,
    )
    session.add(booking)
    session.flush()

    session.add(models.BookingRoom(booking_id=booking.id, room_id=room.id))
    session.add(models.BookingActivity(booking_id=booking.id, activity_id=activity.id))
    session.add(
        models.FerryTicket(
            booking_id=booking.id,
            number_of_tickets=2,
            price=170.0,
        )
    )
    session.add(
        models.Payment(
            booking_id=booking.id,
            amount=booking.total_price,
            currency="USD",
            status=models.PaymentStatusEnum.CAPTURED,
            method=models.PaymentMethodEnum.CARD,
            provider="demo",
            provider_reference="PAY-TEST-0001",
            paid_at=datetime.utcnow(),
        )
    )

    session.flush()
    return booking


def seed_resort_data():
    print("Seeding resort data...")
    Base.metadata.create_all(bind=engine)
    session = SessionLocal()
    try:
        admin = get_or_create_user(session, "admin@resort.test", "Resort Admin", models.RoleEnum.ADMIN)
        customer = get_or_create_user(session, "guest@resort.test", "Resort Guest", models.RoleEnum.CUSTOMER)

        hotel = get_or_create_hotel(session, "Azure Lagoon Resort")
        room = get_or_create_room(session, hotel.id, "Lagoon Suite 201", "Premium Suite", 480.0)
        get_or_create_room(session, hotel.id, "Garden Villa 102", "Villa", 280.0)

        activity = get_or_create_activity(session, "Reef Snorkeling")
        get_or_create_event(session, "Sunset Chef's Table")

        ferry = get_or_create_ferry(session, "Lagoon Express")
        get_or_create_ferry_schedule(session, ferry.id)

        create_booking_with_extras(session, customer, room, activity)

        session.commit()
        print(f"Seed complete. Admin user: {admin.email}, Guest user: {customer.email}")
    except Exception as exc:
        session.rollback()
        print(f"Seed failed: {exc}")
    finally:
        session.close()


if __name__ == "__main__":
    seed_resort_data()
