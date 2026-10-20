import datetime
from sqlalchemy import (
    Column, Integer, String, Text, Boolean, DateTime, ForeignKey, JSON
)
from sqlalchemy.orm import relationship
from app.core.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    consent_store_content = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    analyses = relationship("Analysis", back_populates="user", cascade="all, delete-orphan")
    simulator_attempts = relationship("SimulatorAttempt", back_populates="user")

class Analysis(Base):
    __tablename__ = "analyses"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    session_id = Column(String(100), index=True, nullable=True)
    analysis_type = Column(String(50), default="message", index=True)
    content_preview = Column(Text, nullable=True)
    content_hash = Column(String(64), index=True, nullable=True)
    assessment = Column(String(50), nullable=False, index=True)  # low_risk, caution_advised, high_suspicion
    risk_score = Column(Integer, nullable=False)
    summary = Column(Text, nullable=False)
    consent_given = Column(Boolean, default=False)
    limitations = Column(JSON, default=list)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="analyses")
    indicators = relationship("Indicator", back_populates="analysis", cascade="all, delete-orphan")
    url_inspection = relationship("URLInspection", back_populates="analysis", uselist=False, cascade="all, delete-orphan")

class Indicator(Base):
    __tablename__ = "indicators"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id", ondelete="CASCADE"), nullable=False, index=True)
    indicator_code = Column(String(100), nullable=False, index=True)
    title = Column(String(255), nullable=False)
    severity = Column(String(50), nullable=False)  # low, medium, high, critical
    evidence = Column(Text, nullable=True)
    explanation = Column(Text, nullable=False)
    recommendation = Column(Text, nullable=False)

    analysis = relationship("Analysis", back_populates="indicators")

class URLInspection(Base):
    __tablename__ = "url_inspections"

    id = Column(Integer, primary_key=True, index=True)
    analysis_id = Column(Integer, ForeignKey("analyses.id", ondelete="SET NULL"), nullable=True, index=True)
    raw_url = Column(Text, nullable=False)
    normalized_domain = Column(String(255), nullable=False, index=True)
    risk_score = Column(Integer, nullable=False)
    assessment = Column(String(50), nullable=False, index=True)
    structural_flags = Column(JSON, default=list)
    reputation_status = Column(String(50), default="unconfigured")
    reputation_provider = Column(String(100), default="Local Structural Heuristics + Threat Feed Interface")
    details = Column(JSON, default=dict)
    created_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    analysis = relationship("Analysis", back_populates="url_inspection")

class Scenario(Base):
    __tablename__ = "scenarios"

    id = Column(String(100), primary_key=True, index=True)
    category = Column(String(100), nullable=False, index=True)
    difficulty = Column(String(50), nullable=False)
    title = Column(String(255), nullable=False)
    fictional_sender = Column(String(255), nullable=False)
    fictional_message = Column(Text, nullable=False)
    options = Column(JSON, nullable=False)
    learning_takeaway = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)

    attempts = relationship("SimulatorAttempt", back_populates="scenario")

class SimulatorAttempt(Base):
    __tablename__ = "simulator_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    session_id = Column(String(100), index=True, nullable=True)
    scenario_id = Column(String(100), ForeignKey("scenarios.id", ondelete="CASCADE"), nullable=False, index=True)
    selected_option_id = Column(String(50), nullable=False)
    is_correct = Column(Boolean, nullable=False)
    score = Column(Integer, nullable=False)
    completed_at = Column(DateTime, default=datetime.datetime.utcnow, index=True)

    user = relationship("User", back_populates="simulator_attempts")
    scenario = relationship("Scenario", back_populates="attempts")
