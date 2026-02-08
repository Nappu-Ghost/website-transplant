from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime, date
from app.models import RoleEnum, StatusEnum, AppointmentStatusEnum, ShiftTimeEnum


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    email: Optional[str] = None


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    role: RoleEnum = RoleEnum.CUSTOMER
    status: StatusEnum = StatusEnum.ACTIVE


class UserCreate(UserBase):
    password: str = Field(..., min_length=8)


class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    role: Optional[RoleEnum] = None
    status: Optional[StatusEnum] = None
    password: Optional[str] = Field(None, min_length=8)


class UserResponse(UserBase):
    id: int
    createdAt: datetime
    updatedAt: datetime
    model_config = ConfigDict(from_attributes=True)


class ClinicBase(BaseModel):
    name: str
    address: str
    phone: Optional[str] = None
    opening_hours: Optional[str] = None
    image_url: Optional[str] = None
    rooms: int = Field(3, gt=0)
    beds: int = Field(12, ge=0)
    surgeryRooms: int = Field(1, gt=0)
    status: StatusEnum = StatusEnum.ACTIVE


class ClinicCreate(ClinicBase):
    pass


class ClinicUpdate(BaseModel):
    name: Optional[str] = None
    address: Optional[str] = None
    phone: Optional[str] = None
    opening_hours: Optional[str] = None
    image_url: Optional[str] = None
    rooms: Optional[int] = Field(None, gt=0)
    beds: Optional[int] = Field(None, gt=0)
    surgeryRooms: Optional[int] = Field(None, gt=0)
    status: Optional[StatusEnum] = None


class ClinicResponse(ClinicBase):
    id: int
    createdAt: datetime
    updatedAt: datetime
    model_config = ConfigDict(from_attributes=True)


class ServiceBase(BaseModel):
    name: str
    description: Optional[str] = None
    icon_url: Optional[str] = None
    includes: Optional[str] = None
    price_morning: float = Field(..., gt=0)
    price_afternoon: float = Field(..., gt=0)
    price_evening: float = Field(..., gt=0)
    status: StatusEnum = StatusEnum.ACTIVE


class ServiceCreate(ServiceBase):
    pass


class ServiceUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    icon_url: Optional[str] = None
    includes: Optional[str] = None
    price_morning: Optional[float] = Field(None, gt=0)
    price_afternoon: Optional[float] = Field(None, gt=0)
    price_evening: Optional[float] = Field(None, gt=0)
    status: Optional[StatusEnum] = None


class ServiceResponse(ServiceBase):
    id: int
    createdAt: datetime
    updatedAt: datetime
    model_config = ConfigDict(from_attributes=True)


class DoctorBase(BaseModel):
    specialty: Optional[str] = None
    status: StatusEnum = StatusEnum.ACTIVE
    clinic_id: int
    user_id: Optional[int] = None


class DoctorCreate(DoctorBase):
    user_email: Optional[EmailStr] = None
    user_password: Optional[str] = Field(None, min_length=8)
    user_name: Optional[str] = None


class DoctorUpdate(BaseModel):
    specialty: Optional[str] = None
    status: Optional[StatusEnum] = None
    clinic_id: Optional[int] = None


class DoctorResponse(DoctorBase):
    id: int
    user_id: int
    createdAt: datetime
    updatedAt: datetime
    user: UserResponse
    clinic: ClinicResponse
    model_config = ConfigDict(from_attributes=True)


class AppointmentBase(BaseModel):
    appointment_time: datetime
    status: AppointmentStatusEnum = AppointmentStatusEnum.SCHEDULED
    price: float = Field(..., ge=0)
    notes: Optional[str] = None
    customer_id: int
    clinic_id: int
    service_id: int
    doctor_id: int


class AppointmentCreate(AppointmentBase):
    pass


class AppointmentUpdate(BaseModel):
    appointment_time: Optional[datetime] = None
    status: Optional[AppointmentStatusEnum] = None
    price: Optional[float] = Field(None, ge=0)
    notes: Optional[str] = None


class AppointmentResponse(AppointmentBase):
    id: int
    bookingReference: str
    createdAt: datetime
    updatedAt: datetime
    customer: UserResponse
    clinic: ClinicResponse
    service: ServiceResponse
    doctor: DoctorResponse
    model_config = ConfigDict(from_attributes=True)


class ShiftBase(BaseModel):
    date: date
    shift_time: ShiftTimeEnum
    room: Optional[str] = None
    doctor_id: int
    clinic_id: int


class ShiftCreate(ShiftBase):
    pass


class ShiftUpdate(BaseModel):
    date: Optional[date] = None
    shift_time: Optional[ShiftTimeEnum] = None
    room: Optional[str] = None


class ShiftResponse(ShiftBase):
    id: int
    createdAt: datetime
    updatedAt: datetime
    doctor: DoctorResponse
    clinic: ClinicResponse
    model_config = ConfigDict(from_attributes=True)


class SurgeryBookingBase(BaseModel):
    date: date
    start_time: str
    end_time: str
    procedure: str
    clinic_id: int
    doctor_id: int


class SurgeryBookingCreate(SurgeryBookingBase):
    pass


class SurgeryBookingUpdate(BaseModel):
    date: Optional[date] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    procedure: Optional[str] = None


class SurgeryBookingResponse(SurgeryBookingBase):
    id: int
    createdAt: datetime
    updatedAt: datetime
    clinic: ClinicResponse
    doctor: DoctorResponse
    model_config = ConfigDict(from_attributes=True)
