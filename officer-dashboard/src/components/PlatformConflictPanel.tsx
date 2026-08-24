import React, { useState } from 'react';
import { PlatformConflict } from '../types';
import { ShieldAlert, CheckCircle2, AlertTriangle, ArrowRight, Layers, Sparkles, Check, Info } from 'lucide-react';

interface PlatformConflictPanelProps {
  conflicts: PlatformConflict[];
  onResolveConflict: (conflictId: number) => void;
}

export const PlatformConflictPanel: React.FC<PlatformConflictPanelProps> = ({
  conflicts,
  onResolveConflict
}) => {
  const [selectedStation, setSelectedStation] = useState<string>('KPD');
  const [resolvedIds, setResolvedIds] = useState<number[]>([]);

  const handleResolve = (id: number) => {
    setResolvedIds((prev) => [...prev, id]);
    onResolveConflict(id);
  };

  // Demo Platform Layout for Katpadi (KPD) & Chennai Central (MAS)
  const stationPlatforms = [
    { number: '1', status: 'Occupied', train: '20607 Vande Bharat', time: '07:15', note: 'Through line' },
    { number: '2', status: conflicts.some(c => !resolvedIds.includes(c.id)) ? 'Conflict' : 'Occupied', train: '12627 Karnataka Exp', time: '23:06', note: 'Double booking risk' },
    { number: '3', status: 'Free', train: null, time: null, note: 'Clear' },
    { number: '4', status: 'Free', train: null, time: null, note: 'Recommended for 16021' },
    { number: '5', status: 'Maintenance', train: null, time: null, note: 'Overhead wire check' }
  ];

  return (
    <div className="space-y-4">
      {/* AI Conflict Alerts Banner */}
      <div className="bg-[#121124] border border-rose-500/50 rounded-xl p-4 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start space-x-3">
            <div className="w-10 h-10 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-rose-400 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-bold text-white">
                  Intelligent Platform Conflict & Safety Overlap Engine
                </h3>
                <span className="bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {conflicts.filter(c => !resolvedIds.includes(c.id)).length} Active Conflict
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                AI continuous ETA recalculation detected an overlapping dwell window violating safety clearance buffer.
              </p>
            </div>
          </div>
        </div>

        {/* Conflict Cards */}
        <div className="mt-4 space-y-3">
          {conflicts.map((conflict) => {
            const isResolved = resolvedIds.includes(conflict.id) || conflict.is_resolved;

            return (
              <div
                key={conflict.id}
                className={`p-3.5 rounded-xl border transition ${
                  isResolved
                    ? 'bg-emerald-950/20 border-emerald-500/30'
                    : 'bg-rose-950/30 border-rose-500/40'
                }`}
              >
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
                  {/* Overlap Summary */}
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white font-mono bg-slate-800 px-2 py-0.5 rounded">
                        {conflict.station_name} ({conflict.station_code}) • Platform {conflict.platform_number}
                      </span>
                      {!isResolved && (
                        <span className="text-[10px] font-bold text-rose-400 bg-rose-500/20 px-2 py-0.5 rounded font-mono">
                          {conflict.overlap_minutes} min unsafe overlap
                        </span>
                      )}
                      {isResolved && (
                        <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/20 px-2 py-0.5 rounded flex items-center gap-1">
                          <Check className="w-3 h-3" /> Reassignment Approved
                        </span>
                      )}
                    </div>

                    {/* Conflicting Trains */}
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-mono">
                      <div className="bg-slate-900 px-2.5 py-1 rounded border border-slate-700 text-slate-200">
                        <span className="text-cyan-400 font-bold">{conflict.train1_number}</span> {conflict.train1_name} (ETA: {conflict.train1_eta})
                      </div>
                      <span className="text-rose-400 font-bold">VS</span>
                      <div className="bg-slate-900 px-2.5 py-1 rounded border border-slate-700 text-slate-200">
                        <span className="text-cyan-400 font-bold">{conflict.train2_number}</span> {conflict.train2_name} (ETA: {conflict.train2_eta})
                      </div>
                    </div>

                    {/* AI Recommendation rationale */}
                    <div className="mt-2 text-xs text-slate-300 flex items-start gap-1.5 font-sans">
                      <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />
                      <span>{conflict.recommendation_reason}</span>
                    </div>
                  </div>

                  {/* Resolution Action Button */}
                  <div className="shrink-0">
                    {isResolved ? (
                      <div className="flex items-center space-x-1.5 text-emerald-400 text-xs font-bold bg-emerald-950/60 border border-emerald-500/40 px-3 py-2 rounded-lg">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Platform {conflict.suggested_platform} Assigned</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleResolve(conflict.id)}
                        className="flex items-center space-x-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white px-3.5 py-2 rounded-lg text-xs font-bold shadow-lg shadow-emerald-500/20 transition transform active:scale-95 whitespace-nowrap"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve Reassignment to Platform {conflict.suggested_platform}</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Visual Station Platform Occupancy Grid */}
      <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-4 shadow-lg">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center space-x-2">
            <Layers className="w-4 h-4 text-cyan-400" />
            <h3 className="text-sm font-bold text-white">
              Katpadi Junction (KPD) • Live Platform Occupancy Grid
            </h3>
          </div>
          <span className="text-xs text-slate-400">Total 5 Platforms</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {stationPlatforms.map((p) => {
            const isConflict = p.status === 'Conflict';
            const isOccupied = p.status === 'Occupied';
            const isFree = p.status === 'Free';

            return (
              <div
                key={p.number}
                className={`p-3 rounded-xl border transition ${
                  isConflict
                    ? 'bg-rose-950/30 border-rose-500/60'
                    : isOccupied
                    ? 'bg-amber-950/20 border-amber-500/40'
                    : isFree
                    ? 'bg-emerald-950/10 border-emerald-500/30'
                    : 'bg-slate-900/60 border-slate-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-mono font-bold text-sm text-white bg-slate-800 px-2 py-0.5 rounded">
                    Platform {p.number}
                  </span>
                  <span
                    className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                      isConflict
                        ? 'bg-rose-500/20 text-rose-400'
                        : isOccupied
                        ? 'bg-amber-500/20 text-amber-300'
                        : isFree
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {p.status}
                  </span>
                </div>

                <div className="text-xs font-semibold text-slate-200 truncate">
                  {p.train || 'No Active Train'}
                </div>
                {p.time && (
                  <div className="text-[11px] font-mono text-cyan-400 mt-1">
                    ETA: {p.time}
                  </div>
                )}
                <div className="text-[10px] text-slate-400 mt-2 border-t border-slate-800/80 pt-1.5">
                  {p.note}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
