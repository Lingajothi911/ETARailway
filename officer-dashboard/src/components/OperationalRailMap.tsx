import React, { useState } from 'react';
import { TrainRow } from '../types';
import { Train, Navigation, Sparkles, AlertTriangle, ShieldCheck, MapPin, Gauge } from 'lucide-react';

interface OperationalRailMapProps {
  trains: TrainRow[];
  selectedTrain?: TrainRow | null;
  onSelectTrain: (train: TrainRow) => void;
}

interface StationNode {
  code: string;
  name: string;
  x: number; // SVG coordinates 0 - 1000
  y: number;
  platforms: number;
}

export const OperationalRailMap: React.FC<OperationalRailMapProps> = ({
  trains,
  selectedTrain,
  onSelectTrain
}) => {
  const [hoveredTrain, setHoveredTrain] = useState<TrainRow | null>(null);

  // SVG Coordinate mapping for the Southern Main Corridor
  const stations: StationNode[] = [
    { code: 'MAS', name: 'Chennai Central (MAS)', x: 100, y: 150, platforms: 12 },
    { code: 'AJJ', name: 'Arakkonam (AJJ)', x: 250, y: 170, platforms: 5 },
    { code: 'KPD', name: 'Katpadi Jnr (KPD)', x: 420, y: 200, platforms: 5 },
    { code: 'JTJ', name: 'Jolarpettai Jnr (JTJ)', x: 580, y: 260, platforms: 5 },
    { code: 'BWT', name: 'Bangarapet (BWT)', x: 720, y: 220, platforms: 4 },
    { code: 'KJM', name: 'Krishnarajapuram (KJM)', x: 840, y: 200, platforms: 4 },
    { code: 'SBC', name: 'KSR Bengaluru (SBC)', x: 930, y: 200, platforms: 10 },
    // Southern branch from JTJ
    { code: 'SA', name: 'Salem (SA)', x: 620, y: 380, platforms: 5 },
    { code: 'ED', name: 'Erode (ED)', x: 730, y: 440, platforms: 4 },
    { code: 'CBE', name: 'Coimbatore (CBE)', x: 870, y: 480, platforms: 6 }
  ];

  // Helper to get approximate SVG position based on progress % along main route
  const getTrainSVGPosition = (train: TrainRow) => {
    // Determine route branch
    const isCoimbatoreRoute = train.route.includes('CBE') || train.train_number === '12675';
    
    if (isCoimbatoreRoute) {
      const pct = Math.max(0, Math.min(100, train.progress_percentage)) / 100;
      if (pct < 0.45) {
        // MAS to JTJ
        const subPct = pct / 0.45;
        const x = 100 + (580 - 100) * subPct;
        const y = 150 + (260 - 150) * subPct;
        return { x, y };
      } else {
        // JTJ to CBE
        const subPct = (pct - 0.45) / 0.55;
        const x = 580 + (870 - 580) * subPct;
        const y = 260 + (480 - 260) * subPct;
        return { x, y };
      }
    } else {
      // MAS to SBC main line
      const pct = Math.max(0, Math.min(100, train.progress_percentage)) / 100;
      const x = 100 + (930 - 100) * pct;
      // Gentle curve through KPD & JTJ
      const y = 150 + Math.sin(pct * Math.PI) * 90;
      return { x, y };
    }
  };

  return (
    <div className="bg-[#0b1120] border border-slate-800 rounded-xl overflow-hidden shadow-lg p-4">
      {/* Map Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <Navigation className="w-4 h-4 text-cyan-400" />
            <span>Interactive Operational Corridor Rail Map</span>
          </h2>
          <p className="text-xs text-slate-400">
            Live GPS telemetry, section line density, and spatial train fleet locations
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center space-x-3 text-[11px]">
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 bg-emerald-500 rounded-full" />
            <span className="text-slate-400">Normal Track</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 bg-amber-500 rounded-full" />
            <span className="text-slate-400">Moderate Load</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-3 h-1 bg-rose-500 rounded-full" />
            <span className="text-slate-400">Heavy Congestion (KPD-JTJ)</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
            <span className="text-cyan-400 font-semibold">Live Train</span>
          </div>
        </div>
      </div>

      {/* SVG Rail Map Viewport */}
      <div className="relative w-full h-[380px] bg-[#070c18] rounded-xl border border-slate-900 overflow-hidden shadow-inner flex items-center justify-center">
        {/* Background Grid Lines */}
        <svg className="w-full h-full" viewBox="0 0 1020 540" preserveAspectRatio="xMidYMid meet">
          <defs>
            <linearGradient id="trackGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0ea5e9" />
              <stop offset="35%" stopColor="#f59e0b" />
              <stop offset="55%" stopColor="#ef4444" />
              <stop offset="80%" stopColor="#0ea5e9" />
              <stop offset="100%" stopColor="#10b981" />
            </linearGradient>

            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>

          {/* Grid pattern */}
          <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#141c2e" strokeWidth="0.5" />
          </pattern>
          <rect width="100%" height="100%" fill="url(#grid)" />

          {/* Main Track Route (MAS -> AJJ -> KPD -> JTJ -> BWT -> KJM -> SBC) */}
          <path
            d="M 100 150 L 250 170 L 420 200 L 580 260 L 720 220 L 840 200 L 930 200"
            fill="none"
            stroke="#1e293b"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path
            d="M 100 150 L 250 170 L 420 200 L 580 260 L 720 220 L 840 200 L 930 200"
            fill="none"
            stroke="url(#trackGradient)"
            strokeWidth="3.5"
            strokeLinecap="round"
            filter="url(#glow)"
          />

          {/* Branch Track Route (JTJ -> SA -> ED -> CBE) */}
          <path
            d="M 580 260 L 620 380 L 730 440 L 870 480"
            fill="none"
            stroke="#1e293b"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <path
            d="M 580 260 L 620 380 L 730 440 L 870 480"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeDasharray="4 2"
          />

          {/* Station Nodes */}
          {stations.map((stn) => (
            <g key={stn.code} className="cursor-pointer group">
              {/* Outer halo */}
              <circle cx={stn.x} cy={stn.y} r="8" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
              <circle cx={stn.x} cy={stn.y} r="3" fill="#38bdf8" />

              {/* Station Label */}
              <text
                x={stn.x}
                y={stn.y - 14}
                textAnchor="middle"
                className="fill-slate-300 font-bold text-[11px] select-none"
              >
                {stn.code}
              </text>
              <text
                x={stn.x}
                y={stn.y + 18}
                textAnchor="middle"
                className="fill-slate-500 text-[9px] select-none"
              >
                {stn.platforms} Platforms
              </text>
            </g>
          ))}

          {/* Live Train Moving Markers */}
          {trains.map((t) => {
            const pos = getTrainSVGPosition(t);
            const isSelected = selectedTrain?.id === t.id;
            const isCritical = t.risk_level === 'Critical';

            return (
              <g
                key={t.id}
                transform={`translate(${pos.x}, ${pos.y})`}
                onClick={() => onSelectTrain(t)}
                onMouseEnter={() => setHoveredTrain(t)}
                onMouseLeave={() => setHoveredTrain(null)}
                className="cursor-pointer transition-transform duration-500"
              >
                {/* Pulse wave for moving train */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? "18" : "12"}
                  fill={isCritical ? "#ef4444" : "#0ea5e9"}
                  opacity="0.3"
                  className="animate-ping"
                />

                {/* Train marker circle */}
                <circle
                  cx="0"
                  cy="0"
                  r={isSelected ? "10" : "8"}
                  fill={isSelected ? "#38bdf8" : isCritical ? "#ef4444" : "#0284c7"}
                  stroke="#ffffff"
                  strokeWidth="2"
                  filter="url(#glow)"
                />

                {/* Train Badge label above pin */}
                <rect
                  x="-30"
                  y="-32"
                  width="60"
                  height="16"
                  rx="4"
                  fill="#0b1120"
                  stroke={isCritical ? "#ef4444" : "#0ea5e9"}
                  strokeWidth="1.2"
                />
                <text
                  x="0"
                  y="-21"
                  textAnchor="middle"
                  className="fill-white font-mono font-bold text-[9px] select-none"
                >
                  {t.train_number}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover / Selected Train Telemetry Card Overlay */}
        {(hoveredTrain || selectedTrain) && (
          <div className="absolute bottom-3 left-3 bg-[#0b1120]/95 backdrop-blur border border-cyan-500/40 rounded-xl p-3 shadow-2xl z-20 text-xs w-72">
            {(() => {
              const active = hoveredTrain || selectedTrain!;
              return (
                <div>
                  <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                    <div className="font-bold text-white flex items-center gap-1.5">
                      <Train className="w-3.5 h-3.5 text-cyan-400" />
                      <span className="font-mono text-cyan-300">{active.train_number}</span>
                      <span className="text-slate-200 truncate max-w-[130px]">{active.train_name}</span>
                    </div>
                    <span
                      className={`px-1.5 py-0.2 text-[9px] font-bold rounded ${
                        active.current_delay_minutes > 0
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-emerald-500/20 text-emerald-300'
                      }`}
                    >
                      +{active.current_delay_minutes}m Late
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-2 font-mono text-[11px]">
                    <div>
                      <div className="text-slate-400 text-[10px]">CURRENT LOCATION</div>
                      <div className="text-slate-200 font-semibold">{active.current_location}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">NEXT STATION</div>
                      <div className="text-slate-200 font-semibold">{active.next_station}</div>
                    </div>
                    <div>
                      <div className="text-slate-400 text-[10px]">TRADITIONAL ETA</div>
                      <div className="text-amber-400 font-semibold">{active.traditional_eta}</div>
                    </div>
                    <div className="bg-cyan-950/60 p-1 rounded border border-cyan-500/30">
                      <div className="text-cyan-400 text-[9px] font-bold flex items-center gap-0.5">
                        <Sparkles className="w-2.5 h-2.5" />
                        AI PREDICTED ETA
                      </div>
                      <div className="text-cyan-200 text-xs font-bold">{active.ai_predicted_eta}</div>
                    </div>
                  </div>
                </div>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
};
