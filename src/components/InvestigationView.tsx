import React, { useState } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Bot,
  Terminal,
  Server,
  Zap,
  Check,
  X,
  HelpCircle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  FileText,
  Copy,
} from 'lucide-react';
import {
  Incident,
  IncidentEvent,
  EvidenceItem,
  MitreMapping,
  AgentRun,
  ResponseRecommendation,
  User,
} from '../types';
import { AnalystProcessStager } from './AnalystProcessStager';

interface InvestigationViewProps {
  incident: Incident | null;
  events: IncidentEvent[];
  evidence: EvidenceItem[];
  mitre: MitreMapping[];
  agents: AgentRun[];
  recommendations: ResponseRecommendation[];
  currentUser: User;
  onRunInvestigation: (incidentId: string) => Promise<void>;
  onApproveRecommendation: (recId: string, notes?: string) => Promise<void>;
  onRejectRecommendation: (recId: string, notes?: string) => Promise<void>;
  onInvestigateFurther: (recId: string, notes?: string) => Promise<void>;
  onUpdateStage?: (stageId: number, notes?: string) => Promise<void>;
  isInvestigating: boolean;
  onNavigateTab: (tab: string) => void;
}

export const InvestigationView: React.FC<InvestigationViewProps> = ({
  incident,
  events,
  evidence,
  mitre,
  agents,
  recommendations,
  currentUser,
  onRunInvestigation,
  onApproveRecommendation,
  onRejectRecommendation,
  onInvestigateFurther,
  onUpdateStage,
  isInvestigating,
  onNavigateTab,
}) => {
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [actionNotes, setActionNotes] = useState<Record<string, string>>({});
  const [activeTab, setActiveTab] = useState<'timeline' | 'evidence' | 'mitre' | 'response' | 'agents'>('timeline');
  const [aiReportModalOpen, setAiReportModalOpen] = useState(false);
  const [aiReportLoading, setAiReportLoading] = useState(false);
  const [aiReportContent, setAiReportContent] = useState<string | null>(null);
  const [aiReportSource, setAiReportSource] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  if (!incident) {
    return (
      <div className="p-8 text-center bg-slate-900/60 border border-slate-800 rounded-xl space-y-3">
        <Server className="w-12 h-12 text-slate-500 mx-auto" />
        <h3 className="text-base font-semibold text-white">No Incident Selected</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Please select an incident from the Incidents list or trigger a simulated attack chain to start the multi-agent investigation.
        </p>
        <button
          onClick={() => onNavigateTab('incidents')}
          className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-medium rounded-lg"
        >
          View Incidents Queue
        </button>
      </div>
    );
  }

  // Request AI Explainable Report
  const handleGenerateAiReport = async () => {
    setAiReportLoading(true);
    setAiReportModalOpen(true);
    try {
      const res = await fetch('/api/gemini/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ incidentId: incident.id }),
      });
      const data = await res.json();
      setAiReportContent(data.report);
      setAiReportSource(data.source);
    } catch (err) {
      setAiReportContent('Failed to retrieve explainable report. Please verify server connectivity.');
    } finally {
      setAiReportLoading(false);
    }
  };

  const copyToClipboard = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const supportingEvidence = evidence.filter((e) => e.evidence_type === 'supporting');
  const contradictingEvidence = evidence.filter((e) => e.evidence_type === 'contradicting');

  return (
    <div className="space-y-6 pb-16">
      {/* ============================================================ */}
      {/* 1. INCIDENT HEADER CARD (Page 5 & 10 Requirements) */}
      {/* ============================================================ */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-mono text-sm font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-800 px-2 py-0.5 rounded">
                {incident.incident_number}
              </span>

              {/* Major Verification Badge (Page 10 requirement) */}
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-mono font-extrabold tracking-wide uppercase ${
                  incident.verification_status === 'VERIFIED'
                    ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/80 shadow-md shadow-emerald-950/50 glow-cyan'
                    : 'bg-amber-950/90 text-amber-300 border border-amber-600'
                }`}
              >
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                {incident.verification_status}
              </span>

              <span
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold uppercase ${
                  incident.severity === 'critical'
                    ? 'bg-rose-950 text-rose-300 border border-rose-800'
                    : 'bg-amber-950 text-amber-300 border border-amber-800'
                }`}
              >
                {incident.severity}
              </span>

              <span className="text-xs text-slate-400">
                Status: <strong className="text-slate-200 uppercase font-mono">{incident.status}</strong>
              </span>
            </div>

            <h1 className="text-xl font-bold text-white tracking-tight">{incident.title}</h1>
            <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">{incident.description}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={handleGenerateAiReport}
              className="px-3 py-2 bg-gradient-to-r from-purple-900/60 to-indigo-900/60 hover:from-purple-800 hover:to-indigo-800 text-purple-200 border border-purple-700/60 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-400" />
              <span>AI Explainable Report</span>
            </button>

            <button
              onClick={() => onRunInvestigation(incident.id)}
              disabled={isInvestigating}
              className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-md shadow-cyan-600/20 transition-all active:scale-95 disabled:opacity-50"
            >
              {isInvestigating ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Agents Executing...</span>
                </>
              ) : (
                <>
                  <Bot className="w-3.5 h-3.5" />
                  <span>Re-Run Multi-Agent Investigation</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Calculated Metrics Grid (Page 10: "Use actual calculated values, not fake values") */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80">
          {/* Risk Score */}
          <div className="p-3 bg-slate-950/70 border border-rose-900/40 rounded-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-rose-300">Risk Score</span>
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-rose-400 flex items-baseline gap-1">
              <span>{incident.risk_score}</span>
              <span className="text-xs text-slate-500 font-normal">/ 100</span>
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Calculated danger & exploitability</p>
          </div>

          {/* Confidence Score */}
          <div className="p-3 bg-slate-950/70 border border-cyan-900/40 rounded-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-cyan-300">Confidence Score</span>
              <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-cyan-300">
              {incident.confidence_score}%
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Strength of supporting evidence</p>
          </div>

          {/* Supporting Evidence */}
          <div className="p-3 bg-slate-950/70 border border-emerald-900/40 rounded-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-emerald-300">Supporting Evidence</span>
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-emerald-400">
              {supportingEvidence.length} items
            </div>
            <p className="text-[10px] text-slate-400 mt-0.5">Corroborated by telemetry</p>
          </div>

          {/* Contradicting Evidence */}
          <div className="p-3 bg-slate-950/70 border border-slate-800 rounded-lg">
            <div className="flex items-center justify-between text-xs text-slate-400 mb-1">
              <span className="font-semibold text-slate-300">Contradicting Evidence</span>
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
            </div>
            <div className="text-2xl font-bold font-mono text-slate-300">
              {contradictingEvidence.length} items
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Benign hypotheses tested</p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* 2. ANALYST PROCESS STAGING CONTROLLER                        */}
      {/* ============================================================ */}
      {onUpdateStage && (
        <AnalystProcessStager
          incident={incident}
          currentUser={currentUser}
          onUpdateStage={onUpdateStage}
        />
      )}

      {/* ============================================================ */}
      {/* 3. AGENTS EXECUTION STATUS TRACKER (Page 2 & 5 Requirement) */}
      {/* ============================================================ */}
      <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bot className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">Autonomous Multi-Agent Orchestration Pipeline</h3>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            6 Specialized Agents • Sequential Orchestration
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
          {[
            { name: 'Detection', role: 'Initial risk & anomaly' },
            { name: 'Investigation', role: 'Context & entity search' },
            { name: 'Correlation', role: 'Causal timeline graph' },
            { name: 'MITRE', role: 'ATT&CK mapping' },
            { name: 'Verification', role: 'Evidence corroboration' },
            { name: 'Response', role: 'Safe recommendations' },
          ].map((agentMeta) => {
            const run = agents.find((a) => a.agent_name.toLowerCase() === agentMeta.name.toLowerCase());
            const isDone = run?.status === 'completed';

            return (
              <div
                key={agentMeta.name}
                className={`p-2.5 rounded-lg border transition-all ${
                  isDone
                    ? 'bg-slate-950/80 border-emerald-800/60 shadow-sm'
                    : isInvestigating
                    ? 'bg-slate-950/80 border-cyan-700 animate-pulse'
                    : 'bg-slate-950/40 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-semibold text-xs text-slate-200">{agentMeta.name}</span>
                  {isDone ? (
                    <span className="text-emerald-400 font-bold text-xs">✓</span>
                  ) : isInvestigating ? (
                    <div className="w-2.5 h-2.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <span className="text-slate-500 text-xs">○</span>
                  )}
                </div>
                <div className="text-[10px] text-slate-400 leading-tight mb-1">{agentMeta.role}</div>
                {run && (
                  <div className="text-[10px] font-mono text-cyan-400 flex items-center justify-between border-t border-slate-800/80 pt-1 mt-1">
                    <span>{run.execution_time_ms} ms</span>
                    <span className="text-emerald-400">Active</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ============================================================ */}
      {/* 3. INVESTIGATION TABS (Timeline, Evidence, MITRE, Response)   */}
      {/* ============================================================ */}
      <div className="flex border-b border-slate-800 space-x-1 text-xs">
        {[
          { id: 'timeline', label: 'Attack Timeline', count: events.length },
          { id: 'evidence', label: 'Evidence Verification', count: evidence.length },
          { id: 'mitre', label: 'MITRE ATT&CK', count: mitre.length },
          { id: 'response', label: 'Response Recommendations', count: recommendations.length },
          { id: 'agents', label: 'Agent Telemetry Logs', count: agents.length },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-4 py-2.5 font-medium border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === tab.id
                ? 'border-cyan-400 text-cyan-300 bg-cyan-950/20'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
            }`}
          >
            <span>{tab.label}</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                activeTab === tab.id ? 'bg-cyan-900/60 text-cyan-200' : 'bg-slate-800 text-slate-400'
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Tab Content 1: Attack Timeline */}
      {activeTab === 'timeline' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between text-xs text-slate-400">
            <span>
              Chronological Security Events (Correlated Attack Sequence: Brute Force → Successful Login → Suspicious PowerShell → Network Activity)
            </span>
            <span className="font-mono text-cyan-400">{events.length} Correlated Events</span>
          </div>

          <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
            {events.map((item, idx) => {
              const ev = item.security_event;
              const isSelected = selectedEventId === ev.id;

              return (
                <div key={item.id} className="relative group">
                  {/* Timeline dot */}
                  <div
                    className={`absolute -left-6 top-3 w-5 h-5 rounded-full border-2 flex items-center justify-center text-[10px] font-mono font-bold ${
                      ev.severity === 'critical'
                        ? 'bg-rose-950 border-rose-500 text-rose-300'
                        : ev.severity === 'high'
                        ? 'bg-amber-950 border-amber-500 text-amber-300'
                        : 'bg-blue-950 border-blue-500 text-blue-300'
                    }`}
                  >
                    {idx + 1}
                  </div>

                  {/* Event Card */}
                  <div className="p-4 bg-slate-900/90 border border-slate-800/90 rounded-xl hover:border-slate-700 transition-colors shadow-sm space-y-2">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-cyan-400">{ev.id}</span>
                        <span className="text-xs font-semibold text-white">{ev.event_type}</span>
                        <span
                          className={`px-1.5 py-0.2 rounded text-[10px] font-mono uppercase font-bold ${
                            ev.severity === 'critical'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : ev.severity === 'high'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}
                        >
                          {ev.severity}
                        </span>
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-500" />
                          <span className="font-mono">{new Date(ev.timestamp).toLocaleTimeString()}</span>
                        </div>
                        <span className="font-mono text-[11px] bg-slate-950 px-2 py-0.5 rounded text-slate-300">
                          Host: {ev.host}
                        </span>
                      </div>
                    </div>

                    {/* Correlation Reason */}
                    <div className="text-xs text-cyan-300 font-medium bg-cyan-950/40 border border-cyan-900/40 p-2 rounded">
                      🔗 {item.correlation_reason}
                    </div>

                    {/* Meta details */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs font-mono bg-slate-950/60 p-2.5 rounded border border-slate-800/60">
                      <div>
                        <span className="text-slate-500 text-[10px] block">Source IP</span>
                        <span className="text-slate-200">{ev.source_ip}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Target IP</span>
                        <span className="text-slate-200">{ev.destination_ip}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">User Principal</span>
                        <span className="text-slate-200">{ev.username}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 text-[10px] block">Anomaly Score</span>
                        <span className="text-amber-400 font-bold">{ev.anomaly_score.toFixed(2)}</span>
                      </div>
                    </div>

                    {/* Command line if present */}
                    {ev.command_line && (
                      <div className="mt-2">
                        <span className="text-[11px] text-slate-400 font-semibold block mb-1">
                          Captured Command Line Payload:
                        </span>
                        <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-xs font-mono text-emerald-400 break-all select-all flex items-start justify-between gap-2">
                          <span>{ev.command_line}</span>
                          <button
                            onClick={() => copyToClipboard(ev.command_line!, ev.id)}
                            className="text-slate-400 hover:text-white shrink-0 p-1"
                            title="Copy Command"
                          >
                            {copiedId === ev.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Raw payload expander */}
                    {ev.raw_data && (
                      <div>
                        <button
                          onClick={() => setSelectedEventId(isSelected ? null : ev.id)}
                          className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 mt-1"
                        >
                          {isSelected ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                          <span>{isSelected ? 'Hide Raw Telemetry' : 'Inspect Raw Telemetry (JSON)'}</span>
                        </button>
                        {isSelected && (
                          <pre className="mt-2 p-3 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono text-slate-300 overflow-x-auto">
                            {JSON.stringify(ev.raw_data, null, 2)}
                          </pre>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content 2: Evidence Verification (Page 5 Requirement) */}
      {activeTab === 'evidence' && (
        <div className="space-y-6">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between text-xs text-slate-300">
            <span>
              Evidence-Driven Verification: Each claim is verified against concrete security events to eliminate LLM hallucinations.
            </span>
            <span className="font-mono text-emerald-400 font-semibold">
              Verdict: {incident.verification_status}
            </span>
          </div>

          {/* Supporting Evidence List */}
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-emerald-400 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Supporting Evidence ({supportingEvidence.length})</span>
            </h3>

            <div className="space-y-3">
              {supportingEvidence.map((evi) => (
                <div
                  key={evi.id}
                  className="p-4 bg-slate-900/90 border border-emerald-900/40 rounded-xl space-y-2 shadow-sm"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400">{evi.id}</span>
                      <span className="text-xs font-semibold text-white">{evi.claim}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded text-[10px] font-mono font-bold uppercase">
                        Strength: {evi.strength}
                      </span>
                      <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded text-[10px] font-mono font-bold uppercase">
                        {evi.verification_status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                    <strong className="text-slate-400">Verifying Rationale:</strong> {evi.rationale}
                  </p>

                  <div className="flex items-center gap-2 text-[11px] text-slate-400 font-mono pt-1">
                    <span>Referenced Telemetry ID:</span>
                    <span className="text-cyan-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                      {evi.security_event_id}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Contradicting Evidence Hypothesis */}
          <div className="space-y-3 pt-4 border-t border-slate-800">
            <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
              <HelpCircle className="w-4 h-4 text-slate-400" />
              <span>Contradicting Hypotheses Tested ({contradictingEvidence.length})</span>
            </h3>

            <div className="space-y-3">
              {contradictingEvidence.map((evi) => (
                <div
                  key={evi.id}
                  className="p-4 bg-slate-900/70 border border-slate-800 rounded-xl space-y-2 opacity-85"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-400">{evi.id}</span>
                      <span className="text-xs font-semibold text-slate-300">{evi.claim}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded text-[10px] font-mono">
                        Hypothesis Strength: {evi.strength}
                      </span>
                      <span className="px-2 py-0.5 bg-rose-950 text-rose-300 border border-rose-800 rounded text-[10px] font-mono font-bold uppercase">
                        {evi.verification_status}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                    <strong className="text-slate-400">Refutation Finding:</strong> {evi.rationale}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Tab Content 3: MITRE ATT&CK Mapping (Page 5 & 10 Requirement) */}
      {activeTab === 'mitre' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between text-xs text-slate-400">
            <span>
              Autonomous MITRE ATT&CK Behavioral Mapping with telemetry evidence links and confidence scoring.
            </span>
            <span className="font-mono text-cyan-400">{mitre.length} Techniques Mapped</span>
          </div>

          <div className="overflow-x-auto bg-slate-900/90 border border-slate-800 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/60">
                  <th className="py-3 px-4">Technique ID</th>
                  <th className="py-3 px-4">Technique Name</th>
                  <th className="py-3 px-4">Tactic</th>
                  <th className="py-3 px-4">Observed Behavior</th>
                  <th className="py-3 px-4">Evidence</th>
                  <th className="py-3 px-4 text-right">Confidence</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {mitre.map((m) => (
                  <tr key={m.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-cyan-400">
                      <span className="bg-cyan-950 px-2 py-1 rounded border border-cyan-800/80">
                        {m.technique_id}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-200">{m.technique_name}</td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded text-[11px] font-mono bg-purple-950/60 text-purple-300 border border-purple-800/60">
                        {m.tactic}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 max-w-md">{m.observed_behavior}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-slate-400">
                      {m.evidence_ids.join(', ')}
                    </td>
                    <td className="py-3 px-4 text-right font-mono font-bold text-emerald-400">
                      {m.confidence}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content 4: Response Recommendations (Page 6: Approve, Reject, Investigate Further) */}
      {activeTab === 'response' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>
                <strong>Analyst Gated Response Policy:</strong> AI agents formulate containment actions, but never execute destructive commands without human analyst sign-off.
              </span>
            </div>
            <span className="font-mono text-cyan-400 font-semibold">
              Current Analyst: {currentUser.name}
            </span>
          </div>

          <div className="space-y-4">
            {recommendations.map((rec) => {
              const isPending = rec.status === 'pending';
              const isApproved = rec.status === 'approved';
              const isRejected = rec.status === 'rejected';
              const isInvestigatingFurther = rec.status === 'investigating';

              return (
                <div
                  key={rec.id}
                  className={`p-4 rounded-xl border transition-all shadow-md space-y-3 ${
                    isApproved
                      ? 'bg-slate-900/90 border-emerald-700/80'
                      : isRejected
                      ? 'bg-slate-900/60 border-rose-900/40 opacity-75'
                      : isInvestigatingFurther
                      ? 'bg-slate-900/90 border-amber-700/80'
                      : 'bg-slate-900/90 border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                            rec.priority === 'critical'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : rec.priority === 'high'
                              ? 'bg-amber-950 text-amber-300 border border-amber-800'
                              : 'bg-blue-950 text-blue-300 border border-blue-800'
                          }`}
                        >
                          {rec.priority} PRIORITY
                        </span>
                        <h4 className="text-sm font-bold text-white">{rec.title}</h4>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{rec.description}</p>
                    </div>

                    {/* Status badge */}
                    <div className="shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded text-xs font-mono font-bold uppercase ${
                          isApproved
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-600'
                            : isRejected
                            ? 'bg-rose-950 text-rose-300 border border-rose-800'
                            : isInvestigatingFurther
                            ? 'bg-amber-950 text-amber-300 border border-amber-700'
                            : 'bg-slate-800 text-slate-300 border border-slate-700'
                        }`}
                      >
                        {isApproved && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                        {isRejected && <X className="w-3.5 h-3.5 text-rose-400" />}
                        {isInvestigatingFurther && <HelpCircle className="w-3.5 h-3.5 text-amber-400" />}
                        <span>{rec.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* PowerShell command snippet preview */}
                  {rec.command_snippet && (
                    <div className="p-2.5 bg-slate-950 rounded border border-slate-800 text-xs font-mono text-cyan-300 flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 overflow-x-auto">
                        <Terminal className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <code>{rec.command_snippet}</code>
                      </div>
                      <button
                        onClick={() => copyToClipboard(rec.command_snippet!, rec.id)}
                        className="text-slate-400 hover:text-white shrink-0 p-1"
                        title="Copy command"
                      >
                        {copiedId === rec.id ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      </button>
                    </div>
                  )}

                  {/* Decision details if taken */}
                  {rec.human_decision_by && (
                    <div className="text-[11px] text-slate-400 bg-slate-950/60 p-2 rounded border border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
                      <div>
                        Decided by <strong className="text-slate-200">{rec.human_decision_by}</strong> at{' '}
                        {new Date(rec.human_decision_at || '').toLocaleString()}
                      </div>
                      <div className="text-slate-300 italic font-sans">"{rec.human_notes}"</div>
                    </div>
                  )}

                  {/* Action Controls (Approve, Reject, Investigate Further) */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-2 border-t border-slate-800/60">
                    <input
                      type="text"
                      placeholder="Optional analyst justification / notes..."
                      value={actionNotes[rec.id] || ''}
                      onChange={(e) =>
                        setActionNotes({
                          ...actionNotes,
                          [rec.id]: e.target.value,
                        })
                      }
                      className="px-2.5 py-1.5 bg-slate-950 border border-slate-800 rounded text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 flex-1"
                    />

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => onApproveRecommendation(rec.id, actionNotes[rec.id])}
                        disabled={isApproved}
                        className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
                      >
                        <Check className="w-3 h-3" />
                        <span>Approve</span>
                      </button>

                      <button
                        onClick={() => onRejectRecommendation(rec.id, actionNotes[rec.id])}
                        disabled={isRejected}
                        className="px-3 py-1.5 bg-rose-900 hover:bg-rose-800 disabled:opacity-50 text-rose-200 rounded text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
                      >
                        <X className="w-3 h-3" />
                        <span>Reject</span>
                      </button>

                      <button
                        onClick={() => onInvestigateFurther(rec.id, actionNotes[rec.id])}
                        disabled={isInvestigatingFurther}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 rounded text-xs font-semibold flex items-center gap-1 transition-all active:scale-95"
                      >
                        <HelpCircle className="w-3 h-3" />
                        <span>Investigate Further</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab Content 5: Agent Telemetry Logs */}
      {activeTab === 'agents' && (
        <div className="space-y-4">
          <div className="p-3 bg-slate-900/60 border border-slate-800 rounded-lg flex items-center justify-between text-xs text-slate-400">
            <span>Detailed execution traces from the 6 autonomous agents for this incident.</span>
            <span className="font-mono text-cyan-400">{agents.length} Agent Traces</span>
          </div>

          <div className="space-y-3">
            {agents.map((agent) => (
              <div
                key={agent.id}
                className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold">
                      {agent.agent_name} Agent
                    </span>
                    <span className="text-xs text-emerald-400 font-semibold font-mono">
                      Status: {agent.status.toUpperCase()}
                    </span>
                  </div>
                  <div className="text-xs font-mono text-slate-400">
                    Duration: <strong className="text-white">{agent.execution_time_ms} ms</strong>
                  </div>
                </div>

                <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
                  {agent.summary}
                </p>

                {agent.output_data && (
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono tracking-wider block mb-1">
                      Structured Agent Output:
                    </span>
                    <pre className="p-2.5 bg-slate-950 rounded border border-slate-800/80 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                      {JSON.stringify(agent.output_data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ============================================================ */}
      {/* AI EXPLAINABLE REPORT MODAL                                  */}
      {/* ============================================================ */}
      {aiReportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0f172a] border border-slate-700 rounded-xl w-full max-w-3xl max-h-[85vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-400" />
                <div>
                  <h3 className="text-sm font-bold text-white">
                    ThreatLens Explainable Incident Intelligence Report
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Incident: {incident.incident_number} • Engine: {aiReportSource || 'Gemini 2.5 Flash'}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setAiReportModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 overflow-y-auto space-y-4 text-xs text-slate-200 leading-relaxed font-sans">
              {aiReportLoading ? (
                <div className="flex flex-col items-center justify-center py-12 space-y-3">
                  <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-purple-300">
                    Synthesizing multi-agent evidence & telemetry into structured intelligence report...
                  </p>
                </div>
              ) : (
                <div className="prose prose-invert max-w-none text-xs leading-relaxed space-y-3 whitespace-pre-wrap font-mono">
                  {aiReportContent}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-3 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between">
              <span className="text-[11px] text-slate-400">
                Grounded in actual security event telemetry • Zero hallucination protocol
              </span>
              <button
                onClick={() => setAiReportModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold rounded-lg"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
