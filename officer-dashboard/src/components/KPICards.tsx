import React from 'react';
import { Train, Clock, AlertTriangle, ShieldAlert, Sparkles, TrendingDown, CheckCircle2 } from 'lucide-react';
import { OfficerKPIs } from '../types';

interface KPICardsProps {
  kpis: OfficerKPIs;
  onSelectMetric?: (metric: string) => void;
}

export const KPICards: React.FC<KPICardsProps> = ({ kpis, onSelectMetric }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
      {/* 1. Active Trains */}
      <div className="bg-[#0e1628] border border-slate-800/80 rounded-xl p-3.5 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Active Fleet</span>
          <Train className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-white">{kpis.active_trains}</span>
          <span className="text-[10px] text-emerald-400 font-medium">All tracking</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1">MAS-SBC Mainline</div>
      </div>

      {/* 2. Delayed Trains */}
      <div className="bg-[#0e1628] border border-slate-800/80 rounded-xl p-3.5 shadow-sm hover:border-amber-500/40 transition">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Delayed Trains</span>
          <Clock className="w-4 h-4 text-amber-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-amber-300">{kpis.delayed_trains}</span>
          <span className="text-[10px] text-amber-400 font-medium">Active delays</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1">Dynamic recovery active</div>
      </div>

      {/* 3. Critical Delays */}
      <div className="bg-[#0e1628] border border-slate-800/80 rounded-xl p-3.5 shadow-sm hover:border-rose-500/40 transition">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Critical Delays</span>
          <AlertTriangle className="w-4 h-4 text-rose-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-rose-400">{kpis.critical_delays}</span>
          <span className="text-[10px] text-rose-400 font-medium">&gt; 15 min late</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1">Requires dispatch priority</div>
      </div>

      {/* 4. Platform Conflicts */}
      <div className={`bg-[#0e1628] border rounded-xl p-3.5 shadow-sm transition ${
        kpis.platform_conflicts > 0 ? 'border-rose-500/60 bg-rose-950/20' : 'border-slate-800/80'
      }`}>
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Platform Overlaps</span>
          <ShieldAlert className={`w-4 h-4 ${kpis.platform_conflicts > 0 ? 'text-rose-400 animate-bounce' : 'text-emerald-400'}`} />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className={`text-2xl font-bold font-mono ${kpis.platform_conflicts > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
            {kpis.platform_conflicts}
          </span>
          <span className="text-[10px] text-rose-300 font-medium">Safety alerts</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1">AI suggestions generated</div>
      </div>

      {/* 5. ML Error vs Traditional */}
      <div className="bg-[#0e1628] border border-cyan-900/50 rounded-xl p-3.5 shadow-sm hover:border-cyan-500/40 transition">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">System ML MAE</span>
          <Sparkles className="w-4 h-4 text-cyan-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-cyan-300">{kpis.system_mae_ml}m</span>
          <span className="text-[10px] text-slate-400 line-through">vs {kpis.system_mae_traditional}m</span>
        </div>
        <div className="text-[10px] text-cyan-400 font-semibold mt-1">
          82% error reduction
        </div>
      </div>

      {/* 6. Dynamic Predictions count */}
      <div className="bg-[#0e1628] border border-slate-800/80 rounded-xl p-3.5 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 mb-1">
          <span className="text-[11px] font-semibold uppercase tracking-wider">Predictions Live</span>
          <CheckCircle2 className="w-4 h-4 text-purple-400" />
        </div>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl font-bold font-mono text-white">{kpis.predictions_updated_count}</span>
          <span className="text-[10px] text-purple-300 font-medium">Recalculated</span>
        </div>
        <div className="text-[10px] text-slate-400 mt-1">Adaptive section models</div>
      </div>
    </div>
  );
};
