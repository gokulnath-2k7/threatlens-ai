export type SeverityLevel = 'low' | 'medium' | 'high' | 'critical';

export type IncidentStatus = 'open' | 'investigating' | 'contained' | 'resolved';

export type VerificationStatus = 'VERIFIED' | 'PARTIALLY VERIFIED' | 'INSUFFICIENT EVIDENCE';

export type RecommendationStatus = 'pending' | 'approved' | 'rejected' | 'investigating';

export type UserRole = 'analyst' | 'admin';

export interface User {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  name: string;
}

export interface SecurityEvent {
  id: string;
  timestamp: string;
  source_ip: string;
  destination_ip: string;
  username: string;
  host: string;
  event_type: string;
  process_name?: string;
  command_line?: string;
  severity: SeverityLevel;
  raw_data?: Record<string, any>;
  is_suspicious: boolean;
  anomaly_score: number; // 0 to 1
  category: string;
}

export interface Alert {
  id: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  status: 'open' | 'investigating' | 'resolved';
  risk_score: number; // 0 to 100
  confidence_score: number; // 0 to 100
  triggered_at: string;
  source_event_ids: string[];
  host: string;
  user: string;
  incident_id?: string;
}

export interface Incident {
  id: string;
  incident_number: string;
  title: string;
  description: string;
  severity: SeverityLevel;
  risk_score: number; // 0 to 100
  confidence_score: number; // 0 to 100
  verification_status: VerificationStatus;
  status: IncidentStatus;
  created_at: string;
  updated_at: string;
  assigned_to?: string;
  scenario?: string;
  supporting_evidence_count: number;
  contradicting_evidence_count: number;
  current_stage?: number; // 1 to 7 indicating position in the analyst investigation process
  stage_notes?: string;
}

export interface AnalystStageInfo {
  id: number;
  name: string;
  short_name: string;
  code: string;
  phase: 'detection' | 'scoping' | 'verification' | 'attribution' | 'orchestration' | 'response' | 'closure';
  description: string;
  key_actions: string[];
  target_sla_mins: number;
}

export interface AnalystRosterMember {
  id: string;
  name: string;
  role: string;
  tier: string;
  email: string;
  station: string;
  shift: string;
  status: 'active' | 'in_investigation' | 'awaiting_signoff' | 'shift_handover';
  current_stage_id: number;
  current_incident_id?: string;
  current_incident_number?: string;
  stage_started_at: string;
  incidents_completed_today: number;
  avg_resolution_mins: number;
}

export interface AdminProjectReport {
  generated_at: string;
  reporting_period: string;
  ciso_name: string;
  executive_summary: {
    total_events_processed: number;
    edge_filter_rate: number;
    total_incidents_analyzed: number;
    verified_breaches: number;
    false_positive_reduction_pct: number;
    mean_time_to_detect_seconds: number;
    mean_time_to_respond_minutes: number;
    industry_benchmark_mttr_hours: number;
    hours_saved_by_ai_agents: number;
    estimated_cost_avoidance_usd: number;
    compliance_score_pct: number;
  };
  killchain_coverage: {
    tactic: string;
    techniques_neutralized: number;
    top_technique: string;
    detection_efficacy: number;
  }[];
  analyst_performance: {
    total_active_analysts: number;
    current_active_investigations: number;
    avg_stage_bottleneck: string;
    stage_durations: { stage_id: number; name: string; avg_minutes: number; sla_minutes: number }[];
  };
  compliance_matrix: {
    standard: string;
    status: 'COMPLIANT' | 'AUDIT_READY' | 'ACTIVE_MONITORING';
    controls_verified: number;
    total_controls: number;
    sha256_audit_seal: string;
  }[];
}

export interface IncidentEvent {
  id: string;
  incident_id: string;
  security_event_id: string;
  security_event: SecurityEvent;
  correlation_reason: string;
  sequence_order: number;
}

export interface EvidenceItem {
  id: string;
  incident_id: string;
  security_event_id: string;
  claim: string;
  evidence_type: 'supporting' | 'contradicting';
  strength: 'strong' | 'moderate' | 'weak';
  verification_status: 'verified' | 'unverified' | 'disproven';
  rationale: string;
  source_event?: SecurityEvent;
}

export interface MitreMapping {
  id: string;
  incident_id: string;
  technique_id: string;
  technique_name: string;
  tactic: string;
  observed_behavior: string;
  evidence_ids: string[];
  confidence: number; // 0 to 100
}

export interface AgentRun {
  id: string;
  incident_id: string;
  agent_name: 'Detection' | 'Investigation' | 'Correlation' | 'MITRE' | 'Verification' | 'Response';
  status: 'pending' | 'running' | 'completed' | 'failed';
  started_at: string;
  completed_at?: string;
  summary: string;
  output_data?: Record<string, any>;
  execution_time_ms: number;
}

export interface ResponseRecommendation {
  id: string;
  incident_id: string;
  action_type: 'investigate_endpoint' | 'review_account' | 'reset_credentials' | 'investigate_source_ip' | 'consider_isolation';
  title: string;
  description: string;
  priority: SeverityLevel;
  status: RecommendationStatus;
  human_decision_by?: string;
  human_decision_at?: string;
  human_notes?: string;
  command_snippet?: string;
}

export interface AuditLog {
  id: string;
  incident_id: string;
  action: string;
  actor: string;
  timestamp: string;
  previous_hash: string;
  current_hash: string;
  details: string;
}

export interface DashboardKPIs {
  total_alerts: number;
  critical_alerts: number;
  active_incidents: number;
  verified_incidents: number;
  average_risk: number;
  average_confidence: number;
  investigation_time_seconds: number;
  evidence_verification_rate: number;
}

export interface DashboardData {
  kpis: DashboardKPIs;
  alert_trends: { time: string; count: number; critical: number }[];
  severity_distribution: { name: string; value: number; color: string }[];
  threat_categories: { category: string; count: number }[];
  incident_status_breakdown: { status: string; count: number }[];
  mitre_frequency: { technique_id: string; name: string; count: number }[];
  edge_inference_stats: {
    events_ingested: number;
    edge_filtered_clean: number;
    dispatched_to_fastapi: number;
    avg_latency_ms: number;
  };
}
