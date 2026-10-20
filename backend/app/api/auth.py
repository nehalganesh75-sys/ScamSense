from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import verify_password, get_password_hash, create_access_token, get_current_user
from app.models.models import User, Analysis, SimulatorAttempt
from app.schemas.schemas import UserRegister, UserLogin, Token, UserOut, UserSettingsUpdate

router = APIRouter()

@router.post("/register", response_model=Token)
def register(payload: UserRegister, db: Session = Depends(get_db)):
    """Registers a new user account with hashed password and privacy preferences."""
    existing = db.query(User).filter(User.email == payload.email.lower()).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="An account with this email address already exists."
        )

    user = User(
        email=payload.email.lower(),
        hashed_password=get_password_hash(payload.password),
        full_name=payload.full_name,
        consent_store_content=payload.consent_store_content
    )
    db.add(user)
    db.commit()
    db.refresh(user)

    token = create_access_token(data={"sub": user.email, "id": user.id})
    return Token(
        access_token=token,
        token_type="bearer",
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "consent_store_content": user.consent_store_content
        }
    )

@router.post("/login", response_model=Token)
def login(payload: UserLogin, db: Session = Depends(get_db)):
    """Authenticates credentials and returns a secure JWT bearer token."""
    user = db.query(User).filter(User.email == payload.email.lower()).first()
    if not user or not verify_password(payload.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
            headers={"WWW-Authenticate": "Bearer"}
        )

    token = create_access_token(data={"sub": user.email, "id": user.id})
    return Token(
        access_token=token,
        token_type="bearer",
        user={
            "id": user.id,
            "email": user.email,
            "full_name": user.full_name,
            "consent_store_content": user.consent_store_content
        }
    )

@router.get("/me", response_model=UserOut)
def get_profile(current_user: User = Depends(get_current_user)):
    """Returns authenticated user profile information."""
    return current_user

@router.patch("/settings", response_model=UserOut)
def update_settings(
    payload: UserSettingsUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Updates user privacy controls and storage consent preferences."""
    if payload.full_name is not None:
        current_user.full_name = payload.full_name
    if payload.consent_store_content is not None:
        current_user.consent_store_content = payload.consent_store_content

    db.commit()
    db.refresh(current_user)
    return current_user

@router.delete("/data")
def purge_user_data(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Permanently deletes all historical analyses and attempts associated with this account."""
    analysis_count = db.query(Analysis).filter(Analysis.user_id == current_user.id).delete()
    attempt_count = db.query(SimulatorAttempt).filter(SimulatorAttempt.user_id == current_user.id).delete()
    db.commit()
    return {
        "message": f"Successfully deleted {analysis_count} analysis record(s) and {attempt_count} simulator record(s)."
    }
