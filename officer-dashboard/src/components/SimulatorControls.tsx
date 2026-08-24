import React from 'react';
import { Play, Pause, RotateCcw, Zap, FastForward, Gauge } from 'lucide-react';

interface SimulatorControlsProps {
  isRunning: boolean;
  speedMultiplier: number;
  onPlay: () => void;
  onPause: () => void;
  onReset: () => void;
  onSpeedChange: (speed: number) => void;
  onOpenInjectDelay: () => void;
}

export const SimulatorControls: React.FC<SimulatorControlsProps> = ({
  isRunning,
  speedMultiplier,
  onPlay,
  onPause,
  onReset,
  onSpeedChange,
  onOpenInjectDelay
}) => {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-[#0d1527] to-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-md">
      {/* Engine Status */}
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className={`w-2.5 h-2.5 rounded-full ${isRunning ? 'bg-cyan-400 animate-ping' : 'bg-slate-500'}`} />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono">
            SIMULATION ENGINE: <span className={isRunning ? 'text-cyan-400 font-bold' : 'text-slate-400'}>{isRunning ? 'RUNNING' : 'PAUSED'}</span>
          </span>
        </div>
        <span className="text-slate-600">|</span>
        <span className="text-xs text-slate-400 hidden sm:inline">
          Accelerated railway kinetic dispatcher & dynamic ML loop
        </span>
      </div>

      {/* Control Buttons & Speed Multipliers */}
      <div className="flex items-center space-x-2">
        {/* Play/Pause Button */}
        <button
          onClick={isRunning ? onPause : onPlay}
          className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-bold shadow transition ${
            isRunning
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30'
          }`}
        >
          {isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
          <span>{isRunning ? 'PAUSE' : 'RESUME'}</span>
        </button>

        {/* Speed Selector */}
        <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-lg p-0.5">
          {[1, 5, 15].map((speed) => (
            <button
              key={speed}
              onClick={() => onSpeedChange(speed)}
              className={`px-2.5 py-1 rounded text-xs font-mono font-bold transition ${
                speedMultiplier === speed
                  ? 'bg-cyan-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {speed}x
            </button>
          ))}
        </div>

        {/* Reset Simulation */}
        <button
          onClick={onReset}
          title="Reset train positions to baseline"
          className="flex items-center space-x-1 px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-semibold border border-slate-700 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span className="hidden md:inline">RESET</span>
        </button>

        {/* Delay Injection Demo Button (Crucial for Demo) */}
        <button
          onClick={onOpenInjectDelay}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-lg text-xs font-bold shadow-lg shadow-purple-500/20 border border-purple-400/30 transition transform active:scale-95"
        >
          <Zap className="w-3.5 h-3.5 text-yellow-300 animate-pulse" />
          <span>INJECT OPERATIONAL DELAY</span>
        </button>
      </div>
    </div>
  );
};
