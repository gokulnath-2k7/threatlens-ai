import React, { useState } from 'react';
import {
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  Search,
  ArrowRight,
  User,
  Clock,
  Layers,
  Zap,
} from 'lucide-react';
import { Incident } from '../types';

interface IncidentsViewProps {
  incidents: Incident[];
  onSelectIncident: (id: string) => void;
  onNavigateTab: (tab: string) => void;
  onRunAttackChain: () => void;
}

export const IncidentsView: React.FC<IncidentsViewProps> = ({
  incidents,
  onSelectIncident,
  onNavigateTab,
  onRunAttackChain,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredIncidents = incidents.filter((inc) => {
    const matchesStatus = statusFilter === 'all' || inc.status === statusFilter;
    const matchesSearch =
      inc.incident_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      inc.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (inc.assigned_to || '').toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <ShieldAlert className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">Security Incidents Queue</h2>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold">
                {incidents.length} Multi-Agent Incidents
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Every incident is evaluated by our 6 autonomous agents, verified against actual endpoint & network evidence, and gated behind analyst response approval.
            </p>
          </div>

          <button
            onClick={onRunAttackChain}
            className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-md shadow-cyan-500/20 active:scale-95 transition-all"
          >
            <Zap className="w-4 h-4 text-yellow-300" />
            <span>Simulate New Incident</span>
          </button>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search incident number, title, actor, or assignee..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['all', 'investigating', 'open', 'contained', 'resolved'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase font-mono transition-colors ${
                statusFilter === st
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Incidents Cards List */}
      <div className="space-y-4">
        {filteredIncidents.map((inc) => (
          <div
            key={inc.id}
            className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4 shadow-sm hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
              <div className="space-y-1.5">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-sm font-bold text-cyan-400 bg-cyan-950/70 border border-cyan-800 px-2.5 py-0.5 rounded">
                    {inc.incident_number}
                  </span>

                  {/* Verification Badge */}
                  <span
                    className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-mono font-extrabold uppercase ${
                      inc.verification_status === 'VERIFIED'
                        ? 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        : 'bg-amber-950 text-amber-300 border border-amber-700'
                    }`}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    {inc.verification_status}
                  </span>

                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                      inc.severity === 'critical'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}
                  >
                    {inc.severity}
                  </span>

                  <span className="text-xs text-slate-400 font-mono">
                    Status: <strong className="text-slate-200 uppercase">{inc.status}</strong>
                  </span>
                </div>

                <h3 className="text-base font-bold text-white tracking-tight">{inc.title}</h3>
                <p className="text-xs text-slate-300 max-w-4xl leading-relaxed">{inc.description}</p>
              </div>

              <div className="shrink-0 flex items-center gap-3">
                <button
                  onClick={() => {
                    onSelectIncident(inc.id);
                    onNavigateTab('investigation');
                  }}
                  className="px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white rounded-lg text-xs font-bold flex items-center gap-2 shadow-md shadow-cyan-600/20 active:scale-95 transition-all"
                >
                  <span>Open Deep Investigation</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Metrics row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-slate-800/80 text-xs">
              <div className="p-2 bg-slate-950/70 border border-slate-800/80 rounded flex items-center justify-between">
                <span className="text-slate-400">Risk Score:</span>
                <span className="font-mono font-bold text-rose-400">{inc.risk_score} / 100</span>
              </div>

              <div className="p-2 bg-slate-950/70 border border-slate-800/80 rounded flex items-center justify-between">
                <span className="text-slate-400">Evidence Confidence:</span>
                <span className="font-mono font-bold text-cyan-400">{inc.confidence_score}%</span>
              </div>

              <div className="p-2 bg-slate-950/70 border border-slate-800/80 rounded flex items-center justify-between">
                <span className="text-slate-400">Supporting Telemetry:</span>
                <span className="font-mono font-bold text-emerald-400">{inc.supporting_evidence_count} events</span>
              </div>

              <div className="p-2 bg-slate-950/70 border border-slate-800/80 rounded flex items-center justify-between">
                <span className="text-slate-400">Assigned Analyst:</span>
                <span className="text-slate-200 font-medium truncate max-w-[140px]">{inc.assigned_to || 'Unassigned'}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
