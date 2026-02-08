from sqlalchemy import (
    Column,
    Integer,
    String,
    ForeignKey,
    DateTime,
    Enum as SQLAlchemyEnum,
    Float,
    Date,
    UniqueConstraint,
    Index,
    Boolean,
    Text,
)
from sqlalchemy.orm import relationship
from app.db import Base
import enum
from datetime import datetime
import uuid


class RoleEnum(str, enum.Enum):
    CUSTOMER = "CUSTOMER"
    DOCTOR = "DOCTOR"
    ADMINISTRATIVE_OFFICER = "ADMINISTRATIVE_OFFICER"
    MANAGER = "MANAGER"
    ADMIN = "ADMIN"


class StatusEnum(str, enum.Enum):
    ACTIVE = "ACTIVE"
    INACTIVE = "INACTIVE"


class AppointmentStatusEnum(str, enum.Enum):
    SCHEDULED = "SCHEDULED"
    COMPLETED = "COMPLETED"
    CANCELLED = "CANCELLED"


class ShiftTimeEnum(str, enum.Enum):
    MORNING = "MORNING"
    AFTERNOON = "AFTERNOON"
    EVENING = "EVENING"


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    role = Column(SQLAlchemyEnum(RoleEnum), default=RoleEnum.CUSTOMER, nullable=False)
    status = Column(
        SQLAlchemyEnum(StatusEnum), default=StatusEnum.ACTIVE, nullable=False
    )
    profileImage = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    appointments = relationship(
        "Appointment",
        back_populates="customer",
        foreign_keys="[Appointment.customer_id]",
    )
    doctor_profile = relationship(
        "Doctor", back_populates="user", uselist=False, cascade="all, delete-orphan"
    )


class Clinic(Base):
    __tablename__ = "clinics"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    address = Column(String, nullable=False)
    phone = Column(String, nullable=True)
    opening_hours = Column(String, nullable=True)
    image_url = Column(String, nullable=True)
    rooms = Column(Integer, default=3, nullable=False)
    beds = Column(Integer, default=12, nullable=False)
    surgeryRooms = Column(Integer, default=1, nullable=False)
    status = Column(
        SQLAlchemyEnum(StatusEnum), default=StatusEnum.ACTIVE, nullable=False
    )
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    doctors = relationship("Doctor", back_populates="clinic")
    appointments = relationship("Appointment", back_populates="clinic")
    shifts = relationship("Shift", back_populates="clinic")
    surgery_bookings = relationship("SurgeryBooking", back_populates="clinic")


class Doctor(Base):
    __tablename__ = "doctors"
    id = Column(Integer, primary_key=True, index=True)
    specialty = Column(String, nullable=True)
    status = Column(
        SQLAlchemyEnum(StatusEnum), default=StatusEnum.ACTIVE, nullable=False
    )
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    user_id = Column(Integer, ForeignKey("users.id"), unique=True, nullable=False)
    user = relationship("User", back_populates="doctor_profile")
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=True)
    clinic = relationship("Clinic", back_populates="doctors")
    appointments = relationship("Appointment", back_populates="doctor")
    shifts = relationship("Shift", back_populates="doctor")
    surgery_bookings = relationship("SurgeryBooking", back_populates="doctor")


class Service(Base):
    __tablename__ = "services"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    icon_url = Column(String, nullable=True)
    includes = Column(Text, nullable=True)
    price_morning = Column(Float, nullable=False)
    price_afternoon = Column(Float, nullable=False)
    price_evening = Column(Float, nullable=False)
    status = Column(
        SQLAlchemyEnum(StatusEnum), default=StatusEnum.ACTIVE, nullable=False
    )
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    appointments = relationship("Appointment", back_populates="service")


class Appointment(Base):
    __tablename__ = "appointments"
    id = Column(Integer, primary_key=True, index=True)
    bookingReference = Column(
        String, unique=True, default=lambda: str(uuid.uuid4()), nullable=False
    )
    appointment_time = Column(DateTime, nullable=False)
    status = Column(
        SQLAlchemyEnum(AppointmentStatusEnum),
        default=AppointmentStatusEnum.SCHEDULED,
        nullable=False,
    )
    price = Column(Float, nullable=False)
    notes = Column(Text, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    customer = relationship(
        "User", back_populates="appointments", foreign_keys=[customer_id]
    )
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    clinic = relationship("Clinic", back_populates="appointments")
    service_id = Column(Integer, ForeignKey("services.id"), nullable=False)
    service = relationship("Service", back_populates="appointments")
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    doctor = relationship("Doctor", back_populates="appointments")


class Shift(Base):
    __tablename__ = "shifts"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    shift_time = Column(SQLAlchemyEnum(ShiftTimeEnum), nullable=False)
    room = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    doctor = relationship("Doctor", back_populates="shifts")
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    clinic = relationship("Clinic", back_populates="shifts")
    __table_args__ = (
        UniqueConstraint("doctor_id", "date", "shift_time", name="uq_doctor_date_shift"),
    )


class SurgeryBooking(Base):
    __tablename__ = "surgery_bookings"
    id = Column(Integer, primary_key=True, index=True)
    date = Column(Date, nullable=False)
    start_time = Column(String, nullable=False)
    end_time = Column(String, nullable=False)
    procedure = Column(String, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    clinic_id = Column(Integer, ForeignKey("clinics.id"), nullable=False)
    clinic = relationship("Clinic", back_populates="surgery_bookings")
    doctor_id = Column(Integer, ForeignKey("doctors.id"), nullable=False)
    doctor = relationship("Doctor", back_populates="surgery_bookings")
    __table_args__ = (Index("ix_surgerybooking_clinic_date", "clinic_id", "date"),)


class BookingStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    PAYMENT_COMPLETED = "PAYMENT_COMPLETED"
    CONFIRMED = "CONFIRMED"
    CHECKED_IN = "CHECKED_IN"
    CHECKED_OUT = "CHECKED_OUT"
    CANCELLED = "CANCELLED"


class PaymentStatusEnum(str, enum.Enum):
    PENDING = "PENDING"
    AUTHORIZED = "AUTHORIZED"
    CAPTURED = "CAPTURED"
    FAILED = "FAILED"
    REFUNDED = "REFUNDED"


class PaymentMethodEnum(str, enum.Enum):
    CARD = "CARD"
    BANK_TRANSFER = "BANK_TRANSFER"
    CASH = "CASH"


class Hotel(Base):
    __tablename__ = "hotels"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(Text, nullable=True)
    location = Column(String, nullable=False)
    image_url = Column(String, nullable=True)
    floors = Column(Integer, default=1, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    rooms = relationship("Room", back_populates="hotel", cascade="all, delete-orphan")


class Room(Base):
    __tablename__ = "rooms"
    id = Column(Integer, primary_key=True, index=True)
    hotel_id = Column(Integer, ForeignKey("hotels.id"), nullable=False)
    name = Column(String, nullable=False)
    type = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    capacity = Column(Integer, nullable=False)
    description = Column(Text, nullable=True)
    image_url = Column(String, nullable=True)
    floor_number = Column(Integer, default=1, nullable=False)
    available = Column(Boolean, default=True, nullable=False)
    is_premium = Column(Boolean, default=False, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    hotel = relationship("Hotel", back_populates="rooms")
    bookings = relationship("BookingRoom", back_populates="room", cascade="all, delete-orphan")


class Activity(Base):
    __tablename__ = "activities"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    activity_type = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    capacity = Column(Integer, nullable=True)
    image_url = Column(String, nullable=True)
    is_premium = Column(Boolean, default=False, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    bookings = relationship("BookingActivity", back_populates="activity", cascade="all, delete-orphan")


class Event(Base):
    __tablename__ = "events"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    is_premium = Column(Boolean, default=False, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )


class Booking(Base):
    __tablename__ = "bookings"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    number_of_guests = Column(Integer, nullable=False)
    status = Column(SQLAlchemyEnum(BookingStatusEnum), default=BookingStatusEnum.PENDING, nullable=False)
    total_price = Column(Float, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    is_premium = Column(Boolean, default=False, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    user = relationship("User")
    rooms = relationship("BookingRoom", back_populates="booking", cascade="all, delete-orphan")
    activities = relationship("BookingActivity", back_populates="booking", cascade="all, delete-orphan")
    ferry_ticket = relationship("FerryTicket", back_populates="booking", uselist=False, cascade="all, delete-orphan")
    payments = relationship("Payment", back_populates="booking", cascade="all, delete-orphan")


class Payment(Base):
    __tablename__ = "payments"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    amount = Column(Float, nullable=False)
    currency = Column(String, default="USD", nullable=False)
    status = Column(SQLAlchemyEnum(PaymentStatusEnum), default=PaymentStatusEnum.PENDING, nullable=False)
    method = Column(SQLAlchemyEnum(PaymentMethodEnum), default=PaymentMethodEnum.CARD, nullable=False)
    provider = Column(String, nullable=True)
    provider_reference = Column(String, nullable=True)
    paid_at = Column(DateTime, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    booking = relationship("Booking", back_populates="payments")


class BookingRoom(Base):
    __tablename__ = "booking_rooms"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    room_id = Column(Integer, ForeignKey("rooms.id"), nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    booking = relationship("Booking", back_populates="rooms")
    room = relationship("Room", back_populates="bookings")

    __table_args__ = (UniqueConstraint("booking_id", "room_id", name="uq_booking_room"),)


class BookingActivity(Base):
    __tablename__ = "booking_activities"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False)
    activity_id = Column(Integer, ForeignKey("activities.id"), nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    booking = relationship("Booking", back_populates="activities")
    activity = relationship("Activity", back_populates="bookings")

    __table_args__ = (UniqueConstraint("booking_id", "activity_id", name="uq_booking_activity"),)


class Ferry(Base):
    __tablename__ = "ferries"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    capacity = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    schedule = Column(Text, nullable=False)
    image_url = Column(String, nullable=True)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    schedules = relationship("FerrySchedule", back_populates="ferry", cascade="all, delete-orphan")


class FerrySchedule(Base):
    __tablename__ = "ferry_schedules"
    id = Column(Integer, primary_key=True, index=True)
    ferry_id = Column(Integer, ForeignKey("ferries.id"), nullable=False)
    departure = Column(DateTime, nullable=False)
    arrival = Column(DateTime, nullable=False)
    route = Column(String, nullable=False)
    price = Column(Float, nullable=False)
    available = Column(Boolean, default=True, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    ferry = relationship("Ferry", back_populates="schedules")


class FerryTicket(Base):
    __tablename__ = "ferry_tickets"
    id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.id"), nullable=False, unique=True)
    number_of_tickets = Column(Integer, nullable=False)
    price = Column(Float, nullable=False)
    createdAt = Column(DateTime, default=datetime.utcnow, nullable=False)
    updatedAt = Column(
        DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False
    )
    booking = relationship("Booking", back_populates="ferry_ticket")
