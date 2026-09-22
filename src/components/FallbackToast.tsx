import React, { useState, useEffect } from 'react';
import { Zap, AlertTriangle, X, ShieldCheck, RefreshCw } from 'lucide-react';
import { DisplaySettings } from '../types';

interface FallbackToastProps {
  reason?: string;
  displaySettings?: DisplaySettings;
  onRetry?: () => void;
}

export const FallbackToast: React.FC<FallbackToastProps> = ({
  reason,
  displaySettings,
  onRetry,
}) => {
  const [dismissed, setDismissed] = useState<boolean>(false);
  const isHighContrast = displaySettings?.highContrastMode ?? false;

  // Auto show whenever reason changes
  useEffect(() => {
    setDismissed(false);
  }, [reason]);

  if (dismissed) return null;

  return (
    <div
      id="fallback-heuristics-toast"
      role="alert"
      className={`fixed bottom-6 right-6 z-50 max-w-md w-full mx-auto p-4 rounded-2xl shadow-2xl transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 border ${
        isHighContrast
          ? 'bg-black border-2 border-white text-white'
          : 'bg-slate-900/95 border-amber-500/60 shadow-amber-950/40 text-slate-100 backdrop-blur-md'
      }`}
    >
      <div className="flex items-start space-x-3">
        <div className="p-2 rounded-xl bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0 mt-0.5">
          <Zap className="w-5 h-5 animate-pulse" />
        </div>

        <div className="flex-1 space-y-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-mono-code font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
              <span>Switched to Local Heuristics Guard</span>
            </h4>
            <button
              onClick={() => setDismissed(true)}
              className="text-slate-400 hover:text-slate-200 transition-colors p-1"
              aria-label="Dismiss notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {reason ||
              'ScamShield detected Gemini API rate limit or transient network protection. Instant zero-downtime offline rule heuristics generated this full report.'}
          </p>

          <div className="pt-2 flex items-center gap-3">
            <span className="inline-flex items-center gap-1 text-[11px] font-mono-code text-emerald-400">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Full Audit Preserved</span>
            </span>

            {onRetry && (
              <button
                onClick={onRetry}
                className="inline-flex items-center gap-1 text-[11px] font-mono-code text-amber-300 hover:text-amber-200 underline font-semibold"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Retry Gemini AI</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
