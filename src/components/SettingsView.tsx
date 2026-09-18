import React, { useState } from 'react';
import { Settings, Server, Cpu, Key, Database, RotateCcw, ShieldCheck, CheckCircle2 } from 'lucide-react';

interface SettingsViewProps {
  onResetDatabase: () => Promise<void>;
}

export const SettingsView: React.FC<SettingsViewProps> = ({ onResetDatabase }) => {
  const [resetting, setResetting] = useState(false);
  const [resetDone, setResetDone] = useState(false);

  const handleReset = async () => {
    setResetting(true);
    try {
      await onResetDatabase();
      setResetDone(true);
      setTimeout(() => setResetDone(false), 3000);
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">System Architecture & Settings</h2>
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono">
            HACKATHON PLATFORM
          </span>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Operational telemetry configuration, AI model parameters, and database state management for ThreatLens AI.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {/* Card 1: AI & ML Engine Configuration */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">AI & ML Detection Engine</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-slate-200 block">Lightweight Detection Model</strong>
                <span className="text-slate-400 text-[11px]">Scikit-learn IsolationForest + Rule Hybrid</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-mono text-[10px] font-bold">
                ACTIVE
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-slate-200 block">Gemini Explainable Reporting</strong>
                <span className="text-slate-400 text-[11px]">gemini-2.5-flash with Deterministic Fallback</span>
              </div>
              <span className="px-2 py-0.5 bg-cyan-950 text-cyan-300 border border-cyan-800 rounded font-mono text-[10px] font-bold">
                READY
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-slate-200 block">Autonomous Multi-Agent Swarm</strong>
                <span className="text-slate-400 text-[11px]">6 Specialized Agents Orchestrated Sequentially</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-mono text-[10px] font-bold">
                ONLINE
              </span>
            </div>
          </div>
        </div>

        {/* Card 2: Database & Security State */}
        <div className="p-5 bg-slate-900/90 border border-slate-800 rounded-xl space-y-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">Database & Compliance State</h3>
          </div>

          <div className="space-y-3 text-xs">
            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-slate-200 block">PostgreSQL Schema Compatibility</strong>
                <span className="text-slate-400 text-[11px]">10 Tables: users, events, alerts, incidents, evidence, mitre...</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-mono text-[10px] font-bold">
                MIGRATED
              </span>
            </div>

            <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 flex items-center justify-between">
              <div>
                <strong className="text-slate-200 block">Cryptographic Audit Ledger</strong>
                <span className="text-slate-400 text-[11px]">Tamper-evident SHA-256 block hash chain</span>
              </div>
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded font-mono text-[10px] font-bold">
                VALID
              </span>
            </div>

            {/* Reset DB Button */}
            <div className="pt-2">
              <button
                onClick={handleReset}
                disabled={resetting}
                className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold flex items-center justify-center gap-2 border border-slate-700 transition-colors cursor-pointer"
              >
                {resetting ? (
                  <div className="w-3.5 h-3.5 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin"></div>
                ) : (
                  <RotateCcw className="w-3.5 h-3.5 text-cyan-400" />
                )}
                <span>Reset Database to Initial Hackathon Demo State</span>
              </button>

              {resetDone && (
                <div className="mt-2 p-2 bg-emerald-950/70 border border-emerald-700 rounded text-xs text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Database re-seeded successfully with primary demo scenario!</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
