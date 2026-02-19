from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import Optional

from app import models, schemas
from app.db import get_db
from app.dependencies import get_current_active_user, require_role

router = APIRouter(tags=["Ferry Tickets"], responses={404: {"description": "Not found"}})


@router.post("", response_model=schemas.FerryTicketResponse, status_code=status.HTTP_201_CREATED)
@router.post("/", response_model=schemas.FerryTicketResponse, status_code=status.HTTP_201_CREATED)
def create_ferry_ticket(
    ticket: schemas.FerryTicketCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(
        require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])
    ),
):
    booking = db.query(models.Booking).filter(models.Booking.id == ticket.booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    db_ticket = models.FerryTicket(
        booking_id=ticket.booking_id,
        number_of_tickets=ticket.number_of_tickets,
        price=ticket.price,
    )
    db.add(db_ticket)
    db.commit()
    db.refresh(db_ticket)
    return db_ticket


@router.get("", response_model=schemas.FerryTicketResponse)
@router.get("/", response_model=schemas.FerryTicketResponse)
def read_ferry_ticket(
    booking_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    booking = db.query(models.Booking).filter(models.Booking.id == booking_id).first()
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")

    if current_user.role not in [models.RoleEnum.ADMIN, models.RoleEnum.MANAGER] and booking.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to access this ticket")

    ticket = db.query(models.FerryTicket).filter(models.FerryTicket.booking_id == booking_id).first()
    if not ticket:
        raise HTTPException(status_code=404, detail="Ferry ticket not found")
    return ticket
