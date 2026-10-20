# ScamSense — Detection & Scoring Methodology

## 1. Philosophical Framework

ScamSense operates under the principle of **Transparent, Explainable Risk Assessment**. Unlike generative AI systems that output unverified confidence claims or black-box verdicts, ScamSense relies on deterministic rules, linguistic indicators, structural domain analysis, and contextual synergies.

Every assessment is accompanied by:
1. The exact evidence excerpt identified in the submitted text.
2. The technical or psychological reason why scammers utilize that tactic.
3. Tailored defensive recommendations for the user.
4. Documented limitations of the evaluation.

---

## 2. Text Normalization Pipeline

To counteract evasion techniques such as unicode spoofing, zero-width spaces, and leetspeak substitution:

1. **Unicode NFKC Decomposition**: Maps lookalike unicode characters to standard ASCII equivalents.
2. **Zero-Width Character Removal**: Strips `\u200B`, `\u200C`, `\u200D`, and `\uFEFF` inserted by scammers to disrupt keyword filtering.
3. **Leetspeak Decoding with Digit Preservation**:
   - Obfuscated keywords such as `p@ssword` -> `password`, `0tp` -> `otp` are converted to standard terms.
   - Purely numeric sequences, currency amounts (e.g. `Rs 5,000`, `15 minutes`), and phone numbers are strictly preserved.

---

## 3. Warning Indicator Registry

| Code | Severity | Weight | Description |
|---|---|---|---|
| `CREDENTIAL_OTP_HARVESTING` | Critical | 65 | Demanding OTPs, UPI PINs, passwords, or CVV codes. Legitimate entities never ask for authorization credentials. |
| `UPFRONT_PAYMENT_FEE` | Critical | 65 | Demands for registration fees, laptop caution deposits, or customs release charges before receiving a service or job. |
| `URGENCY_PRESSURE_TACTIC` | High | 40 | Manufactured countdowns (&ldquo;within 15 minutes&rdquo;, &ldquo;account blocked today&rdquo;) designed to trigger panic reactions. |
| `AUTHORITY_IMPERSONATION` | Critical | 60 | Fictitious claims of police arrest warrants, CBI investigations, or &ldquo;digital arrest&rdquo;. |
| `UNREALISTIC_EARNINGS_PROMISE` | High | 45 | Promises of excessive compensation for low-skill tasks (e.g., earning Rs 5,000/day liking YouTube videos). |
| `COMMUNICATION_BYPASS` | Medium | 30 | Directing users off official platforms onto unmonitored Telegram channels or WhatsApp chats. |
| `SUSPICIOUS_PAYMENT_CHANNEL` | High | 45 | Solicitations via personal UPI VPAs, gift cards, or cryptocurrency addresses. |
| `SECRECY_COERCION` | High | 40 | Mandating that the victim conceal the interaction from family, friends, or banking staff. |
| `UNSOLICITED_REMOTE_ACCESS` | Critical | 65 | Directing the user to install AnyDesk, TeamViewer, or QuickSupport screen-sharing tools. |

---

## 4. Scoring & Diminishing Returns Model

Raw score is accumulated across unique detected indicators:
$$\text{Raw Score} = \sum_{i \in \text{Detected}} w_i + \text{Synergy Bonus}$$

### Contextual Synergy Bonus (+15)
When high-pressure urgency (`URGENCY_PRESSURE_TACTIC`) is paired with an upfront payment demand (`UPFRONT_PAYMENT_FEE`) or credential solicitation (`CREDENTIAL_OTP_HARVESTING`), a +15 point synergy bonus is applied, reflecting the compound risk of coordinated social engineering.

### Non-Linear Diminishing Returns
To prevent repeated instances of minor indicators from exaggerating risk while ensuring genuine multi-vector fraud is flagged:
- If `Raw Score` < 35 and no critical indicator: Score is capped at 29 (**Low observed risk**).
- If `Raw Score` is between 35 and 59: Score scales smoothly between 30 and 59 (**Caution advised**).
- If `Raw Score` >= 60 or any critical indicator is present: Score maps into 72 - 98 (**High suspicion**).

---

## 5. Explicit Limitations & Disclaimers

1. **Heuristic Nature**: The engine analyzes pattern markers. A zero-indicator finding indicates no recognized signatures were matched; it is not a proof of legitimacy.
2. **Targeted Spear-Phishing**: Highly personalized spear-phishing messages written in custom language may not trigger generic keyword heuristics.
3. **External Verification**: Users must independently verify any critical banking, employment, or governmental communication.
