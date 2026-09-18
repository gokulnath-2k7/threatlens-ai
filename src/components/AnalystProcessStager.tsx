import React, { useState } from 'react';
import {
  CheckCircle2,
  Clock,
  ChevronRight,
  Shield,
  FileSearch,
  Activity,
  CheckSquare,
  Square,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  Info,
} from 'lucide-react';
import { Incident, User } from '../types';
import { ANALYST_STAGES } from '../data/stages';

interface AnalystProcessStagerProps {
  incident: Incident;
  currentUser: User;
  onUpdateStage: (stageId: number, notes?: string) => Promise<void>;
  isUpdating?: boolean;
}

export const AnalystProcessStager: React.FC<AnalystProcessStagerProps> = ({
  incident,
  currentUser,
  onUpdateStage,
  isUpdating = false,
}) => {
  const currentStageId = incident.current_stage || 6;
  const currentStageInfo = ANALYST_STAGES.find((s) => s.id === currentStageId) || ANALYST_STAGES[5];

  const [completedActions, setCompletedActions] = useState<Record<string, boolean>>({
    [`${currentStageId}-0`]: true,
    [`${currentStageId}-1`]: true,
  });
  const [stageNotes, setStageNotes] = useState('');
  const [showChecklist, setShowChecklist] = useState(true);

  const toggleAction = (key: string) => {
    setCompletedActions((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const handleAdvance = () => {
    if (currentStageId < 7) {
      onUpdateStage(currentStageId + 1, stageNotes || `Advanced to Stage ${currentStageId + 1}`);
      setStageNotes('');
    }
  };

  const handlePrevious = () => {
    if (currentStageId > 1) {
      onUpdateStage(currentStageId - 1, stageNotes || `Reverted to Stage ${currentStageId - 1}`);
      setStageNotes('');
    }
  };

  return (
    <div id="analyst-process-stager" className="p-4 sm:p-5 rounded-xl bg-slate-900/90 border border-cyan-800/60 shadow-xl space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold text-cyan-400 uppercase tracking-wider">
                Analyst Workflow Pipeline
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-cyan-950 text-cyan-300 border border-cyan-700">
                CURRENT POSITION: STAGE {currentStageId} OF 7
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Assigned Analyst: <strong className="text-slate-200">{currentUser.name}</strong> • Incident: <span className="font-mono text-cyan-300">{incident.incident_number}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={() => setShowChecklist(!showChecklist)}
            className="px-2.5 py-1 text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700/80 rounded border border-slate-700 font-mono text-[11px] transition-colors"
          >
            {showChecklist ? 'Hide Action Checklist' : 'Show Action Checklist'}
          </button>
        </div>
      </div>

      {/* 7-Stage Horizontal Visual Stepper */}
      <div className="overflow-x-auto pb-2">
        <div className="flex items-center min-w-[760px] justify-between relative px-2">
          {/* Connector Track Line */}
          <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-800 -z-0"></div>
          <div
            className="absolute top-4 left-6 h-0.5 bg-gradient-to-r from-emerald-500 via-cyan-500 to-blue-500 -z-0 transition-all duration-300"
            style={{ width: `${((currentStageId - 1) / 6) * 100}%` }}
          ></div>

          {ANALYST_STAGES.map((stage) => {
            const isCompleted = stage.id < currentStageId;
            const isCurrent = stage.id === currentStageId;
            const isUpcoming = stage.id > currentStageId;

            return (
              <div
                key={stage.id}
                onClick={() => onUpdateStage(stage.id, `Manual jump to ${stage.name}`)}
                className="flex flex-col items-center group cursor-pointer z-10 text-center max-w-[100px]"
                title={`Click to set position to ${stage.name}`}
              >
                {/* Node circle */}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center font-mono text-xs font-bold transition-all ${
                    isCompleted
                      ? 'bg-emerald-950 text-emerald-300 border-2 border-emerald-500 shadow-md shadow-emerald-950/60'
                      : isCurrent
                      ? 'bg-cyan-500 text-slate-950 border-2 border-white shadow-lg shadow-cyan-500/50 scale-110 ring-4 ring-cyan-500/20'
                      : 'bg-slate-900 text-slate-500 border border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {isCompleted ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : stage.id}
                </div>

                {/* Stage Title */}
                <span
                  className={`text-[10px] font-medium mt-2 leading-tight ${
                    isCurrent
                      ? 'text-cyan-300 font-bold'
                      : isCompleted
                      ? 'text-emerald-400'
                      : 'text-slate-500 group-hover:text-slate-400'
                  }`}
                >
                  {stage.short_name}
                </span>

                {isCurrent && (
                  <span className="mt-1 px-1.5 py-0.2 bg-cyan-950/80 border border-cyan-600/80 text-cyan-300 rounded text-[9px] font-mono animate-pulse whitespace-nowrap">
                    Active
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Stage Detail Card with SLA & Checklist */}
      {showChecklist && (
        <div className="p-3.5 rounded-lg bg-slate-950/70 border border-cyan-900/50 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">
                  {currentStageInfo.name}
                </span>
                <span className="px-1.5 py-0.5 bg-slate-800 text-slate-300 text-[10px] font-mono rounded">
                  Target SLA: {currentStageInfo.target_sla_mins} mins
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{currentStageInfo.description}</p>
            </div>

            {/* Quick Step Buttons */}
            <div className="flex items-center gap-2 shrink-0">
              <button
                onClick={handlePrevious}
                disabled={currentStageId <= 1 || isUpdating}
                className="px-2.5 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Prev Stage</span>
              </button>

              <button
                onClick={handleAdvance}
                disabled={currentStageId >= 7 || isUpdating}
                className="px-3 py-1.5 rounded bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-semibold flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-cyan-600/20 transition-all"
              >
                <span>Advance to Next Stage</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Key actions checklist for this stage */}
          <div className="pt-2 border-t border-slate-800/80">
            <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider block mb-2 font-mono">
              Stage {currentStageId} Verification Checklist
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {currentStageInfo.key_actions.map((action, idx) => {
                const key = `${currentStageId}-${idx}`;
                const checked = !!completedActions[key];
                return (
                  <div
                    key={key}
                    onClick={() => toggleAction(key)}
                    className={`flex items-start gap-2 p-2 rounded cursor-pointer border text-xs transition-colors ${
                      checked
                        ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-200'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {checked ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
                    )}
                    <span className={checked ? 'line-through opacity-85' : ''}>{action}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
