import React from 'react';
import { ShieldAlert, ShieldCheck, Zap, Activity, Eye } from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { AccessibilityBar } from './AccessibilityBar';
import { DisplaySettings } from '../types';

interface HeaderProps {
  realTimeProtection: boolean;
  onToggleProtection: () => void;
  activeScanCount: number;
  displaySettings: DisplaySettings;
  onUpdateDisplaySettings: (newSettings: Partial<DisplaySettings>) => void;
}

export const Header: React.FC<HeaderProps> = ({
  realTimeProtection,
  onToggleProtection,
  activeScanCount,
  displaySettings,
  onUpdateDisplaySettings,
}) => {
  const isHighContrast = displaySettings.highContrastMode;

  return (
    <div className="sticky top-0 z-40">
      <header
        className={`border-b transition-colors ${
          isHighContrast
            ? 'bg-black border-white text-white'
            : 'border-slate-800/80 bg-slate-950/80 backdrop-blur-md'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Brand */}
          <div className="flex items-center space-x-3">
            <div
              className={`relative flex items-center justify-center w-10 h-10 rounded-xl border ${
                isHighContrast
                  ? 'bg-white text-black border-white font-extrabold'
                  : 'bg-gradient-to-br from-cyan-500/20 via-blue-500/20 to-indigo-500/20 border-cyan-500/30 text-cyan-400 shadow-lg shadow-cyan-950/50'
              }`}
            >
              <ShieldAlert className="w-5 h-5 text-current" />
              {!isHighContrast && (
                <span className="absolute -top-0.5 -right-0.5 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-cyan-500"></span>
                </span>
              )}
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-bold text-lg tracking-tight text-white flex items-center gap-1.5">
                  Scam<span className={isHighContrast ? 'text-white underline' : 'text-cyan-400'}>Shield</span>
                </span>
                <span
                  className={`text-[10px] font-mono-code font-semibold px-2 py-0.5 rounded-full tracking-wide uppercase ${
                    isHighContrast
                      ? 'bg-black text-white border border-white'
                      : 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/50'
                  }`}
                >
                  App
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Fake Offer Letter & Phishing Inspector
              </p>
            </div>
          </div>

          {/* Real-time Link Protection Status, PWA Install & Telemetry */}
          <div className="flex items-center space-x-3">
            <div className="hidden lg:flex items-center space-x-2 text-xs font-mono-code px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <Activity className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              <span>ENGINE:</span>
              <span className="text-emerald-400 font-semibold">GEMINI ONLINE</span>
            </div>

            {/* Local Protection Toggle Button */}
            <button
              id="toggle-realtime-guard"
              onClick={onToggleProtection}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                realTimeProtection
                  ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/40'
                  : 'bg-slate-900 border-slate-700 text-slate-400 hover:bg-slate-800'
              }`}
              title="Toggle client-side real-time URL heuristic inspection"
            >
              {realTimeProtection ? (
                <>
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="hidden sm:inline">Link Guard:</span>
                  <span className="font-mono-code font-semibold">ACTIVE</span>
                </>
              ) : (
                <>
                  <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                  <span className="hidden sm:inline">Link Guard:</span>
                  <span className="font-mono-code font-semibold">PAUSED</span>
                </>
              )}
            </button>

            {/* In-App PWA Install Trigger */}
            <PWAInstallButton variant="header" />
          </div>
        </div>
      </header>

      {/* Built-in Accessibility & Display Settings Bar */}
      <AccessibilityBar
        settings={displaySettings}
        onUpdateSettings={onUpdateDisplaySettings}
      />
    </div>
  );
};
