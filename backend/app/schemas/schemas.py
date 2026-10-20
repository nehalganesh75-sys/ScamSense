import datetime
from typing import List, Optional, Dict, Any
from pydantic import BaseModel, Field, EmailStr

# --- Analyzer Schemas ---

class IndicatorOut(BaseModel):
    code: str
    title: str
    severity: str  # low, medium, high, critical
    evidence: Optional[str] = None
    explanation: str
    recommendation: str

class URLInspectionOut(BaseModel):
    id: Optional[int] = None
    raw_url: str
    normalized_domain: str
    risk_score: int
    assessment: str  # low_risk, caution_advised, high_suspicion
    structural_flags: List[str] = []
    reputation_status: str
    reputation_provider: str
    details: Dict[str, Any] = {}
    created_at: Optional[datetime.datetime] = None

class AnalysisCreate(BaseModel):
    content: str = Field(..., min_length=5, max_length=25000, description="Submitted text to analyze")
    analysis_type: Optional[str] = Field("message", description="Category: message, email, job_offer, payment_request, quick_check")
    suspicious_url: Optional[str] = Field(None, description="Optional suspicious link attached or contained")
    consent_store: bool = Field(False, description="User consent to store submitted content")
    session_id: Optional[str] = None

class AnalysisOut(BaseModel):
    id: Optional[int] = None
    assessment: str  # low_risk, caution_advised, high_suspicion
    risk_score: int
    summary: str
    analysis_type: str
    content_preview: Optional[str] = None
    indicators: List[IndicatorOut] = []
    url_inspection: Optional[URLInspectionOut] = None
    recommendations: List[str] = []
    limitations: List[str] = []
    created_at: Optional[datetime.datetime] = None

    class Config:
        from_attributes = True

# --- Link Inspector Schemas ---

class URLInspectRequest(BaseModel):
    url: str = Field(..., min_length=3, max_length=2000, description="URL to inspect")
    consent_store: bool = False
    session_id: Optional[str] = None

# --- Simulator Schemas ---

class ScenarioOption(BaseModel):
    id: str
    text: str
    is_safest: bool
    explanation: str

class ScenarioOut(BaseModel):
    id: str
    category: str
    difficulty: str
    title: str
    fictional_sender: str
    fictional_message: str
    options: List[ScenarioOption]
    learning_takeaway: str

class ScenarioAttemptRequest(BaseModel):
    selected_option_id: str
    session_id: Optional[str] = None

class ScenarioAttemptResult(BaseModel):
    scenario_id: str
    selected_option_id: str
    is_correct: bool
    score: int
    explanation: str
    learning_takeaway: str

# --- Pattern Explorer Graph Schemas ---

class GraphNode(BaseModel):
    id: str
    label: str
    type: str  # campaign, domain, entity, indicator, tactic
    group: Optional[str] = None
    risk_level: Optional[str] = None
    details: Dict[str, Any] = {}

class GraphEdge(BaseModel):
    id: str
    source: str
    target: str
    label: str
    relationship: str

class PatternGraphData(BaseModel):
    nodes: List[GraphNode]
    edges: List[GraphEdge]

# --- Dashboard & Analytics Schemas ---

class DashboardSummaryOut(BaseModel):
    total_analyses: int
    risk_distribution: Dict[str, int]
    type_distribution: Dict[str, int]
    top_indicators: List[Dict[str, Any]]
    total_url_inspections: int
    simulator_stats: Dict[str, Any]
    is_demo_data: bool = False

class TrendPoint(BaseModel):
    date: str
    total: int
    high_suspicion: int
    caution_advised: int
    low_risk: int

# --- Auth Schemas ---

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., min_length=8)
    full_name: Optional[str] = None
    consent_store_content: bool = False

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: Dict[str, Any]

class UserOut(BaseModel):
    id: int
    email: EmailStr
    full_name: Optional[str] = None
    consent_store_content: bool
    created_at: datetime.datetime

    class Config:
        from_attributes = True

class UserSettingsUpdate(BaseModel):
    full_name: Optional[str] = None
    consent_store_content: Optional[bool] = None
