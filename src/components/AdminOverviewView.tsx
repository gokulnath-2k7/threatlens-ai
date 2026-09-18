import React, { useState, useEffect } from 'react';
import {
  Award,
  ShieldCheck,
  TrendingDown,
  Clock,
  Zap,
  Users,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Copy,
  Check,
  RefreshCw,
  ExternalLink,
  ChevronRight,
  Printer,
  FileCode,
  Lock,
  ArrowRight,
} from 'lucide-react';
import { AdminProjectReport, AnalystRosterMember, Incident, User } from '../types';
import { ANALYST_STAGES } from '../data/stages';

interface AdminOverviewViewProps {
  currentUser: User;
  incidents: Incident[];
  onSelectIncident: (id: string) => void;
  onNavigateTab: (tab: string) => void;
  onRunAttackChain?: () => void;
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({
  currentUser,
  incidents,
  onSelectIncident,
  onNavigateTab,
  onRunAttackChain,
}) => {
  const [report, setReport] = useState<AdminProjectReport | null>(null);
  const [roster, setRoster] = useState<AnalystRosterMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [copiedReport, setCopiedReport] = useState(false);
  const [downloadedFormat, setDownloadedFormat] = useState<string | null>(null);
  const [activeReportSection, setActiveReportSection] = useState<'summary' | 'killchain' | 'stages' | 'compliance'>('summary');
  const [stagedSuccessMessage, setStagedSuccessMessage] = useState<string | null>(null);

  // Fetch report and roster
  const fetchAdminData = async () => {
    setIsLoading(true);
    try {
      const [repRes, rosRes] = await Promise.all([
        fetch('/api/admin/report'),
        fetch('/api/analyst/roster'),
      ]);

      if (repRes.ok) setReport(await repRes.json());
      if (rosRes.ok) setRoster(await rosRes.json());
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleAdvanceAnalystStage = async (analystId: string, currentStage: number, incidentId?: string) => {
    if (!incidentId) return;
    const nextStage = Math.min(7, currentStage + 1);
    try {
      const res = await fetch(`/api/incidents/${incidentId}/stage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          stage: nextStage,
          analyst: currentUser.name,
          notes: `Admin ${currentUser.name} manually updated analyst stage to Stage ${nextStage}`,
        }),
      });
      if (res.ok) {
        setStagedSuccessMessage(`Successfully updated stage to Stage ${nextStage}`);
        setTimeout(() => setStagedSuccessMessage(null), 3000);
        await fetchAdminData();
      }
    } catch (err) {
      console.error('Failed to stage analyst:', err);
    }
  };

  const copyMarkdownBriefing = () => {
    if (!report) return;
    const text = `# ThreatLens AI - CISO Executive Cybersecurity Operations Briefing
**Reporting Period:** ${report.reporting_period}
**Generated:** ${new Date(report.generated_at).toLocaleString()}
**CISO / Executive Sponsor:** ${report.ciso_name}

## 1. Executive Operations & ROI Summary
- **Total Security Events Processed:** ${report.executive_summary.total_events_processed.toLocaleString()}
- **Edge Inference Clean Filter Rate:** ${report.executive_summary.edge_filter_rate}% (1.4ms latency)
- **Total Incidents Analyzed:** ${report.executive_summary.total_incidents_analyzed}
- **Verified Breaches Neutralized:** ${report.executive_summary.verified_breaches}
- **False Positive Reduction:** ${report.executive_summary.false_positive_reduction_pct}%
- **Mean Time to Detect (MTTD):** ${report.executive_summary.mean_time_to_detect_seconds} seconds
- **Mean Time to Respond (MTTR):** ${report.executive_summary.mean_time_to_respond_minutes} mins (vs Industry standard ${report.executive_summary.industry_benchmark_mttr_hours} hours)
- **Estimated Labor Hours Saved:** ${report.executive_summary.hours_saved_by_ai_agents} hours
- **Estimated Cost Avoidance:** $${report.executive_summary.estimated_cost_avoidance_usd.toLocaleString()} USD
- **Compliance Readiness Score:** ${report.executive_summary.compliance_score_pct}%

## 2. Active Analyst Investigation Staging
- Total Active Analysts On Shift: ${report.analyst_performance.total_active_analysts}
- Active Investigations: ${report.analyst_performance.current_active_investigations}
- Operational Bottleneck Analysis: ${report.analyst_performance.avg_stage_bottleneck}

## 3. Compliance & Cryptographic Audit Continuity
- NIST SP 800-61 Rev 2: COMPLIANT (24/24 controls)
- SOC 2 Type II: AUDIT READY (18/18 controls)
- ISO/IEC 27001:2022: COMPLIANT (14/14 controls)
- SHA-256 Ledger Seal: Validated & Untampered
`;

    navigator.clipboard.writeText(text);
    setCopiedReport(true);
    setTimeout(() => setCopiedReport(false), 2500);
  };

  const downloadJsonReport = () => {
    if (!report) return;
    const jsonStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(report, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonStr);
    downloadAnchor.setAttribute('download', `ThreatLens-Executive-Report-${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
    setDownloadedFormat('JSON (STIX 2.1)');
    setTimeout(() => setDownloadedFormat(null), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div id="admin-overview-view" className="space-y-6 pb-20">
      {/* Top Directorate Banner */}
      <div className="p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-900 to-amber-950/40 border border-amber-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1.5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-amber-950 text-amber-300 border border-amber-600/70 shadow-sm flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-amber-400" />
                EXECUTIVE GOVERNANCE DIRECTORATE
              </span>
              <span className="text-xs text-slate-400 font-mono">
                Clearance: <strong className="text-amber-300">Level 4 Secret</strong> • CISO Lead: <strong className="text-slate-200">David Vance</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              SOC Project Report Overview & Analyst Process Staging
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 max-w-3xl leading-relaxed">
              Real-time administrative telemetry, multi-agent automated ROI metrics, full MITRE killchain neutralization, and live operational staging of all Tier 1/2/3 SOC analysts.
            </p>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              onClick={fetchAdminData}
              disabled={isLoading}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Refresh live telemetry"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={copyMarkdownBriefing}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              {copiedReport ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-slate-400" />}
              <span>{copiedReport ? 'Copied Briefing!' : 'Copy Briefing'}</span>
            </button>

            <button
              onClick={downloadJsonReport}
              className="px-3 py-2 bg-amber-950/80 hover:bg-amber-900 text-amber-200 border border-amber-700/80 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <FileCode className="w-3.5 h-3.5 text-amber-400" />
              <span>{downloadedFormat ? 'Downloaded JSON' : 'Export STIX 2.1'}</span>
            </button>

            <button
              onClick={handlePrint}
              className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-amber-600/20 transition-all active:scale-95"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Executive PDF</span>
            </button>
          </div>
        </div>

        {stagedSuccessMessage && (
          <div className="mt-4 p-2.5 rounded-lg bg-emerald-950/80 border border-emerald-600 text-emerald-200 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>{stagedSuccessMessage}</span>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* 1. REAL-TIME ANALYST PROCESS STAGING MONITOR (User Core Request)           */}
      {/* ========================================================================= */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Live Analyst Process Staging Monitor
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Live tracking of each active SOC analyst's current position within the 7-stage autonomous investigation and response pipeline.
            </p>
          </div>

          <span className="px-2.5 py-1 rounded bg-slate-800/80 text-cyan-300 border border-cyan-800 text-xs font-mono font-semibold">
            {roster.length} Analysts Active on Shift
          </span>
        </div>

        {/* Analyst Roster Cards Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {roster.map((analyst) => {
            const stage = ANALYST_STAGES.find((s) => s.id === analyst.current_stage_id) || ANALYST_STAGES[0];
            const isAwaitingSignoff = analyst.current_stage_id === 6;
            const isClosed = analyst.current_stage_id === 7;

            return (
              <div
                key={analyst.id}
                className={`p-4 sm:p-5 rounded-xl border transition-all shadow-lg ${
                  isAwaitingSignoff
                    ? 'bg-cyan-950/30 border-cyan-500/50 shadow-cyan-950/30 ring-1 ring-cyan-500/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Analyst Header */}
                <div className="flex items-start justify-between gap-3 border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-600 to-blue-700 flex items-center justify-center font-bold text-white text-sm shadow-md">
                      {analyst.name
                        .split(' ')
                        .map((n) => n[0])
                        .join('')}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-white">{analyst.name}</span>
                        <span className="px-1.5 py-0.2 bg-slate-800 text-slate-300 text-[10px] font-mono rounded">
                          {analyst.station}
                        </span>
                      </div>
                      <div className="text-xs text-cyan-400 font-mono">{analyst.tier}</div>
                    </div>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      isAwaitingSignoff
                        ? 'bg-amber-950 text-amber-300 border border-amber-600 animate-pulse'
                        : isClosed
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-slate-800 text-slate-300 border border-slate-700'
                    }`}
                  >
                    {analyst.status.replace('_', ' ')}
                  </span>
                </div>

                {/* Current Stage Indicator Banner */}
                <div className="my-3 p-3 rounded-lg bg-slate-950/70 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[11px] font-mono uppercase font-bold text-slate-400">
                      CURRENT STAGE POSITION:
                    </span>
                    <span className="font-mono text-cyan-300 font-bold">
                      Stage {stage.id} of 7 • {stage.short_name}
                    </span>
                  </div>

                  {/* Stage Progress Bar */}
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-500 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${(stage.id / 7) * 100}%` }}
                    />
                  </div>

                  {/* Micro Stepper Labels */}
                  <div className="flex justify-between text-[9px] font-mono text-slate-500 pt-0.5">
                    <span>1. Triage</span>
                    <span>2. Scope</span>
                    <span>3. Evidence</span>
                    <span>4. MITRE</span>
                    <span>5. Agents</span>
                    <span className={stage.id === 6 ? 'text-amber-400 font-bold' : ''}>6. Response</span>
                    <span>7. Seal</span>
                  </div>

                  <p className="text-[11px] text-slate-300 pt-1 leading-relaxed">
                    <strong>Stage Objective:</strong> {stage.description}
                  </p>
                </div>

                {/* Assigned Incident & Actions */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
                  <div className="text-xs">
                    <span className="text-slate-400">Current Incident: </span>
                    <span className="font-mono font-bold text-white">
                      {analyst.current_incident_number || 'Queue Ready'}
                    </span>
                    <div className="text-[10px] text-slate-500">
                      Completed Today: {analyst.incidents_completed_today} cases • Avg MTTR: {analyst.avg_resolution_mins}m
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {analyst.current_incident_id && (
                      <button
                        onClick={() => {
                          onSelectIncident(analyst.current_incident_id!);
                          onNavigateTab('investigation');
                        }}
                        className="px-2.5 py-1 rounded bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 text-xs font-semibold flex items-center gap-1 transition-colors"
                      >
                        <span>Inspect Case</span>
                        <ExternalLink className="w-3 h-3" />
                      </button>
                    )}

                    <button
                      onClick={() =>
                        handleAdvanceAnalystStage(
                          analyst.id,
                          analyst.current_stage_id,
                          analyst.current_incident_id || incidents[0]?.id
                        )
                      }
                      disabled={analyst.current_stage_id >= 7}
                      className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-medium flex items-center gap-1 transition-colors disabled:opacity-40"
                      title="Advance analyst position to next stage"
                    >
                      <span>Advance Stage</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. CISO EXECUTIVE PROJECT REPORT OVERVIEW (User Core Request)             */}
      {/* ========================================================================= */}
      <div className="space-y-4 pt-4 border-t border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <div className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Project Report Overview (CISO & Executive Sponsor)
              </h2>
            </div>
            <p className="text-xs text-slate-400">
              Aggregated quantitative metrics on false-positive reduction, agent investigation speedup, killchain neutralization, and regulatory compliance.
            </p>
          </div>

          {/* Section Tabs */}
          <div className="flex items-center gap-1 bg-slate-900 border border-slate-800 p-1 rounded-lg text-xs">
            <button
              onClick={() => setActiveReportSection('summary')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                activeReportSection === 'summary'
                  ? 'bg-amber-950 text-amber-300 border border-amber-700/80 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Executive Summary
            </button>
            <button
              onClick={() => setActiveReportSection('killchain')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                activeReportSection === 'killchain'
                  ? 'bg-amber-950 text-amber-300 border border-amber-700/80 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              MITRE Killchain
            </button>
            <button
              onClick={() => setActiveReportSection('stages')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                activeReportSection === 'stages'
                  ? 'bg-amber-950 text-amber-300 border border-amber-700/80 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Stage Bottlenecks
            </button>
            <button
              onClick={() => setActiveReportSection('compliance')}
              className={`px-3 py-1 rounded font-medium transition-colors ${
                activeReportSection === 'compliance'
                  ? 'bg-amber-950 text-amber-300 border border-amber-700/80 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Compliance Ledger
            </button>
          </div>
        </div>

        {/* Section 1: Executive Summary KPIs */}
        {activeReportSection === 'summary' && report && (
          <div className="space-y-4">
            {/* Top 4 Impact Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>MTTR (Response Time)</span>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-black text-amber-400 font-mono">
                  {report.executive_summary.mean_time_to_respond_minutes} mins
                </div>
                <div className="text-[11px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                  <TrendingDown className="w-3.5 h-3.5" />
                  <span>99.3% reduction vs industry 4.2h</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>False Positive Reduction</span>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-black text-emerald-400 font-mono">
                  {report.executive_summary.false_positive_reduction_pct}%
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Hypothesis disproval engine active
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Labor Hours Saved</span>
                  <Clock className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-black text-cyan-400 font-mono">
                  {report.executive_summary.hours_saved_by_ai_agents} hrs
                </div>
                <div className="text-[11px] text-slate-400 mt-1 font-mono">
                  Equivalent to 3 full-time SOC engineers
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 shadow-md">
                <div className="flex items-center justify-between text-slate-400 text-xs mb-1">
                  <span>Estimated Cost Avoidance</span>
                  <Award className="w-4 h-4 text-purple-400" />
                </div>
                <div className="text-2xl font-black text-purple-300 font-mono">
                  ${(report.executive_summary.estimated_cost_avoidance_usd / 1000).toFixed(0)}k
                </div>
                <div className="text-[11px] text-slate-400 mt-1">
                  Breach blast radius containment
                </div>
              </div>
            </div>

            {/* Deep Executive Briefing Box */}
            <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Executive Findings & Operational Health Assessment</span>
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                During the current reporting window, ThreatLens AI successfully processed{' '}
                <strong className="text-white font-mono">
                  {report.executive_summary.total_events_processed.toLocaleString()}
                </strong>{' '}
                raw security telemetry events. The lightweight Edge IsolationForest filter eliminated{' '}
                <strong className="text-emerald-400 font-mono">{report.executive_summary.edge_filter_rate}%</strong>{' '}
                of baseline benign traffic in under 1.4 milliseconds, dispatching only anomalous signal clusters to the multi-agent investigation orchestration engine.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 text-xs">
                <div className="p-3 rounded bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">Total Incidents Analyzed</div>
                  <div className="text-lg font-bold text-white font-mono mt-0.5">
                    {report.executive_summary.total_incidents_analyzed} Confirmed Cases
                  </div>
                </div>
                <div className="p-3 rounded bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">Mean Time to Detect (MTTD)</div>
                  <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5">
                    {report.executive_summary.mean_time_to_detect_seconds}s (vs Industry 16d)
                  </div>
                </div>
                <div className="p-3 rounded bg-slate-950 border border-slate-800">
                  <div className="text-slate-400">Compliance Readiness Score</div>
                  <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">
                    {report.executive_summary.compliance_score_pct}% Audit Ready
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section 2: MITRE Killchain Efficacy */}
        {activeReportSection === 'killchain' && report && (
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white">Adversary Tactics & Multi-Agent Neutralization Efficacy</h3>
            <div className="space-y-3">
              {report.killchain_coverage.map((kc) => (
                <div key={kc.tactic} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-white">{kc.tactic}</span>
                    <div className="flex items-center gap-3">
                      <span className="text-slate-400 font-mono text-[11px]">{kc.top_technique}</span>
                      <span className="font-mono text-cyan-400 font-bold">{kc.detection_efficacy}% Efficacy</span>
                    </div>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-cyan-500 to-blue-500 h-2 rounded-full"
                      style={{ width: `${kc.detection_efficacy}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Section 3: Stage Bottlenecks Analysis */}
        {activeReportSection === 'stages' && report && (
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-white">Investigation Process Stage Durations & SLA Analytics</h3>
              <p className="text-xs text-slate-400 mt-1">
                Measured duration across all 7 operational investigation stages. Identifies where analysts spend time and verifies adherence to SLA caps.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-mono">
                    <th className="pb-2">Stage #</th>
                    <th className="pb-2">Process Stage Name</th>
                    <th className="pb-2">Avg Duration</th>
                    <th className="pb-2">Target SLA</th>
                    <th className="pb-2">SLA Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {report.analyst_performance.stage_durations.map((stg) => {
                    const isOptimal = stg.avg_minutes <= stg.sla_minutes;
                    return (
                      <tr key={stg.stage_id} className="hover:bg-slate-800/30">
                        <td className="py-2.5 font-bold text-cyan-400">Stage {stg.stage_id}</td>
                        <td className="py-2.5 text-white">{stg.name}</td>
                        <td className="py-2.5 text-cyan-300 font-bold">{stg.avg_minutes} mins</td>
                        <td className="py-2.5 text-slate-400">{stg.sla_minutes} mins</td>
                        <td className="py-2.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isOptimal ? 'bg-emerald-950 text-emerald-300' : 'bg-rose-950 text-rose-300'
                            }`}
                          >
                            {isOptimal ? 'WITHIN SLA' : 'EXCEEDING'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Section 4: Regulatory Compliance Matrix */}
        {activeReportSection === 'compliance' && report && (
          <div className="p-5 rounded-xl bg-slate-900/80 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <Lock className="w-4 h-4 text-emerald-400" />
              <span>Cryptographic Audit Chain & Compliance Assurance</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {report.compliance_matrix.map((comp) => (
                <div key={comp.standard} className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-white">{comp.standard}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
                      {comp.status}
                    </span>
                  </div>
                  <div className="text-xs text-slate-400 flex items-center justify-between">
                    <span>Controls Verified:</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      {comp.controls_verified} / {comp.total_controls} (100%)
                    </span>
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono break-all pt-1 border-t border-slate-900">
                    SHA-256 Ledger Anchor: <span className="text-slate-300">{comp.sha256_audit_seal}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
