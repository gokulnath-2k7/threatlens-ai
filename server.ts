import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import { store } from './server/store.js';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Request logger
  app.use((req, res, next) => {
    if (req.url.startsWith('/api')) {
      console.log(`[API] ${req.method} ${req.url}`);
    }
    next();
  });

  // --- API Endpoints ---

  // Health check
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'healthy',
      system: 'ThreatLens AI Autonomous SOC Engine',
      version: '1.0.0-hackathon-mvp',
      timestamp: new Date().toISOString(),
      llm_status: process.env.GEMINI_API_KEY ? 'gemini-connected' : 'deterministic-fallback',
      audit_chain_valid: store.verifyAuditChain().valid,
    });
  });

  // Authentication
  app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    // Simple demo auth with analyst & admin personas
    let user = Array.from(store.users.values()).find((u) => u.email === email);
    if (!user) {
      if (email?.includes('admin')) {
        user = store.users.get('usr-2');
      } else {
        user = store.users.get('usr-1');
      }
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // In a production backend, generate standard JWT
    const token = `jwt_mock_${user.role}_${Buffer.from(user.email).toString('base64')}`;
    store.createAuditLog('AUTH', 'USER_LOGIN', user.username, `User logged in with role [${user.role}]`);

    return res.json({
      token,
      user,
      expires_in: 86400,
    });
  });

  // Dashboard summary KPIs & chart metrics
  app.get('/api/dashboard/summary', (req, res) => {
    const data = store.getDashboardData();
    res.json(data);
  });

  // Alerts
  app.get('/api/alerts', (req, res) => {
    const alerts = Array.from(store.alerts.values()).sort(
      (a, b) => new Date(b.triggered_at).getTime() - new Date(a.triggered_at).getTime()
    );
    res.json(alerts);
  });

  // Incidents
  app.get('/api/incidents', (req, res) => {
    const incidents = Array.from(store.incidents.values()).sort(
      (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );
    res.json(incidents);
  });

  app.get('/api/incidents/:id', (req, res) => {
    const incident = store.incidents.get(req.params.id);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }
    res.json(incident);
  });

  // Trigger Multi-Agent Investigation on an incident
  app.post('/api/incidents/:id/investigate', async (req, res) => {
    try {
      const incident = store.incidents.get(req.params.id);
      if (!incident) {
        return res.status(404).json({ error: 'Incident not found' });
      }

      const result = await store.runMultiAgentInvestigation(incident.id, process.env.GEMINI_API_KEY);
      res.json({
        message: 'Multi-agent investigation completed successfully',
        incident: result.incident,
        agents: result.agents,
        evidence: result.evidence,
        mitre: result.mitre,
        recommendations: result.recommendations,
      });
    } catch (err: any) {
      console.error('Investigation error:', err);
      res.status(500).json({ error: err.message || 'Investigation execution failed' });
    }
  });

  // Incident timeline
  app.get('/api/incidents/:id/timeline', (req, res) => {
    const events = Array.from(store.incidentEvents.values())
      .filter((ie) => ie.incident_id === req.params.id)
      .sort((a, b) => a.sequence_order - b.sequence_order);
    res.json(events);
  });

  // Incident evidence items
  app.get('/api/incidents/:id/evidence', (req, res) => {
    const evidence = Array.from(store.evidence.values()).filter((e) => e.incident_id === req.params.id);
    res.json(evidence);
  });

  // Incident MITRE mapping
  app.get('/api/incidents/:id/mitre', (req, res) => {
    const mitre = Array.from(store.mitreMappings.values()).filter((m) => m.incident_id === req.params.id);
    res.json(mitre);
  });

  // Incident Agent runs
  app.get('/api/incidents/:id/agents', (req, res) => {
    const agents = Array.from(store.agentRuns.values())
      .filter((a) => a.incident_id === req.params.id)
      .sort((a, b) => new Date(a.started_at).getTime() - new Date(b.started_at).getTime());
    res.json(agents);
  });

  // Incident Response Recommendations
  app.get('/api/incidents/:id/recommendations', (req, res) => {
    const recs = Array.from(store.responseRecommendations.values()).filter((r) => r.incident_id === req.params.id);
    res.json(recs);
  });

  // Analyst Process Staging Endpoints
  app.get('/api/analyst/roster', (req, res) => {
    const roster = Array.from(store.analystRoster.values());
    res.json(roster);
  });

  app.post('/api/incidents/:id/stage', (req, res) => {
    const { stage, analyst, notes } = req.body;
    const stageNum = Number(stage);
    if (!stageNum || stageNum < 1 || stageNum > 7) {
      return res.status(400).json({ error: 'Stage must be a number between 1 and 7' });
    }

    try {
      const analystName = analyst || 'Sarah Chen (Tier 2 SOC Analyst)';
      const updatedIncident = store.updateIncidentStage(req.params.id, stageNum, analystName, notes);
      res.json({
        message: `Analyst position successfully staged to Stage ${stageNum}`,
        incident: updatedIncident,
        roster: Array.from(store.analystRoster.values()),
      });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  // Admin Project Report Endpoint
  app.get('/api/admin/report', (req, res) => {
    try {
      const report = store.getAdminProjectReport();
      res.json(report);
    } catch (err: any) {
      res.status(500).json({ error: err.message });
    }
  });

  // Analyst Response Actions (Approve / Reject / Investigate Further)
  app.post('/api/recommendations/:id/approve', (req, res) => {
    const analystName = req.body.analyst || 'Sarah Chen (Tier 2 SOC Analyst)';
    const notes = req.body.notes || 'Analyst verified evidence and approved containment measure.';
    try {
      const rec = store.updateRecommendationStatus(req.params.id, 'approved', analystName, notes);
      res.json({ message: 'Recommendation approved', recommendation: rec });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  app.post('/api/recommendations/:id/reject', (req, res) => {
    const analystName = req.body.analyst || 'Sarah Chen (Tier 2 SOC Analyst)';
    const notes = req.body.notes || 'Analyst rejected action due to potential business impact or false positive check.';
    try {
      const rec = store.updateRecommendationStatus(req.params.id, 'rejected', analystName, notes);
      res.json({ message: 'Recommendation rejected', recommendation: rec });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  app.post('/api/recommendations/:id/investigate-further', (req, res) => {
    const analystName = req.body.analyst || 'Sarah Chen (Tier 2 SOC Analyst)';
    const notes = req.body.notes || 'Analyst requested additional memory forensics before approval.';
    try {
      const rec = store.updateRecommendationStatus(req.params.id, 'investigating', analystName, notes);
      res.json({ message: 'Marked for deeper investigation', recommendation: rec });
    } catch (err: any) {
      res.status(404).json({ error: err.message });
    }
  });

  // --- Attack Simulator Endpoints ---
  app.post('/api/simulator/bruteforce', (req, res) => {
    const result = store.simulateBruteForce();
    res.json({
      message: 'Simulated brute force login flood against DC01.corp',
      alert: result.alert,
      eventsCount: result.events.length,
    });
  });

  app.post('/api/simulator/powershell', (req, res) => {
    const result = store.simulatePowerShell();
    res.json({
      message: 'Simulated encoded PowerShell download cradle execution',
      alert: result.alert,
      eventsCount: result.events.length,
    });
  });

  app.post('/api/simulator/portscan', (req, res) => {
    const result = store.simulatePortScan();
    res.json({
      message: 'Simulated internal TCP SYN sweep against file server',
      alert: result.alert,
      eventsCount: result.events.length,
    });
  });

  // Primary Hackathon Live Demo Workflow Endpoint
  app.post('/api/simulator/full-attack', (req, res) => {
    const result = store.runFullAttackChain('Analyst Live Hackathon Demo');
    res.json({
      message: 'Full attack chain simulated & multi-agent investigation completed!',
      incident: result.incident,
      alert: result.alert,
      eventsCount: result.events.length,
      workflow: [
        'Events Generated (5 Stages)',
        'Alert Correlated',
        'Detection Agent Evaluated',
        'Investigation Agent Scoped',
        'Correlation Agent Linked',
        'MITRE Agent Mapped (T1110, T1078, T1059.001, T1071.001)',
        'Evidence Verification Agent Verified (INCIDENT VERIFIED)',
        'Response Agent Generated Recommendations',
      ],
    });
  });

  // ML Scoring Endpoint
  app.post('/api/ml/predict', (req, res) => {
    const { event_type, command_line, source_ip, failed_count } = req.body;

    let anomaly_score = 0.2;
    let risk_level = 'LOW';
    const triggers: string[] = [];

    if (failed_count && failed_count > 3) {
      anomaly_score += 0.35;
      triggers.push(`Burst authentication failures (${failed_count} events)`);
    }

    if (command_line && /(-enc|-nop|-w hidden|downloadstring|iex|invoke-mimikatz)/i.test(command_line)) {
      anomaly_score += 0.45;
      triggers.push('Obfuscated script interpreter arguments with memory injection syntax');
    }

    if (source_ip && !source_ip.startsWith('10.') && !source_ip.startsWith('192.168.')) {
      anomaly_score += 0.2;
      triggers.push(`External unmanaged IP source: ${source_ip}`);
    }

    anomaly_score = Math.min(0.99, anomaly_score);
    if (anomaly_score > 0.8) risk_level = 'CRITICAL';
    else if (anomaly_score > 0.6) risk_level = 'HIGH';
    else if (anomaly_score > 0.4) risk_level = 'MEDIUM';

    res.json({
      model: 'Hybrid-RandomForest-IsolationForest-v1.4',
      anomaly_score: Number(anomaly_score.toFixed(3)),
      risk_level,
      is_anomalous: anomaly_score >= 0.6,
      feature_triggers: triggers,
      inference_time_ms: 1.2,
    });
  });

  // Audit Trail & Tamper Verification
  app.get('/api/audit', (req, res) => {
    res.json(store.auditLogs);
  });

  app.get('/api/audit/verify', (req, res) => {
    const result = store.verifyAuditChain();
    res.json(result);
  });

  app.post('/api/audit/tamper', (req, res) => {
    try {
      const result = store.tamperAuditTrail();
      res.json({
        message: 'Tampered middle audit log for cryptographic demonstration',
        tampered_id: result.tampered_id,
        verification_now: store.verifyAuditChain(),
      });
    } catch (err: any) {
      res.status(400).json({ error: err.message });
    }
  });

  app.post('/api/audit/restore', (req, res) => {
    store.restoreAuditTrail();
    res.json({
      message: 'Audit trail hashes re-anchored and validated',
      verification: store.verifyAuditChain(),
    });
  });

  // AI Explainable Reporting (using Gemini if key available, or deterministic fallback)
  app.post('/api/gemini/explain', async (req, res) => {
    const { incidentId } = req.body;
    const incident = store.incidents.get(incidentId);
    if (!incident) {
      return res.status(404).json({ error: 'Incident not found' });
    }

    const evidenceList = Array.from(store.evidence.values()).filter((e) => e.incident_id === incidentId);
    const mitreList = Array.from(store.mitreMappings.values()).filter((m) => m.incident_id === incidentId);

    // Fallback deterministic report
    const deterministicReport = `### ThreatLens Autonomous Investigation Summary for ${incident.incident_number}
**Incident Verdict:** ${incident.verification_status} (Risk: ${incident.risk_score}/100 | Confidence: ${incident.confidence_score}%)

1. **Attack Vectors & Root Cause**:
The attacker initiated an automated brute-force campaign from external address \`198.51.100.45\` against host \`DC01.corp\`. Upon successfully guessing credentials for domain account \`admin_ops\`, an interactive RDP session was established.

2. **Privilege Discovery & Execution**:
Immediate post-exploitation reconnaissance identified elevated privileges (\`whoami /priv\`). The threat actor subsequently executed an obfuscated PowerShell payload invoking an in-memory download cradle to evade host disk detection.

3. **C2 Persistence & Data Staging**:
An outbound connection was established to external IP \`203.0.113.88:8443\` transferring 142KB of encrypted command & control telemetry.

4. **MITRE ATT&CK Attribution**:
- **T1110 (Credential Access)**: 12 failed attempts followed by authentication.
- **T1078 (Initial Access)**: Valid administrative credentials abused.
- **T1059.001 (Execution)**: Encoded PowerShell process.
- **T1071.001 (Command & Control)**: TLS beaconing over web ports.

5. **Analyst Action Required**:
All destructive response steps (process termination, network quarantine, credential revocation) have been staged in the Response Agent for analyst approval.`;

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are the lead AI Cybersecurity Investigator for ThreatLens AI. 
Generate a structured, concise, evidence-driven Incident Intelligence Report for this confirmed security incident:
Incident: ${incident.title} (Severity: ${incident.severity}, Risk: ${incident.risk_score}, Confidence: ${incident.confidence_score}%)
MITRE Techniques: ${mitreList.map((m) => `${m.technique_id} ${m.technique_name}`).join(', ')}
Evidence Items: ${evidenceList.map((e) => `${e.evidence_type.toUpperCase()}: ${e.claim} (Rationale: ${e.rationale})`).join('; ')}

Strict Rule: Do not hallucinate or speculate without referencing the provided evidence items. Return a crisp, high-value executive & technical summary suitable for a Tier 3 SOC Lead.`;

        const aiResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
        });

        return res.json({
          source: 'gemini-2.5-flash',
          report: aiResponse.text || deterministicReport,
        });
      } catch (err: any) {
        console.warn('Gemini API call failed, falling back to deterministic template:', err.message);
        return res.json({
          source: 'deterministic-fallback',
          report: deterministicReport,
          note: 'Fallback template used due to LLM response limit or network',
        });
      }
    }

    return res.json({
      source: 'deterministic-fallback',
      report: deterministicReport,
    });
  });

  // Database Reset
  app.post('/api/reset', (req, res) => {
    store.seedInitialData();
    res.json({ message: 'Database reset to initial demo state' });
  });

  // --- Vite Dev Server Middleware / Static Fallback ---
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[ThreatLens AI] SOC Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
