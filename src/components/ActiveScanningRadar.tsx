import React, { useState, useEffect } from 'react';
import { Radar, Terminal, Shield, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { DisplaySettings } from '../types';

interface ActiveScanningRadarProps {
  offerTypeHint: string;
  senderDomain?: string;
  displaySettings?: DisplaySettings;
}

export const ActiveScanningRadar: React.FC<ActiveScanningRadarProps> = ({
  offerTypeHint,
  senderDomain,
  displaySettings,
}) => {
  const isHighContrast = displaySettings?.highContrastMode ?? false;

  const steps = [
    { text: 'Initializing zero-trust inspection pipeline...', time: 200 },
    {
      text: senderDomain
        ? `Auditing sender domain records for "${senderDomain}"...`
        : 'Scanning header metadata & communication channels...',
      time: 600,
    },
    { text: 'Evaluating advance-fee cashier check & wiring demands...', time: 1100 },
    { text: 'Detecting artificial urgency & coercion tactics...', time: 1600 },
    { text: 'Verifying corporate identity & cross-examining Gemini models...', time: 2100 },
    { text: 'Synthesizing forensic threat breakdown & defensive steps...', time: 2700 },
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [progress, setProgress] = useState<number>(10);

  useEffect(() => {
    // Step advancement timers
    const timers = steps.map((step, idx) => {
      return setTimeout(() => {
        setCurrentStepIndex(idx);
        setProgress(Math.min(95, Math.round(((idx + 1) / steps.length) * 100)));
      }, step.time);
    });

    return () => {
      timers.forEach((t) => clearTimeout(t));
    };
  }, []);

  return (
    <div
      id="active-scanning-animation"
      className={`rounded-3xl border p-6 sm:p-8 transition-all overflow-hidden relative shadow-2xl ${
        isHighContrast
          ? 'bg-black border-2 border-white text-white'
          : 'bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 border-cyan-500/40 shadow-cyan-950/30'
      }`}
    >
      {/* Background glowing sweep */}
      {!isHighContrast && (
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(6,182,212,0.12)_0%,transparent_70%)] pointer-events-none" />
      )}

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-8 justify-between">
        {/* Left: Radar Sweep Canvas Visualizer */}
        <div className="flex flex-col items-center justify-center shrink-0">
          <div className="relative w-44 h-44 flex items-center justify-center">
            {/* Concentric radar rings */}
            <div className="absolute inset-0 rounded-full border border-cyan-500/20" />
            <div className="absolute inset-4 rounded-full border border-cyan-500/30" />
            <div className="absolute inset-8 rounded-full border border-cyan-500/40" />
            <div className="absolute inset-14 rounded-full border border-cyan-500/60" />

            {/* Rotating radar beam sweep */}
            <div
              className="absolute inset-0 rounded-full animate-spin"
              style={{
                background: 'conic-gradient(from 0deg, transparent 0deg, rgba(6, 182, 212, 0.4) 60deg, transparent 70deg)',
                animationDuration: '2s',
              }}
            />

            {/* Crosshairs */}
            <div className="absolute inset-x-0 top-1/2 h-px bg-cyan-500/30" />
            <div className="absolute inset-y-0 left-1/2 w-px bg-cyan-500/30" />

            {/* Center target icon */}
            <div className="relative z-10 w-12 h-12 rounded-xl bg-slate-950 border border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/40 animate-pulse">
              <Radar className="w-6 h-6 text-cyan-400" />
            </div>

            {/* Blips */}
            <span className="absolute top-8 right-10 w-2 h-2 rounded-full bg-rose-500 animate-ping opacity-75" />
            <span className="absolute bottom-10 left-8 w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          </div>

          <div className="mt-3 text-center">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-code font-bold bg-cyan-950 text-cyan-300 border border-cyan-800">
              <Loader2 className="w-3 h-3 animate-spin text-cyan-400" />
              <span>LIVE FORENSIC AUDIT</span>
            </span>
          </div>
        </div>

        {/* Right: Step-by-Step Terminal Progression Logs */}
        <div className="flex-1 w-full space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold font-mono-code text-white">
                ScamShield AI Analysis Engine
              </h3>
            </div>
            <div className="flex items-center space-x-2 text-xs font-mono-code">
              <span className="text-slate-400">Pipeline:</span>
              <span className="text-cyan-400 font-bold">{progress}%</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-500 h-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>

          {/* Terminal log steps */}
          <div className="space-y-2 font-mono-code text-xs">
            {steps.map((s, idx) => {
              const isPast = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              const isUpcoming = idx > currentStepIndex;

              return (
                <div
                  key={idx}
                  className={`flex items-start space-x-2.5 p-2 rounded-lg transition-all ${
                    isCurrent
                      ? isHighContrast
                        ? 'bg-zinc-900 border border-white text-white font-bold'
                        : 'bg-cyan-950/50 border border-cyan-800/80 text-cyan-200'
                      : isPast
                      ? 'text-slate-400 opacity-80'
                      : 'text-slate-600 opacity-40'
                  }`}
                >
                  <span className="mt-0.5 shrink-0">
                    {isPast ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : isCurrent ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                    ) : (
                      <span className="inline-block w-3.5 h-3.5 rounded-full border border-slate-700" />
                    )}
                  </span>
                  <span className="leading-snug">{s.text}</span>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between text-[11px] font-mono-code text-slate-500 pt-1">
            <span>Evaluating: {offerTypeHint}</span>
            <span className="flex items-center gap-1 text-slate-400">
              <Sparkles className="w-3 h-3 text-cyan-400" />
              <span>Multi-vector heuristic cross-check</span>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
