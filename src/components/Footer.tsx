import React from 'react';
import { ShieldCheck, Info, Lock } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/60 py-6 mt-12 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          <span className="font-semibold text-slate-400">ScamShield</span>
          <span>— Cybersecurity & Fraud Threat Defense Platform</span>
        </div>

        <div className="flex items-center space-x-4 text-[11px] font-mono-code">
          <span className="flex items-center gap-1 text-slate-400">
            <Lock className="w-3 h-3 text-emerald-400" /> Client-Side Link Inspection Active
          </span>
          <span>•</span>
          <span>Powered by Google Gemini 3.8</span>
        </div>
      </div>
    </footer>
  );
};
