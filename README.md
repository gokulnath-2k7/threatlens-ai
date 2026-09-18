# ThreatLens AI
### Autonomous Multi-Agent SOC Investigation & Evidence Verification System
**Tagline:** *From Security Alert to Verified Incident Intelligence*

---

## 🎯 Executive Overview
ThreatLens AI transforms high-volume security alerts into verified, actionable incident intelligence by combining **lightweight edge threat detection** with **autonomous multi-agent investigation**, **MITRE ATT&CK mapping**, **evidence verification**, and **human-analyst approved response execution**.

### Core Architecture Workflow
```
Security Logs 
  → Lightweight Detection (ML + Rule Hybrid)
  → Risk Scoring (0–100) & Alert Prioritization
  → Autonomous Multi-Agent Investigation
  → Causal Event Correlation
  → MITRE ATT&CK Mapping
  → Evidence Verification (Supporting vs Contradicting)
  → Explainable Incident Report (Gemini AI + Deterministic Fallback)
  → Safe Response Recommendation Gated by Analyst Approval
  → Tamper-Evident Cryptographic Audit Trail (SHA-256 Hash Chain)
```

---

## 🤖 The 6 Autonomous AI Agents
1. **Detection Agent**: Identifies anomalous behavior patterns using a transparent rule + lightweight ML hybrid model, calculating initial risk.
2. **Investigation Agent**: Queries related security events around user, host, IP, and temporal context window (+/- 30 mins).
3. **Correlation Agent**: Reconstructs the end-to-end multi-stage attack graph across authentication, process execution, and network flow.
4. **MITRE Agent**: Maps concrete observed behaviors to MITRE ATT&CK techniques (`T1110`, `T1078`, `T1087.002`, `T1059.001`, `T1071.001`).
5. **Evidence Verification Agent**: Rigorously evaluates supporting vs contradicting hypotheses, assigning evidentiary strength (`Strong`, `Moderate`, `Weak`) and concluding verdicts: `VERIFIED`, `PARTIALLY VERIFIED`, or `INSUFFICIENT EVIDENCE`.
6. **Response Agent**: Formulates safe, prioritized mitigation steps (`Investigate Endpoint`, `Review Account`, `Reset Credentials`, `Block IP`, `Quarantine Host`) with zero autonomous destructive execution.

---

## 🚀 16-Step Hackathon Live Demonstration Script
1. **Login**: Authenticate as `analyst@threatlens.ai` (Tier 2 SOC Analyst) or `admin@threatlens.ai`.
2. **Open Dashboard**: Review SOC KPIs (Total Alerts, Critical Alerts, Active Incidents, Evidence Verification Rate, Edge Inference metrics).
3. **Open Attack Simulator**: Navigate to the Attack Simulator control panel.
4. **Run Full Attack Chain**: Click **"Run Full Attack Chain"**.
5. **Watch Events Ingested**: See live synthetic events generated (5 failed logins → successful RDP logon → privilege discovery → PowerShell memory download cradle → outbound C2 beacon).
6. **Open Generated Alert**: Inspect real-time alert with risk & confidence calculations.
7. **Start Multi-Agent Investigation**: Click **"Investigate Incident"**.
8. **Witness Autonomous Agent Execution**: Watch the 6 agents run in sequence with real-time status and telemetry logs.
9. **Inspect Attack Timeline**: Review the correlated causal event sequence with payload decoders.
10. **Analyze MITRE ATT&CK Mapping**: View tactic matrix and technique confidence attribution.
11. **Review Evidence Verification**: Compare verified supporting evidence vs disproven benign hypotheses.
12. **Evaluate Risk & Confidence**: Understand the transparent metrics (Risk: 91/100, Confidence: 94%).
13. **Review Response Recommendations**: Examine containment proposals with PowerShell/CLI command previews.
14. **Analyst Approval**: Click **Approve** on critical actions (with optional analyst notes).
15. **Open Audit Trail**: View the tamper-evident SHA-256 cryptographic chain.
16. **Verify Audit Chain**: Click **"Verify Audit Chain"** to confirm mathematical integrity (`VALID`), or test tamper detection!

---

## 🛠 Local Setup & Running

### Option 1: Live Web Application (Node / Vite / Express)
```bash
npm install
npm run dev
# Running on http://localhost:3000
```

### Option 2: Python Backend (FastAPI / SQLAlchemy / PostgreSQL)
```bash
pip install -r requirements.txt
uvicorn backend.app.main:app --reload --port 8000
```

### Option 3: Docker Compose
```bash
docker compose up --build
```
