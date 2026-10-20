import hashlib
import datetime
from typing import Optional, List
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.security import get_optional_current_user
from app.models.models import User, Analysis, Indicator, URLInspection
from app.schemas.schemas import AnalysisCreate, AnalysisOut, IndicatorOut, URLInspectionOut
from app.services.scam_detector import detector_engine
from app.services.url_inspector import url_inspector

router = APIRouter()

PRESET_SCENARIOS = [
    {
        "id": "sample-internship-scam",
        "title": "Fake Internship Registration Fee Scam",
        "category": "job_offer",
        "content": "Dear Candidate, You have been shortlisted for our Global AI Engineering Internship at TechCorp. Stipend: Rs 65,000/month. No technical interview required due to urgent project onboarding. To confirm your slot and receive your laptop, please pay a mandatory refundable registration fee of Rs 1,500 via UPI within 2 hours. Send confirmation screenshot on Telegram: t.me/techcorp_hr_desk.",
        "suspicious_url": "https://techcorp-internships.top/pay"
    },
    {
        "id": "sample-digital-arrest",
        "title": "Digital Arrest Extortion Threat",
        "category": "message",
        "content": "This is Inspector Vijay from CBI Mumbai Cyber Cell. A courier package containing 250g contraband narcotics and fake passports has been detained at customs under your Aadhaar number. A non-bailable arrest warrant has been signed. You are under Digital Arrest. Do not disconnect this call or inform family. Transfer your funds to RBI verification escrow account immediately to clear charges.",
        "suspicious_url": None
    },
    {
        "id": "sample-banking-kyc",
        "title": "Urgent Banking KYC Disconnection Phishing",
        "category": "email",
        "content": "URGENT NOTICE: Your SBI/HDFC NetBanking services will be permanently suspended tonight at 11:59 PM due to expired PAN KYC. Enter your NetBanking username, password, and OTP immediately on http://194.165.22.8/sbi-verify to avoid complete account freeze and penalty fees.",
        "suspicious_url": "http://194.165.22.8/sbi-verify"
    },
    {
        "id": "sample-upi-refund",
        "title": "UPI Reversal / Overpayment Scam",
        "category": "payment_request",
        "content": "Sir, I accidentally sent Rs 25,000 to your UPI account instead of Rs 2,500. Please refund the extra Rs 22,500 urgently to my personal UPI ID: rahul.sharma99@okhdfcbank. Scan this QR code and enter your UPI PIN to approve the refund transfer back to me.",
        "suspicious_url": None
    },
    {
        "id": "sample-legitimate-job",
        "title": "Legitimate Job Screening (Benign Control)",
        "category": "job_offer",
        "content": "Hello Nehal, Thank you for applying for the Junior Software Engineer position at Acme Software. We reviewed your profile and would like to schedule a 30-minute introductory Google Meet with our engineering lead next Tuesday. We never ask for any payment or sensitive credentials. Please view our official team calendar on https://careers.acmesoftware.com/schedule to select a convenient time.",
        "suspicious_url": "https://careers.acmesoftware.com/schedule"
    }
]

@router.get("/samples")
def get_sample_scenarios():
    """Returns curated fictional test scenarios to demonstrate detection logic."""
    return PRESET_SCENARIOS

@router.post("", response_model=AnalysisOut)
def analyze_content(
    payload: AnalysisCreate,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_current_user)
):
    """
    Analyzes submitted message, email, or offer text using the explainable detection engine.
    Extracts indicators, scores risk, and optionally stores findings if consented.
    """
    if len(payload.content.strip()) < 5:
        raise HTTPException(status_code=400, detail="Submitted content is too short to analyze.")

    # Run detection
    analysis_result = detector_engine.analyze(
        content=payload.content,
        analysis_type=payload.analysis_type or "message",
        suspicious_url=payload.suspicious_url
    )

    # Optional URL inspection if attached
    url_result_out: Optional[URLInspectionOut] = None
    if payload.suspicious_url:
        u_inspect = url_inspector.inspect(payload.suspicious_url)
        url_result_out = URLInspectionOut(
            raw_url=u_inspect["raw_url"],
            normalized_domain=u_inspect["normalized_domain"],
            risk_score=u_inspect["risk_score"],
            assessment=u_inspect["assessment"],
            structural_flags=u_inspect["structural_flags"],
            reputation_status=u_inspect["reputation_status"],
            reputation_provider=u_inspect["reputation_provider"],
            details=u_inspect["details"],
            created_at=datetime.datetime.utcnow()
        )

    # Database persistence logic
    analysis_id = None
    consent = payload.consent_store or (current_user and current_user.consent_store_content)

    content_hash = hashlib.sha256(payload.content.encode("utf-8")).hexdigest()
    # If consent granted, store preview snippet; otherwise keep content-free
    preview = analysis_result["content_preview"] if consent else "[Content omitted - User did not opt-in to text retention]"

    db_analysis = Analysis(
        user_id=current_user.id if current_user else None,
        session_id=payload.session_id,
        analysis_type=payload.analysis_type or "message",
        content_preview=preview,
        content_hash=content_hash,
        assessment=analysis_result["assessment"],
        risk_score=analysis_result["risk_score"],
        summary=analysis_result["summary"],
        consent_given=bool(consent),
        limitations=analysis_result["limitations"],
        created_at=datetime.datetime.utcnow()
    )
    db.add(db_analysis)
    db.flush()  # get ID

    analysis_id = db_analysis.id

    for ind in analysis_result["indicators"]:
        db_indicator = Indicator(
            analysis_id=analysis_id,
            indicator_code=ind.code,
            title=ind.title,
            severity=ind.severity,
            evidence=ind.evidence if consent else "[Redacted]",
            explanation=ind.explanation,
            recommendation=ind.recommendation
        )
        db.add(db_indicator)

    if url_result_out:
        db_url = URLInspection(
            analysis_id=analysis_id,
            raw_url=url_result_out.raw_url,
            normalized_domain=url_result_out.normalized_domain,
            risk_score=url_result_out.risk_score,
            assessment=url_result_out.assessment,
            structural_flags=url_result_out.structural_flags,
            reputation_status=url_result_out.reputation_status,
            reputation_provider=url_result_out.reputation_provider,
            details=url_result_out.details,
            created_at=datetime.datetime.utcnow()
        )
        db.add(db_url)

    db.commit()

    return AnalysisOut(
        id=analysis_id,
        assessment=analysis_result["assessment"],
        risk_score=analysis_result["risk_score"],
        summary=analysis_result["summary"],
        analysis_type=payload.analysis_type or "message",
        content_preview=preview,
        indicators=analysis_result["indicators"],
        url_inspection=url_result_out,
        recommendations=analysis_result["recommendations"],
        limitations=analysis_result["limitations"],
        created_at=datetime.datetime.utcnow()
    )
