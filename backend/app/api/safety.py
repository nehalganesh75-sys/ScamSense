from typing import Optional, List
from fastapi import APIRouter, Query

router = APIRouter()

SAFETY_RESOURCES = {
    "emergency_helplines": [
        {
            "name": "National Cyber Crime Helpline (India)",
            "contact": "1930",
            "type": "Toll-Free Phone Helpline",
            "operational_hours": "24x7",
            "description": "Call 1930 immediately if you have suffered financial fraud. Reporting within the 'Golden Hour' allows cyber cells to coordinate with banks to freeze recipient accounts before funds are withdrawn.",
            "action_url": "tel:1930"
        },
        {
            "name": "National Cyber Crime Reporting Portal",
            "contact": "cybercrime.gov.in",
            "type": "Official Government Portal",
            "operational_hours": "Online Portal",
            "description": "Ministry of Home Affairs portal for filing formal cyber complaints, especially financial fraud and crimes against women/children.",
            "action_url": "https://cybercrime.gov.in"
        },
        {
            "name": "Chakshu Portal (DoT)",
            "contact": "sancharsaathi.gov.in/sfc",
            "type": "Telecom Fraud Portal",
            "operational_hours": "Online Portal",
            "description": "Report suspected fraud communications received via SMS, voice call, or WhatsApp (e.g. fake KYC, job scams, digital arrest threats).",
            "action_url": "https://sancharsaathi.gov.in/sfc"
        },
        {
            "name": "RBI Sachet Portal",
            "contact": "sachet.rbi.org.in",
            "type": "Financial Regulatory Portal",
            "operational_hours": "Online Portal",
            "description": "Verify registered financial entities and report unauthorized deposit-taking schemes, illegal loan apps, and fraudulent lenders.",
            "action_url": "https://sachet.rbi.org.in"
        }
    ],
    "guides": [
        {
            "id": "guide_fake_internships",
            "category": "job_internship",
            "title": "Recognizing Fake Internship & Job Offers",
            "summary": "How students and jobseekers can spot recruitment fraud before paying registration or laptop deposits.",
            "key_takeaways": [
                "Legitimate recruiters NEVER charge application, training, registration, or equipment deposits.",
                "Verify recruiter identities through company-registered domains (@company.com), not free Gmail/Yahoo or Telegram links.",
                "High salaries for simple copy-paste or review tasks are deceptive pretexts for advance fee fraud."
            ],
            "action_checklist": [
                "Check the company's official careers site directly for the job ID.",
                "Refuse any request to move conversation off official channels to private Telegram handles.",
                "Never pay for 'refundable security deposits' or 'laptop insurance fees'."
            ]
        },
        {
            "id": "guide_upi_safety",
            "category": "payment_fraud",
            "title": "Mastering UPI Safety & Avoiding PIN Traps",
            "summary": "Understanding how UPI transactions work and avoiding QR-code debit manipulation.",
            "key_takeaways": [
                "You NEVER enter your UPI PIN to receive money. PIN entry is solely to approve outward payments.",
                "Scanning a QR code can only authorize deductions from your account, never deposits.",
                "Scammers often pose as buyers on marketplaces (OLX/Facebook) claiming their 'merchant account' requires PIN confirmation."
            ],
            "action_checklist": [
                "If someone asks you to enter your PIN to receive money, immediately terminate the chat.",
                "Only share your UPI ID (VPA) or phone number to receive payment.",
                "Review the payment screen prompt carefully: check if the button says 'Pay' instead of 'Collect'."
            ]
        },
        {
            "id": "guide_digital_arrest",
            "category": "impersonation",
            "title": "The 'Digital Arrest' Extortion Playbook",
            "summary": "How fraudsters impersonate police and customs officers on video calls and how to defend yourself.",
            "key_takeaways": [
                "'Digital Arrest' has zero legal validity in India or internationally.",
                "Law enforcement never investigates crimes or conducts arrests over WhatsApp or Skype video calls.",
                "Government agencies never demand fund transfers into 'RBI clearance escrow' accounts."
            ],
            "action_checklist": [
                "Immediately disconnect any call where someone claims you are under digital arrest.",
                "Do not transfer any money, regardless of forged police stamps or Supreme Court seals.",
                "Call 1930 and visit your nearest local police station to report the caller's phone number."
            ]
        },
        {
            "id": "guide_evidence_preservation",
            "category": "legal_evidence",
            "title": "Preserving Digital Evidence for Police Reporting",
            "summary": "Critical steps to document cybercrime evidence before scammers delete accounts or messages.",
            "key_takeaways": [
                "Take full screenshots including timestamps, phone numbers, and message status ticks.",
                "Record the bank transaction Reference/UTR number, date, time, and recipient UPI VPA.",
                "Export chat conversations using WhatsApp 'Export Chat' with media included."
            ],
            "action_checklist": [
                "Do not delete chat logs or block the scammer before saving screenshots.",
                "Collect bank account statements showing the fraudulent debit line.",
                "Submit all evidence promptly on cybercrime.gov.in or at the nearest Cyber Police Station."
            ]
        }
    ]
}

@router.get("/resources")
def get_safety_resources(category: Optional[str] = Query(None)):
    """Returns curated digital safety guides, reporting helplines, and action checklists."""
    helplines = SAFETY_RESOURCES["emergency_helplines"]
    guides = SAFETY_RESOURCES["guides"]

    if category and category != "all":
        guides = [g for g in guides if g["category"] == category]

    return {
        "emergency_helplines": helplines,
        "guides": guides
    }
