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
