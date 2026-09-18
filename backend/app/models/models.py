from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, ForeignKey, Text, JSON
from sqlalchemy.orm import declarative_base, relationship

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    username = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    password_hash = Column(String, nullable=False)
    role = Column(String, default="analyst")  # analyst, admin
    name = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class SecurityEvent(Base):
    __tablename__ = "security_events"

    id = Column(String, primary_key=True, index=True)
    timestamp = Column(DateTime, default=datetime.utcnow, index=True)
    source_ip = Column(String, index=True)
    destination_ip = Column(String)
    username = Column(String, index=True)
    host = Column(String, index=True)
    event_type = Column(String, index=True)
    process_name = Column(String, nullable=True)
    command_line = Column(Text, nullable=True)
    severity = Column(String, default="low")
    raw_data = Column(JSON, nullable=True)
    is_suspicious = Column(Boolean, default=False)
    anomaly_score = Column(Float, default=0.0)
    category = Column(String, default="General")

class Alert(Base):
    __tablename__ = "alerts"

    id = Column(String, primary_key=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String, default="medium")
    status = Column(String, default="open")  # open, investigating, resolved
    risk_score = Column(Integer, default=50)
    confidence_score = Column(Integer, default=50)
    triggered_at = Column(DateTime, default=datetime.utcnow)
    source_event_ids = Column(JSON, default=list)
    host = Column(String)
    user = Column(String)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=True)

class Incident(Base):
    __tablename__ = "incidents"

    id = Column(String, primary_key=True, index=True)
    incident_number = Column(String, unique=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    severity = Column(String, default="high")
    risk_score = Column(Integer, default=0)
    confidence_score = Column(Integer, default=0)
    verification_status = Column(String, default="INSUFFICIENT EVIDENCE") # VERIFIED, PARTIALLY VERIFIED, INSUFFICIENT EVIDENCE
    status = Column(String, default="open") # open, investigating, contained, resolved
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    assigned_to = Column(String, nullable=True)
    scenario = Column(String, nullable=True)
    supporting_evidence_count = Column(Integer, default=0)
    contradicting_evidence_count = Column(Integer, default=0)

    events = relationship("IncidentEvent", back_populates="incident")
    evidence_items = relationship("Evidence", back_populates="incident")
    mitre_mappings = relationship("MitreMapping", back_populates="incident")
    agent_runs = relationship("AgentRun", back_populates="incident")
    recommendations = relationship("ResponseRecommendation", back_populates="incident")

class IncidentEvent(Base):
    __tablename__ = "incident_events"

    id = Column(String, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    security_event_id = Column(String, ForeignKey("security_events.id"), nullable=False)
    correlation_reason = Column(String, nullable=False)
    sequence_order = Column(Integer, default=1)

    incident = relationship("Incident", back_populates="events")

class Evidence(Base):
    __tablename__ = "evidence"

    id = Column(String, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    security_event_id = Column(String, nullable=True)
    claim = Column(Text, nullable=False)
    evidence_type = Column(String, default="supporting")  # supporting, contradicting
    strength = Column(String, default="moderate")        # strong, moderate, weak
    verification_status = Column(String, default="verified") # verified, unverified, disproven
    rationale = Column(Text, nullable=False)

    incident = relationship("Incident", back_populates="evidence_items")

class MitreMapping(Base):
    __tablename__ = "mitre_mappings"

    id = Column(String, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    technique_id = Column(String, index=True, nullable=False) # e.g. T1110, T1078
    technique_name = Column(String, nullable=False)
    tactic = Column(String, nullable=False)
    observed_behavior = Column(Text, nullable=False)
    evidence_ids = Column(JSON, default=list)
    confidence = Column(Integer, default=90)

    incident = relationship("Incident", back_populates="mitre_mappings")

class AgentRun(Base):
    __tablename__ = "agent_runs"

    id = Column(String, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    agent_name = Column(String, nullable=False) # Detection, Investigation, Correlation, MITRE, Verification, Response
    status = Column(String, default="completed") # pending, running, completed, failed
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)
    summary = Column(Text, nullable=False)
    output_data = Column(JSON, nullable=True)
    execution_time_ms = Column(Integer, default=0)

    incident = relationship("Incident", back_populates="agent_runs")

class ResponseRecommendation(Base):
    __tablename__ = "response_recommendations"

    id = Column(String, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("incidents.id"), nullable=False)
    action_type = Column(String, nullable=False) # investigate_endpoint, review_account, reset_credentials, investigate_source_ip, consider_isolation
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    priority = Column(String, default="high")
    status = Column(String, default="pending") # pending, approved, rejected, investigating
    human_decision_by = Column(String, nullable=True)
    human_decision_at = Column(DateTime, nullable=True)
    human_notes = Column(Text, nullable=True)
    command_snippet = Column(Text, nullable=True)

    incident = relationship("Incident", back_populates="recommendations")

class AuditLog(Base):
    __tablename__ = "audit_logs"

    id = Column(String, primary_key=True, index=True)
    incident_id = Column(String, index=True, nullable=False)
    action = Column(String, nullable=False)
    actor = Column(String, nullable=False)
    timestamp = Column(DateTime, default=datetime.utcnow)
    previous_hash = Column(String(64), nullable=False)
    current_hash = Column(String(64), nullable=False)
    details = Column(Text, nullable=False)
