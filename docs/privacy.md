# ScamSense — Privacy Policy & Data Retention Policy

## 1. Privacy Philosophy

ScamSense was engineered with a strict **Privacy-First, Data-Minimization** ethos. Because digital scam detection often involves reviewing sensitive personal messages, user content is treated as untrusted and confidential.

---

## 2. Information Handling Practices

### 2.1 Submitted Message Text
- **Default Mode (Content-Free)**: When submitting a message without opting into history retention, the content is processed entirely in volatile memory (RAM) and immediately discarded.
- **Opt-In Storage Mode**: If the user explicitly checks &ldquo;Save this analysis report in my history&rdquo;, a truncated preview (first 200 characters) and a one-way SHA-256 cryptographic hash are stored.

### 2.2 Prohibited Data Submission
ScamSense explicitly warns users never to submit:
- Passwords, passcodes, or PINs
- One-Time Passwords (OTPs)
- Credit or debit card numbers / CVV
- Personal identity numbers (Aadhaar, Social Security Numbers)

### 2.3 URL Inspection Privacy
- The Link Inspector analyzes URLs via **static lexical and structural parsing**.
- ScamSense does **NOT** navigate to or fetch submitted URLs on behalf of the user, preventing IP exposure or tracking.

---

## 3. User Data Rights & Erasure

Users have complete autonomy over their data:
1. **Single Record Deletion**: Individual reports can be removed anytime via the `/reports` interface.
2. **Complete History Wipe**: Users can erase all session records with a single click.
3. **Account Data Purge**: Authenticated users can permanently wipe all historical analyses and simulator attempts from the database under `/settings`.

---

## 4. Third-Party Integrations

- If Google Safe Browsing API v4 is enabled via environment variables, domain hashes are queried via the backend using secure lookup protocols.
- ScamSense does not sell, share, or monetize user interaction data.
