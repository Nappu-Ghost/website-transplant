from __future__ import annotations

from pydantic import BaseModel, EmailStr, Field, ConfigDict, AliasChoices, model_validator
from typing import Optional, List
from datetime import datetime, date

def _validate_password_strength(password: str, email: str | None = None) -> str:
    if password is None:
        return password
    pw = password.strip()
    if len(pw) < 12:
        raise ValueError("Password must be at least 12 characters long.")
    if len(pw) > 128:
        raise ValueError("Password must be at most 128 characters long.")

    classes = 0
    classes += 1 if any(c.islower() for c in pw) else 0
    classes += 1 if any(c.isupper() for c in pw) else 0
    classes += 1 if any(c.isdigit() for c in pw) else 0
    classes += 1 if any(not c.isalnum() for c in pw) else 0
    if classes < 3:
        raise ValueError("Password must include at least 3 of: lowercase, uppercase, digit, symbol.")

    if email:
        local = email.split("@", 1)[0].lower()
        if local and local in pw.lower():
            raise ValueError("Password must not contain parts of your email address.")

    return pw

from app.models import (
    RoleEnum,
    StatusEnum,
    BookingStatusEnum,
    PaymentStatusEnum,
    PaymentMethodEnum,
)


class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: Optional[str] = None


class TokenPayload(BaseModel):
    email: str
    token_type: Optional[str] = None 
    token_version: Optional[int] = None
    session_id: Optional[str] = None
    jti: Optional[str] = None


class TokenData(BaseModel):
    email: Optional[str] = None


class UserBase(BaseModel):
    email: EmailStr
    name: Optional[str] = None
    role: RoleEnum = RoleEnum.CUSTOMER
    status: StatusEnum = StatusEnum.ACTIVE
    profileImage: Optional[str] = Field(None, validation_alias=AliasChoices("profileImage", "profile_image"))

class UserCreate(UserBase):
    password: str

    @model_validator(mode="after")
    def validate_password(self):
        self.password = _validate_password_strength(self.password, self.email)
        return self

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    name: Optional[str] = None
    role: Optional[RoleEnum] = None
    status: Optional[StatusEnum] = None
    profileImage: Optional[str] = Field(None, validation_alias=AliasChoices("profileImage", "profile_image"))
    password: Optional[str] = None

    @model_validator(mode="after")
    def validate_password(self):
        if self.password is not None:
            self.password = _validate_password_strength(self.password, self.email)
        return self


class UserResponse(UserBase):
    id: int
    createdAt: datetime
    updatedAt: datetime
    model_config = ConfigDict(from_attributes=True)

class HotelBase(BaseModel):
    name: str
    description: Optional[str] = None
    location: str
    image_url: Optional[str] = None
    floors: int = Field(1, ge=1)

class HotelCreate(HotelBase):
    pass

class HotelUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    location: Optional[str] = None
    image_url: Optional[str] = None
    floors: Optional[int] = Field(None, ge=1)

class HotelResponse(HotelBase):
    id: int
    createdAt: datetime
    updatedAt: datetime
    model_config = ConfigDict(from_attributes=True)

class RoomBase(BaseModel):
    hotel_id: int
    name: str
    type: str
    price: float = Field(..., ge=0)
    capacity: int = Field(..., ge=1)
    description: Optional[str] = None
    image_url: Optional[str] = None
    floor_number: int = Field(1, ge=1)
    available: bool = True
    is_premium: bool = False

class RoomCreate(RoomBase):
    pass

class RoomUpdate(BaseModel):
    hotel_id: Optional[int] = None
    name: Optional[str] = None
    type: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    capacity: Optional[int] = Field(None, ge=1)
    description: Optional[str] = None
    image_url: Optional[str] = None
    floor_number: Optional[int] = Field(None, ge=1)
    available: Optional[bool] = None
    is_premium: Optional[bool] = None

class RoomResponse(RoomBase):
    id: int
    createdAt: datetime
    updatedAt: datetime
    model_config = ConfigDict(from_attributes=True)

class ActivityBase(BaseModel):
    name: str
    activity_type: str
    price: float = Field(..., ge=0)
    capacity: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = None
    is_premium: bool = False

class ActivityCreate(ActivityBase):
    pass

class ActivityUpdate(BaseModel):
    name: Optional[str] = None
    activity_type: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    capacity: Optional[int] = Field(None, ge=0)
    image_url: Optional[str] = None
    is_premium: Optional[bool] = None

class ActivityResponse(ActivityBase):
    id: int
    createdAt: datetime
    updatedAt: datetime
    model_config = ConfigDict(from_attributes=True)

class EventBase(BaseModel):
    name: str
    start_date: datetime
    end_date: datetime
    is_premium: bool = False

class EventCreate(EventBase):
    pass

class EventUpdate(BaseModel):
    name: Optional[str] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_premium: Optional[bool] = None

class EventResponse(EventBase):
    id: int
    createdAt: datetime
    updatedAt: datetime
    model_config = ConfigDict(from_attributes=True)

class FerryBase(BaseModel):
    name: str
    description: Optional[str] = None
    capacity: int = Field(..., ge=1)
    price: float = Field(..., ge=0)
    schedule: str
    image_url: Optional[str] = None

class FerryCreate(FerryBase):
    pass

class FerryUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    capacity: Optional[int] = Field(None, ge=1)
    price: Optional[float] = Field(None, ge=0)
    schedule: Optional[str] = None
    image_url: Optional[str] = None

class FerryResponse(FerryBase):
    id: int
    createdAt: datetime
    updatedAt: datetime
    model_config = ConfigDict(from_attributes=True)

class FerryScheduleBase(BaseModel):
    ferry_id: int
    departure: datetime
    arrival: datetime
    route: str
    price: float = Field(..., ge=0)
    available: bool = True

class FerryScheduleCreate(FerryScheduleBase):
    pass

class FerryScheduleUpdate(BaseModel):
    ferry_id: Optional[int] = None
    departure: Optional[datetime] = None
    arrival: Optional[datetime] = None
    route: Optional[str] = None
    price: Optional[float] = Field(None, ge=0)
    available: Optional[bool] = None

class FerryScheduleResponse(FerryScheduleBase):
    id: int
    createdAt: datetime
    updatedAt: datetime
    model_config = ConfigDict(from_attributes=True)

class FerryTicketCreateIn(BaseModel):
    number_of_tickets: int = Field(..., ge=0)
    price: float = Field(..., ge=0)

class FerryTicketBase(BaseModel):
    booking_id: int
    number_of_tickets: int = Field(..., ge=0)
    price: float = Field(..., ge=0)

class FerryTicketCreate(FerryTicketBase):
    pass

class FerryTicketResponse(FerryTicketBase):
    id: int
    createdAt: datetime
    updatedAt: datetime
    model_config = ConfigDict(from_attributes=True)


class HomepageAd(BaseModel):
    id: str
    title: str
    description: str
    image_url: Optional[str] = None
    cta_text: Optional[str] = None
    cta_url: Optional[str] = None
    badge: Optional[str] = None


class HomepageConfig(BaseModel):
    ads: List[HomepageAd] = []

class BookingRoomResponse(BaseModel):
    id: int
    room: RoomResponse
    createdAt: datetime
    updatedAt: datetime
    model_config = ConfigDict(from_attributes=True)

class BookingActivityResponse(BaseModel):
    id: int
    activity: ActivityResponse
    createdAt: datetime
    updatedAt: datetime
    model_config = ConfigDict(from_attributes=True)

class BookingCreate(BaseModel):
    user_id: int
    number_of_guests: int = Field(..., ge=1)
    total_price: float = Field(..., ge=0)
    start_date: datetime
    end_date: datetime
    is_premium: bool = False
    room_ids: List[int]
    activity_ids: Optional[List[int]] = None
    ferry_ticket: Optional[FerryTicketCreateIn] = None

    @model_validator(mode="after")
    def _validate_booking_window(self):
        if self.end_date <= self.start_date:
            raise ValueError("end_date must be after start_date")
        if (self.end_date.date() - self.start_date.date()).days < 1:
            raise ValueError("Booking must be at least 1 night")
        if not self.room_ids:
            raise ValueError("At least one room is required")
        if len(self.room_ids) != len(set(self.room_ids)):
            raise ValueError("room_ids must not contain duplicates")
        if self.activity_ids and len(self.activity_ids) != len(set(self.activity_ids)):
            raise ValueError("activity_ids must not contain duplicates")
        return self

class BookingUpdate(BaseModel):
    number_of_guests: Optional[int] = Field(None, ge=1)
    status: Optional[BookingStatusEnum] = None
    total_price: Optional[float] = Field(None, ge=0)
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    is_premium: Optional[bool] = None

class BookingResponse(BaseModel):
    id: int
    user_id: int
    number_of_guests: int
    status: BookingStatusEnum
    total_price: float
    start_date: datetime
    end_date: datetime
    is_premium: bool
    createdAt: datetime
    updatedAt: datetime
    user: UserResponse
    rooms: List[BookingRoomResponse]
    activities: List[BookingActivityResponse]
    ferry_ticket: Optional[FerryTicketResponse] = None
    payments: List[PaymentResponse] = []
    model_config = ConfigDict(from_attributes=True)

class PaymentBase(BaseModel):
    booking_id: int
    amount: float = Field(..., ge=0)
    currency: str = Field("USD", min_length=3, max_length=3)
    status: PaymentStatusEnum = PaymentStatusEnum.PENDING
    method: PaymentMethodEnum = PaymentMethodEnum.CARD
    provider: Optional[str] = None
    provider_reference: Optional[str] = None
    paid_at: Optional[datetime] = None

class PaymentCreate(PaymentBase):
    pass

class PaymentUpdate(BaseModel):
    amount: Optional[float] = Field(None, ge=0)
    currency: Optional[str] = Field(None, min_length=3, max_length=3)
    status: Optional[PaymentStatusEnum] = None
    method: Optional[PaymentMethodEnum] = None
    provider: Optional[str] = None
    provider_reference: Optional[str] = None
    paid_at: Optional[datetime] = None

class PaymentResponse(PaymentBase):
    id: int
    createdAt: datetime
    updatedAt: datetime
    model_config = ConfigDict(from_attributes=True)
