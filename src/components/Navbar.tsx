import React from 'react';
import {
  ShieldAlert,
  Activity,
  AlertTriangle,
  FileSearch,
  Grid,
  Bot,
  Zap,
  Lock,
  Settings,
  ShieldCheck,
  UserCheck,
  CheckCircle2,
  XCircle,
  Award,
  LogOut,
} from 'lucide-react';
import { User } from '../types';

interface NavbarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  currentUser: User;
  setCurrentUser: (user: User) => void;
  auditValid: boolean;
  totalAlerts: number;
  activeIncidents: number;
  onQuickSimulate: () => void;
  onLogout?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  setActiveTab,
  currentUser,
  setCurrentUser,
  auditValid,
  totalAlerts,
  activeIncidents,
  onQuickSimulate,
  onLogout,
}) => {
  const isAdmin = currentUser.role === 'admin';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: Activity },
    ...(isAdmin
      ? [{ id: 'admin-overview', label: 'Admin Overview', icon: Award, highlight: true, adminOnly: true }]
      : []),
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: totalAlerts },
    { id: 'incidents', label: 'Incidents', icon: ShieldAlert, badge: activeIncidents },
    { id: 'investigation', label: 'Investigation', icon: FileSearch, highlight: true },
    { id: 'mitre', label: 'MITRE ATT&CK', icon: Grid },
    { id: 'agents', label: 'Agent Activity', icon: Bot },
    { id: 'simulator', label: 'Attack Simulator', icon: Zap, demo: true },
    { id: 'audit', label: 'Audit Trail', icon: Lock, valid: auditValid },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0b0f19]/95 backdrop-blur-md border-b border-slate-800/80">
      {/* Top utility ticker */}
      <div className="px-4 py-1.5 bg-slate-950/60 border-b border-slate-800/40 text-xs flex items-center justify-between text-slate-400">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-emerald-400 font-mono font-medium">SOC ENGINE ONLINE</span>
          </div>
          <span className="text-slate-600">|</span>
          <div className="flex items-center gap-1">
            <span className="text-slate-500">Edge Filter:</span>
            <span className="text-cyan-400 font-mono">1.4ms Latency (93.8% Filtered)</span>
          </div>
          <span className="text-slate-600 hidden md:inline">|</span>
          <div className="hidden md:flex items-center gap-1">
            <span className="text-slate-500">Model:</span>
            <span className="text-slate-300 font-mono">IsolationForest + Rule Hybrid</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Audit Chain Pill */}
          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-1.5 px-2 py-0.5 rounded font-mono text-[11px] transition-colors ${
              auditValid
                ? 'bg-emerald-950/60 text-emerald-300 border border-emerald-800/60 hover:bg-emerald-900/60'
                : 'bg-rose-950/80 text-rose-300 border border-rose-700/80 animate-pulse hover:bg-rose-900'
            }`}
          >
            {auditValid ? <CheckCircle2 className="w-3 h-3 text-emerald-400" /> : <XCircle className="w-3 h-3 text-rose-400" />}
            <span>Audit Chain: {auditValid ? 'VALID' : 'TAMPER DETECTED'}</span>
          </button>

          {/* User Persona Switcher */}
          <div className="flex items-center gap-1.5 bg-slate-900/80 border border-slate-800 rounded px-2 py-0.5">
            <UserCheck className="w-3 h-3 text-cyan-400" />
            <select
              value={currentUser.role}
              onChange={(e) => {
                const role = e.target.value as 'analyst' | 'admin';
                setCurrentUser(
                  role === 'analyst'
                    ? {
                        id: 'usr-1',
                        username: 'analyst_sarah',
                        email: 'analyst@threatlens.ai',
                        role: 'analyst',
                        name: 'Sarah Chen (Tier 2 SOC)',
                      }
                    : {
                        id: 'usr-2',
                        username: 'admin_david',
                        email: 'admin@threatlens.ai',
                        role: 'admin',
                        name: 'David Vance (SOC Lead)',
                      }
                );
              }}
              className="bg-transparent text-slate-300 text-xs focus:outline-none cursor-pointer pr-1"
            >
              <option value="analyst" className="bg-slate-900 text-slate-200">
                Analyst: Sarah Chen
              </option>
              <option value="admin" className="bg-slate-900 text-slate-200">
                Admin: David Vance
              </option>
            </select>
          </div>

          {onLogout && (
            <button
              onClick={onLogout}
              className="flex items-center gap-1 px-2 py-0.5 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 text-[11px] font-mono transition-colors"
              title="Sign Out / Switch Portal"
            >
              <LogOut className="w-3 h-3 text-rose-400" />
              <span className="hidden sm:inline">Exit</span>
            </button>
          )}
        </div>
      </div>

      {/* Main navigation row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div
            onClick={() => setActiveTab('dashboard')}
            className="flex items-center gap-2.5 cursor-pointer group"
          >
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                  ThreatLens<span className="text-cyan-400">AI</span>
                </span>
                <span className="px-1.5 py-0.2 bg-cyan-950/80 border border-cyan-700/60 text-cyan-300 text-[10px] font-mono rounded font-semibold">
                  v1.0 MVP
                </span>
              </div>
              <p className="text-[10px] text-slate-400 tracking-tight leading-none hidden sm:block">
                Autonomous Multi-Agent SOC Investigation
              </p>
            </div>
          </div>
        </div>

        {/* Nav tabs */}
        <nav className="hidden lg:flex items-center space-x-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative px-3 py-1.5 rounded-md text-xs font-medium flex items-center gap-1.5 transition-all ${
                  isActive
                    ? 'bg-cyan-950/70 text-cyan-300 border border-cyan-800/80 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                } ${item.demo ? 'border border-amber-500/40 text-amber-300 hover:bg-amber-950/40' : ''}`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : item.demo ? 'text-amber-400' : 'text-slate-400'}`} />
                <span>{item.label}</span>

                {item.badge !== undefined && item.badge > 0 && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      item.id === 'incidents'
                        ? 'bg-rose-900/80 text-rose-200 border border-rose-700'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}

                {item.demo && (
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Quick Demo CTA */}
        <div className="flex items-center gap-2">
          <button
            onClick={onQuickSimulate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold shadow-md shadow-cyan-600/20 transition-all active:scale-95"
            title="Trigger the primary Hackathon scenario (Brute Force -> Login -> PowerShell -> C2)"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-300" />
            <span className="hidden sm:inline">⚡ Run Attack Chain</span>
            <span className="sm:hidden">Run Chain</span>
          </button>
        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="lg:hidden flex overflow-x-auto px-4 py-2 bg-slate-900/90 border-t border-slate-800 space-x-2 text-xs scrollbar-none">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`whitespace-nowrap px-2.5 py-1 rounded text-xs flex items-center gap-1 ${
              activeTab === item.id
                ? 'bg-cyan-950 text-cyan-300 border border-cyan-700'
                : 'text-slate-400 hover:bg-slate-800'
            }`}
          >
            <item.icon className="w-3 h-3" />
            {item.label}
          </button>
        ))}
      </div>
    </header>
  );
};
