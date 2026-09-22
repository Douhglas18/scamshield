import React, { useState } from 'react';
import { RedFlag, RedFlagSeverity, DisplaySettings } from '../types';
import {
  AlertOctagon,
  AlertTriangle,
  Info,
  CheckCircle2,
  ShieldCheck,
  Quote,
  HelpCircle,
  Filter,
} from 'lucide-react';

interface RedFlagsListProps {
  redFlags: RedFlag[];
  displaySettings?: DisplaySettings;
}

export const RedFlagsList: React.FC<RedFlagsListProps> = ({ redFlags, displaySettings }) => {
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const isHighContrast = displaySettings?.highContrastMode ?? false;
  const mode = displaySettings?.colorVisionMode ?? 'default';

  const filtered = redFlags.filter((flag) => {
    if (filterSeverity === 'ALL') return true;
    return flag.severity.toUpperCase() === filterSeverity;
  });

  const getSeverityStyle = (severity: RedFlagSeverity) => {
    if (isHighContrast) {
      switch (severity.toUpperCase()) {
        case 'CRITICAL':
          return {
            cardBorder: 'border-2 border-white',
            badge: 'bg-white text-black font-extrabold border-white',
            icon: AlertOctagon,
            glow: 'from-transparent to-transparent',
            label: 'CRITICAL',
          };
        case 'HIGH':
          return {
            cardBorder: 'border-2 border-zinc-300',
            badge: 'bg-zinc-200 text-black font-bold border-zinc-200',
            icon: AlertTriangle,
            glow: 'from-transparent to-transparent',
            label: 'HIGH',
          };
        default:
          return {
            cardBorder: 'border-2 border-zinc-500',
            badge: 'bg-zinc-800 text-white font-bold border-zinc-400',
            icon: Info,
            glow: 'from-transparent to-transparent',
            label: 'MEDIUM',
          };
      }
    }

    if (mode === 'deuteranopia') {
      switch (severity.toUpperCase()) {
        case 'CRITICAL':
          return {
            cardBorder: 'border-rose-500/50 hover:border-rose-500/80',
            badge: 'bg-rose-950/70 border-rose-500/60 text-rose-300',
            icon: AlertOctagon,
            glow: 'from-rose-950/30 to-transparent',
            label: 'CRITICAL',
          };
        case 'HIGH':
          return {
            cardBorder: 'border-amber-500/50 hover:border-amber-500/80',
            badge: 'bg-amber-950/70 border-amber-500/60 text-amber-300',
            icon: AlertTriangle,
            glow: 'from-amber-950/30 to-transparent',
            label: 'HIGH',
          };
        default:
          return {
            cardBorder: 'border-yellow-500/50 hover:border-yellow-500/80',
            badge: 'bg-yellow-950/70 border-yellow-500/60 text-yellow-300',
            icon: Info,
            glow: 'from-yellow-950/20 to-transparent',
            label: 'MEDIUM',
          };
      }
    }

    if (mode === 'tritanopia') {
      switch (severity.toUpperCase()) {
        case 'CRITICAL':
          return {
            cardBorder: 'border-pink-500/50 hover:border-pink-500/80',
            badge: 'bg-pink-950/70 border-pink-500/60 text-pink-300',
            icon: AlertOctagon,
            glow: 'from-pink-950/30 to-transparent',
            label: 'CRITICAL',
          };
        case 'HIGH':
          return {
            cardBorder: 'border-purple-500/50 hover:border-purple-500/80',
            badge: 'bg-purple-950/70 border-purple-500/60 text-purple-300',
            icon: AlertTriangle,
            glow: 'from-purple-950/30 to-transparent',
            label: 'HIGH',
          };
        default:
          return {
            cardBorder: 'border-violet-500/50 hover:border-violet-500/80',
            badge: 'bg-violet-950/70 border-violet-500/60 text-violet-300',
            icon: Info,
            glow: 'from-violet-950/20 to-transparent',
            label: 'MEDIUM',
          };
      }
    }

    switch (severity.toUpperCase()) {
      case 'CRITICAL':
        return {
          cardBorder: 'border-red-500/40 hover:border-red-500/70',
          badge: 'bg-red-950/70 border-red-500/50 text-red-300',
          icon: AlertOctagon,
          glow: 'from-red-950/20 to-transparent',
          label: 'CRITICAL',
        };
      case 'HIGH':
        return {
          cardBorder: 'border-amber-500/40 hover:border-amber-500/70',
          badge: 'bg-amber-950/70 border-amber-500/50 text-amber-300',
          icon: AlertTriangle,
          glow: 'from-amber-950/20 to-transparent',
          label: 'HIGH',
        };
      case 'MEDIUM':
        return {
          cardBorder: 'border-yellow-500/40 hover:border-yellow-500/70',
          badge: 'bg-yellow-950/70 border-yellow-500/50 text-yellow-300',
          icon: Info,
          glow: 'from-yellow-950/20 to-transparent',
          label: 'MEDIUM',
        };
      default:
        return {
          cardBorder: 'border-slate-700/60 hover:border-slate-600',
          badge: 'bg-slate-800/80 border-slate-700 text-slate-300',
          icon: HelpCircle,
          glow: 'from-slate-900/40 to-transparent',
          label: 'LOW',
        };
    }
  };

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'payment_demand':
        return 'Payment / Deposit Demand';
      case 'urgency':
        return 'Urgency & Pressure';
      case 'sensitive_info':
        return 'Sensitive Data Harvesting';
      case 'suspicious_language':
        return 'Suspicious Language';
      case 'unverified_contact':
        return 'Unofficial Communication';
      case 'unrealistic_terms':
        return 'Unrealistic Compensation';
      default:
        return category.replace('_', ' ');
    }
  };

  return (
    <div id="red-flags-section" className="space-y-4">
      {/* Header and Filter Controls */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <AlertOctagon className="w-4 h-4 text-rose-400" />
            <span>Detected Red Flags & Fraud Signatures ({redFlags.length})</span>
          </h3>
          <p className="text-xs text-slate-400">
            Granular breakdown of specific predatory phrasing and coercion techniques detected by Gemini AI.
          </p>
        </div>

        {/* Severity Filter Tabs */}
        <div className="flex items-center space-x-1 p-1 bg-slate-900 rounded-lg border border-slate-800 text-xs font-mono-code">
          <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5 mr-0.5" />
          {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => {
            const count =
              sev === 'ALL'
                ? redFlags.length
                : redFlags.filter((f) => f.severity.toUpperCase() === sev).length;

            return (
              <button
                key={sev}
                id={`filter-severity-${sev.toLowerCase()}`}
                onClick={() => setFilterSeverity(sev)}
                className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${
                  filterSeverity === sev
                    ? 'bg-cyan-950 text-cyan-300 border border-cyan-700/60 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {sev} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Red Flags List or Clean State */}
      {filtered.length === 0 ? (
        <div className="p-8 rounded-xl bg-slate-900/50 border border-slate-800 text-center space-y-2">
          <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
          <h4 className="text-sm font-semibold text-slate-200">
            {filterSeverity === 'ALL'
              ? 'No Red Flags Detected'
              : `No ${filterSeverity} severity red flags match this filter`}
          </h4>
          <p className="text-xs text-slate-400 max-w-md mx-auto">
            {filterSeverity === 'ALL'
              ? 'The analyzed text does not exhibit common advance-fee scam, rental fraud, or aggressive phishing markers.'
              : 'Try selecting "ALL" above to view other severity categories.'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filtered.map((flag, idx) => {
            const style = getSeverityStyle(flag.severity);
            const Icon = style.icon;

            return (
              <div
                key={flag.id || idx}
                className={`rounded-xl border ${style.cardBorder} bg-gradient-to-r ${style.glow} bg-slate-900/90 p-4 transition-all space-y-3 shadow-md`}
              >
                {/* Flag Header */}
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono-code font-bold uppercase border ${style.badge}`}
                    >
                      <Icon className="w-3 h-3" />
                      {style.label}
                    </span>
                    <span className="text-xs font-mono-code px-2 py-0.5 rounded bg-slate-800/80 border border-slate-700 text-slate-300">
                      {getCategoryLabel(flag.category)}
                    </span>
                  </div>
                  <span className="text-[11px] font-mono-code text-slate-400">
                    Flag #{idx + 1}
                  </span>
                </div>

                {/* Flag Title */}
                <h4 className="text-sm sm:text-base font-bold text-white tracking-tight">
                  {flag.title}
                </h4>

                {/* Direct Quote Excerpt */}
                {flag.quote && (
                  <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800/90 flex items-start space-x-2.5">
                    <Quote className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5 opacity-80" />
                    <div className="text-xs font-mono-code text-cyan-200/90 italic leading-relaxed break-words">
                      "{flag.quote}"
                    </div>
                  </div>
                )}

                {/* Explanation */}
                <div className="text-xs text-slate-300 leading-relaxed">
                  <span className="font-semibold text-slate-200">Threat Analysis: </span>
                  {flag.explanation}
                </div>

                {/* Verification Advice / Safeguard */}
                <div className="pt-2 border-t border-slate-800/60 flex items-start space-x-2 text-xs text-emerald-300/90 bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-900/30">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-emerald-300">Actionable Safeguard: </span>
                    {flag.verificationAdvice}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
