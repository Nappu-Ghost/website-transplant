from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional

from app import crud, models, schemas
from app.db import get_db
from app.dependencies import get_current_active_user, require_role

router = APIRouter(tags=["Payments"], responses={404: {"description": "Not found"}})


@router.post("/", response_model=schemas.PaymentResponse, status_code=status.HTTP_201_CREATED)
def create_payment(
    payment: schemas.PaymentCreate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    booking = crud.get_db_obj(db, model=models.Booking, obj_id=payment.booking_id)
    if not booking:
        raise HTTPException(status_code=404, detail="Booking not found")
    if current_user.role not in [models.RoleEnum.ADMIN, models.RoleEnum.MANAGER] and booking.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to create payment for this booking")

    return crud.create_payment(db=db, payment_in=payment)


@router.get("/", response_model=List[schemas.PaymentResponse])
def read_payments(
    booking_id: Optional[int] = None,
    status: Optional[models.PaymentStatusEnum] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    query = db.query(models.Payment)
    if booking_id:
        query = query.filter(models.Payment.booking_id == booking_id)
    if status:
        query = query.filter(models.Payment.status == status)
    return query.offset(skip).limit(limit).all()


@router.get("/{payment_id}", response_model=schemas.PaymentResponse)
def read_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
):
    payment = (
        db.query(models.Payment)
        .options(joinedload(models.Payment.booking))
        .filter(models.Payment.id == payment_id)
        .first()
    )
    if not payment:
        raise HTTPException(status_code=404, detail="Payment not found")

    if current_user.role not in [models.RoleEnum.ADMIN, models.RoleEnum.MANAGER] and payment.booking.user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view this payment")

    return payment


@router.get("/user", response_model=List[schemas.PaymentResponse])
def read_user_payments(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(get_current_active_user),
    user_id: Optional[int] = None,
):
    target_user_id = user_id or current_user.id
    if current_user.role not in [models.RoleEnum.ADMIN, models.RoleEnum.MANAGER] and target_user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Not authorized to view these payments")

    return (
        db.query(models.Payment)
        .join(models.Booking)
        .options(joinedload(models.Payment.booking))
        .filter(models.Booking.user_id == target_user_id)
        .order_by(models.Payment.createdAt.desc())
        .all()
    )


@router.put("/{payment_id}", response_model=schemas.PaymentResponse)
def update_payment_full(
    payment_id: int,
    payment: schemas.PaymentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    db_payment = crud.get_db_obj(db, model=models.Payment, obj_id=payment_id)
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return crud.update_payment(db=db, db_payment=db_payment, payment_in=payment)


@router.patch("/{payment_id}", response_model=schemas.PaymentResponse)
def update_payment_partial(
    payment_id: int,
    payment: schemas.PaymentUpdate,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    db_payment = crud.get_db_obj(db, model=models.Payment, obj_id=payment_id)
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    return crud.update_payment(db=db, db_payment=db_payment, payment_in=payment)


@router.delete("/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(
    payment_id: int,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(require_role([models.RoleEnum.ADMIN, models.RoleEnum.MANAGER])),
):
    db_payment = crud.get_db_obj(db, model=models.Payment, obj_id=payment_id)
    if not db_payment:
        raise HTTPException(status_code=404, detail="Payment not found")
    crud.remove_db_obj_generic(db=db, db_obj=db_payment)
    return None
