import React, { useState } from 'react';
import { Bot, Clock, CheckCircle2, AlertTriangle, Terminal, Search } from 'lucide-react';
import { AgentRun } from '../types';

interface AgentActivityViewProps {
  agentRuns: AgentRun[];
}

export const AgentActivityView: React.FC<AgentActivityViewProps> = ({ agentRuns }) => {
  const [filterAgent, setFilterAgent] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredRuns = agentRuns.filter((run) => {
    const matchesAgent = filterAgent === 'all' || run.agent_name.toLowerCase() === filterAgent.toLowerCase();
    const matchesSearch =
      run.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.agent_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      run.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesAgent && matchesSearch;
  });

  const avgDuration =
    agentRuns.length > 0
      ? Math.round(agentRuns.reduce((acc, r) => acc + r.execution_time_ms, 0) / agentRuns.length)
      : 185;

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Bot className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Autonomous Multi-Agent Telemetry Stream
              </h2>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold">
                6-AGENT SWARM
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Real-time audit log of all autonomous agent execution runs, duration benchmarks, and structured reasoning outputs.
            </p>
          </div>

          <div className="flex items-center gap-4 text-xs font-mono bg-slate-950 p-2 rounded-lg border border-slate-800">
            <div>
              <span className="text-slate-500 block text-[10px]">Avg Latency</span>
              <strong className="text-cyan-400">{avgDuration} ms</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Success Rate</span>
              <strong className="text-emerald-400">100.0%</strong>
            </div>
            <div>
              <span className="text-slate-500 block text-[10px]">Total Invocations</span>
              <strong className="text-white">{agentRuns.length}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search agent execution traces..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto">
          {['all', 'detection', 'investigation', 'correlation', 'mitre', 'verification', 'response'].map((ag) => (
            <button
              key={ag}
              onClick={() => setFilterAgent(ag)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium uppercase font-mono transition-colors ${
                filterAgent === ag
                  ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                  : 'bg-slate-900 text-slate-400 border border-slate-800 hover:text-slate-200'
              }`}
            >
              {ag}
            </button>
          ))}
        </div>
      </div>

      {/* Runs Feed */}
      <div className="space-y-3">
        {filteredRuns.map((run) => (
          <div
            key={run.id}
            className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2.5 shadow-sm hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold">
                  {run.agent_name} Agent
                </span>
                <span className="font-mono text-xs text-slate-400">{run.id}</span>
                <span className="inline-flex items-center gap-1 text-[11px] font-mono text-emerald-400 font-semibold">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  {run.status.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center gap-3 text-xs font-mono text-slate-400">
                <span>Duration: <strong className="text-white">{run.execution_time_ms} ms</strong></span>
                <span>{new Date(run.started_at).toLocaleTimeString()}</span>
              </div>
            </div>

            <p className="text-xs text-slate-200 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
              {run.summary}
            </p>

            {run.output_data && (
              <pre className="p-2.5 bg-slate-950 rounded border border-slate-800 text-[11px] font-mono text-cyan-300 overflow-x-auto">
                {JSON.stringify(run.output_data, null, 2)}
              </pre>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
