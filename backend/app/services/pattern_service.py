from typing import List, Dict, Any, Optional
from app.schemas.schemas import PatternGraphData, GraphNode, GraphEdge

DEMO_GRAPH_DATA: Dict[str, Any] = {
    "nodes": [
        # Campaigns
        {
            "id": "camp_internship_task",
            "label": "Fake Internship & Task Scam Wave",
            "type": "campaign",
            "group": "job_internship",
            "risk_level": "high_suspicion",
            "details": {
                "description": "Recruits students and jobseekers promising Rs 3,000-8,000/day for liking videos or doing tasks, then demands deposit fees to 'unlock' earnings.",
                "tactics": ["Upfront Registration Deposit", "Telegram Redirection", "Unrealistic Income"],
                "origin_year": "2024-2026",
                "simulated_reports": 142
            }
        },
        {
            "id": "camp_digital_arrest",
            "label": "Digital Arrest Extortion Ring",
            "type": "campaign",
            "group": "law_enforcement",
            "risk_level": "high_suspicion",
            "details": {
                "description": "Impersonates CBI / Police on video calls claiming an illegal narcotics courier was sent in victim's name, coercing wire transfers into 'verification' accounts.",
                "tactics": ["Authority Impersonation", "Secrecy Mandate", "Manufactured Arrest Threat"],
                "origin_year": "2024-2026",
                "simulated_reports": 89
            }
        },
        {
            "id": "camp_courier_customs",
            "label": "Parcel Customs & Redelivery Trap",
            "type": "campaign",
            "group": "courier_logistics",
            "risk_level": "caution_advised",
            "details": {
                "description": "Sends SMS claiming an undelivered parcel requires a Rs 25 redelivery fee or customs duty via an urgent phishing link.",
                "tactics": ["Phishing Domain", "Small Fee Hook", "Urgency"],
                "origin_year": "2025-2026",
                "simulated_reports": 215
            }
        },
        {
            "id": "camp_bank_kyc_apk",
            "label": "Banking KYC & Pan Card Expiry Trap",
            "type": "campaign",
            "group": "banking",
            "risk_level": "high_suspicion",
            "details": {
                "description": "Mass SMS claiming victim's bank account will be blocked within 24 hours unless a malicious banking APK or credential phishing site is visited.",
                "tactics": ["Credential Harvesting", "Threat of Account Suspension", "Lookalike Brand Domain"],
                "origin_year": "2023-2026",
                "simulated_reports": 310
            }
        },
        {
            "id": "camp_electricity_cutoff",
            "label": "Power Disconnection Urgency Scam",
            "type": "campaign",
            "group": "utility",
            "risk_level": "high_suspicion",
            "details": {
                "description": "Fictional notice threatening power cut at 9:30 PM due to unpaid electricity bill, directing victim to call an unauthorized mobile number.",
                "tactics": ["Urgency Pressure", "Fake Helpline", "Screen Sharing AnyDesk"],
                "origin_year": "2024-2026",
                "simulated_reports": 178
            }
        },
        # Impersonated Entities
        {
            "id": "ent_google",
            "label": "Google Careers (Impersonated)",
            "type": "entity",
            "group": "job_internship",
            "risk_level": "caution_advised",
            "details": {
                "sector": "Technology",
                "official_domain": "careers.google.com",
                "common_spoof": "Unofficial Gmail / Telegram HR recruiters"
            }
        },
        {
            "id": "ent_cbi_police",
            "label": "CBI & Mumbai Police (Impersonated)",
            "type": "entity",
            "group": "law_enforcement",
            "risk_level": "high_suspicion",
            "details": {
                "sector": "Law Enforcement",
                "official_portal": "cybercrime.gov.in",
                "common_spoof": "Fake arrest warrants on forged letterheads"
            }
        },
        {
            "id": "ent_fedex_indiapost",
            "label": "FedEx / India Post (Impersonated)",
            "type": "entity",
            "group": "courier_logistics",
            "risk_level": "caution_advised",
            "details": {
                "sector": "Logistics",
                "official_domain": "fedex.com / indiapost.gov.in",
                "common_spoof": "Customs clearance SMS with shortlinks"
            }
        },
        {
            "id": "ent_sbi_hdfc",
            "label": "SBI & HDFC Bank (Impersonated)",
            "type": "entity",
            "group": "banking",
            "risk_level": "high_suspicion",
            "details": {
                "sector": "Banking",
                "official_domain": "onlinesbi.sbi / hdfcbank.com",
                "common_spoof": "KYC update expiry warning texts"
            }
        },
        # Domains & Channels
        {
            "id": "dom_googlejobs_top",
            "label": "careers-googlejobs.top",
            "type": "domain",
            "group": "job_internship",
            "risk_level": "high_suspicion",
            "details": {
                "registrar_tld": ".top (disposable TLD)",
                "detected_flags": ["HIGH_ABUSE_TLD", "BRAND_MISDIRECTION"],
                "status": "Flagged Malicious"
            }
        },
        {
            "id": "dom_fedex_clearance_xyz",
            "label": "fedex-clearance-track.xyz",
            "type": "domain",
            "group": "courier_logistics",
            "risk_level": "high_suspicion",
            "details": {
                "registrar_tld": ".xyz",
                "detected_flags": ["HIGH_ABUSE_TLD", "EXCESSIVE_SUBDOMAINS", "BRAND_MISDIRECTION"],
                "status": "Flagged Malicious"
            }
        },
        {
            "id": "dom_sbi_kyc_update_buzz",
            "label": "sbi-kyc-verify-portal.buzz",
            "type": "domain",
            "group": "banking",
            "risk_level": "high_suspicion",
            "details": {
                "registrar_tld": ".buzz",
                "detected_flags": ["HIGH_ABUSE_TLD", "CREDENTIAL_SENSITIVE_PATH"],
                "status": "Flagged Malicious"
            }
        },
        {
            "id": "dom_telegram_channel",
            "label": "t.me/hr_google_tasks_india",
            "type": "channel",
            "group": "job_internship",
            "risk_level": "caution_advised",
            "details": {
                "platform": "Telegram",
                "purpose": "Off-platform victim recruitment and daily task posting"
            }
        },
        {
            "id": "dom_anydesk_app",
            "label": "AnyDesk Remote APK",
            "type": "tactic",
            "group": "utility",
            "risk_level": "high_suspicion",
            "details": {
                "mechanism": "Unsolicited remote desktop installation to view banking OTPs",
                "severity": "Critical"
            }
        }
    ],
    "edges": [
        {"id": "e1", "source": "camp_internship_task", "target": "ent_google", "label": "Spoofs", "relationship": "impersonates"},
        {"id": "e2", "source": "camp_internship_task", "target": "dom_googlejobs_top", "label": "Directs to", "relationship": "uses_domain"},
        {"id": "e3", "source": "camp_internship_task", "target": "dom_telegram_channel", "label": "Channels victims to", "relationship": "uses_channel"},
        {"id": "e4", "source": "camp_digital_arrest", "target": "ent_cbi_police", "label": "Fictional authority claim", "relationship": "impersonates"},
        {"id": "e5", "source": "camp_courier_customs", "target": "ent_fedex_indiapost", "label": "Fabricates parcel from", "relationship": "impersonates"},
        {"id": "e6", "source": "camp_courier_customs", "target": "dom_fedex_clearance_xyz", "label": "Sends tracking link to", "relationship": "uses_domain"},
        {"id": "e7", "source": "camp_bank_kyc_apk", "target": "ent_sbi_hdfc", "label": "Pretends to be security team of", "relationship": "impersonates"},
        {"id": "e8", "source": "camp_bank_kyc_apk", "target": "dom_sbi_kyc_update_buzz", "label": "Harvests credentials on", "relationship": "uses_domain"},
        {"id": "e9", "source": "camp_electricity_cutoff", "target": "dom_anydesk_app", "label": "Coerces install of", "relationship": "deploys_tactic"}
    ]
}

def get_pattern_graph_data(category_filter: Optional[str] = None, search: Optional[str] = None) -> PatternGraphData:
    nodes = DEMO_GRAPH_DATA["nodes"]
    edges = DEMO_GRAPH_DATA["edges"]

    if category_filter and category_filter != "all":
        nodes = [n for n in nodes if n.get("group") == category_filter]
        allowed_ids = {n["id"] for n in nodes}
        edges = [e for e in edges if e["source"] in allowed_ids and e["target"] in allowed_ids]

    if search:
        search_lower = search.lower().strip()
        nodes = [
            n for n in nodes
            if search_lower in n["label"].lower() or search_lower in n["id"].lower() or search_lower in str(n.get("details", "")).lower()
        ]
        allowed_ids = {n["id"] for n in nodes}
        edges = [e for e in edges if e["source"] in allowed_ids and e["target"] in allowed_ids]

    return PatternGraphData(
        nodes=[GraphNode(**n) for n in nodes],
        edges=[GraphEdge(**e) for e in edges]
    )
