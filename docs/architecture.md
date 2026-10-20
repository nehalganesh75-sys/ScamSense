# ScamSense — System Architecture Documentation

## 1. System Overview

**ScamSense** is an explainable, full-stack cybersecurity application designed to analyze potentially fraudulent digital communications, inspect suspicious URLs, and provide interactive scenario-based safety training.

```
+-------------------------------------------------------------------------+
|                              Client Layer                               |
|                  React 19 + TypeScript + Vite + Tailwind CSS            |
|  - Landing Page (/), Explainable Scam Analyzer (/analyze)              |
|  - Suspicious Link Inspector (/link-inspector)                          |
|  - Pattern Explorer Graph (/pattern-explorer)                           |
|  - Awareness Simulator (/simulator)                                     |
|  - Dashboard (/dashboard), Reports (/reports), Safety Center (/safety)  |
+------------------------------------+------------------------------------+
                                     |  REST API / JSON (Over HTTPS)
                                     v
+------------------------------------+------------------------------------+
|                             Backend Layer                               |
|                        FastAPI (Python 3.13)                            |
|  +-------------------------------------------------------------------+  |
|  | Routers: /analyze, /inspect-url, /dashboard, /reports, /simulator  |  |
|  |          /patterns, /safety, /auth                                 |  |
|  +-------------------------------------------------------------------+  |
|  | Detection Engine: Rule Registry, Text Normalizer, Leetspeak        |  |
|  |                   Evidence Extractor, Scoring Model, Diminishing    |  |
|  | URL Inspector:   SSRF Protection, Brand Misdirection, Punycode    |  |
|  | Auth Security:    PBKDF2/Bcrypt Password Hashing, JWT Tokens       |  |
|  +-------------------------------------------------------------------+  |
+------------------------------------+------------------------------------+
                                     |  SQLAlchemy 2.0 ORM / Alembic
                                     v
+------------------------------------+------------------------------------+
|                             Storage Layer                               |
|                   PostgreSQL (Production) / SQLite (Dev)                |
|  Tables: users, analyses, indicators, url_inspections, scenarios,       |
|          simulator_attempts                                             |
+-------------------------------------------------------------------------+
```

---

## 2. Component Architecture

### 2.1 Explainable Scam Analyzer (`backend/app/services/scam_detector.py`)
- **Text Normalizer**:
  - Unicode NFKC normalization
  - Zero-width character stripping (`\u200B`, `\u200C`, etc.)
  - Leetspeak decoding while strictly preserving numerical digits and currency
- **Rule Registry**:
  - Modular `DetectionIndicator` objects specifying regex patterns, weights, explanations, and tailored safety recommendations.
  - Core rules: `CREDENTIAL_OTP_HARVESTING`, `UPFRONT_PAYMENT_FEE`, `URGENCY_PRESSURE_TACTIC`, `COMMUNICATION_BYPASS`, `UNREALISTIC_EARNINGS_PROMISE`, `AUTHORITY_IMPERSONATION`, `SUSPICIOUS_PAYMENT_CHANNEL`, `SECRECY_COERCION`, `UNSOLICITED_REMOTE_ACCESS`.
- **Scoring & Synergy**:
  - Contextual combination bonus (e.g., Urgency + Credential Harvesting).
  - Diminishing returns scaling formula to prevent score inflation.
  - Three distinct assessment bands:
    - `0 - 29`: **Low observed risk**
    - `30 - 59`: **Caution advised**
    - `60 - 100`: **High suspicion**

### 2.2 Suspicious Link Inspector (`backend/app/services/url_inspector.py`)
- **Zero-Arbitrary-Fetch SSRF Defense**:
  - Parses URLs statically without making the server connect to untrusted endpoints.
  - Blocks loopback (`127.0.0.1`, `localhost`), link-local (`169.254.0.0/16`), private subnets (`10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`), and AWS/GCP cloud metadata addresses (`169.254.169.254`).
- **Structural Heuristics**:
  - Detects raw IP hosting, internationalized domain names (Punycode `xn--`), disposable phishing TLDs (`.top`, `.xyz`, `.buzz`), URL shorteners, and deceptive brand positioning in subdomains.
- **Provider Interface**:
  - Supports Google Safe Browsing API v4 lookup when configured via backend environment variables.

### 2.3 Scam Pattern Explorer (`backend/app/services/pattern_service.py`)
- Relational topology mapping campaigns to impersonated entities, malicious domains, and communication vectors.
- Interactive SVG canvas with concentric orbits, mouse drag/pan, zoom, search, category filtering, and linked node side-drawers.

### 2.4 Educational Awareness Simulator (`backend/app/services/simulator_service.py`)
- Pre-seeded real-world scenario playbooks (Internship fee fraud, OLX UPI QR code scam, India Post delivery SMS, CBI Digital Arrest extortion, Banking KYC phishing).
- Tracks user scores and evaluates decisions with instant explanations.

---

## 3. Database Schema

- **`users`**: Account credentials, email index, and privacy consent preferences.
- **`analyses`**: Type, assessment status, 0-100 score, summary, and SHA256 content hashes.
- **`indicators`**: Child records storing exact evidence excerpts, rationale, and specific safety recommendations.
- **`url_inspections`**: Normalized domain, parsed components, structural flags, and reputation provider status.
- **`scenarios` & `simulator_attempts`**: Fictional educational scenarios and user completion telemetry.

---

## 4. Security Principles

1. **Defense in Depth**: Untrusted input is sanitized both client-side and server-side.
2. **SSRF Hardening**: The server never follows arbitrary client-submitted URLs to internal subnets.
3. **Privacy by Default**: Content retention requires explicit user opt-in. Content-free hashes and immediate RAM discarding are supported.
4. **No Sensitive Telemetry**: OTPs, passwords, and banking PINs are never stored in plain text or logged.
