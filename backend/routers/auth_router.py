from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

import models
import schemas
from auth import hash_password, verify_password, create_access_token
from config import ADMIN_USERNAME, ADMIN_PASSWORD
from database import get_db
from services.activity import log_activity

router = APIRouter(prefix="/api/auth", tags=["auth"])


@router.post("/signup", response_model=schemas.Token)
def signup(payload: schemas.UserSignup, db: Session = Depends(get_db)):
    if payload.username.lower() == ADMIN_USERNAME.lower():
        raise HTTPException(status_code=400, detail="Username reserved")

    existing = db.query(models.User).filter(
        (models.User.username == payload.username) | (models.User.email == payload.email)
    ).first()
    if existing:
        raise HTTPException(status_code=400, detail="Username or email already registered")

    user = models.User(
        username=payload.username,
        email=payload.email,
        full_name=payload.full_name or "",
        hashed_password=hash_password(payload.password),
        role="user",
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    log_activity(db, actor=user.username, role="user", action="SIGNUP",
                 detail=f"New account created ({user.email})")

    token = create_access_token({"sub": user.username, "role": "user"})
    return schemas.Token(access_token=token, role="user", username=user.username)


@router.post("/login", response_model=schemas.Token)
def login(payload: schemas.UserLogin, db: Session = Depends(get_db)):
    user = db.query(models.User).filter(models.User.username == payload.username).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Invalid username or password")
    if not user.is_active:
        raise HTTPException(status_code=403, detail="Account is disabled")

    log_activity(db, actor=user.username, role="user", action="LOGIN", detail="User signed in")

    token = create_access_token({"sub": user.username, "role": "user"})
    return schemas.Token(access_token=token, role="user", username=user.username)


@router.post("/admin/login", response_model=schemas.Token)
def admin_login(payload: schemas.AdminLogin, db: Session = Depends(get_db)):
    if payload.username != ADMIN_USERNAME or payload.password != ADMIN_PASSWORD:
        raise HTTPException(status_code=401, detail="Invalid admin credentials")

    log_activity(db, actor=ADMIN_USERNAME, role="admin", action="LOGIN", detail="Admin signed in")

    token = create_access_token({"sub": ADMIN_USERNAME, "role": "admin"})
    return schemas.Token(access_token=token, role="admin", username=ADMIN_USERNAME)
