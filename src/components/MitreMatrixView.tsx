import React, { useState } from 'react';
import { Grid, Shield, ExternalLink, CheckCircle2, Search } from 'lucide-react';
import { MitreMapping } from '../types';

interface MitreMatrixViewProps {
  mitreMappings: MitreMapping[];
  onSelectIncident?: (incidentId: string) => void;
  onNavigateTab?: (tab: string) => void;
}

export const MitreMatrixView: React.FC<MitreMatrixViewProps> = ({
  mitreMappings,
}) => {
  const [selectedTechnique, setSelectedTechnique] = useState<any | null>(null);

  // Enterprise Tactics columns
  const tactics = [
    {
      id: 'TA0001',
      name: 'Initial Access',
      techniques: [
        { id: 'T1078', name: 'Valid Accounts', active: true, desc: 'Abuse of compromised domain admin credentials to gain interactive RDP access.' },
        { id: 'T1190', name: 'Exploit Public-Facing App', active: false },
        { id: 'T1566', name: 'Phishing', active: false },
      ],
    },
    {
      id: 'TA0002',
      name: 'Execution',
      techniques: [
        { id: 'T1059.001', name: 'PowerShell Interpreter', active: true, desc: 'Obfuscated Base64 download cradle executed via powershell.exe with bypass flags.' },
        { id: 'T1059.003', name: 'Windows Command Shell', active: true, desc: 'cmd.exe spawned for parent process execution.' },
        { id: 'T1204', name: 'User Execution', active: false },
      ],
    },
    {
      id: 'TA0004',
      name: 'Privilege Escalation',
      techniques: [
        { id: 'T1078', name: 'Valid Accounts', active: true, desc: 'Elevation through assumption of privileged backup and ops administrator roles.' },
        { id: 'T1548', name: 'Abuse Elevation Control', active: false },
        { id: 'T1134', name: 'Access Token Manipulation', active: false },
      ],
    },
    {
      id: 'TA0006',
      name: 'Credential Access',
      techniques: [
        { id: 'T1110', name: 'Brute Force / Password Guessing', active: true, desc: 'Rapid burst of 12 authentication failures within 45 seconds from external IP.' },
        { id: 'T1003', name: 'OS Credential Dumping', active: false },
        { id: 'T1555', name: 'Credentials from Password Stores', active: false },
      ],
    },
    {
      id: 'TA0007',
      name: 'Discovery',
      techniques: [
        { id: 'T1087.002', name: 'Domain Account Discovery', active: true, desc: 'whoami /priv and net localgroup administrators enumeration commands.' },
        { id: 'T1046', name: 'Network Service Discovery', active: true, desc: 'Port scanning across internal management subnets.' },
        { id: 'T1082', name: 'System Information Discovery', active: false },
      ],
    },
    {
      id: 'TA0011',
      name: 'Command and Control',
      techniques: [
        { id: 'T1071.001', name: 'Web Protocols (HTTPS)', active: true, desc: 'Encrypted outbound C2 communication over port 8443 beaconing to 203.0.113.88.' },
        { id: 'T1573', name: 'Encrypted Channel', active: true, desc: 'TLS tunnel concealing remote management payload.' },
        { id: 'T1105', name: 'Ingress Tool Transfer', active: false },
      ],
    },
  ];

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-2">
        <div className="flex items-center gap-2">
          <Grid className="w-5 h-5 text-cyan-400" />
          <h2 className="text-lg font-bold text-white tracking-tight">
            MITRE ATT&CK Enterprise Matrix Navigator
          </h2>
          <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono font-bold">
            v14.1 FRAMEWORK
          </span>
        </div>
        <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
          Behavioral mapping performed autonomously by the MITRE Agent. Active threats detected in your environment are highlighted with observed evidence references and attribution confidence.
        </p>
      </div>

      {/* Legend & Stats */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3 bg-slate-900/60 border border-slate-800 rounded-lg text-xs">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-cyan-500 shadow-sm shadow-cyan-500/50"></span>
            <span className="text-slate-200 font-medium">Active Detected Technique (Corroborated)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded bg-slate-800 border border-slate-700"></span>
            <span className="text-slate-400">Baseline Monitored Technique</span>
          </div>
        </div>

        <div className="text-slate-400 font-mono text-[11px]">
          Mapped Techniques in Active Scenarios: <strong className="text-cyan-400">6 Detected</strong>
        </div>
      </div>

      {/* ATT&CK Tactics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {tactics.map((tactic) => (
          <div key={tactic.id} className="space-y-2">
            {/* Column header */}
            <div className="p-2.5 bg-slate-950/80 border border-slate-800 rounded-lg">
              <span className="text-[10px] font-mono text-cyan-400 block">{tactic.id}</span>
              <h3 className="text-xs font-bold text-white tracking-tight leading-tight">{tactic.name}</h3>
            </div>

            {/* Techniques */}
            <div className="space-y-2">
              {tactic.techniques.map((tech) => (
                <div
                  key={tech.id}
                  onClick={() => setSelectedTechnique(tech)}
                  className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                    tech.active
                      ? 'bg-cyan-950/80 border-cyan-500/80 text-cyan-100 shadow-sm hover:bg-cyan-900/80'
                      : 'bg-slate-900/50 border-slate-800 text-slate-400 hover:bg-slate-800/40 hover:text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[10px] mb-1">
                    <span className={tech.active ? 'font-bold text-cyan-300' : 'text-slate-500'}>
                      {tech.id}
                    </span>
                    {tech.active && <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>}
                  </div>
                  <div className="font-semibold leading-tight">{tech.name}</div>
                  {tech.desc && (
                    <div className="text-[10px] text-slate-300 mt-1 line-clamp-2 leading-tight">
                      {tech.desc}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Technique Detail Modal/Drawer */}
      {selectedTechnique && (
        <div className="p-4 bg-slate-900 border border-cyan-800/80 rounded-xl space-y-3 shadow-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-700 font-mono text-xs font-bold">
                {selectedTechnique.id}
              </span>
              <h3 className="text-sm font-bold text-white">{selectedTechnique.name}</h3>
            </div>
            <button
              onClick={() => setSelectedTechnique(null)}
              className="text-xs text-slate-400 hover:text-white"
            >
              ✕ Close
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {selectedTechnique.desc ||
              'Monitored enterprise technique. No current incident detections recorded for this technique.'}
          </p>
        </div>
      )}
    </div>
  );
};
