import React, { useEffect, useState } from 'react';
import { TrainRow } from '../types';
import { X, Sparkles, Clock, Navigation, Train, Layers, ShieldCheck, Info, ChevronRight } from 'lucide-react';

interface TrainDetailDrawerProps {
  train: TrainRow | null;
  onClose: () => void;
}

export const TrainDetailDrawer: React.FC<TrainDetailDrawerProps> = ({ train, onClose }) => {
  const [details, setDetails] = useState<any>(null);
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (train) {
      setLoading(true);
      fetch(`http://localhost:8000/api/trains/${train.train_number}`)
        .then((res) => res.json())
        .then((data) => {
          setDetails(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [train?.train_number]);

  if (!train) return null;

  const pred = details?.next_station_prediction;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-[#0d1424] border-l border-slate-800 shadow-2xl flex flex-col">
      {/* Drawer Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-[#0b1120]">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center">
            <Train className="w-5 h-5 text-cyan-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold text-white font-mono">{train.train_number}</span>
              <span className="text-xs text-slate-300 font-semibold">{train.train_name}</span>
            </div>
            <div className="text-[11px] text-slate-400">{train.train_type} • {train.route}</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Drawer Body */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Core Running Status Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-3.5 space-y-3 font-mono text-xs">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">CURRENT STATUS</span>
            <span
              className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                train.current_delay_minutes > 0
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                  : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              }`}
            >
              {train.current_delay_minutes > 0 ? `Late by ${train.current_delay_minutes}m` : 'Running On Time'}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
            <div>
              <div className="text-[10px] text-slate-500">CURRENT LOCATION</div>
              <div className="text-white font-sans font-semibold text-xs">{train.current_location}</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">NEXT STATION</div>
              <div className="text-white font-sans font-semibold text-xs">{train.next_station} ({train.platform})</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">SPEED</div>
              <div className="text-slate-200 font-bold">{Math.round(train.speed_kmph)} km/h</div>
            </div>
            <div>
              <div className="text-[10px] text-slate-500">PRIORITY CLASS</div>
              <div className="text-cyan-300 font-bold font-sans">{train.priority}</div>
            </div>
          </div>
        </div>

        {/* AI ETA Differentiator Card */}
        <div className="bg-gradient-to-br from-cyan-950/40 via-slate-900 to-slate-950 border border-cyan-500/40 rounded-xl p-4 shadow-lg space-y-3">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center space-x-1.5 text-cyan-400 font-bold text-xs font-mono">
              <Sparkles className="w-4 h-4" />
              <span>DYNAMIC AI ETA FORECAST</span>
            </div>
            <span className="text-[10px] font-mono text-cyan-300 bg-cyan-950 px-2 py-0.5 rounded border border-cyan-800">
              {Math.round(train.confidence_score * 100)}% Confidence
            </span>
          </div>

          {/* Comparison Grid */}
          <div className="grid grid-cols-3 gap-2 text-center font-mono">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <div className="text-[9px] text-slate-500 uppercase">Scheduled</div>
              <div className="text-xs font-bold text-slate-300 mt-0.5">{train.scheduled_eta}</div>
            </div>
            <div className="bg-amber-950/30 p-2 rounded-lg border border-amber-500/30">
              <div className="text-[9px] text-amber-400 uppercase">Traditional Est.</div>
              <div className="text-xs font-bold text-amber-300 mt-0.5">{train.traditional_eta}</div>
            </div>
            <div className="bg-cyan-950/60 p-2 rounded-lg border border-cyan-500/50 shadow-inner">
              <div className="text-[9px] text-cyan-300 uppercase font-bold">AI Predicted</div>
              <div className="text-sm font-bold text-cyan-300 mt-0.5">{train.ai_predicted_eta}</div>
            </div>
          </div>

          {/* Explainability Breakdown */}
          {pred?.factors && pred.factors.length > 0 && (
            <div className="pt-2 border-t border-slate-800">
              <div className="text-[11px] font-bold text-slate-300 mb-1.5 flex items-center gap-1 font-sans">
                <Info className="w-3 h-3 text-cyan-400" />
                <span>Why is this dynamic ETA predicted?</span>
              </div>
              <div className="space-y-1.5">
                {pred.factors.map((f: any, idx: number) => (
                  <div
                    key={idx}
                    className="text-[11px] bg-slate-900/60 p-2 rounded-lg border border-slate-800 font-sans flex items-start justify-between gap-2"
                  >
                    <div>
                      <span className="font-semibold text-slate-200">{f.factor_name}: </span>
                      <span className="text-slate-400">{f.description}</span>
                    </div>
                    {f.impact_minutes !== 0 && (
                      <span
                        className={`font-mono font-bold text-xs shrink-0 ${
                          f.impact_minutes < 0 ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {f.impact_minutes > 0 ? `+${f.impact_minutes}m` : `${f.impact_minutes}m`}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Coach Composition */}
        {details?.coaches && details.coaches.length > 0 && (
          <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-white flex items-center gap-1.5 font-sans">
                <Layers className="w-3.5 h-3.5 text-cyan-400" />
                <span>Coach Composition & Position</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{details.coaches.length} Coaches</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-2 scrollbar-thin">
              {details.coaches.map((c: any) => (
                <div
                  key={c.sequence_number}
                  className="bg-slate-900 border border-slate-700 px-2 py-1 rounded text-center shrink-0 min-w-[42px]"
                >
                  <div className="font-mono font-bold text-[11px] text-cyan-300">{c.coach_code}</div>
                  <div className="text-[8px] text-slate-400 truncate max-w-[40px]">{c.coach_type}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
