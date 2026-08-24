import React, { useState } from 'react';
import { ShieldCheck, Lock, Mail, Cpu, ArrowRight } from 'lucide-react';

interface LoginModalProps {
  isOpen: boolean;
  onLoginSuccess: (user: any) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onLoginSuccess }) => {
  const [email, setEmail] = useState<string>('officer@railpredict.in');
  const [password, setPassword] = useState<string>('officer123');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('http://localhost:8000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!res.ok) {
        throw new Error('Invalid credentials');
      }

      const data = await res.json();
      onLoginSuccess(data);
    } catch (err: any) {
      // Demo fallback login
      onLoginSuccess({
        user_name: 'Rajesh Sharma',
        user_email: email,
        role: 'Senior Section Controller',
        division: 'Southern Railway - Chennai & Bangalore Division'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#050811]/90 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#0e1628] border border-cyan-500/40 rounded-2xl max-w-md w-full p-6 shadow-2xl relative">
        {/* Brand Icon */}
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-cyan-600 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 ring-1 ring-cyan-400/40 mx-auto mb-4">
          <Cpu className="w-6 h-6 text-white animate-pulse" />
        </div>

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-white tracking-tight">RailPredict Control Room</h2>
          <p className="text-xs text-slate-400 mt-1">
            Section Controller Dispatch & Dynamic ETA Surveillance System
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Officer Email
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Password
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-900 border border-slate-700 text-xs rounded-xl pl-9 pr-3 py-2.5 text-slate-200 focus:outline-none focus:border-cyan-500 font-mono"
                required
              />
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-2.5 text-[11px] text-slate-400 font-mono">
            <div><strong>Demo Credentials Pre-filled:</strong></div>
            <div>officer@railpredict.in / officer123</div>
          </div>

          {error && <div className="text-xs text-rose-400 text-center">{error}</div>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white py-2.5 rounded-xl text-xs font-bold shadow-lg shadow-cyan-500/20 transition flex items-center justify-center space-x-2"
          >
            <span>{loading ? 'AUTHENTICATING...' : 'ENTER CONTROL ROOM'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
