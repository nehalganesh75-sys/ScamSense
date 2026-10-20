import datetime
from typing import Optional
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_optional_current_user
from app.models.models import User, URLInspection
from app.schemas.schemas import URLInspectRequest, URLInspectionOut
from app.services.url_inspector import url_inspector

router = APIRouter()

PRESET_URL_SAMPLES = [
    {
        "label": "Lookalike Brand Subdomain Phishing",
        "url": "https://paypal.com.verify-billing-update.top/login"
    },
    {
        "label": "Raw IP Address Host",
        "url": "http://185.220.101.5/banking/sbi/otp-auth"
    },
    {
        "label": "Known URL Shortener with Hidden Target",
        "url": "https://tinyurl.com/parcel-customs-fee-99"
    },
    {
        "label": "Excessive Subdomain Stacking",
        "url": "https://secure.auth.account.google.com.user-verification.xyz/index.html"
    },
    {
        "label": "Legitimate Official Domain",
        "url": "https://cybercrime.gov.in/Webform/Crime_AuthoLogin.aspx"
    }
]

@router.get("/samples")
def get_sample_urls():
    """Returns sample URLs representing clean and high-risk patterns for demonstration."""
    return PRESET_URL_SAMPLES

@router.post("", response_model=URLInspectionOut)
def inspect_url(
    payload: URLInspectRequest,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Performs URL structural inspection, brand misdirection analysis, and reputation checks.
    """
    result = url_inspector.inspect(payload.url)

    # Persist if user consented
    db_record = None
    if payload.consent_store or (current_user and current_user.consent_store_content):
        db_record = URLInspection(
            raw_url=result["raw_url"],
            normalized_domain=result["normalized_domain"],
            risk_score=result["risk_score"],
            assessment=result["assessment"],
            structural_flags=result["structural_flags"],
            reputation_status=result["reputation_status"],
            reputation_provider=result["reputation_provider"],
            details=result["details"],
            created_at=datetime.datetime.utcnow()
        )
        db.add(db_record)
        db.commit()
        db.refresh(db_record)

    return URLInspectionOut(
        id=db_record.id if db_record else None,
        raw_url=result["raw_url"],
        normalized_domain=result["normalized_domain"],
        risk_score=result["risk_score"],
        assessment=result["assessment"],
        structural_flags=result["structural_flags"],
        reputation_status=result["reputation_status"],
        reputation_provider=result["reputation_provider"],
        details=result["details"],
        created_at=datetime.datetime.utcnow()
    )
