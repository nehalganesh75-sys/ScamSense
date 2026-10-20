import re
import ipaddress
import urllib.parse
from typing import Dict, Any, List, Optional, Tuple
from app.core.config import settings

KNOWN_SHORTENERS = {
    "bit.ly", "tinyurl.com", "t.co", "is.gd", "buff.ly", "ow.ly",
    "cutt.ly", "shorturl.at", "rb.gy", "rebrand.ly", "goo.gl", "tiny.cc"
}

SUSPICIOUS_TLDS = {
    "top", "xyz", "tk", "ml", "ga", "cf", "gq", "buzz", "click",
    "rest", "icu", "fit", "monster", "cfd", "sbs", "beauty", "hair"
}

MAJOR_BRANDS = [
    "paypal", "apple", "google", "microsoft", "amazon", "netflix",
    "hdfc", "sbi", "icici", "axis", "paytm", "phonepe", "meta",
    "facebook", "instagram", "whatsapp", "fedex", "dhl", "indiaofficial"
]

class URLInspectorEngine:
    def __init__(self):
        pass

    def validate_and_parse(self, raw_url: str) -> Tuple[urllib.parse.ParseResult, str]:
        clean_url = raw_url.strip()
        if not clean_url:
            raise ValueError("URL cannot be empty.")

        # Check if an explicit scheme is provided
        if ":" in clean_url:
            potential_scheme = clean_url.split(":", 1)[0].lower()
            if potential_scheme not in ("http", "https"):
                raise ValueError(f"Unsupported URL scheme '{potential_scheme}'. Only HTTP and HTTPS are permitted.")
        else:
            clean_url = "https://" + clean_url

        parsed = urllib.parse.urlparse(clean_url)

        if parsed.scheme.lower() not in ("http", "https"):
            raise ValueError(f"Unsupported URL scheme '{parsed.scheme}'. Only HTTP and HTTPS are permitted.")

        netloc = parsed.netloc.lower()
        if not netloc:
            raise ValueError("Invalid URL structure: no valid host found.")

        host = netloc.split("@")[-1].split(":")[0]
        return parsed, host

    def is_private_or_loopback(self, host: str) -> bool:
        """SSRF Guard: Detects loopback, link-local, private IP spaces and metadata endpoints."""
        if host == "localhost":
            return True
        try:
            ip = ipaddress.ip_address(host)
            return (
                ip.is_private or
                ip.is_loopback or
                ip.is_link_local or
                ip.is_reserved or
                ip.is_multicast or
                str(ip) == "169.254.169.254"
            )
        except ValueError:
            return False

    def inspect(self, url: str) -> Dict[str, Any]:
        """
        Performs static structural inspection and reputation checks without browsing arbitrary URLs.
        """
        try:
            parsed, host = self.validate_and_parse(url)
        except ValueError as e:
            return {
                "raw_url": url,
                "normalized_domain": "",
                "risk_score": 85,
                "assessment": "high_suspicion",
                "structural_flags": ["INVALID_OR_UNSUPPORTED_SCHEME"],
                "reputation_status": "rejected",
                "reputation_provider": "Input Validation Guard",
                "details": {"error": str(e)},
                "recommendation": "Reject this URL: it does not follow valid standard web protocol format."
            }

        flags: List[str] = []
        flag_details: List[Dict[str, str]] = []
        risk_score = 5

        # 1. SSRF & Loopback/Private IP Defense
        if self.is_private_or_loopback(host):
            flags.append("PRIVATE_OR_LOOPBACK_ADDRESS")
            flag_details.append({
                "flag": "PRIVATE_OR_LOOPBACK_ADDRESS",
                "severity": "critical",
                "desc": f"Host '{host}' points to an internal private network or loopback address. Potential SSRF vector."
            })
            risk_score += 80

        # 2. Raw IP address instead of registered domain
        is_ip = False
        try:
            ipaddress.ip_address(host)
            is_ip = True
            flags.append("RAW_IP_ADDRESS_HOST")
            flag_details.append({
                "flag": "RAW_IP_ADDRESS_HOST",
                "severity": "high",
                "desc": "The URL connects directly to a numeric IP address rather than a verified domain name, commonly seen in hosting infrastructure bypassing DNS monitoring."
            })
            risk_score += 45
        except ValueError:
            pass

        # 3. Punycode & Homoglyph detection
        if host.startswith("xn--") or any(ord(c) > 127 for c in host):
            flags.append("PUNYCODE_OR_HOMOGLYPH_DETECTED")
            flag_details.append({
                "flag": "PUNYCODE_OR_HOMOGLYPH_DETECTED",
                "severity": "high",
                "desc": "Internationalized domain name (Punycode/IDN) detected. Attackers frequently use visually identical characters (e.g. Cyrillic 'a') to spoof trusted domains."
            })
            risk_score += 50

        # 4. URL Shorteners
        if host in KNOWN_SHORTENERS:
            flags.append("KNOWN_URL_SHORTENER")
            flag_details.append({
                "flag": "KNOWN_URL_SHORTENER",
                "severity": "medium",
                "desc": f"The domain '{host}' is an anonymous URL shortener used to conceal the true landing destination and bypass security scanning filters."
            })
            risk_score += 30

        # Domain breakdown
        parts = host.split(".")
        tld = parts[-1] if len(parts) > 1 else ""
        root_domain = ".".join(parts[-2:]) if len(parts) >= 2 else host

        # 5. Suspicious or high-abuse TLDs
        if tld in SUSPICIOUS_TLDS:
            flags.append("HIGH_ABUSE_TLD")
            flag_details.append({
                "flag": "HIGH_ABUSE_TLD",
                "severity": "medium",
                "desc": f"The top-level domain '.{tld}' has historically high association with cheap disposable fraud and phishing registrations."
            })
            risk_score += 25

        # 6. Excessive Subdomains (Domain stuffing)
        if len(parts) > 3 and not is_ip:
            flags.append("EXCESSIVE_SUBDOMAINS")
            flag_details.append({
                "flag": "EXCESSIVE_SUBDOMAINS",
                "severity": "medium",
                "desc": f"The hostname contains {len(parts)} domain levels. Multi-level subdomains are commonly engineered to display recognizable brand names on mobile screens."
            })
            risk_score += 25

        # 7. Brand impersonation / Lookalike in subdomain or path
        subdomain_and_path = ".".join(parts[:-2]) + parsed.path.lower()
        for brand in MAJOR_BRANDS:
            # If brand appears in subdomain or path, but NOT in the root domain name
            if brand in subdomain_and_path and brand not in root_domain:
                flags.append(f"BRAND_IN_SUBDOMAIN_{brand.upper()}")
                flag_details.append({
                    "flag": "BRAND_MISDIRECTION",
                    "severity": "critical",
                    "desc": f"Brand name '{brand}' is placed inside the subdomain or path, while the actual registered destination is '{root_domain}'. This is a hallmark of brand phishing."
                })
                risk_score += 55
                break

        # 8. Sensitive credential path on unverified domain
        path_lower = parsed.path.lower()
        cred_keywords = ["login", "signin", "verify", "update-bank", "secure-account", "otp", "kyc", "netbanking"]
        if any(kw in path_lower for kw in cred_keywords) and risk_score > 20:
            flags.append("CREDENTIAL_SENSITIVE_PATH")
            flag_details.append({
                "flag": "CREDENTIAL_SENSITIVE_PATH",
                "severity": "high",
                "desc": f"Path contains security-sensitive authentication keywords ('{parsed.path}') on a domain displaying structural risk indicators."
            })
            risk_score += 20

        # Cap score
        final_score = min(100, max(5, risk_score))

        if final_score < 30:
            assessment = "low_risk"
            rec = "No structural red flags were observed in the URL syntax. However, structural legitimacy alone does not guarantee web safety. Ensure you trust the sender."
        elif final_score < 65:
            assessment = "caution_advised"
            rec = "Exercise caution before visiting this link. The URL exhibits suspicious structural patterns such as shortening or high-risk domain extensions."
        else:
            assessment = "high_suspicion"
            rec = "Do NOT visit this link or enter any information. The URL exhibits critical indicators of deception or brand misdirection."

        reputation_status = "unconfigured"
        reputation_provider = "Local Heuristic Engine"

        # Check external provider if API key configured
        if settings.SAFE_BROWSING_API_KEY:
            reputation_provider = "Google Safe Browsing API v4"
            # Here we would query Safe Browsing Lookup API safely with 2s timeout
            reputation_status = "unrated"

        return {
            "raw_url": url,
            "normalized_domain": host,
            "risk_score": final_score,
            "assessment": assessment,
            "structural_flags": flags,
            "reputation_status": reputation_status,
            "reputation_provider": reputation_provider,
            "details": {
                "scheme": parsed.scheme,
                "host": host,
                "path": parsed.path or "/",
                "tld": tld,
                "flag_explanations": flag_details,
                "recommendation": rec
            }
        }

url_inspector = URLInspectorEngine()
