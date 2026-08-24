import datetime
import hashlib
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.models.database import get_db
from app.models.schema_models import OfficerUser
from app.schemas.dto import LoginRequest, TokenResponse
from app.core.config import settings

router = APIRouter(prefix="/auth", tags=["Authentication"])

def hash_pw(pw: str) -> str:
    return hashlib.sha256(pw.encode()).hexdigest()

@router.post("/login", response_model=TokenResponse)
def officer_login(credentials: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate railway officer and return session token."""
    user = db.query(OfficerUser).filter(OfficerUser.email == credentials.email).first()
    
    # For prototype ease, also accept default officer credentials if user table empty
    if not user and credentials.email == "officer@railpredict.in" and credentials.password == "officer123":
        return TokenResponse(
            access_token="mock_jwt_token_for_officer_section_controller_demo",
            token_type="bearer",
            user_name="Rajesh Sharma",
            user_email="officer@railpredict.in",
            role="Senior Section Controller",
            division="Southern Railway - Chennai & Bangalore Division"
        )
        
    if not user or user.hashed_password != hash_pw(credentials.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Try officer@railpredict.in / officer123"
        )
        
    return TokenResponse(
        access_token=f"jwt_{user.id}_{int(datetime.datetime.utcnow().timestamp())}",
        token_type="bearer",
        user_name=user.full_name,
        user_email=user.email,
        role=user.role,
        division=user.division
    )

@router.get("/me")
def get_current_officer():
    """Returns current active officer profile."""
    return {
        "user_name": "Rajesh Sharma",
        "user_email": "officer@railpredict.in",
        "role": "Senior Section Controller",
        "division": "Southern Railway - Chennai & Bangalore Division",
        "badge_id": "SR-MAS-8821",
        "shift": "Night Shift (20:00 - 04:00)"
    }
