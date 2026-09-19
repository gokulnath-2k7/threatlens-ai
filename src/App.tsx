import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from './components/Navbar';
import { DashboardView } from './components/DashboardView';
import { AlertsView } from './components/AlertsView';
import { IncidentsView } from './components/IncidentsView';
import { InvestigationView } from './components/InvestigationView';
import { AttackSimulatorView } from './components/AttackSimulatorView';
import { MitreMatrixView } from './components/MitreMatrixView';
import { AgentActivityView } from './components/AgentActivityView';
import { AuditTrailView } from './components/AuditTrailView';
import { SettingsView } from './components/SettingsView';
import { AdminOverviewView } from './components/AdminOverviewView';
import { LoginView } from './components/LoginView';
import {
  User,
  DashboardData,
  Alert,
  Incident,
  IncidentEvent,
  EvidenceItem,
  MitreMapping,
  AgentRun,
  ResponseRecommendation,
  AuditLog,
} from './types';

const DEMO_DASHBOARD_DATA: DashboardData = {
  kpis: {
    total_alerts: 128,
    critical_alerts: 12,
    active_incidents: 7,
    verified_incidents: 5,
    average_risk: 72,
    average_confidence: 89,
    investigation_time_seconds: 48,
    evidence_verification_rate: 94
  },

  alert_trends: [
    { time: '00:00', count: 8, critical: 1 },
    { time: '04:00', count: 12, critical: 2 },
    { time: '08:00', count: 19, critical: 2 },
    { time: '12:00', count: 25, critical: 3 },
    { time: '16:00', count: 31, critical: 2 },
    { time: '20:00', count: 33, critical: 2 }
  ],

  severity_distribution: [
    { name: 'Critical', value: 12, color: '#ef4444' },
    { name: 'High', value: 31, color: '#f97316' },
    { name: 'Medium', value: 49, color: '#eab308' },
    { name: 'Low', value: 36, color: '#22c55e' }
  ],

  threat_categories: [
    { category: 'Credential Attack', count: 28 },
    { category: 'Malware', count: 24 },
    { category: 'Lateral Movement', count: 19 },
    { category: 'Data Exfiltration', count: 16 },
    { category: 'Privilege Escalation', count: 14 },
    { category: 'Reconnaissance', count: 11 }
  ],

  incident_status_breakdown: [
    { status: 'Open', count: 3 },
    { status: 'Investigating', count: 4 },
    { status: 'Contained', count: 5 },
    { status: 'Resolved', count: 9 }
  ],

  mitre_frequency: [
    {
      technique_id: 'T1059',
      name: 'Command and Scripting Interpreter',
      count: 18
    },
    {
      technique_id: 'T1078',
      name: 'Valid Accounts',
      count: 14
    },
    {
      technique_id: 'T1055',
      name: 'Process Injection',
      count: 11
    },
    {
      technique_id: 'T1021',
      name: 'Remote Services',
      count: 9
    },
    {
      technique_id: 'T1041',
      name: 'Exfiltration Over C2 Channel',
      count: 7
    }
  ],

  edge_inference_stats: {
    events_ingested: 12540,
    edge_filtered_clean: 10872,
    dispatched_to_fastapi: 1668,
    avg_latency_ms: 42
  }
};

export default function App() {
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'usr-1',
    username: 'analyst_sarah',
    email: 'analyst@threatlens.ai',
    role: 'analyst',
    name: 'Sarah Chen (Tier 2 SOC Analyst)',
  });

  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
 const [dashboardData, setDashboardData] =
  useState<DashboardData>(DEMO_DASHBOARD_DATA);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>(null);

  // Active incident sub-telemetry
  const [activeIncident, setActiveIncident] = useState<Incident | null>(null);
  const [incidentEvents, setIncidentEvents] = useState<IncidentEvent[]>([]);
  const [evidenceItems, setEvidenceItems] = useState<EvidenceItem[]>([]);
  const [mitreMappings, setMitreMappings] = useState<MitreMapping[]>([]);
  const [agentRuns, setAgentRuns] = useState<AgentRun[]>([]);
  const [recommendations, setRecommendations] = useState<ResponseRecommendation[]>([]);

  // Global agent runs for Agent Activity view
  const [allAgentRuns, setAllAgentRuns] = useState<AgentRun[]>([]);

  // Audit trail
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [auditValid, setAuditValid] = useState<boolean>(true);

  const [isInvestigating, setIsInvestigating] = useState(false);

  // --- Load High-Level Data ---
  const fetchGlobalData = useCallback(async () => {
    try {
      const [dashRes, alertsRes, incRes, auditRes, verifyRes] = await Promise.all([
        fetch('/api/dashboard/summary'),
        fetch('/api/alerts'),
        fetch('/api/incidents'),
        fetch('/api/audit'),
        fetch('/api/audit/verify'),
      ]);

      if (dashRes.ok) setDashboardData(await dashRes.json());
      if (alertsRes.ok) setAlerts(await alertsRes.json());

      if (incRes.ok) {
        const incData: Incident[] = await incRes.json();
        setIncidents(incData);
        if (!selectedIncidentId && incData.length > 0) {
          setSelectedIncidentId(incData[0].id);
        }
      }

      if (auditRes.ok) setAuditLogs(await auditRes.json());
      if (verifyRes.ok) {
        const verifyData = await verifyRes.json();
        setAuditValid(verifyData.valid);
      }
    } catch (err) {
      console.error('Failed to load global SOC data:', err);
    }
  }, [selectedIncidentId]);

  useEffect(() => {
    fetchGlobalData();
  }, [fetchGlobalData]);

  // --- Load Selected Incident Details ---
  const fetchIncidentDetails = useCallback(async (id: string) => {
    try {
      const [incRes, timelineRes, eviRes, mitreRes, agentsRes, recsRes] = await Promise.all([
        fetch(`/api/incidents/${id}`),
        fetch(`/api/incidents/${id}/timeline`),
        fetch(`/api/incidents/${id}/evidence`),
        fetch(`/api/incidents/${id}/mitre`),
        fetch(`/api/incidents/${id}/agents`),
        fetch(`/api/incidents/${id}/recommendations`),
      ]);

      if (incRes.ok) setActiveIncident(await incRes.json());
      if (timelineRes.ok) setIncidentEvents(await timelineRes.json());
      if (eviRes.ok) setEvidenceItems(await eviRes.json());
      if (mitreRes.ok) setMitreMappings(await mitreRes.json());
      if (agentsRes.ok) {
        const agData = await agentsRes.json();
        setAgentRuns(agData);
        setAllAgentRuns((prev) => {
          const map = new Map(prev.map((r) => [r.id, r]));
          agData.forEach((r: AgentRun) => map.set(r.id, r));
          return Array.from(map.values());
        });
      }
      if (recsRes.ok) setRecommendations(await recsRes.json());
    } catch (err) {
      console.error('Failed to load incident details:', err);
    }
  }, []);

  useEffect(() => {
    if (selectedIncidentId) {
      fetchIncidentDetails(selectedIncidentId);
    }
  }, [selectedIncidentId, fetchIncidentDetails]);

  // --- Handlers ---
  const handleRunInvestigation = async (incidentId: string) => {
    setIsInvestigating(true);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/investigate`, {
        method: 'POST',
      });
      if (res.ok) {
        await fetchIncidentDetails(incidentId);
        await fetchGlobalData();
      }
    } finally {
      setIsInvestigating(false);
    }
  };

  const handleApproveRecommendation = async (recId: string, notes?: string) => {
    await fetch(`/api/recommendations/${recId}/approve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analyst: currentUser.name, notes }),
    });
    if (selectedIncidentId) fetchIncidentDetails(selectedIncidentId);
    fetchGlobalData();
  };

  const handleRejectRecommendation = async (recId: string, notes?: string) => {
    await fetch(`/api/recommendations/${recId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analyst: currentUser.name, notes }),
    });
    if (selectedIncidentId) fetchIncidentDetails(selectedIncidentId);
    fetchGlobalData();
  };

  const handleInvestigateFurther = async (recId: string, notes?: string) => {
    await fetch(`/api/recommendations/${recId}/investigate-further`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ analyst: currentUser.name, notes }),
    });
    if (selectedIncidentId) fetchIncidentDetails(selectedIncidentId);
    fetchGlobalData();
  };

  // --- Attack Simulator Handlers ---
  const handleRunFullAttack = async (): Promise<Incident | null> => {
    const res = await fetch('/api/simulator/full-attack', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      await fetchGlobalData();
      setSelectedIncidentId(data.incident.id);
      await fetchIncidentDetails(data.incident.id);
      return data.incident;
    }
    return null;
  };

  const handleSimulateBruteForce = async (): Promise<Alert | null> => {
    const res = await fetch('/api/simulator/bruteforce', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      await fetchGlobalData();
      return data.alert;
    }
    return null;
  };

  const handleSimulatePowerShell = async (): Promise<Alert | null> => {
    const res = await fetch('/api/simulator/powershell', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      await fetchGlobalData();
      return data.alert;
    }
    return null;
  };

  const handleSimulatePortScan = async (): Promise<Alert | null> => {
    const res = await fetch('/api/simulator/portscan', { method: 'POST' });
    if (res.ok) {
      const data = await res.json();
      await fetchGlobalData();
      return data.alert;
    }
    return null;
  };

  // --- Audit Trail Handlers ---
  const handleVerifyAudit = async () => {
    const res = await fetch('/api/audit/verify');
    const result = await res.json();
    setAuditValid(result.valid);
    return result;
  };

  const handleTamperAudit = async () => {
    await fetch('/api/audit/tamper', { method: 'POST' });
    await fetchGlobalData();
  };

  const handleRestoreAudit = async () => {
    await fetch('/api/audit/restore', { method: 'POST' });
    await fetchGlobalData();
  };

  const handleResetDatabase = async () => {
    await fetch('/api/reset', { method: 'POST' });
    await fetchGlobalData();
    if (incidents.length > 0) {
      setSelectedIncidentId(incidents[0].id);
    }
  };

  const handleLoginSuccess = (user: User, targetTab: string = 'dashboard') => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    setActiveTab(targetTab);
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
  };

  const handleUpdateStage = async (stageId: number, notes?: string) => {
    if (!selectedIncidentId) return;
    try {
      const res = await fetch(`/api/incidents/${selectedIncidentId}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: stageId,
          analyst: currentUser.name,
          notes,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.incident) {
          setActiveIncident(data.incident);
          setIncidents((prev) =>
            prev.map((i) => (i.id === data.incident.id ? data.incident : i))
          );
        }
        await fetchIncidentDetails(selectedIncidentId);
      }
    } catch (err) {
      console.error('Failed to update stage:', err);
    }
  };

  if (!isAuthenticated) {
    return (
      <LoginView
        onLoginSuccess={handleLoginSuccess}
        initialRole={currentUser.role}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0f19] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Top Navigation */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
        auditValid={auditValid}
        totalAlerts={alerts.length}
        activeIncidents={incidents.filter((i) => i.status !== 'resolved').length}
        onQuickSimulate={() => {
          setActiveTab('simulator');
        }}
        onLogout={handleLogout}
      />

      {/* Main Container Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {activeTab === 'admin-overview' && (
          <AdminOverviewView
            currentUser={currentUser}
            incidents={incidents}
            onSelectIncident={(id) => {
              setSelectedIncidentId(id);
              setActiveTab('investigation');
            }}
            onNavigateTab={setActiveTab}
            onRunAttackChain={() => {
              handleRunFullAttack().then(() => {
                setActiveTab('investigation');
              });
            }}
          />
        )}
        {activeTab === 'dashboard' && (
          <DashboardView
            data={dashboardData}
            incidents={incidents}
            onSelectIncident={(id) => {
              setSelectedIncidentId(id);
              setActiveTab('investigation');
            }}
            onNavigateTab={setActiveTab}
            onRunAttackChain={() => {
              handleRunFullAttack().then(() => {
                setActiveTab('investigation');
              });
            }}
          />
        )}

        {activeTab === 'alerts' && (
          <AlertsView
            alerts={alerts}
            onSelectIncident={(id) => {
              setSelectedIncidentId(id);
              setActiveTab('investigation');
            }}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'incidents' && (
          <IncidentsView
            incidents={incidents}
            onSelectIncident={(id) => {
              setSelectedIncidentId(id);
              setActiveTab('investigation');
            }}
            onNavigateTab={setActiveTab}
            onRunAttackChain={() => {
              handleRunFullAttack().then(() => {
                setActiveTab('investigation');
              });
            }}
          />
        )}

        {activeTab === 'investigation' && (
          <InvestigationView
            incident={activeIncident}
            events={incidentEvents}
            evidence={evidenceItems}
            mitre={mitreMappings}
            agents={agentRuns}
            recommendations={recommendations}
            currentUser={currentUser}
            onRunInvestigation={handleRunInvestigation}
            onApproveRecommendation={handleApproveRecommendation}
            onRejectRecommendation={handleRejectRecommendation}
            onInvestigateFurther={handleInvestigateFurther}
            onUpdateStage={handleUpdateStage}
            isInvestigating={isInvestigating}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'simulator' && (
          <AttackSimulatorView
            onRunFullAttack={handleRunFullAttack}
            onSimulateBruteForce={handleSimulateBruteForce}
            onSimulatePowerShell={handleSimulatePowerShell}
            onSimulatePortScan={handleSimulatePortScan}
            onSelectIncident={(id) => setSelectedIncidentId(id)}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'mitre' && (
          <MitreMatrixView
            mitreMappings={mitreMappings}
            onSelectIncident={(id) => {
              setSelectedIncidentId(id);
              setActiveTab('investigation');
            }}
            onNavigateTab={setActiveTab}
          />
        )}

        {activeTab === 'agents' && <AgentActivityView agentRuns={allAgentRuns.length > 0 ? allAgentRuns : agentRuns} />}

        {activeTab === 'audit' && (
          <AuditTrailView
            auditLogs={auditLogs}
            auditValid={auditValid}
            onVerifyAudit={handleVerifyAudit}
            onTamperAudit={handleTamperAudit}
            onRestoreAudit={handleRestoreAudit}
          />
        )}

        {activeTab === 'settings' && <SettingsView onResetDatabase={handleResetDatabase} />}
      </main>
    </div>
  );
}
