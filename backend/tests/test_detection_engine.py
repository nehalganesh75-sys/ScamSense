import pytest
from app.services.scam_detector import detector_engine

def test_upfront_payment_detection():
    text = "Congratulations! You have been selected for the internship. Please pay a registration fee of Rs 2,500 to confirm your position."
    result = detector_engine.analyze(text)
    assert result["assessment"] in ("caution_advised", "high_suspicion")
    assert result["risk_score"] >= 60
    codes = [ind.code for ind in result["indicators"]]
    assert "UPFRONT_PAYMENT_FEE" in codes
    assert any("registration" in ind.evidence.lower() for ind in result["indicators"])

def test_credential_otp_harvesting():
    text = "Dear customer, your bank account is locked. Please share your OTP and enter UPI PIN immediately to unlock your card."
    result = detector_engine.analyze(text)
    assert result["assessment"] == "high_suspicion"
    assert result["risk_score"] >= 65
    codes = [ind.code for ind in result["indicators"]]
    assert "CREDENTIAL_OTP_HARVESTING" in codes
    assert "URGENCY_PRESSURE_TACTIC" in codes

def test_unrealistic_job_task_scam():
    text = "Work from home part-time. Earn Rs 5,000 daily by liking YouTube videos. Contact HR recruiter on Telegram: t.me/job_tasks."
    result = detector_engine.analyze(text)
    assert result["assessment"] in ("caution_advised", "high_suspicion")
    codes = [ind.code for ind in result["indicators"]]
    assert "UNREALISTIC_EARNINGS_PROMISE" in codes
    assert "COMMUNICATION_BYPASS" in codes

def test_authority_impersonation_digital_arrest():
    text = "This is Mumbai Police and CBI cyber cell. A drug parcel was detained in your name. You are under Digital Arrest. Keep this confidential."
    result = detector_engine.analyze(text)
    assert result["assessment"] == "high_suspicion"
    codes = [ind.code for ind in result["indicators"]]
    assert "AUTHORITY_IMPERSONATION" in codes
    assert "SECRECY_COERCION" in codes

def test_benign_control_message():
    text = "Hi Team, friendly reminder that our sprint review meeting will take place tomorrow at 3:00 PM on Google Meet. See you there!"
    result = detector_engine.analyze(text)
    assert result["assessment"] == "low_risk"
    assert result["risk_score"] < 30
    assert len(result["indicators"]) == 0

def test_diminishing_returns_scoring():
    # Message with multiple repeated keywords shouldn't exceed 100
    text = "Pay fee now! Pay fee immediately! Pay fee today! Urgently pay fee within 15 minutes or arrest! Send OTP now!"
    result = detector_engine.analyze(text)
    assert result["risk_score"] <= 100
    assert result["risk_score"] >= 65
