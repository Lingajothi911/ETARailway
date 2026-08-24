import React from 'react';
import { Activity, ShieldAlert, Train, Radio, Clock, User, LogOut, Cpu, LayoutDashboard, MapPin, AlertTriangle, BarChart3, Layers } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  simulatedTime: string;
  isConnected: boolean;
  conflictCount: number;
  alertCount: number;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  simulatedTime,
  isConnected,
  conflictCount,
  alertCount,
  onLogout
}) => {
  const tabs = [
    { id: 'overview', label: 'Control Overview', icon: LayoutDashboard },
    { id: 'fleet', label: 'Fleet & Live Route Map', icon: Train },
    { id: 'platforms', label: 'Platform Management', icon: Layers, badge: conflictCount > 0 ? conflictCount : null },
    { id: 'congestion', label: 'Section Congestion', icon: Activity },
    { id: 'analytics', label: 'AI Prediction Analytics', icon: BarChart3 },
    { id: 'alerts', label: 'Operational Alerts', icon: AlertTriangle, badge: alertCount > 0 ? alertCount : null }
  ];

  return (
    <header className="bg-[#0b1120] border-b border-slate-800/80 sticky top-0 z-40 px-4 py-3 shadow-lg">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        {/* Brand & Division Info */}
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40">
            <Cpu className="w-5 h-5 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                RailPredict
                <span className="text-[11px] font-mono uppercase bg-cyan-950/80 text-cyan-400 border border-cyan-500/30 px-2 py-0.5 rounded-full font-medium tracking-wide">
                  AI ETA Engine v1.2
                </span>
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Indian Railways • Southern & South Western Corridor Control Room (MAS-SBC)
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="flex items-center gap-1 overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-cyan-500/15 text-cyan-400 border border-cyan-500/40 shadow-sm shadow-cyan-500/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="ml-1 px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px] font-bold">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Telemetry Clock & Officer Profile */}
        <div className="flex items-center space-x-3 text-xs">
          {/* Simulated Clock */}
          <div className="flex items-center space-x-2 bg-slate-900/90 border border-slate-800 px-3 py-1.5 rounded-lg font-mono">
            <Clock className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-slate-400">SIM CLOCK:</span>
            <span className="text-cyan-300 font-bold tracking-wider text-sm">{simulatedTime || '22:10:00'}</span>
          </div>

          {/* WebSocket Live Status */}
          <div className="flex items-center space-x-1.5 bg-slate-900/90 border border-slate-800 px-2.5 py-1.5 rounded-lg">
            <span className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 shadow-[0_0_8px_#34d399]' : 'bg-rose-500'}`} />
            <span className="text-[11px] font-medium text-slate-300">
              {isConnected ? 'LIVE FEED' : 'CONNECTING'}
            </span>
          </div>

          {/* Officer Tag */}
          <div className="flex items-center space-x-2 pl-2 border-l border-slate-800">
            <div className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="hidden xl:block text-left">
              <div className="text-[11px] font-semibold text-slate-200">Rajesh Sharma</div>
              <div className="text-[10px] text-slate-400">Section Controller</div>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 rounded transition"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
