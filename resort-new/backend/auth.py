from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from app.db import get_db
from app import models
from pydantic import BaseModel
import hashlib

router = APIRouter()

class AuthRequest(BaseModel):
    email: str
    password: str

class AuthResponse(BaseModel):
    id: int
    name: str
    email: str
    role: str

@router.post("/login", response_model=AuthResponse)
def login(data: AuthRequest, db: Session = Depends(get_db)):
    hashed_pw = hashlib.sha256(data.password.encode()).hexdigest()
    user = db.query(models.User).filter_by(email=data.email, password=hashed_pw).first()
    if not user:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return AuthResponse(
        id=user.id,
        name=user.name,
        email=user.email,
        role=user.role
    )
