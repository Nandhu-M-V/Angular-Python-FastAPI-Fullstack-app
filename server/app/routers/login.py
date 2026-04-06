from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.models import User
from app.auth import create_access_token, verify_password, hash_password
from app.schemas.auth import TokenResponse, UserCreate
from fastapi.security import OAuth2PasswordRequestForm
from app.dependency.protectedRoutes import get_current_user

router = APIRouter()


@router.post("/register", response_model=TokenResponse)
def register(user: UserCreate, db: Session = Depends(get_db)):

    existing_user = db.query(User).filter(User.email == user.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Email already registered")

    hashed_password = hash_password(user.password)

    new_user = User(
        name=user.name, email=user.email, password_hash=hashed_password, role="user"
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    token = create_access_token(
        {"sub": str(new_user.id), "email": new_user.email, "role": new_user.role}
    )

    return {"access_token": token, "token_type": "bearer"}


@router.post("/login", response_model=TokenResponse)
def login(
    form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.email == form_data.username).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid email or password"
        )

    token = create_access_token(
        {"sub": str(user.id), "email": user.email, "role": user.role}
    )

    return {"access_token": token, "token_type": "bearer"}


@router.get("/me")
def get_me(user=Depends(get_current_user)):
    return user
