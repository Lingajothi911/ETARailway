import React from 'react';
import { CongestionSection } from '../types';
import { Activity, Zap, AlertCircle, CheckCircle2, ShieldCheck, Gauge } from 'lucide-react';

interface CongestionMonitorProps {
  sections: CongestionSection[];
}

export const CongestionMonitor: React.FC<CongestionMonitorProps> = ({ sections }) => {
  return (
    <div className="bg-[#0b1120] border border-slate-800 rounded-xl overflow-hidden shadow-lg p-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="w-4 h-4 text-cyan-400" />
            <span>Corridor Section Density & Track Congestion Monitor</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time sectional traffic load fed dynamically into the AI ETA prediction feature pipeline
          </p>
        </div>
      </div>

      {/* Grid of Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {sections.map((sec) => {
          const isHeavy = sec.current_congestion === 'Heavy';
          const isModerate = sec.current_congestion === 'Moderate';
          const isNormal = sec.current_congestion === 'Normal';

          return (
            <div
              key={sec.id}
              className={`p-3.5 rounded-xl border transition ${
                isHeavy
                  ? 'bg-rose-950/20 border-rose-500/50'
                  : isModerate
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              {/* Section Name & Badge */}
              <div className="flex items-center justify-between mb-2">
                <div className="font-bold text-xs text-white font-mono flex items-center gap-1.5">
                  <span className="text-cyan-400">{sec.from_station_code}</span>
                  <span className="text-slate-500">→</span>
                  <span className="text-cyan-400">{sec.to_station_code}</span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                    isHeavy
                      ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                      : isModerate
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'bg-emerald-500/10 text-emerald-400'
                  }`}
                >
                  {sec.current_congestion}
                </span>
              </div>

              {/* Station Full Names */}
              <div className="text-[11px] text-slate-300 font-sans truncate mb-2">
                {sec.from_station_name} to {sec.to_station_name}
              </div>

              {/* Section Details */}
              <div className="grid grid-cols-3 gap-2 bg-slate-950/60 p-2 rounded-lg text-[10px] font-mono border border-slate-800/80">
                <div>
                  <div className="text-slate-500">DISTANCE</div>
                  <div className="text-slate-200 font-bold">{sec.distance_km} km</div>
                </div>
                <div>
                  <div className="text-slate-500">MAX SPEED</div>
                  <div className="text-slate-200 font-bold">{sec.max_speed_kmph} km/h</div>
                </div>
                <div>
                  <div className="text-slate-500">ML IMPACT</div>
                  <div className={`font-bold ${sec.congestion_delay_factor > 0 ? 'text-amber-400' : 'text-emerald-400'}`}>
                    +{sec.congestion_delay_factor}m buffer
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
