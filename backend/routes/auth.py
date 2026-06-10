from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models.models import User
from schemas.schemas import RegisterInput, LoginInput, AuthResponse
import hashlib
import secrets

router = APIRouter(prefix="/api/auth", tags=["auth"])

def hash_password(password: str) -> str:
    return hashlib.sha256(password.encode()).hexdigest()

def make_token(user_id: int, email: str) -> str:
    return hashlib.sha256(f"{user_id}{email}{secrets.token_hex(8)}".encode()).hexdigest()

@router.post("/register", response_model=AuthResponse)
def register(data: RegisterInput, db: Session = Depends(get_db)):
    existing = db.query(User).filter(User.email == data.email).first()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")
    user = User(
        name=data.name,
        email=data.email,
        password_hash=hash_password(data.password)
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return AuthResponse(id=user.id, name=user.name, email=user.email, token=make_token(user.id, user.email))

@router.post("/login", response_model=AuthResponse)
def login(data: LoginInput, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == data.email).first()
    if not user or user.password_hash != hash_password(data.password):
        raise HTTPException(status_code=401, detail="Invalid email or password")
    return AuthResponse(id=user.id, name=user.name, email=user.email, token=make_token(user.id, user.email))
