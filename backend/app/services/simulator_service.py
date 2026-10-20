from typing import List, Dict, Any, Optional
from app.schemas.schemas import ScenarioOut, ScenarioOption, ScenarioAttemptResult

SCENARIOS_DATA: List[Dict[str, Any]] = [
    {
        "id": "scen_internship_offer",
        "category": "job_internship",
        "difficulty": "beginner",
        "title": "Unsolicited Google Internship Offer",
        "fictional_sender": "Priya Sharma (HR Executive) <priya.googlehr2026@gmail.com>",
        "fictional_message": "Congratulations! You have been selected for a 3-month Remote Software Engineer Internship at Google India. Monthly stipend: Rs 85,000. No technical interview required due to exceptional resume screening. To confirm your joining and dispatch your MacBook Pro, please pay a refundable security kit deposit of Rs 2,500 via UPI within 2 hours. Join WhatsApp onboarding: wa.me/919988776655.",
        "options": [
            {
                "id": "opt_a",
                "text": "Pay the Rs 2,500 refundable deposit promptly to secure the internship slot and laptop.",
                "is_safest": False,
                "explanation": "Dangerous. Genuine tech giants never ask candidates to pay laptop or registration deposits. The Gmail sender address and WhatsApp onboarding link are definitive signs of a recruitment fee scam."
            },
            {
                "id": "opt_b",
                "text": "Join the WhatsApp group first to ask if you can pay the Rs 2,500 from your first stipend.",
                "is_safest": False,
                "explanation": "Unsafe. Entering the scammer's unmonitored WhatsApp channel exposes your phone number to secondary pressure tactics and coordinated group manipulation."
            },
            {
                "id": "opt_c",
                "text": "Ignore the email and report it. Verify any genuine application status on the official Google Careers portal (careers.google.com).",
                "is_safest": True,
                "explanation": "Correct and safest action! Legitimate employers communicate exclusively via corporate email domains (@google.com), never demand upfront deposits, and conduct formal interviews."
            }
        ],
        "learning_takeaway": "No legitimate employer or internship program charges fees for offer letters, laptops, training, or application processing. Always check official career portals."
    },
    {
        "id": "scen_upi_payment",
        "category": "upi_payment",
        "difficulty": "intermediate",
        "title": "OLX Buyer 'Scanning QR to Pay' Trick",
        "fictional_sender": "Amit Verma (Buyer on OLX)",
        "fictional_message": "Brother, I have accepted your price of Rs 12,000 for the bicycle. Since I am an Army officer stationed at the cantonment, my military merchant account requires a verification QR. I am sending you a QR code on WhatsApp. Please scan it in Google Pay and enter your 6-digit UPI PIN to credit Rs 12,000 directly into your bank.",
        "options": [
            {
                "id": "opt_a",
                "text": "Scan the QR code and enter your UPI PIN as requested to receive the money.",
                "is_safest": False,
                "explanation": "Severe risk. UPI PIN is exclusively entered to AUTHORIZE DEBITS (send money). You NEVER enter a PIN or scan a QR code to receive money."
            },
            {
                "id": "opt_b",
                "text": "Refuse to scan any QR code or enter a PIN. Inform the buyer that receiving money only requires sharing your UPI ID or phone number.",
                "is_safest": True,
                "explanation": "Exact right decision! You never need a PIN or QR scan to receive funds. Scammers fabricate 'Army merchant account' stories to trick sellers into approving debits."
            },
            {
                "id": "opt_c",
                "text": "Ask the buyer to transfer just Rs 1 first, scan the QR for Rs 1 to test.",
                "is_safest": False,
                "explanation": "Flawed test. The scammer's QR will deduct Rs 1, or they may send Rs 1 normally and then send a Rs 12,000 debit request. Scanning any QR for receipt is fundamentally compromised."
            }
        ],
        "learning_takeaway": "UPI Golden Rule: Enter your PIN ONLY when SENDING money, never when RECEIVING money. Receiving funds requires zero PIN input."
    },
    {
        "id": "scen_parcel_delivery",
        "category": "parcel_delivery",
        "difficulty": "beginner",
        "title": "India Post / FedEx Undelivered Parcel SMS",
        "fictional_sender": "SMS from 'VK-INPOST' (+91 91234 56789)",
        "fictional_message": "IndiaPost Alert: Your package consignment #IN782910 could not be delivered due to missing house number details. Update your address within 12 hours to avoid return to sender: https://indiapost-update.top/track?id=IN782910. A nominal redelivery charge of Rs 25 is applicable.",
        "options": [
            {
                "id": "opt_a",
                "text": "Click the link and pay the Rs 25 fee since it is a very small amount.",
                "is_safest": False,
                "explanation": "Catastrophic. The Rs 25 charge is a phishing hook. The malicious website (.top domain) will record your credit card number, expiry, CVV, and trick you into sharing a banking OTP."
            },
            {
                "id": "opt_b",
                "text": "Do not click the link. Visit the official India Post website (indiapost.gov.in) manually and enter your genuine tracking consignment number.",
                "is_safest": True,
                "explanation": "Safest response. India Post only operates on .gov.in domains. Never trust shortlinks or .top/.xyz domains delivered via unsolicited SMS."
            },
            {
                "id": "opt_c",
                "text": "Call the sender mobile number back to give your address verbally.",
                "is_safest": False,
                "explanation": "Risky. Calling back connects you directly to a scam call center operator who will pressure you to install remote-access apps or share card numbers."
            }
        ],
        "learning_takeaway": "Logistics scams use tiny charges (Rs 20-50) on phishing domains (.top, .buzz) solely to harvest payment card details and OTPs. Official government portals end in .gov.in."
    },
    {
        "id": "scen_digital_arrest",
        "category": "impersonation",
        "difficulty": "advanced",
        "title": "Customs & 'Digital Arrest' Video Coercion",
        "fictional_sender": "Call from 'Mumbai Cyber Cell Officer Inspector Rathore'",
        "fictional_message": "A courier sent from Mumbai to Cambodia containing 5 fake passports and 150 grams of MDMA has been intercepted in your name. A non-bailable arrest warrant has been issued by CBI. You are under 'Digital Arrest' immediately. Do not disconnect this call or consult family. You must transfer your savings to the RBI Supreme Court Verification Escrow account for asset clearance.",
        "options": [
            {
                "id": "opt_a",
                "text": "Transfer the money to the escrow account to prove your innocence and prevent arrest.",
                "is_safest": False,
                "explanation": "Extremely dangerous. 'Digital arrest' is completely fictitious. Neither the police, CBI, nor courts ever demand money transfers for innocence verification or conduct online arrests."
            },
            {
                "id": "opt_b",
                "text": "Immediately disconnect the call. Do not transfer any money. Report the extortion attempt to the National Cyber Crime Portal (1930 / cybercrime.gov.in) and local police.",
                "is_safest": True,
                "explanation": "The only safe choice! No Indian law or court allows 'digital arrest' over video calls. Law enforcement officers do not demand funds into private bank accounts."
            },
            {
                "id": "opt_c",
                "text": "Ask the caller to send a photo of his police ID card before you make the transfer.",
                "is_safest": False,
                "explanation": "Ineffective. Scammers possess forged police IDs, fake studio backgrounds with police logos, and fabricated court letterheads to fool victims."
            }
        ],
        "learning_takeaway": "'Digital Arrest' does not exist under Indian law. Genuine police and CBI do not arrest people over Skype/WhatsApp calls or demand bank transfers for clearance."
    },
    {
        "id": "scen_phishing_banking",
        "category": "phishing_email",
        "difficulty": "intermediate",
        "title": "HDFC / SBI Urgent NetBanking KYC Suspension",
        "fictional_sender": "Alerts <security@alerts-hdfcbank-verify.com>",
        "fictional_message": "Dear Customer, Your NetBanking access will be blocked within 24 hours due to non-completion of mandatory RBI KYC verification. Please click here: http://194.165.22.8/sbi-hdfc/login to update your Aadhaar, PAN, and NetBanking password immediately to avoid legal penalty.",
        "options": [
            {
                "id": "opt_a",
                "text": "Click the link and complete the KYC update so your account doesn't get blocked.",
                "is_safest": False,
                "explanation": "Dangerous! The link points to a raw IP address (194.165.22.8) and an unauthorized domain. Entering passwords here gives fraudsters direct access to drain your accounts."
            },
            {
                "id": "opt_b",
                "text": "Ignore the email link. Log into your bank via the official bank app or manually typed address (hdfcbank.com), or visit your physical bank branch.",
                "is_safest": True,
                "explanation": "Perfect response! Banks never send links to raw IP addresses or demand passwords/PINs for KYC. Always navigate to banking portals directly."
            },
            {
                "id": "opt_c",
                "text": "Reply to the email with photos of your Aadhaar card and PAN card.",
                "is_safest": False,
                "explanation": "Exposes your critical identity documents directly to fraudsters for identity theft and fraudulent SIM card issuance."
            }
        ],
        "learning_takeaway": "Never click links in SMS or email to perform banking KYC. Banks never host login pages on numeric IP addresses or unofficial domains."
    }
]

def get_scenarios(category: Optional[str] = None) -> List[ScenarioOut]:
    data = SCENARIOS_DATA
    if category and category != "all":
        data = [s for s in data if s["category"] == category]
    return [
        ScenarioOut(
            id=s["id"],
            category=s["category"],
            difficulty=s["difficulty"],
            title=s["title"],
            fictional_sender=s["fictional_sender"],
            fictional_message=s["fictional_message"],
            options=[ScenarioOption(**opt) for opt in s["options"]],
            learning_takeaway=s["learning_takeaway"]
        ) for s in data
    ]

def evaluate_attempt(scenario_id: str, selected_option_id: str) -> ScenarioAttemptResult:
    scenario = next((s for s in SCENARIOS_DATA if s["id"] == scenario_id), None)
    if not scenario:
        raise ValueError(f"Scenario '{scenario_id}' not found.")

    selected_opt = next((o for o in scenario["options"] if o["id"] == selected_option_id), None)
    if not selected_opt:
        raise ValueError(f"Option '{selected_option_id}' invalid for scenario.")

    is_correct = selected_opt["is_safest"]
    score = 100 if is_correct else 0

    return ScenarioAttemptResult(
        scenario_id=scenario_id,
        selected_option_id=selected_option_id,
        is_correct=is_correct,
        score=score,
        explanation=selected_opt["explanation"],
        learning_takeaway=scenario["learning_takeaway"]
    )
