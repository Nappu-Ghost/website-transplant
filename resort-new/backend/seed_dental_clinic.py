import random
import uuid
from datetime import datetime, timedelta, date as DDate, time as DTime
from sqlalchemy import (
    create_engine,
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
from sqlalchemy.orm import declarative_base, sessionmaker, relationship
from faker import Faker
import enum
import sys
import os

try:
    from app.utils.security import get_password_hash
except ImportError:
    project_root_for_seed = os.path.abspath(
        os.path.join(os.path.dirname(__file__), ".")
    )
    if project_root_for_seed not in sys.path:
        sys.path.insert(0, project_root_for_seed)
    from app.utils.security import get_password_hash


DATABASE_URL = "sqlite:///dental_clinic.db"
Base = declarative_base()
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

fake = Faker()

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
    role = Column(
        SQLAlchemyEnum(RoleEnum, name="role_enum_types_seed_v4"),
        default=RoleEnum.CUSTOMER,
        nullable=False,
    )
    status = Column(
        SQLAlchemyEnum(StatusEnum, name="status_enum_types_seed_v4"),
        default=StatusEnum.ACTIVE,
        nullable=False,
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
        SQLAlchemyEnum(StatusEnum, name="clinic_status_enum_seed_v4"),
        default=StatusEnum.ACTIVE,
        nullable=False,
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
        SQLAlchemyEnum(StatusEnum, name="doctor_status_enum_seed_v4"),
        default=StatusEnum.ACTIVE,
        nullable=False,
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
        SQLAlchemyEnum(StatusEnum, name="service_status_enum_seed_v4"),
        default=StatusEnum.ACTIVE,
        nullable=False,
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
        SQLAlchemyEnum(AppointmentStatusEnum, name="appointment_status_enum_seed_v4"),
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
    shift_time = Column(
        SQLAlchemyEnum(ShiftTimeEnum, name="shift_time_enum_seed_v4"), nullable=False
    )
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
        UniqueConstraint(
            "doctor_id", "date", "shift_time", name="uq_doctor_date_shift_seed_v4"
        ),
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
    __table_args__ = (
        Index("ix_surgerybooking_clinic_date_seed_v4", "clinic_id", "date"),
    )

CLINIC_NAMES = ["Malé Central Clinic", "Kulhudhufushi Dental Care", "Addu City Smiles"]
DENTISTS_PER_CLINIC = 2
TOTAL_DOCTORS = len(CLINIC_NAMES) * DENTISTS_PER_CLINIC

SERVICE_DATA = [
    {
        "name": "Preventive Care",
        "price_morning": 150.0,
        "price_afternoon": 125.0,
        "price_evening": 100.0,
        "description": "Routine checkups, professional cleanings, and diagnostic X-rays.",
        "includes": "Checkup, Cleaning, Basic X-Rays",
        "icon_url": "/images/icons/teeth-sparkle.svg",
    },
    {
        "name": "Basic Restorative",
        "price_morning": 200.0,
        "price_afternoon": 250.0,
        "price_evening": 150.0,
        "description": "Treatment for cavities including fillings and simple tooth extractions.",
        "includes": "Composite Filling, Simple Extraction",
        "icon_url": "/images/icons/medikit.svg",
    },
    {
        "name": "Cosmetic Dentistry",
        "price_morning": 250.0,
        "price_afternoon": 400.0,
        "price_evening": 600.0,
        "description": "Procedures like veneers, and teeth whitening.",
        "includes": "Veneers, Whitening",
        "icon_url": "/images/icons/smiley.svg",
    },
    {
        "name": "Emergency Care",
        "price_morning": 350.0,
        "price_afternoon": 500.0,
        "price_evening": 750.0,
        "description": "Urgent treatments for dental injuries or acute pain.",
        "includes": "Pain Relief, Injury Assessment",
        "icon_url": "/images/icons/bandage.svg",
    },
    {
        "name": "Heart Health Oral Check",
        "price_morning": 100.0,
        "price_afternoon": 90.0,
        "price_evening": 80.0,
        "description": "Consultation regarding oral health and its link to heart health.",
        "includes": "Consultation, Risk Assessment",
        "icon_url": "/images/icons/heart-pulse.svg",
    },
]

def get_service_price_for_time(service_obj, appointment_dt):
    hour = appointment_dt.hour
    if 8 <= hour < 12:
        return service_obj.price_morning
    elif 13 <= hour < 17:
        return service_obj.price_afternoon
    elif 18 <= hour < 22:
        return service_obj.price_evening
    return service_obj.price_morning


def create_specific_time(base_date, hour, minute):
    return base_date.replace(hour=hour, minute=minute, second=0, microsecond=0)


def find_or_create_user(session, defaults=None, **kwargs):
    email = kwargs.get("email")
    instance = session.query(User).filter_by(email=email).first()
    if instance:
        if defaults:
            for key, value in defaults.items():
                if key == "password":
                    setattr(instance, "hashed_password", get_password_hash(value))
                elif key == "hashed_password":
                    setattr(instance, key, value)
                else:
                    setattr(instance, key, value)
        return instance, False
    else:
        params = {**kwargs, **(defaults or {})}
        if "password" in params:
            params["hashed_password"] = get_password_hash(params.pop("password"))
        elif "hashed_password" not in params:
            raise ValueError(
                "Password or hashed_password must be provided for new user."
            )
        instance = User(**params)
        session.add(instance)
        return instance, True


def find_or_create(session, model, defaults=None, **kwargs):
    instance = session.query(model).filter_by(**kwargs).first()
    if instance:
        if defaults:
            for key, value in defaults.items():
                setattr(instance, key, value)
        return instance, False
    else:
        params = {**kwargs, **(defaults or {})}
        instance = model(**params)
        session.add(instance)
        return instance, True

def seed():
    current_dir = os.path.dirname(os.path.abspath(__file__))
    project_root_dir = os.path.abspath(os.path.join(current_dir))
    if project_root_dir not in sys.path:
        sys.path.insert(0, project_root_dir)

    print("Dropping all tables (if they exist) and recreating...")
    Base.metadata.drop_all(bind=engine)
    Base.metadata.create_all(bind=engine)
    print("Tables recreated.")

    db = SessionLocal()
    try:
        print(f"Starting seeding process...")
        
        clinic_image_map = {
            "Malé Central Clinic": "/images/clinics/clinic1.jpg",
            "Kulhudhufushi Dental Care": "/images/clinics/clinic2.jpg",
            "Addu City Smiles": "/images/clinics/clinic3.jpg"
        }
        
        db_clinics = []
        for name in CLINIC_NAMES:
            clinic_data = {
                "address": fake.street_address() + ", " + fake.city(),
                "phone": fake.phone_number(),
                "opening_hours": f"Mon-Sun: {random.choice(['8am - 10pm', '9am - 9pm'])}",
                "image_url": clinic_image_map.get(name),
                "status": StatusEnum.ACTIVE,
                "rooms": random.randint(2, 5),
                "beds": random.randint(1, 2),
                "surgeryRooms": random.randint(1, 2),
            }
            clinic, _ = find_or_create(db, Clinic, defaults=clinic_data, name=name)
            db_clinics.append(clinic)
        db.flush()

        db_services = []
        for s_data in SERVICE_DATA:
            service_defaults = {
                "description": s_data["description"],
                "icon_url": s_data["icon_url"],
                "includes": s_data["includes"],
                "price_morning": s_data["price_morning"],
                "price_afternoon": s_data["price_afternoon"],
                "price_evening": s_data["price_evening"],
                "status": StatusEnum.ACTIVE,
            }
            service, _ = find_or_create(
                db, Service, defaults=service_defaults, name=s_data["name"]
            )
            db_services.append(service)
        db.flush()

        admin_user_data = {
            "name": "Admin User",
            "password": "password",
            "role": RoleEnum.ADMIN,
            "status": StatusEnum.ACTIVE,
        }
        admin_user, _ = find_or_create_user(
            db, defaults=admin_user_data, email="admin@example.com"
        )
        manager_user_data = {
            "name": "Manager User",
            "password": "password",
            "role": RoleEnum.MANAGER,
            "status": StatusEnum.ACTIVE,
        }
        manager_user, _ = find_or_create_user(
            db, defaults=manager_user_data, email="manager@example.com"
        )
        officer_user_data = {
            "name": "Officer User",
            "password": "password",
            "role": RoleEnum.ADMINISTRATIVE_OFFICER,
            "status": StatusEnum.ACTIVE,
        }
        officer_user, _ = find_or_create_user(
            db, defaults=officer_user_data, email="officer@example.com"
        )
        customer_user_data = {
            "name": fake.name(),
            "password": "password",
            "role": RoleEnum.CUSTOMER,
            "status": StatusEnum.ACTIVE,
        }
        customer_user, _ = find_or_create_user(
            db, defaults=customer_user_data, email="customer@example.com"
        )
        db_customers = [customer_user]
        for i in range(5):
            cust_email = fake.unique.email()
            cust_data = {
                "name": fake.name(),
                "password": "password",
                "role": RoleEnum.CUSTOMER,
                "status": StatusEnum.ACTIVE,
            }
            new_customer, _ = find_or_create_user(
                db, defaults=cust_data, email=cust_email
            )
            db_customers.append(new_customer)
        db.flush()

        db_doctor_users = []
        for i in range(TOTAL_DOCTORS):
            doc_last_name = fake.last_name().replace("'", "").lower()
            doc_email = f"dr.{doc_last_name}{i+1}@example.doc"
            user_data = {
                "name": f"Dr. {fake.first_name()} {doc_last_name.capitalize()}",
                "password": "password",
                "role": RoleEnum.DOCTOR,
                "status": StatusEnum.ACTIVE,
            }
            user, _ = find_or_create_user(db, defaults=user_data, email=doc_email)
            db_doctor_users.append(user)
        db.flush()

        db_doctors = []
        doctor_user_index = 0
        for clinic_idx, clinic in enumerate(db_clinics):
            for _ in range(DENTISTS_PER_CLINIC):
                if doctor_user_index >= len(db_doctor_users):
                    break
                linked_user = db_doctor_users[doctor_user_index]
                existing_doctor_profile = (
                    db.query(Doctor).filter_by(user_id=linked_user.id).first()
                )
                if existing_doctor_profile:
                    db_doctors.append(existing_doctor_profile)
                    doctor_user_index += 1
                    continue
                doctor_profile_data = {
                    "user_id": linked_user.id,
                    "clinic_id": clinic.id,
                    "specialty": random.choice(
                        ["General Dentistry", "Orthodontics", "Pediatrics"]
                    ),
                    "status": StatusEnum.ACTIVE,
                }
                doctor_profile, _ = find_or_create(
                    db, Doctor, defaults=doctor_profile_data, user_id=linked_user.id
                )
                db_doctors.append(doctor_profile)
                doctor_user_index += 1
            if doctor_user_index >= len(db_doctor_users):
                break
        db.flush()

        if db_doctors:
            today = DDate.today()
            for doctor_profile in db_doctors:
                if not doctor_profile.clinic_id:
                    continue
                clinic_for_shift = db.get(
                    Clinic, doctor_profile.clinic_id
                )
                if not clinic_for_shift:
                    continue
                for day_offset in range(1, 8):
                    shift_date = today + timedelta(days=day_offset)
                    for shift_time_enum in [
                        ShiftTimeEnum.MORNING,
                        ShiftTimeEnum.AFTERNOON,
                    ]:
                        existing_shift = (
                            db.query(Shift)
                            .filter_by(
                                doctor_id=doctor_profile.id,
                                date=shift_date,
                                shift_time=shift_time_enum,
                            )
                            .first()
                        )
                        if not existing_shift:
                            shift = Shift(
                                doctor_id=doctor_profile.id,
                                clinic_id=doctor_profile.clinic_id,
                                date=shift_date,
                                shift_time=shift_time_enum,
                                room=f"Room {random.randint(1, clinic_for_shift.rooms or 1)}",
                            )
                            db.add(shift)
            db.flush()

        if db_doctors and db_services and db_customers:
            for _ in range(20):
                random_doctor = random.choice(db_doctors)
                if not random_doctor.clinic_id:
                    continue
                random_clinic = db.get(
                    Clinic, random_doctor.clinic_id
                )
                if not random_clinic:
                    continue
                random_service = random.choice(db_services)
                random_customer = random.choice(db_customers)
                appointment_base_date = datetime.utcnow() + timedelta(
                    days=random.randint(1, 7)
                )
                random_hour = random.randint(9, 16)
                random_minute = random.choice([0, 30])
                appointment_dt = create_specific_time(
                    appointment_base_date, random_hour, random_minute
                )
                calculated_price = get_service_price_for_time(
                    random_service, appointment_dt
                )
                appointment_status = random.choices(
                    [
                        AppointmentStatusEnum.SCHEDULED,
                        AppointmentStatusEnum.COMPLETED,
                    ],
                    weights=[0.6, 0.2],
                    k=1,
                )[0]
                appointment = Appointment(
                    appointment_time=appointment_dt,
                    price=calculated_price,
                    status=appointment_status,
                    notes=fake.sentence() if random.random() < 0.1 else None,
                    customer_id=random_customer.id,
                    clinic_id=random_clinic.id,
                    service_id=random_service.id,
                    doctor_id=random_doctor.id,
                )
                db.add(appointment)
            db.flush()

        if db_doctors:
            for _ in range(5):
                random_doctor = random.choice(db_doctors)
                if not random_doctor.clinic_id:
                    continue
                doctor_clinic = db.get(
                    Clinic, random_doctor.clinic_id
                )
                if not doctor_clinic or doctor_clinic.surgeryRooms == 0:
                    continue
                booking_date = DDate.today() + timedelta(days=random.randint(1, 14))
                start_hour, duration_hours = (
                    (random.randint(9, 10), 1)
                    if random.choice([True, False])
                    else (random.randint(14, 15), 1)
                )
                start_minute = random.choice([0, 30])
                start_time_obj = DTime(start_hour, start_minute)
                end_time_obj = (
                    datetime.combine(DDate.min, start_time_obj)
                    + timedelta(hours=duration_hours)
                ).time()
                surgery_booking = SurgeryBooking(
                    date=booking_date,
                    start_time=start_time_obj.strftime("%H:%M"),
                    end_time=end_time_obj.strftime("%H:%M"),
                    procedure=random.choice(
                        ["Wisdom Tooth Extraction", "Implant Placement"]
                    ),
                    clinic_id=doctor_clinic.id,
                    doctor_id=random_doctor.id,
                )
                db.add(surgery_booking)
            db.flush()

        db.commit()
        print("\nSeeding finished successfully!")
    except Exception as e:
        db.rollback()
        print(f"\nSeeding failed:")
        import traceback

        traceback.print_exc()
    finally:
        db.close()
        print("Database session closed.")


if __name__ == "__main__":
    seed()