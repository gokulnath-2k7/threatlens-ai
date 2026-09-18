import React, { useState } from 'react';
import {
  Lock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Shield,
  Search,
  ExternalLink,
  Bug,
  Terminal,
} from 'lucide-react';
import { AuditLog } from '../types';

interface AuditTrailViewProps {
  auditLogs: AuditLog[];
  auditValid: boolean;
  onVerifyAudit: () => Promise<{ valid: boolean; status: 'VALID' | 'TAMPER DETECTED'; broken_at?: string; total: number }>;
  onTamperAudit: () => Promise<void>;
  onRestoreAudit: () => Promise<void>;
}

export const AuditTrailView: React.FC<AuditTrailViewProps> = ({
  auditLogs,
  auditValid,
  onVerifyAudit,
  onTamperAudit,
  onRestoreAudit,
}) => {
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationResult, setVerificationResult] = useState<{
    valid: boolean;
    status: 'VALID' | 'TAMPER DETECTED';
    broken_at?: string;
    total: number;
  } | null>({
    valid: auditValid,
    status: auditValid ? 'VALID' : 'TAMPER DETECTED',
    total: auditLogs.length,
  });
  const [searchTerm, setSearchTerm] = useState('');

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const result = await onVerifyAudit();
      setVerificationResult(result);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleTamper = async () => {
    await onTamperAudit();
    await handleVerify();
  };

  const handleRestore = async () => {
    await onRestoreAudit();
    await handleVerify();
  };

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.actor.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.details.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.incident_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="p-5 rounded-xl bg-slate-900/90 border border-slate-800 shadow-xl space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Lock className="w-5 h-5 text-cyan-400" />
              <h2 className="text-lg font-bold text-white tracking-tight">
                Cryptographic Tamper-Evident Audit Trail
              </h2>
              <span className="px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-800 text-xs font-mono">
                SHA-256 HASH CHAIN
              </span>
            </div>
            <p className="text-xs text-slate-300 max-w-3xl leading-relaxed">
              Every analyst decision, agent execution, and incident transition is cryptographically linked in an immutable SHA-256 hash sequence.
            </p>
          </div>

          {/* Verification Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={handleVerify}
              disabled={isVerifying}
              className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 active:scale-95 transition-all cursor-pointer"
            >
              {isVerifying ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Verifying Chain...</span>
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5" />
                  <span>Verify Audit Chain</span>
                </>
              )}
            </button>

            <button
              onClick={handleTamper}
              className="px-3 py-2 bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              title="Demonstrate tamper detection for hackathon evaluation"
            >
              <Bug className="w-3.5 h-3.5 text-rose-400" />
              <span>Simulate Tampering</span>
            </button>

            {!verificationResult?.valid && (
              <button
                onClick={handleRestore}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Restore Chain</span>
              </button>
            )}
          </div>
        </div>

        {/* Verification Status Banner (Page 7: Return VALID or TAMPER DETECTED) */}
        {verificationResult && (
          <div
            className={`p-4 rounded-xl border flex items-center justify-between transition-all ${
              verificationResult.valid
                ? 'bg-emerald-950/70 border-emerald-500/70 text-emerald-200'
                : 'bg-rose-950/90 border-rose-500 text-rose-200 animate-pulse'
            }`}
          >
            <div className="flex items-center gap-3">
              {verificationResult.valid ? (
                <div className="w-10 h-10 rounded-lg bg-emerald-900/80 border border-emerald-500 flex items-center justify-center">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-lg bg-rose-900/80 border border-rose-500 flex items-center justify-center">
                  <XCircle className="w-6 h-6 text-rose-400" />
                </div>
              )}
              <div>
                <div className="text-sm font-extrabold font-mono tracking-wide">
                  AUDIT VERIFICATION VERDICT: {verificationResult.status}
                </div>
                <div className="text-xs opacity-90 mt-0.5">
                  {verificationResult.valid
                    ? `Mathematical integrity confirmed across all ${verificationResult.total} ledger blocks. Zero unauthorized modifications detected.`
                    : `CRITICAL INTEGRITY BREACH: ${verificationResult.broken_at || 'Hash discrepancy detected in chain history'}`}
                </div>
              </div>
            </div>

            <div className="text-right font-mono text-xs hidden sm:block">
              <div>Total Anchors: {verificationResult.total}</div>
              <div className="text-[10px] opacity-75">Algorithm: SHA-256 Sequential</div>
            </div>
          </div>
        )}

        {/* Hash Formula Callout (Page 7 Requirement) */}
        <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 text-xs font-mono text-cyan-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <span className="text-slate-500">Hash Specification: </span>
            <span className="text-emerald-400 font-bold">
              current_hash = SHA256(previous_hash + action + timestamp + incident_id)
            </span>
          </div>
          <span className="text-[11px] text-slate-400">Genesis Hash: 000000...0000</span>
        </div>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center justify-between gap-4">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            placeholder="Search by action, actor, incident ID, or payload..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
        </div>

        <div className="text-xs text-slate-400 font-mono">
          Showing {filteredLogs.length} of {auditLogs.length} Records
        </div>
      </div>

      {/* Audit Blocks Feed */}
      <div className="space-y-3">
        {filteredLogs.map((log, idx) => (
          <div
            key={log.id}
            className="p-4 bg-slate-900/90 border border-slate-800 rounded-xl space-y-2.5 shadow-sm hover:border-slate-700 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded bg-slate-950 border border-slate-800 text-cyan-400 font-mono text-xs font-bold">
                  Block #{idx + 1}
                </span>
                <span className="font-mono text-xs font-bold text-white">{log.action}</span>
                <span className="text-xs text-slate-400">
                  by <strong className="text-slate-200">{log.actor}</strong>
                </span>
              </div>

              <div className="text-xs font-mono text-slate-400">
                {new Date(log.timestamp).toLocaleString()}
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-2.5 rounded border border-slate-800/80">
              {log.details}
            </p>

            {/* Cryptographic Linkage Display */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono bg-slate-950 p-2 rounded border border-slate-800/70">
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                <span className="text-slate-500 mr-2">Previous Hash:</span>
                <span className="text-slate-400">{log.previous_hash}</span>
              </div>
              <div className="overflow-hidden text-ellipsis whitespace-nowrap">
                <span className="text-cyan-500 mr-2">Current Hash:</span>
                <span className="text-cyan-300 font-semibold">{log.current_hash}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
