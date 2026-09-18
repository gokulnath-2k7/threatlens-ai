import React, { useState } from 'react';
import {
  AlertTriangle,
  Search,
  Filter,
  ArrowRight,
  Shield,
  ShieldAlert,
  Clock,
  User,
  Server,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Alert, SeverityLevel } from '../types';

interface AlertsViewProps {
  alerts: Alert[];
  onSelectIncident: (incidentId: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  alerts,
  onSelectIncident,
  onNavigateTab,
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedAlertId, setExpandedAlertId] = useState<string | null>(null);

  const filteredAlerts = alerts.filter((a) => {
    const matchesSeverity = severityFilter === 'all' || a.severity === severityFilter;
    const matchesSearch =
      a.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.host.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.user.toLowerCase().includes(searchTerm.toLowerCase()) ||
      a.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSeverity && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">Security Alerts Feed</h2>
          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-xs font-mono">
            {alerts.length} Ingested Alerts
          </span>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Suspicious telemetry events triaged and prioritized by the lightweight edge hybrid detection model. High-confidence alerts are automatically correlated into multi-agent investigation incidents.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by title, host, user, or alert ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
            <button
              key={sev}
              onClick={() => setSeverityFilter(sev)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase font-mono transition-colors ${
                severityFilter === sev
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {sev}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Grid */}
      <div className="space-y-3">
        {filteredAlerts.length === 0 ? (
          <div className="p-8 text-center bg-slate-900/40 border border-slate-800 rounded-xl text-slate-400 text-xs">
            No alerts match the selected criteria.
          </div>
        ) : (
          filteredAlerts.map((alert) => {
            const isExpanded = expandedAlertId === alert.id;

            return (
              <div
                key={alert.id}
                className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-3 shadow-sm hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-950/60 border border-cyan-800/80 px-2 py-0.5 rounded">
                      {alert.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        alert.severity === 'critical'
                          ? 'bg-rose-950 text-rose-300 border border-rose-800'
                          : alert.severity === 'high'
                          ? 'bg-amber-950 text-amber-300 border border-amber-800'
                          : 'bg-blue-950 text-blue-300 border border-blue-800'
                      }`}
                    >
                      {alert.severity}
                    </span>
                    <h3 className="text-sm font-bold text-white">{alert.title}</h3>
                  </div>

                  <div className="flex items-center gap-2 text-xs">
                    <span className="text-slate-400 font-mono text-[11px]">
                      {new Date(alert.triggered_at).toLocaleString()}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{alert.description}</p>

                {/* Score Pills & Metadata */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60 text-xs">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1 font-mono">
                      <span className="text-slate-500 text-[11px]">Risk:</span>
                      <strong className="text-rose-400">{alert.risk_score}/100</strong>
                    </div>

                    <div className="flex items-center gap-1 font-mono">
                      <span className="text-slate-500 text-[11px]">Confidence:</span>
                      <strong className="text-cyan-400">{alert.confidence_score}%</strong>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      <Server className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono text-[11px]">{alert.host}</span>
                    </div>

                    <div className="flex items-center gap-1 text-slate-400">
                      <User className="w-3.5 h-3.5 text-slate-500" />
                      <span className="font-mono text-[11px]">{alert.user}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {alert.incident_id ? (
                      <button
                        onClick={() => {
                          onSelectIncident(alert.incident_id!);
                          onNavigateTab('investigation');
                        }}
                        className="px-3 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                      >
                        <ShieldAlert className="w-3 h-3" />
                        <span>View Incident Investigation</span>
                        <ArrowRight className="w-3 h-3" />
                      </button>
                    ) : (
                      <button
                        onClick={() => onNavigateTab('simulator')}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded text-xs font-medium flex items-center gap-1"
                      >
                        <span>Escalate to Investigation</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
