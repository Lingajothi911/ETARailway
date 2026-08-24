import React, { useState } from 'react';
import { AlertItem } from '../types';
import { AlertTriangle, ShieldAlert, Info, CheckCircle2, Clock, Check } from 'lucide-react';

interface AlertStreamProps {
  alerts: AlertItem[];
  onAcknowledgeAlert: (alertId: number) => void;
}

export const AlertStream: React.FC<AlertStreamProps> = ({ alerts, onAcknowledgeAlert }) => {
  const [acknowledgedIds, setAcknowledgedIds] = useState<number[]>([]);

  const handleAck = (id: number) => {
    setAcknowledgedIds((prev) => [...prev, id]);
    onAcknowledgeAlert(id);
  };

  return (
    <div className="bg-[#0b1120] border border-slate-800 rounded-xl overflow-hidden shadow-lg p-4">
      <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
        <div>
          <h2 className="text-sm font-bold text-white flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Operational & Dispatch Alert Stream</span>
          </h2>
          <p className="text-xs text-slate-400">
            Real-time warnings on platform occupancy conflicts, excessive sectional delay, and AI ETA shifts
          </p>
        </div>
      </div>

      <div className="space-y-2.5">
        {alerts.map((alert) => {
          const isAck = acknowledgedIds.includes(alert.id) || alert.is_acknowledged;
          const isCritical = alert.severity === 'CRITICAL';
          const isWarning = alert.severity === 'WARNING';

          return (
            <div
              key={alert.id}
              className={`p-3 rounded-xl border transition ${
                isAck
                  ? 'bg-slate-900/40 border-slate-800 opacity-60'
                  : isCritical
                  ? 'bg-rose-950/20 border-rose-500/40'
                  : isWarning
                  ? 'bg-amber-950/20 border-amber-500/40'
                  : 'bg-slate-900/60 border-slate-800'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="flex items-start space-x-2.5">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center shrink-0 mt-0.5 ${
                      isCritical
                        ? 'bg-rose-500/20 text-rose-400'
                        : isWarning
                        ? 'bg-amber-500/20 text-amber-400'
                        : 'bg-cyan-500/20 text-cyan-400'
                    }`}
                  >
                    {isCritical ? (
                      <ShieldAlert className="w-4 h-4" />
                    ) : isWarning ? (
                      <AlertTriangle className="w-4 h-4" />
                    ) : (
                      <Info className="w-4 h-4" />
                    )}
                  </div>

                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-bold text-white font-sans">{alert.title}</span>
                      {alert.train_number && (
                        <span className="text-[10px] font-mono font-bold bg-slate-800 text-cyan-300 px-1.5 py-0.2 rounded border border-slate-700">
                          Train {alert.train_number}
                        </span>
                      )}
                      <span
                        className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded ${
                          isCritical
                            ? 'bg-rose-500/20 text-rose-400'
                            : isWarning
                            ? 'bg-amber-500/20 text-amber-300'
                            : 'bg-slate-800 text-slate-400'
                        }`}
                      >
                        {alert.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 mt-1 font-sans">{alert.description}</p>

                    {alert.recommended_action && (
                      <div className="mt-1.5 text-[11px] text-cyan-300 bg-cyan-950/40 border border-cyan-500/30 px-2 py-1 rounded-md font-sans flex items-center gap-1.5">
                        <span className="font-bold uppercase text-[9px] text-cyan-400">Action:</span>
                        <span>{alert.recommended_action}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Timestamp & Ack button */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-start gap-2 shrink-0">
                  <div className="flex items-center space-x-1 text-[10px] text-slate-400 font-mono">
                    <Clock className="w-3 h-3 text-slate-500" />
                    <span>{alert.timestamp}</span>
                  </div>

                  {!isAck ? (
                    <button
                      onClick={() => handleAck(alert.id)}
                      className="flex items-center space-x-1 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-semibold border border-slate-700 transition"
                    >
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span>ACKNOWLEDGE</span>
                    </button>
                  ) : (
                    <span className="text-[10px] font-semibold text-slate-500 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Resolved
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
