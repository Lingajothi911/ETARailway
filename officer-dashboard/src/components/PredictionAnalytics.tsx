import React, { useEffect, useState } from 'react';
import { AnalyticsData } from '../types';
import { fetchAnalyticsData } from '../services/api';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, LineChart, Line, Cell
} from 'recharts';
import { BarChart3, Sparkles, TrendingDown, Info, ShieldCheck, Cpu } from 'lucide-react';

export const PredictionAnalytics: React.FC = () => {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchAnalyticsData()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  if (loading || !data) {
    return (
      <div className="p-8 text-center text-slate-400 font-mono text-xs">
        Loading AI Prediction Analytics...
      </div>
    );
  }

  const chartData = data.evaluations.map((e) => ({
    name: `${e.train_number} @ ${e.station}`,
    'AI Model Error (min)': e.ai_error_min,
    'Traditional Error (min)': e.traditional_error_min
  }));

  const featureData = data.feature_importance.map((f) => ({
    name: f.feature,
    weight: Math.round(f.importance * 100),
    description: f.description
  }));

  return (
    <div className="space-y-4">
      {/* Prototype / Transparency Disclaimer Banner */}
      <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-3.5 flex items-start space-x-3">
        <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div className="text-xs">
          <span className="font-bold text-amber-300 uppercase tracking-wider font-mono">
            {data.disclaimer}
          </span>
          <p className="text-slate-300 mt-0.5">
            The evaluations and feature contributions shown below illustrate model verification and operational error metrics. In production, this dashboard directly binds to trained ML pipeline validation logs (XGBoost / LightGBM / LSTM).
          </p>
        </div>
      </div>

      {/* Metric KPI Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            AI Mean Absolute Error
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold font-mono text-cyan-400">
              {data.summary.mae_ml_minutes}m
            </span>
            <span className="text-xs text-emerald-400 font-semibold font-mono">
              (High Precision)
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Average deviation from actual arrival</div>
        </div>

        <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Traditional Est. Error
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold font-mono text-amber-400">
              {data.summary.mae_traditional_minutes}m
            </span>
            <span className="text-xs text-rose-400 font-semibold font-mono">
              (Static Delay Drift)
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Simple Scheduled + Delay formula</div>
        </div>

        <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Error Reduction
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-400">
              {data.summary.accuracy_improvement_pct}%
            </span>
            <TrendingDown className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Lower error vs traditional method</div>
        </div>

        <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-3.5">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
            Evaluated Runs
          </div>
          <div className="flex items-baseline space-x-2 mt-1">
            <span className="text-2xl font-bold font-mono text-purple-400">
              {data.summary.total_samples} Sections
            </span>
          </div>
          <div className="text-[10px] text-slate-500 mt-1">Corridor benchmark dataset</div>
        </div>
      </div>

      {/* Recharts Error Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Chart 1: Error Comparison */}
        <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              PREDICTION ERROR COMPARISON (MINUTES)
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">Lower is better</span>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 25 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" tick={{ fontSize: 9 }} angle={-30} textAnchor="end" />
                <YAxis stroke="#64748b" tick={{ fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Bar dataKey="AI Model Error (min)" fill="#0ea5e9" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Traditional Error (min)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Feature Importance Breakdown */}
        <div className="bg-[#0b1120] border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800">
            <h3 className="text-xs font-bold text-white flex items-center gap-1.5 font-mono">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              DYNAMIC ETA FEATURE IMPORTANCE WEIGHTS
            </h3>
            <span className="text-[10px] text-slate-400 font-mono">SHAP Feature Impact</span>
          </div>

          <div className="h-64 w-full text-xs">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={featureData} layout="vertical" margin={{ top: 10, right: 20, left: 60, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis type="number" stroke="#64748b" tick={{ fontSize: 10 }} domain={[0, 45]} unit="%" />
                <YAxis dataKey="name" type="category" stroke="#64748b" tick={{ fontSize: 9 }} width={120} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px', fontSize: '11px' }}
                  formatter={(val: any) => [`${val}%`, 'Importance Weight']}
                />
                <Bar dataKey="weight" fill="#a855f7" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
