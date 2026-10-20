import pytest
from app.services.url_inspector import url_inspector

def test_clean_legitimate_url():
    result = url_inspector.inspect("https://cybercrime.gov.in")
    assert result["assessment"] == "low_risk"
    assert result["risk_score"] < 30
    assert len(result["structural_flags"]) == 0

def test_brand_subdomain_phishing():
    result = url_inspector.inspect("https://paypal.com.verify-billing.top/login")
    assert result["assessment"] == "high_suspicion"
    assert result["risk_score"] >= 65
    assert any("BRAND" in flag for flag in result["structural_flags"])
    assert "HIGH_ABUSE_TLD" in result["structural_flags"]

def test_raw_ip_address_host():
    result = url_inspector.inspect("http://185.220.101.5/banking/sbi/otp-auth")
    assert result["assessment"] in ("caution_advised", "high_suspicion")
    assert "RAW_IP_ADDRESS_HOST" in result["structural_flags"]

def test_url_shortener_detection():
    result = url_inspector.inspect("https://tinyurl.com/parcel-customs-fee-99")
    assert "KNOWN_URL_SHORTENER" in result["structural_flags"]
    assert result["risk_score"] >= 30

def test_ssrf_loopback_rejection():
    result = url_inspector.inspect("http://127.0.0.1:8080/admin")
    assert "PRIVATE_OR_LOOPBACK_ADDRESS" in result["structural_flags"]
    assert result["assessment"] == "high_suspicion"

def test_unsupported_scheme():
    result = url_inspector.inspect("javascript:alert(1)")
    assert result["assessment"] == "high_suspicion"
    assert "INVALID_OR_UNSUPPORTED_SCHEME" in result["structural_flags"]
