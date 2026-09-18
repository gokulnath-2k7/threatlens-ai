import React from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Clock,
  Zap,
  TrendingUp,
  Cpu,
  ArrowRight,
  Shield,
  Layers,
  Search,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from 'recharts';
import { DashboardData, Incident } from '../types';

interface DashboardViewProps {
  data: DashboardData | null;
  incidents: Incident[];
  onSelectIncident: (incidentId: string) => void;
  onNavigateTab: (tab: string) => void;
  onRunAttackChain: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  data,
  incidents,
  onSelectIncident,
  onNavigateTab,
  onRunAttackChain,
}) => {
  if (!data) {
    return (
      <div className="flex items-center justify-center h-96 text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
          <span>Loading SOC telemetry data...</span>
        </div>
      </div>
    );
  }

  const { kpis, alert_trends, severity_distribution, threat_categories, mitre_frequency, edge_inference_stats } = data;

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner / Scenario Highlight */}
      <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 via-slate-900 to-cyan-950/40 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-lg">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-400 border border-cyan-700 text-xs font-mono font-semibold">
              HACKATHON DEMO SCENARIO READY
            </span>
            <span className="text-xs text-slate-400">ThreatLens Multi-Agent Pipeline</span>
          </div>
          <h2 className="text-lg font-bold text-white tracking-tight">
            Autonomous Multi-Agent SOC Investigation & Evidence Verification
          </h2>
          <p className="text-xs text-slate-400 max-w-2xl">
            From raw endpoint/network logs to verified incident intelligence with transparent Risk (XX/100), Confidence (XX%), and gated analyst response approval.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={onRunAttackChain}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold rounded-lg shadow-md shadow-cyan-500/20 flex items-center gap-2 transition-all active:scale-95"
          >
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>Simulate Full Attack Chain</span>
          </button>
          <button
            onClick={() => onNavigateTab('simulator')}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-lg border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <span>Open Simulator</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 8 Dashboard KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
        {/* KPI 1: Total Alerts */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-lg p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Total Alerts</span>
            <AlertTriangle className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{kpis.total_alerts}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Ingested today</div>
        </div>

        {/* KPI 2: Critical Alerts */}
        <div className="bg-slate-900/90 border border-rose-900/30 rounded-lg p-3 hover:border-rose-700/50 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-rose-300">Critical Alerts</span>
            <AlertTriangle className="w-3.5 h-3.5 text-rose-500" />
          </div>
          <div className="text-2xl font-bold text-rose-400 font-mono">{kpis.critical_alerts}</div>
          <div className="text-[10px] text-rose-400/80 mt-0.5">Priority triage</div>
        </div>

        {/* KPI 3: Active Incidents */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-lg p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Active Incidents</span>
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-amber-300 font-mono">{kpis.active_incidents}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">In investigation</div>
        </div>

        {/* KPI 4: Verified Incidents */}
        <div className="bg-slate-900/90 border border-emerald-900/40 rounded-lg p-3 hover:border-emerald-700/50 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider text-emerald-300">Verified</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-emerald-400 font-mono">{kpis.verified_incidents}</div>
          <div className="text-[10px] text-emerald-500 mt-0.5">By multi-agent</div>
        </div>

        {/* KPI 5: Average Risk */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-lg p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Avg Risk</span>
            <TrendingUp className="w-3.5 h-3.5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono flex items-baseline gap-1">
            <span>{kpis.average_risk}</span>
            <span className="text-xs text-slate-500 font-normal">/100</span>
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Calculated danger</div>
        </div>

        {/* KPI 6: Average Confidence */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-lg p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Avg Confidence</span>
            <Shield className="w-3.5 h-3.5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-cyan-300 font-mono">{kpis.average_confidence}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Evidence strength</div>
        </div>

        {/* KPI 7: Investigation Time */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-lg p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Invest. Time</span>
            <Clock className="w-3.5 h-3.5 text-slate-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono flex items-baseline gap-1">
            <span>{kpis.investigation_time_seconds}</span>
            <span className="text-xs text-slate-500 font-normal">sec</span>
          </div>
          <div className="text-[10px] text-emerald-400 mt-0.5">vs 45m human</div>
        </div>

        {/* KPI 8: Evidence Verification Rate */}
        <div className="bg-slate-900/90 border border-slate-800/90 rounded-lg p-3 hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between text-slate-400 mb-1">
            <span className="text-[11px] font-medium uppercase tracking-wider">Verif. Rate</span>
            <Layers className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-2xl font-bold text-white font-mono">{kpis.evidence_verification_rate}%</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Zero unbacked claims</div>
        </div>
      </div>

      {/* Edge Inference Stage Pipeline Architecture Concept */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-semibold text-white">
              Edge Inference & Ingestion Pipeline (Lightweight Local Stage)
            </h3>
          </div>
          <span className="text-xs font-mono text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
            Avg Edge Latency: {edge_inference_stats.avg_latency_ms} ms
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-2 text-xs">
          <div className="p-3 bg-slate-950/70 border border-slate-800/80 rounded-lg">
            <div className="text-[11px] font-semibold text-slate-300 mb-1">1. Local Events</div>
            <div className="text-lg font-bold font-mono text-white">
              {edge_inference_stats.events_ingested.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Raw Windows, Sysmon, Zeek</p>
          </div>

          <div className="p-3 bg-slate-950/70 border border-cyan-900/30 rounded-lg">
            <div className="text-[11px] font-semibold text-cyan-300 mb-1">2. Lightweight Detection</div>
            <div className="text-lg font-bold font-mono text-cyan-400">
              {edge_inference_stats.edge_filtered_clean.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Pre-filtered clean at edge</p>
          </div>

          <div className="p-3 bg-slate-950/70 border border-amber-900/40 rounded-lg">
            <div className="text-[11px] font-semibold text-amber-300 mb-1">3. Suspicious Events</div>
            <div className="text-lg font-bold font-mono text-amber-400">
              {edge_inference_stats.dispatched_to_fastapi.toLocaleString()}
            </div>
            <p className="text-[10px] text-slate-500 mt-0.5">Exceeds anomaly threshold</p>
          </div>

          <div className="p-3 bg-slate-950/70 border border-blue-900/40 rounded-lg">
            <div className="text-[11px] font-semibold text-blue-300 mb-1">4. FastAPI / Backend</div>
            <div className="text-lg font-bold font-mono text-blue-400">Prioritized</div>
            <p className="text-[10px] text-slate-500 mt-0.5">PostgreSQL & Alert Router</p>
          </div>

          <div className="p-3 bg-slate-950/70 border border-emerald-900/40 rounded-lg">
            <div className="text-[11px] font-semibold text-emerald-300 mb-1">5. Multi-Agent System</div>
            <div className="text-lg font-bold font-mono text-emerald-400">6 Agents</div>
            <p className="text-[10px] text-slate-500 mt-0.5">Correlate & Verify Evidence</p>
          </div>
        </div>
      </div>

      {/* Recharts Data Visualizations Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Chart 1: Alert Trends */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Security Event & Alert Trends (24h)</h3>
              <p className="text-xs text-slate-400">Time-series ingestion volume vs critical alert spikes</p>
            </div>
            <span className="text-[11px] font-mono text-cyan-400 bg-slate-800 px-2 py-0.5 rounded">Live Telemetry</span>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={alert_trends}>
                <defs>
                  <linearGradient id="alertCountGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="critGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.5} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} />
                <YAxis stroke="#64748b" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', fontSize: '12px' }}
                />
                <Area type="monotone" dataKey="count" name="Total Events" stroke="#06b6d4" fillOpacity={1} fill="url(#alertCountGrad)" />
                <Area type="monotone" dataKey="critical" name="Critical Alerts" stroke="#ef4444" fillOpacity={1} fill="url(#critGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Severity Distribution */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Alert Severity Distribution</h3>
              <p className="text-xs text-slate-400">Current triage queue classification</p>
            </div>
          </div>
          <div className="h-56 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={severity_distribution}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {severity_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', fontSize: '12px' }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-slate-300 text-xs">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 3: Threat Categories */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Threat Categories Breakdown</h3>
              <p className="text-xs text-slate-400">Detected vectors across enterprise telemetry</p>
            </div>
          </div>
          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={threat_categories} layout="vertical" margin={{ top: 5, right: 20, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" fontSize={11} />
                <YAxis dataKey="category" type="category" stroke="#94a3b8" fontSize={11} width={90} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '6px', fontSize: '12px' }}
                />
                <Bar dataKey="count" name="Detections" fill="#3b82f6" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 4: Top MITRE ATT&CK Techniques */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-semibold text-white">Top MITRE ATT&CK Techniques</h3>
              <p className="text-xs text-slate-400">Mapped behaviors with evidence confirmation</p>
            </div>
            <button
              onClick={() => onNavigateTab('mitre')}
              className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
            >
              <span>View Matrix</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div className="space-y-2.5">
            {mitre_frequency.map((tech) => (
              <div key={tech.technique_id} className="flex items-center justify-between p-2 rounded bg-slate-950/60 border border-slate-800/80">
                <div className="flex items-center gap-2">
                  <span className="px-1.5 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800/60 rounded text-[11px] font-mono font-bold">
                    {tech.technique_id}
                  </span>
                  <span className="text-xs text-slate-200 font-medium">{tech.name}</span>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-24 bg-slate-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
                    <div
                      className="bg-cyan-500 h-full rounded-full"
                      style={{ width: `${Math.min(100, (tech.count / 20) * 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-mono text-slate-400">{tech.count} events</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Active Incidents Table */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-sm font-semibold text-white">Active Investigated Incidents</h3>
            <p className="text-xs text-slate-400">
              Autonomous multi-agent verified security incidents requiring analyst review
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('incidents')}
            className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
          >
            <span>View All Incidents</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 bg-slate-950/40">
                <th className="py-2.5 px-3">Incident #</th>
                <th className="py-2.5 px-3">Title</th>
                <th className="py-2.5 px-3">Severity</th>
                <th className="py-2.5 px-3">Risk</th>
                <th className="py-2.5 px-3">Confidence</th>
                <th className="py-2.5 px-3">Verification Status</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {incidents.slice(0, 4).map((inc) => (
                <tr key={inc.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-3 font-mono font-semibold text-cyan-400">{inc.incident_number}</td>
                  <td className="py-3 px-3">
                    <div className="font-medium text-slate-200">{inc.title}</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">{inc.scenario || 'Correlated Killchain'}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                        inc.severity === 'critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : inc.severity === 'high'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}
                    >
                      {inc.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-rose-400">{inc.risk_score}</span>
                    <span className="text-[10px] text-slate-500">/100</span>
                  </td>
                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-cyan-400">{inc.confidence_score}%</span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold ${
                        inc.verification_status === 'VERIFIED'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                          : 'bg-amber-950 text-amber-300 border border-amber-700'
                      }`}
                    >
                      <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                      {inc.verification_status}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => onSelectIncident(inc.id)}
                      className="px-2.5 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded text-xs font-medium flex items-center gap-1 ml-auto transition-colors"
                    >
                      <Search className="w-3 h-3" />
                      <span>Investigate</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
