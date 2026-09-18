import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  User,
  KeyRound,
  Terminal,
  Activity,
  Award,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  Zap,
  Briefcase,
  AlertTriangle,
  Cpu,
} from 'lucide-react';
import { User as UserType } from '../types';

interface LoginViewProps {
  onLoginSuccess: (user: UserType, initialTab?: string) => void;
  initialRole?: 'analyst' | 'admin';
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  initialRole = 'analyst',
}) => {
  const [selectedRole, setSelectedRole] = useState<'analyst' | 'admin'>(initialRole);
  const [email, setEmail] = useState(
    initialRole === 'admin' ? 'admin@threatlens.ai' : 'analyst@threatlens.ai'
  );
  const [password, setPassword] = useState('••••••••••••');
  const [stationId, setStationId] = useState('SOC-CONSOLE-04');
  const [securityDomain, setSecurityDomain] = useState('corp.threatlens.internal');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Preset demo personas
  const setAnalystPreset = (presetEmail: string, name: string, tier: string, station: string) => {
    setSelectedRole('analyst');
    setEmail(presetEmail);
    setPassword('ThreatLens2026!');
    setStationId(station);
    setErrorMsg('');
  };

  const setAdminPreset = (presetEmail: string, name: string) => {
    setSelectedRole('admin');
    setEmail(presetEmail);
    setPassword('MasterAdminKey#2026');
    setErrorMsg('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, role: selectedRole }),
      });

      if (!res.ok) {
        throw new Error('Authentication rejected. Invalid credentials.');
      }

      const data = await res.json();
      const user: UserType = data.user || {
        id: selectedRole === 'admin' ? 'usr-2' : 'usr-1',
        username: selectedRole === 'admin' ? 'admin_david' : 'analyst_sarah',
        email,
        role: selectedRole,
        name:
          selectedRole === 'admin'
            ? 'David Vance (SOC Lead / Admin)'
            : 'Sarah Chen (Tier 2 SOC Analyst)',
      };

      // Redirect admin to admin-overview or dashboard, analyst to dashboard
      const targetTab = selectedRole === 'admin' ? 'admin-overview' : 'dashboard';
      onLoginSuccess(user, targetTab);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsLoading(false);
    }
  };

  const isAnalyst = selectedRole === 'analyst';

  return (
    <div className="min-h-screen bg-[#070a13] text-slate-100 flex flex-col justify-center items-center px-4 py-8 relative overflow-hidden selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* Background ambient lighting */}
      <div
        className={`absolute top-0 left-1/4 w-[600px] h-[600px] rounded-full blur-[140px] pointer-events-none opacity-20 transition-all duration-700 ${
          isAnalyst ? 'bg-cyan-500' : 'bg-amber-500'
        }`}
      />
      <div
        className={`absolute bottom-0 right-1/4 w-[500px] h-[500px] rounded-full blur-[140px] pointer-events-none opacity-15 transition-all duration-700 ${
          isAnalyst ? 'bg-blue-600' : 'bg-orange-600'
        }`}
      />

      {/* Brand Header */}
      <div className="mb-6 text-center space-y-2 z-10">
        <div className="inline-flex items-center gap-2.5 px-3 py-1 rounded-full bg-slate-900/90 border border-slate-800 text-xs text-slate-300 font-mono mb-2 shadow-inner">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span>ThreatLens AI Autonomous SOC Platform</span>
          <span className="text-cyan-400 font-semibold">v1.0 MVP</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
          Enterprise Security Access Gate
        </h1>
        <p className="text-xs sm:text-sm text-slate-400 max-w-lg mx-auto">
          Multi-agent cyber investigation, evidence verification, and cryptographic compliance gateway.
        </p>
      </div>

      {/* Main Differentiated Container */}
      <div className="w-full max-w-xl z-10">
        {/* Role Toggle Selector (Clear differentiation between the two login portals) */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-900/90 border border-slate-800 rounded-xl mb-4 shadow-xl">
          <button
            type="button"
            onClick={() => {
              setSelectedRole('analyst');
              setEmail('analyst@threatlens.ai');
              setErrorMsg('');
            }}
            className={`py-3 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              isAnalyst
                ? 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-4 h-4 text-cyan-200" />
            <span>SOC Analyst Terminal</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setSelectedRole('admin');
              setEmail('admin@threatlens.ai');
              setErrorMsg('');
            }}
            className={`py-3 px-4 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
              !isAnalyst
                ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-lg shadow-amber-600/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Award className="w-4 h-4 text-amber-200" />
            <span>Executive Admin Portal</span>
          </button>
        </div>

        {/* Portal Body Card */}
        <div
          className={`p-6 sm:p-8 rounded-2xl backdrop-blur-xl border transition-all duration-300 shadow-2xl ${
            isAnalyst
              ? 'bg-slate-900/80 border-cyan-500/30 shadow-cyan-950/40'
              : 'bg-slate-900/80 border-amber-500/30 shadow-amber-950/40'
          }`}
        >
          {/* Differentiated Telemetry Header */}
          {isAnalyst ? (
            <div className="mb-6 p-3 rounded-lg bg-cyan-950/40 border border-cyan-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-cyan-300 uppercase">
                    SOC Operations Floor // Blue Sector
                  </div>
                  <div className="text-[10px] text-slate-400">
                    Live Stream: Active • Edge Filter: 1.4ms • Auto-Triage Ready
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-900/80 text-cyan-200 border border-cyan-700">
                Tier 1/2/3 Clearance
              </span>
            </div>
          ) : (
            <div className="mb-6 p-3 rounded-lg bg-amber-950/40 border border-amber-800/50 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-md bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <div>
                  <div className="text-xs font-mono font-bold text-amber-300 uppercase">
                    Executive Security Directorate // Level 4
                  </div>
                  <div className="text-[10px] text-slate-400">
                    CISO Governance • Project Reports • SHA-256 Audit Authority
                  </div>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-amber-900/80 text-amber-200 border border-amber-700">
                Restricted Admin
              </span>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {errorMsg && (
              <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {isAnalyst ? 'Analyst Workstation Email / Callsign' : 'SOC Director / Admin Email'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={isAnalyst ? 'analyst@threatlens.ai' : 'admin@threatlens.ai'}
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">
                {isAnalyst ? 'Analyst Security PIN / Password' : 'Admin Zero-Trust Hardware Token / Master Key'}
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>
            </div>

            {/* Differentiated Secondary Field */}
            {isAnalyst ? (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Assigned SOC Console Terminal ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Cpu className="w-4 h-4" />
                  </div>
                  <select
                    value={stationId}
                    onChange={(e) => setStationId(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                  >
                    <option value="SOC-CONSOLE-04">Console 04 (Blue Sector - Tier 2 Investigation)</option>
                    <option value="SOC-CONSOLE-02">Console 02 (Frontline - Tier 1 Alert Triage)</option>
                    <option value="FORENSICS-LAB-01">Forensics Lab 01 (Deep Reverse Engineering)</option>
                  </select>
                </div>
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Enterprise Security Domain / Realm
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <ShieldCheck className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    value={securityDomain}
                    onChange={(e) => setSecurityDomain(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 bg-slate-950/80 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-amber-500 font-mono"
                  />
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className={`w-full py-2.5 rounded-lg text-xs font-bold text-white flex items-center justify-center gap-2 shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 ${
                isAnalyst
                  ? 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 shadow-cyan-600/30'
                  : 'bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 shadow-amber-600/30'
              }`}
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>
                    {isAnalyst ? 'Authenticate & Enter SOC Terminal' : 'Authenticate & Open Executive Governance'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick-Fill Presets for Seamless Demo & Grading */}
          <div className="mt-6 pt-5 border-t border-slate-800 space-y-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-400">
              <span className="font-mono uppercase font-semibold">1-Click Demo Credentials:</span>
              <span className="text-[10px] text-slate-500">Auto-populates fields</span>
            </div>

            {isAnalyst ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setAnalystPreset('analyst@threatlens.ai', 'Sarah Chen', 'Tier 2 Investigation', 'SOC-CONSOLE-04')
                  }
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-cyan-900/50 hover:border-cyan-500/60 text-left transition-colors group"
                >
                  <div className="text-xs font-bold text-cyan-300 group-hover:text-cyan-200">
                    Sarah Chen (Tier 2 SOC)
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">analyst@threatlens.ai</div>
                  <div className="text-[9px] text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Active on INC-2026-8491 (Stage 6)
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() =>
                    setAnalystPreset('triage.reed@threatlens.ai', 'Marcus Reed', 'Tier 1 Triage', 'SOC-CONSOLE-02')
                  }
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-cyan-600/60 text-left transition-colors group"
                >
                  <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                    Marcus Reed (Tier 1 Triage)
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">triage.reed@threatlens.ai</div>
                  <div className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                    <Activity className="w-3 h-3" /> Active on Alert Ingestion (Stage 2)
                  </div>
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdminPreset('admin@threatlens.ai', 'David Vance')}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-amber-900/50 hover:border-amber-500/60 text-left transition-colors group"
                >
                  <div className="text-xs font-bold text-amber-300 group-hover:text-amber-200">
                    David Vance (SOC Lead)
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">admin@threatlens.ai</div>
                  <div className="text-[9px] text-amber-400 mt-1 flex items-center gap-1">
                    <Award className="w-3 h-3" /> Full Executive & Audit Authority
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setAdminPreset('ciso@threatlens.ai', 'Dr. Evelyn Hayes')}
                  className="p-2.5 rounded-lg bg-slate-950/60 border border-slate-800 hover:border-amber-600/60 text-left transition-colors group"
                >
                  <div className="text-xs font-bold text-slate-200 group-hover:text-amber-300">
                    Dr. Evelyn Hayes (CISO)
                  </div>
                  <div className="text-[10px] text-slate-400 font-mono">ciso@threatlens.ai</div>
                  <div className="text-[9px] text-slate-400 mt-1 flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> Executive Board Threat Briefing
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
