import React, { useState } from 'react';
import { TrainRow } from '../types';
import { Sparkles, ArrowRight, Gauge, ShieldCheck, AlertCircle, Info, ChevronRight, Filter } from 'lucide-react';

interface LiveFleetTableProps {
  trains: TrainRow[];
  onSelectTrain: (train: TrainRow) => void;
  selectedTrainId?: number;
}

export const LiveFleetTable: React.FC<LiveFleetTableProps> = ({
  trains,
  onSelectTrain,
  selectedTrainId
}) => {
  const [filterType, setFilterType] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const filteredTrains = trains.filter((t) => {
    const matchesSearch =
      t.train_number.includes(searchTerm) ||
      t.train_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.current_location.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'DELAYED') return matchesSearch && t.current_delay_minutes > 0;
    if (filterType === 'CRITICAL') return matchesSearch && (t.current_delay_minutes >= 15 || t.risk_level === 'Critical');
    return matchesSearch;
  });

  return (
    <div className="bg-[#0b1120] border border-slate-800 rounded-xl overflow-hidden shadow-lg">
      {/* Table Toolbar */}
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#0d1424]">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <span>Active Corridor Fleet & Dynamic ETA Matrix</span>
            <span className="text-[11px] font-mono text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded border border-cyan-800/60">
              {filteredTrains.length} Active Trains
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time comparison between Traditional Delay heuristic and AI Adaptive Section Forecasting
          </p>
        </div>

        {/* Filters */}
        <div className="flex items-center space-x-2">
          <input
            type="text"
            placeholder="Search train no, name, station..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-xs rounded-lg px-3 py-1.5 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 w-48"
          />

          <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5 text-xs font-semibold">
            {['ALL', 'DELAYED', 'CRITICAL'].map((f) => (
              <button
                key={f}
                onClick={() => setFilterType(f)}
                className={`px-2.5 py-1 rounded transition ${
                  filterType === f
                    ? 'bg-cyan-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* High Density Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-slate-800 bg-slate-900/90 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
              <th className="py-3 px-3">Train / Type</th>
              <th className="py-3 px-3">Corridor Route</th>
              <th className="py-3 px-3">Current Location</th>
              <th className="py-3 px-2 text-center">Delay</th>
              <th className="py-3 px-2 text-center">Speed</th>
              <th className="py-3 px-3">Next Station</th>
              <th className="py-3 px-2 text-center">Sched. ETA</th>
              <th className="py-3 px-2 text-center bg-slate-950/40 text-amber-300">Traditional Est.</th>
              <th className="py-3 px-3 text-center bg-cyan-950/40 text-cyan-300 border-l border-r border-cyan-800/40 font-bold">
                <span className="flex items-center justify-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  AI Predicted ETA
                </span>
              </th>
              <th className="py-3 px-2 text-center">Conf.</th>
              <th className="py-3 px-2 text-center">Plat.</th>
              <th className="py-3 px-2 text-center">Risk</th>
              <th className="py-3 px-2 text-center">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {filteredTrains.map((t) => {
              const isSelected = selectedTrainId === t.id;
              const hasRecovery = t.delay_recovery_minutes > 0;

              return (
                <tr
                  key={t.id}
                  onClick={() => onSelectTrain(t)}
                  className={`hover:bg-slate-800/50 transition cursor-pointer ${
                    isSelected ? 'bg-cyan-950/30 ring-1 ring-cyan-500/50' : ''
                  }`}
                >
                  {/* Train No & Name */}
                  <td className="py-2.5 px-3 font-sans">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <span className="text-cyan-400 font-mono font-bold">{t.train_number}</span>
                      <span className="text-slate-300 truncate max-w-[140px]">{t.train_name}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-sans">{t.train_type}</div>
                  </td>

                  {/* Route */}
                  <td className="py-2.5 px-3 font-sans text-slate-300 text-xs">
                    {t.route}
                  </td>

                  {/* Current Location */}
                  <td className="py-2.5 px-3 font-sans">
                    <div className="text-slate-200 font-medium truncate max-w-[120px]">
                      {t.current_location}
                    </div>
                    <div className="w-20 bg-slate-800 h-1 rounded-full mt-1 overflow-hidden">
                      <div
                        className="bg-cyan-500 h-full rounded-full"
                        style={{ width: `${t.progress_percentage}%` }}
                      />
                    </div>
                  </td>

                  {/* Delay */}
                  <td className="py-2.5 px-2 text-center">
                    {t.current_delay_minutes === 0 ? (
                      <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 rounded text-[11px] font-semibold font-sans">
                        ON TIME
                      </span>
                    ) : (
                      <span
                        className={`px-1.5 py-0.5 rounded text-[11px] font-bold ${
                          t.current_delay_minutes >= 15
                            ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        }`}
                      >
                        +{t.current_delay_minutes}m
                      </span>
                    )}
                  </td>

                  {/* Speed */}
                  <td className="py-2.5 px-2 text-center text-slate-300 text-xs">
                    {Math.round(t.speed_kmph)} <span className="text-[10px] text-slate-500">km/h</span>
                  </td>

                  {/* Next Station */}
                  <td className="py-2.5 px-3 font-sans text-slate-200 font-medium">
                    {t.next_station}
                  </td>

                  {/* Scheduled ETA */}
                  <td className="py-2.5 px-2 text-center text-slate-400">
                    {t.scheduled_eta}
                  </td>

                  {/* Traditional Estimate */}
                  <td className="py-2.5 px-2 text-center bg-slate-950/30 text-amber-400/90 font-medium">
                    {t.traditional_eta}
                  </td>

                  {/* AI Predicted ETA (Differentiator!) */}
                  <td className="py-2.5 px-3 text-center bg-cyan-950/30 border-l border-r border-cyan-800/40 font-bold">
                    <div className="text-cyan-300 text-sm font-bold flex items-center justify-center gap-1">
                      {t.ai_predicted_eta}
                    </div>
                    {hasRecovery && (
                      <div className="text-[9px] font-sans font-semibold text-emerald-400 bg-emerald-950/60 rounded px-1 mt-0.5 inline-block">
                        -{t.delay_recovery_minutes}m recovered
                      </div>
                    )}
                  </td>

                  {/* Confidence */}
                  <td className="py-2.5 px-2 text-center">
                    <div className="text-[11px] font-bold text-slate-300">
                      {Math.round(t.confidence_score * 100)}%
                    </div>
                    <div className="w-10 bg-slate-800 h-1 rounded-full mx-auto mt-0.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full ${
                          t.confidence_score >= 0.85 ? 'bg-cyan-400' : 'bg-amber-400'
                        }`}
                        style={{ width: `${t.confidence_score * 100}%` }}
                      />
                    </div>
                  </td>

                  {/* Platform */}
                  <td className="py-2.5 px-2 text-center font-sans font-bold text-slate-200">
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700">
                      {t.platform}
                    </span>
                  </td>

                  {/* Risk Level */}
                  <td className="py-2.5 px-2 text-center font-sans">
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                        t.risk_level === 'Critical'
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                          : t.risk_level === 'At Risk'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-emerald-500/10 text-emerald-400'
                      }`}
                    >
                      {t.risk_level}
                    </span>
                  </td>

                  {/* Action */}
                  <td className="py-2.5 px-2 text-center">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectTrain(t);
                      }}
                      className="p-1 rounded bg-slate-800 hover:bg-cyan-600 hover:text-white text-slate-400 transition"
                      title="Inspect train details"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
