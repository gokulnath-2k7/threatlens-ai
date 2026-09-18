import React, { useState } from 'react';
import {
  Zap,
  Terminal,
  Play,
  ShieldAlert,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  AlertOctagon,
  KeyRound,
  FileCode,
  Network,
  Cpu,
} from 'lucide-react';
import { Alert, Incident } from '../types';

interface AttackSimulatorViewProps {
  onRunFullAttack: () => Promise<Incident | null>;
  onSimulateBruteForce: () => Promise<Alert | null>;
  onSimulatePowerShell: () => Promise<Alert | null>;
  onSimulatePortScan: () => Promise<Alert | null>;
  onSelectIncident: (id: string) => void;
  onNavigateTab: (tab: string) => void;
}

export const AttackSimulatorView: React.FC<AttackSimulatorViewProps> = ({
  onRunFullAttack,
  onSimulateBruteForce,
  onSimulatePowerShell,
  onSimulatePortScan,
  onSelectIncident,
  onNavigateTab,
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([
    '[SYSTEM READY] ThreatLens AI Attack Simulation Harness initialized.',
    '[INFO] Ingestion pipeline listening on local telemetry queue.',
    '[READY] Click any attack simulation button below to inject synthetic events into database.',
  ]);
  const [latestIncidentId, setLatestIncidentId] = useState<string | null>(null);
  const [latestAlertId, setLatestAlertId] = useState<string | null>(null);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs((prev) => [...prev, `[${timestamp}] ${msg}`]);
  };

  const handleFullChain = async () => {
    setIsRunning(true);
    setActiveScenario('Full Attack Chain');
    setLogs([
      `[${new Date().toLocaleTimeString()}] 🚀 Initiating Primary Hackathon Demo Scenario: Full Multi-Stage Killchain`,
      `[STAGE 1] Ingesting 5 repeated failed logins (Event 4625) from foreign IP 198.51.100.45 targeting DC01.corp`,
      `[STAGE 2] Ingesting successful RDP authentication (Event 4624) for compromised account 'admin_ops'`,
      `[STAGE 3] Ingesting privilege reconnaissance ('whoami /priv' & 'net localgroup administrators')`,
      `[STAGE 4] Ingesting in-memory encoded PowerShell execution cradle (Sysmon Event 1)`,
      `[STAGE 5] Ingesting outbound C2 beaconing to 203.0.113.88:8443 (142KB transmitted)`,
      `[PIPELINE] Promoting correlated events to Alert & Incident...`,
      `[AGENTS] Launching 6 autonomous agents sequentially...`,
    ]);

    try {
      const inc = await onRunFullAttack();
      if (inc) {
        setLatestIncidentId(inc.id);
        addLog(`✅ Detection Agent: Flagged anomalous burst, assessed initial risk: ${inc.risk_score}/100`);
        addLog(`✅ Investigation Agent: Scoped DC01.corp, user admin_ops, source IP 198.51.100.45`);
        addLog(`✅ Correlation Agent: Causal graph constructed linking all 5 attack phases`);
        addLog(`✅ MITRE Agent: Mapped T1110, T1078, T1059.001, T1071.001, T1087.002 with evidence`);
        addLog(`✅ Evidence Verification Agent: Confirmed 5 supporting evidence items. VERDICT: VERIFIED (Confidence: ${inc.confidence_score}%)`);
        addLog(`✅ Response Agent: Formulated 5 safe containment recommendations requiring analyst approval`);
        addLog(`🔒 Audit Trail: Appended tamper-evident SHA-256 block into hash chain`);
        addLog(`🎉 Complete Workflow Finished: Incident ${inc.incident_number} verified and ready!`);
      }
    } catch (err: any) {
      addLog(`❌ Simulation error: ${err.message}`);
    } finally {
      setIsRunning(false);
    }
  };

  const handleBruteForce = async () => {
    setIsRunning(true);
    setActiveScenario('Brute Force');
    addLog('Simulating rapid burst of 8 failed login attempts against DC01.corp...');
    try {
      const alert = await onSimulateBruteForce();
      if (alert) {
        setLatestAlertId(alert.id);
        addLog(`✅ Generated Alert ${alert.id}: ${alert.title} (Risk: ${alert.risk_score}, Conf: ${alert.confidence_score}%)`);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handlePowerShell = async () => {
    setIsRunning(true);
    setActiveScenario('PowerShell');
    addLog('Simulating obfuscated Base64 PowerShell execution on DC01.corp...');
    try {
      const alert = await onSimulatePowerShell();
      if (alert) {
        setLatestAlertId(alert.id);
        addLog(`✅ Generated Alert ${alert.id}: ${alert.title} (Risk: ${alert.risk_score}, Conf: ${alert.confidence_score}%)`);
      }
    } finally {
      setIsRunning(false);
    }
  };

  const handlePortScan = async () => {
    setIsRunning(true);
    setActiveScenario('Port Scan');
    addLog('Simulating internal TCP SYN port sweep across subnet 10.0.4.0/24...');
    try {
      const alert = await onSimulatePortScan();
      if (alert) {
        setLatestAlertId(alert.id);
        addLog(`✅ Generated Alert ${alert.id}: ${alert.title} (Risk: ${alert.risk_score}, Conf: ${alert.confidence_score}%)`);
      }
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header Banner */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-yellow-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            ThreatLens Interactive Attack Simulator
          </h2>
          <span className="px-2 py-0.5 rounded bg-yellow-950/80 text-yellow-300 border border-yellow-700/60 text-xs font-mono font-bold">
            LIVE DEMO CENTER
          </span>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Inject real synthetic security events directly into the database to trigger edge detection, causal correlation, autonomous multi-agent investigation, evidence verification, and response generation.
        </p>
      </div>

      {/* Simulator Control Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Primary Demo Button (Page 6 & 10) */}
        <div className="md:col-span-4 p-5 rounded-xl bg-gradient-to-r from-slate-900 via-cyan-950/50 to-blue-950/50 border border-cyan-700/60 shadow-lg space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-cyan-900 text-cyan-200 text-xs font-mono font-bold">
                  PRIMARY HACKATHON DEMO
                </span>
                <span className="text-xs text-slate-400">End-to-End Autonomous Pipeline</span>
              </div>
              <h3 className="text-base font-bold text-white">
                Run Full Attack Chain (Brute Force → Login → PowerShell → Network C2)
              </h3>
              <p className="text-xs text-slate-300 max-w-3xl">
                Executes the full killchain scenario requested in the design spec: generates 5 failed logins, successful RDP logon, privilege assumption, encoded download cradle, and C2 beaconing. Triggers the 6 autonomous agents and records a tamper-evident SHA-256 audit entry.
              </p>
            </div>

            <div className="shrink-0 flex items-center gap-3">
              <button
                onClick={handleFullChain}
                disabled={isRunning}
                className="px-6 py-3 bg-gradient-to-r from-cyan-500 via-blue-600 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white rounded-lg text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-cyan-500/25 active:scale-95 disabled:opacity-50 transition-all cursor-pointer"
              >
                {isRunning && activeScenario === 'Full Attack Chain' ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Simulating Chain...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 text-yellow-300" />
                    <span>Run Full Attack Chain</span>
                  </>
                )}
              </button>

              {latestIncidentId && (
                <button
                  onClick={() => {
                    onSelectIncident(latestIncidentId);
                    onNavigateTab('investigation');
                  }}
                  className="px-4 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Open Verified Incident</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Killchain Stage Flow Diagram */}
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2 text-xs">
            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-500 block font-mono">Stage 1</span>
              <strong className="text-slate-200">Brute Force Burst</strong>
              <div className="text-[10px] text-slate-400 mt-0.5">5x Event 4625</div>
            </div>
            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-500 block font-mono">Stage 2</span>
              <strong className="text-amber-400">Successful Login</strong>
              <div className="text-[10px] text-slate-400 mt-0.5">LogonType 10 RDP</div>
            </div>
            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-500 block font-mono">Stage 3</span>
              <strong className="text-purple-400">Privilege Recon</strong>
              <div className="text-[10px] text-slate-400 mt-0.5">whoami /priv</div>
            </div>
            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-500 block font-mono">Stage 4</span>
              <strong className="text-rose-400">Encoded PowerShell</strong>
              <div className="text-[10px] text-slate-400 mt-0.5">Base64 Memory Cradle</div>
            </div>
            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg">
              <span className="text-[10px] text-slate-500 block font-mono">Stage 5</span>
              <strong className="text-cyan-400">Outbound C2 Beacon</strong>
              <div className="text-[10px] text-slate-400 mt-0.5">TLS Port 8443 (142KB)</div>
            </div>
          </div>
        </div>

        {/* Button 1: Simulate Brute Force */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-amber-950/80 border border-amber-800/80 flex items-center justify-center text-amber-400">
              <KeyRound className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">Simulate Brute Force</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Injects rapid burst of 8 failed login events (Windows EventID 4625) from external IP 198.51.100.45.
            </p>
          </div>

          <button
            onClick={handleBruteForce}
            disabled={isRunning}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Play className="w-3 h-3 text-amber-400" />
            <span>Simulate Brute Force</span>
          </button>
        </div>

        {/* Button 2: Simulate PowerShell */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-purple-950/80 border border-purple-800/80 flex items-center justify-center text-purple-400">
              <FileCode className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">Simulate PowerShell</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Injects suspicious encoded script cradle with execution policy bypass parameters into process log.
            </p>
          </div>

          <button
            onClick={handlePowerShell}
            disabled={isRunning}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Play className="w-3 h-3 text-purple-400" />
            <span>Simulate PowerShell</span>
          </button>
        </div>

        {/* Button 3: Simulate Port Scan */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-blue-950/80 border border-blue-800/80 flex items-center justify-center text-blue-400">
              <Network className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">Simulate Port Scan</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Generates internal TCP SYN sweep against 11 service ports on file server FS01.corp.
            </p>
          </div>

          <button
            onClick={handlePortScan}
            disabled={isRunning}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
          >
            <Play className="w-3 h-3 text-blue-400" />
            <span>Simulate Port Scan</span>
          </button>
        </div>

        {/* View Generated Artifacts CTA */}
        <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 flex flex-col justify-between">
          <div className="space-y-1.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-950/80 border border-cyan-800/80 flex items-center justify-center text-cyan-400">
              <Terminal className="w-4 h-4" />
            </div>
            <h4 className="text-xs font-bold text-white">Alerts & Incidents Queue</h4>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              View ingested alerts or inspect the multi-agent investigation results and tamper-evident audit logs.
            </p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => onNavigateTab('alerts')}
              className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium"
            >
              Alerts
            </button>
            <button
              onClick={() => onNavigateTab('incidents')}
              className="flex-1 py-2 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-800 rounded-lg text-xs font-medium"
            >
              Incidents
            </button>
          </div>
        </div>
      </div>

      {/* Simulator Real-Time Console / Terminal */}
      <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 shadow-xl font-mono text-xs space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500"></span>
            </div>
            <span className="text-slate-400 text-[11px]">threatlens-soc-terminal:~/simulator-engine</span>
          </div>
          <button
            onClick={() => setLogs(['[RESET] Terminal cleared. Engine ready.'])}
            className="text-[11px] text-slate-500 hover:text-slate-300 flex items-center gap-1"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Clear</span>
          </button>
        </div>

        <div className="h-64 overflow-y-auto space-y-1 text-slate-300 scrollbar-none pr-1">
          {logs.map((log, idx) => (
            <div
              key={idx}
              className={`leading-relaxed ${
                log.includes('✅')
                  ? 'text-emerald-400 font-semibold'
                  : log.includes('🚀') || log.includes('STAGE')
                  ? 'text-cyan-300'
                  : log.includes('❌')
                  ? 'text-rose-400 font-bold'
                  : log.includes('🎉')
                  ? 'text-yellow-300 font-bold'
                  : 'text-slate-400'
              }`}
            >
              {log}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
