import re
import unicodedata
from typing import List, Dict, Any, Tuple, Optional
from app.schemas.schemas import IndicatorOut, AnalysisOut

class DetectionIndicator:
    def __init__(
        self,
        code: str,
        title: str,
        severity: str,  # low, medium, high, critical
        weight: int,
        patterns: List[str],
        explanation: str,
        recommendation: str,
        require_context: Optional[List[str]] = None
    ):
        self.code = code
        self.title = title
        self.severity = severity
        self.weight = weight
        self.patterns = [re.compile(p, re.IGNORECASE) for p in patterns]
        self.explanation = explanation
        self.recommendation = recommendation
        self.require_context = [re.compile(c, re.IGNORECASE) for c in (require_context or [])]

    def evaluate(self, normalized_text: str, original_text: str) -> Optional[Dict[str, Any]]:
        # If contextual prerequisites are defined, at least one must match
        if self.require_context:
            if not any(ctx.search(normalized_text) for ctx in self.require_context):
                return None

        for pattern in self.patterns:
            match = pattern.search(normalized_text)
            if match:
                start, end = match.span()
                ctx_start = max(0, start - 25)
                ctx_end = min(len(original_text), end + 25)
                evidence = original_text[ctx_start:ctx_end].strip()
                if ctx_start > 0:
                    evidence = "..." + evidence
                if ctx_end < len(original_text):
                    evidence = evidence + "..."

                return {
                    "code": self.code,
                    "title": self.title,
                    "severity": self.severity,
                    "weight": self.weight,
                    "evidence": evidence,
                    "explanation": self.explanation,
                    "recommendation": self.recommendation
                }
        return None

class ScamDetectorEngine:
    def __init__(self):
        self.indicators = self._build_indicator_registry()

    def _build_indicator_registry(self) -> List[DetectionIndicator]:
        return [
            DetectionIndicator(
                code="CREDENTIAL_OTP_HARVESTING",
                title="Credential, OTP, or PIN Solicitation",
                severity="critical",
                weight=65,
                patterns=[
                    r"\b(?:share|send|provide|verify|enter|forward|give)\s+(?:your\s+)?(?:[a-z]{0,15}\s+)?(?:otp|one[- ]time password|pin|mpin|cvv|password|passcode|netbanking credentials)\b",
                    r"\botp\s+(?:is\s+required|verification\s+needed|to\s+cancel|to\s+refund|to\s+receive)\b",
                    r"\benter\s+(?:upi\s+)?pin\s+to\s+(?:receive|claim|credit|refund)\b",
                ],
                explanation="Legitimate financial institutions and companies will NEVER ask you to disclose an OTP, PIN, or password. Entering a PIN in UPI is exclusively for sending money, never receiving it.",
                recommendation="Do not share the code or enter your PIN. Disconnect communication immediately and report the attempt to your bank."
            ),
            DetectionIndicator(
                code="UPFRONT_PAYMENT_FEE",
                title="Unexpected Upfront Payment or Deposit Demand",
                severity="critical",
                weight=65,
                patterns=[
                    r"\b(?:pay|deposit|transfer|send)\s+(?:a\s+)?(?:[a-z]{0,15}\s+)?(?:registration|security|laptop|training|kit|processing|clearance|refundable|verification|courier)\s+(?:fee|amount|deposit|charge|money)\b",
                    r"\bpay\s+(?:rs\.?|inr|\$|usd|£|€)?\s*[\d,]+\s+(?:before|to\s+start|for\s+offer\s+letter|to\s+release|to\s+confirm|for\s+customs)\b",
                    r"\bfee\s+(?:is\s+100%\s+refundable|will\s+be\s+reimbursed\s+in\s+first\s+salary)\b",
                    r"\bcustoms\s+(?:clearance\s+fee|duty\s+charge)\s+required\s+to\s+deliver\b"
                ],
                explanation="Legitimate recruiters and genuine employers do not charge application, laptop deposit, or processing fees. Genuine couriers don't ask for direct personal UPI transfers for parcels you never ordered.",
                recommendation="Never pay fees to secure an internship, job offer, or lottery prize. Verify recruitment campaigns directly on the organization's verified careers portal."
            ),
            DetectionIndicator(
                code="URGENCY_PRESSURE_TACTIC",
                title="Manufactured Urgency and Threat Tactics",
                severity="high",
                weight=40,
                patterns=[
                    r"\b(?:within\s+(?:[\d]+\s+)?(?:minutes|hours|days)|immediately|today\s+itself|urgent\s+action\s+required)\b",
                    r"\b(?:account|card|sim|service|electricity|bill)\s+(?:will\s+be\s+blocked|suspended|deactivated|disconnected|terminated|freeze)\b",
                    r"\b(?:legal\s+action|police\s+complaint|cbi|arrest\s+warrant|court\s+notice)\s+(?:will\s+be\s+taken|issued|initiated|signed)\b",
                    r"\bfinal\s+(?:notice|warning|reminder)\b"
                ],
                explanation="Scammers deliberately simulate ticking clocks and catastrophic penalties (e.g. account suspension, arrest, immediate disconnection) to compel rash reactions before you can think or verify.",
                recommendation="Pause and breathe. Scammers rely on panic. Legitimate service providers send repeated formal notices by physical mail or verified portals, not sudden threatening SMS messages."
            ),
            DetectionIndicator(
                code="COMMUNICATION_BYPASS",
                title="Bypass of Official Communication Channels",
                severity="medium",
                weight=30,
                patterns=[
                    r"\b(?:contact|message|chat\s+with|connect\s+with)\s+(?:[a-z]{0,15}\s+)?(?:hr|manager|recruiter|us)\s+on\s+(?:telegram|whatsapp|wa\.me|t\.me)\b",
                    r"\b(?:t\.me|wa\.me)\/[a-zA-Z0-9_\-\.]+\b",
                    r"\bjoin\s+(?:telegram|whatsapp)\b"
                ],
                explanation="Scammers aggressively funnel victims to encrypted, unmonitored messaging channels (Telegram, WhatsApp) where accounts are easily discarded and anonymous.",
                recommendation="Insist on communicating through corporate email domains (e.g. @company.com) or official support portals. Avoid engaging in commercial or employment matters over anonymous chat apps."
            ),
            DetectionIndicator(
                code="UNREALISTIC_EARNINGS_PROMISE",
                title="Abnormal or Unrealistic Compensation / Rewards",
                severity="high",
                weight=45,
                patterns=[
                    r"\bearn\s+(?:rs\.?|inr|\$)?\s*[\d,]+\s*(?:per\s+day|daily|weekly|every\s+hour|working\s+from\s+home)?\b",
                    r"\b(?:like|subscribe|rate)\s+(?:youtube|google|hotel|movie)\s+(?:videos|reviews|channels)\b",
                    r"\bguaranteed\s+(?:daily\s+profit|100%\s+return|income|fixed\s+profit|zero\s+risk)\b",
                    r"\bcongratulations!?\s+you\s+have\s+won\s+(?:a\s+lottery|cash\s+prize|lucky\s+draw|iphone|car)\b"
                ],
                explanation="Promises of astronomical income for trivial, unskilled tasks (e.g. 'earn Rs 5,000/day liking YouTube videos') are classic task/pretext scams designed to hook victims into advance fee fraud.",
                recommendation="If an offer sounds too good to be true, it almost certainly is. Avoid task-based investment schemes and fake review farms."
            ),
            DetectionIndicator(
                code="AUTHORITY_IMPERSONATION",
                title="Impersonation of Regulatory, Police, or Corporate Authorities",
                severity="critical",
                weight=60,
                patterns=[
                    r"\b(?:mumbai\s+police|delhi\s+police|cyber\s+crime\s+branch|cbi|ed|interpol|customs\s+department)\b",
                    r"\b(?:rbi|reserve\s+bank\s+of\s+india|income\s+tax\s+department|customs\s+officer)\b",
                    r"\b(?:fedex|dhl|india\s+post|bluedart)\s+(?:parcel|consignment|courier|shipment)\s+(?:detained|illegal|drugs|contraband|held)\b",
                    r"\bdigital\s+arrest\b"
                ],
                explanation="Law enforcement, police agencies, and the Reserve Bank of India never conduct 'digital arrests' over Skype, WhatsApp video calls, or phone messages, nor do they demand money transfers to verify identity.",
                recommendation="Government agencies and genuine police never demand money transfers or remote screen sharing. Contact the local police station directly or dial national cyber helpline 1930."
            ),
            DetectionIndicator(
                code="SUSPICIOUS_PAYMENT_CHANNEL",
                title="Irregular or Unofficial Payment Channels",
                severity="high",
                weight=45,
                patterns=[
                    r"\b(?:pay\s+via|transfer\s+to|send\s+to)\s+[a-zA-Z0-9.\-_]{2,}@(okhdfcbank|okaxis|okicici|paytm|ybl|ibl|upi)\b",
                    r"\b(?:buy|purchase|send)\s+(?:apple|google\s+play|amazon|steam)\s+gift\s+card\b",
                    r"\b(?:usdt|bitcoin|crypto\s+wallet|binance|tron)\s+(?:transfer|deposit|address)\b"
                ],
                explanation="Official corporate entities operate verified merchant banking gateways with structured invoicing, never personal UPI VPAs, gift cards, or cryptocurrency transfers.",
                recommendation="Never make business or institutional payments to individual personal UPI IDs or untraceable vouchers."
            ),
            DetectionIndicator(
                code="SECRECY_COERCION",
                title="Strict Secrecy or Isolation Mandate",
                severity="high",
                weight=40,
                patterns=[
                    r"\b(?:keep\s+this\s+(?:strictly\s+)?confidential|do\s+not\s+inform|do\s+not\s+discuss|do\s+not\s+tell)\b",
                    r"\bconfidential\s+investigation\b",
                    r"\bstrictly\s+private\s+assignment\b"
                ],
                explanation="Scammers enforce strict secrecy to isolate the victim from loved ones, tech-savvy advisers, or banking staff who would recognize the fraudulent deception.",
                recommendation="Whenever an unknown caller or sender forbids you from discussing a matter with family or officials, treat it as an immediate red flag and seek trusted second opinions."
            ),
            DetectionIndicator(
                code="UNSOLICITED_REMOTE_ACCESS",
                title="Unsolicited Screen Sharing or Remote Access Request",
                severity="critical",
                weight=65,
                patterns=[
                    r"\b(?:install|download|open)\s+(?:anydesk|teamviewer|rustdesk|quicksupport|zoho\s+assist)\b",
                    r"\bshare\s+(?:your\s+)?(?:screen|9[- ]digit\s+code|remote\s+code)\b",
                    r"\bgrant\s+remote\s+(?:access|permission)\b"
                ],
                explanation="Apps like AnyDesk and TeamViewer grant attackers complete remote control of your phone or computer, enabling them to silently view OTPs and drain banking apps.",
                recommendation="Never install screen-sharing software at the behest of an unsolicited caller or support representative. Disconnect immediately."
            )
        ]

    def normalize_text(self, text: str) -> str:
        if not text:
            return ""
        normalized = unicodedata.normalize("NFKC", text)
        normalized = re.sub(r"[\u200B-\u200D\uFEFF]", "", normalized)
        # Remove commas inside numbers (e.g. 5,000 -> 5000)
        normalized = re.sub(r"(?<=\d),(?=\d)", "", normalized)
        normalized = re.sub(r"\s+", " ", normalized)
        
        leet_map = {
            "@": "a",
            "$": "s",
            "!": "i",
            "3": "e",
            "5": "s"
        }
        def replace_leet(token: str) -> str:
            # Don't alter tokens that are predominantly numeric (currency, phone numbers, amounts)
            digits_count = sum(c.isdigit() for c in token)
            if digits_count > 0 and digits_count >= len(token) - 2:
                return token
            res = ""
            for ch in token:
                if ch == "0" and len(token) <= 4:
                    # e.g. 0tp -> otp
                    res += "o"
                else:
                    res += leet_map.get(ch, ch)
            return res

        tokens = normalized.split(" ")
        normalized_tokens = [replace_leet(t.lower()) for t in tokens]
        return " ".join(normalized_tokens)

    def extract_embedded_urls(self, text: str) -> List[str]:
        url_regex = re.compile(
            r"(?:https?:\/\/|www\.)[^\s<>\"'{}|\\^`]+",
            re.IGNORECASE
        )
        return url_regex.findall(text)

    def analyze(
        self,
        content: str,
        analysis_type: str = "message",
        suspicious_url: Optional[str] = None
    ) -> Dict[str, Any]:
        normalized = self.normalize_text(content)
        detected_indicators: List[Dict[str, Any]] = []
        seen_codes = set()

        for indicator in self.indicators:
            finding = indicator.evaluate(normalized, content)
            if finding and finding["code"] not in seen_codes:
                detected_indicators.append(finding)
                seen_codes.add(finding["code"])

        embedded_urls = self.extract_embedded_urls(content)
        if suspicious_url and suspicious_url not in embedded_urls:
            embedded_urls.append(suspicious_url)

        if embedded_urls:
            from app.services.url_inspector import url_inspector
            for u in embedded_urls[:3]:
                u_res = url_inspector.inspect(u)
                if u_res["risk_score"] >= 40 and "SUSPICIOUS_LINK_IN_MESSAGE" not in seen_codes:
                    detected_indicators.append({
                        "code": "SUSPICIOUS_LINK_IN_MESSAGE",
                        "title": "Questionable Link Contained in Message",
                        "severity": "high" if u_res["risk_score"] >= 65 else "medium",
                        "weight": 40 if u_res["risk_score"] >= 65 else 25,
                        "evidence": u,
                        "explanation": f"The message contains a link to '{u_res['normalized_domain']}' flagged with structural warning: {', '.join(u_res['structural_flags']) or 'Unusual structure'}.",
                        "recommendation": "Do not tap or click the link. If you need to access this service, enter the official web address manually in your browser."
                    })
                    seen_codes.add("SUSPICIOUS_LINK_IN_MESSAGE")

        # Contextual synergy bonus
        has_urgency = "URGENCY_PRESSURE_TACTIC" in seen_codes
        has_payment = "UPFRONT_PAYMENT_FEE" in seen_codes or "SUSPICIOUS_PAYMENT_CHANNEL" in seen_codes
        has_credential = "CREDENTIAL_OTP_HARVESTING" in seen_codes or "UNSOLICITED_REMOTE_ACCESS" in seen_codes
        has_authority = "AUTHORITY_IMPERSONATION" in seen_codes
        
        combo_bonus = 0
        if has_urgency and (has_payment or has_credential or has_authority):
            combo_bonus = 15

        raw_score = sum(ind["weight"] for ind in detected_indicators) + combo_bonus

        # Check if any single critical indicator is present
        has_critical = any(ind["severity"] == "critical" for ind in detected_indicators)

        if raw_score == 0:
            final_score = 4
            assessment = "low_risk"
            summary = "No prominent scam or social engineering indicators were detected in the submitted content."
        elif raw_score < 35 and not has_critical:
            final_score = min(29, max(12, raw_score))
            assessment = "low_risk"
            summary = "Low observed risk: Minor patterns were detected, but no critical fraud signatures were identified."
        elif raw_score < 60 and not has_critical:
            final_score = min(59, max(30, int(raw_score)))
            assessment = "caution_advised"
            summary = f"Caution advised: {len(detected_indicators)} warning indicator(s) identified. Exercise heightened scrutiny before interacting."
        else:
            final_score = min(98, max(72, int(raw_score * 0.85 if raw_score > 98 else raw_score)))
            assessment = "high_suspicion"
            summary = f"High suspicion: Multiple severe warning indicators ({len(detected_indicators)} found) matching known fraud playbooks."

        recommendations: List[str] = []
        for ind in detected_indicators:
            if ind["recommendation"] not in recommendations:
                recommendations.append(ind["recommendation"])

        if not recommendations:
            recommendations = [
                "Even for low-risk content, always verify unexpected requests through known official contact channels.",
                "Never share passwords, PINs, or OTPs under any circumstances.",
                "Bookmark official portals and avoid following unsolicited links."
            ]

        limitations = [
            "This assessment is heuristic and rule-assisted; zero observed indicators do not guarantee that content is safe or genuine.",
            "Sophisticated or targeted spear-phishing messages may lack common automated keywords.",
            "Always verify claims through independent, officially established channels rather than replying to unsolicited contacts."
        ]

        preview = content[:200] + ("..." if len(content) > 200 else "")

        return {
            "assessment": assessment,
            "risk_score": final_score,
            "summary": summary,
            "analysis_type": analysis_type,
            "content_preview": preview,
            "indicators": [
                IndicatorOut(
                    code=ind["code"],
                    title=ind["title"],
                    severity=ind["severity"],
                    evidence=ind["evidence"],
                    explanation=ind["explanation"],
                    recommendation=ind["recommendation"]
                ) for ind in detected_indicators
            ],
            "recommendations": recommendations[:5],
            "limitations": limitations
        }

detector_engine = ScamDetectorEngine()
