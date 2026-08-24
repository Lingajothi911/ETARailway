import React, { useState } from 'react';
import { Zap, X, AlertTriangle, Sparkles, Check } from 'lucide-react';
import { TrainRow } from '../types';

interface InjectDelayModalProps {
  isOpen: boolean;
  onClose: () => void;
  trains: TrainRow[];
  onInject: (trainNumber: string, addedMinutes: number) => void;
}

export const InjectDelayModal: React.FC<InjectDelayModalProps> = ({
  isOpen,
  onClose,
  trains,
  onInject
}) => {
  const [selectedTrain, setSelectedTrain] = useState<string>(trains[0]?.train_number || '12627');
  const [delayMinutes, setDelayMinutes] = useState<number>(15);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onInject(selectedTrain, delayMinutes);
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#0f172a] border border-cyan-500/40 rounded-2xl max-w-md w-full p-5 shadow-2xl relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center">
            <Zap className="w-5 h-5 text-yellow-300 animate-pulse" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Live Delay Injection Tool</h3>
            <p className="text-xs text-slate-400">Simulate real-time operational disruption</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 bg-slate-900/90 border border-slate-800 p-3 rounded-xl mb-4 font-sans">
          This demo feature injects unexpected delay onto a running train to demonstrate how the <strong className="text-cyan-400">AI prediction model recalculates upcoming ETAs</strong>, factors in delay recovery, and generates platform conflict warnings simultaneously.
        </p>

        {isSuccess ? (
          <div className="bg-emerald-950/40 border border-emerald-500/40 rounded-xl p-4 text-center my-4">
            <Check className="w-6 h-6 text-emerald-400 mx-auto mb-1" />
            <div className="text-xs font-bold text-emerald-300">
              Disruption Injected! (+{delayMinutes}m delay)
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              AI recalculating dynamic arrival times in real-time...
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Select Train */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Target Train
              </label>
              <select
                value={selectedTrain}
                onChange={(e) => setSelectedTrain(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs rounded-xl px-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
              >
                {trains.map((t) => (
                  <option key={t.train_number} value={t.train_number}>
                    {t.train_number} - {t.train_name} (Current: +{t.current_delay_minutes}m)
                  </option>
                ))}
              </select>
            </div>

            {/* Select Delay Amount */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
                Added Delay: <span className="text-amber-400 font-bold">+{delayMinutes} minutes</span>
              </label>
              <div className="flex items-center gap-2">
                {[5, 10, 15, 25].map((mins) => (
                  <button
                    type="button"
                    key={mins}
                    onClick={() => setDelayMinutes(mins)}
                    className={`flex-1 py-2 rounded-lg text-xs font-bold font-mono transition ${
                      delayMinutes === mins
                        ? 'bg-purple-600 text-white shadow-lg shadow-purple-500/30'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    +{mins}m
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-purple-500/20 transition flex items-center justify-center space-x-2"
            >
              <Zap className="w-4 h-4 text-yellow-300" />
              <span>APPLY DELAY & RECALCULATE DYNAMIC ETA</span>
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
