import React from 'react';
import { CategoryBreakdown, DisplaySettings } from '../types';
import { CreditCard, Clock, Lock, FileText, Globe, AlertTriangle } from 'lucide-react';

interface CategoryMatrixProps {
  breakdown: CategoryBreakdown;
  displaySettings?: DisplaySettings;
}

export const CategoryMatrix: React.FC<CategoryMatrixProps> = ({ breakdown, displaySettings }) => {
  const isHighContrast = displaySettings?.highContrastMode ?? false;
  const mode = displaySettings?.colorVisionMode ?? 'default';

  const categories = [
    {
      key: 'paymentOrDepositDemands',
      title: 'Payment & Deposit Demands',
      icon: CreditCard,
      data: breakdown.paymentOrDepositDemands,
      description: 'Demands for upfront checks, equipment wiring, crypto, or non-refundable reservation fees.',
    },
    {
      key: 'urgencyTactics',
      title: 'Urgency & Coercion Tactics',
      icon: Clock,
      data: breakdown.urgencyTactics,
      description: 'Artificial 12-24 hour deadlines, threats of forfeiting offer, or pressure to skip diligence.',
    },
    {
      key: 'sensitiveInfoRequests',
      title: 'Sensitive Info Requests',
      icon: Lock,
      data: breakdown.sensitiveInfoRequests,
      description: 'Demands for SSN, photo ID scans, voided checks, or banking credentials before official onboarding.',
    },
    {
      key: 'suspiciousLanguage',
      title: 'Suspicious Language & Style',
      icon: FileText,
      data: breakdown.suspiciousLanguage,
      description: 'Grammatical anomalies, excessive religious appeals, generic titles, or absurd pay vs qualifications.',
    },
    {
      key: 'identityOrDomainAnomalies',
      title: 'Domain & Channel Anomalies',
      icon: Globe,
      data: breakdown.identityOrDomainAnomalies,
      description: 'Interviews conducted exclusively via Telegram/WhatsApp, or using free Gmail/Outlook addresses for major corporations.',
    },
  ];

  const getScoreColor = (score: number) => {
    if (isHighContrast) {
      if (score >= 70) return { bar: 'bg-white', text: 'text-white font-extrabold', badge: 'bg-white text-black font-extrabold border-white' };
      if (score >= 40) return { bar: 'bg-zinc-300', text: 'text-zinc-200 font-bold', badge: 'bg-zinc-300 text-black font-bold border-zinc-200' };
      return { bar: 'bg-zinc-500', text: 'text-zinc-300', badge: 'bg-zinc-800 text-white border-zinc-400' };
    }

    if (mode === 'deuteranopia') {
      if (score >= 70) return { bar: 'bg-rose-600', text: 'text-rose-400', badge: 'bg-rose-950/70 text-rose-300 border-rose-800' };
      if (score >= 40) return { bar: 'bg-amber-500', text: 'text-amber-400', badge: 'bg-amber-950/70 text-amber-300 border-amber-800' };
      return { bar: 'bg-blue-500', text: 'text-blue-400', badge: 'bg-blue-950/70 text-blue-300 border-blue-800' };
    }

    if (mode === 'tritanopia') {
      if (score >= 70) return { bar: 'bg-pink-600', text: 'text-pink-400', badge: 'bg-pink-950/70 text-pink-300 border-pink-800' };
      if (score >= 40) return { bar: 'bg-purple-500', text: 'text-purple-400', badge: 'bg-purple-950/70 text-purple-300 border-purple-800' };
      return { bar: 'bg-cyan-500', text: 'text-cyan-400', badge: 'bg-cyan-950/70 text-cyan-300 border-cyan-800' };
    }

    // Default
    if (score >= 70) return { bar: 'bg-rose-500', text: 'text-rose-400', badge: 'bg-rose-950/60 text-rose-300 border-rose-800' };
    if (score >= 40) return { bar: 'bg-amber-500', text: 'text-amber-400', badge: 'bg-amber-950/60 text-amber-300 border-amber-800' };
    return { bar: 'bg-emerald-500', text: 'text-emerald-400', badge: 'bg-emerald-950/60 text-emerald-300 border-emerald-800' };
  };

  return (
    <div id="category-matrix-section" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-cyan-400" />
          <span>Scam Risk Dimension Analysis</span>
        </h3>
        <span className="text-xs font-mono-code text-slate-400">5-Pillar Heuristic Vector</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const score = cat.data?.score ?? 0;
          const color = getScoreColor(score);

          return (
            <div
              key={cat.key}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center space-x-2">
                    <div className="p-1.5 rounded-lg bg-slate-800 text-cyan-400">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-200">{cat.title}</span>
                  </div>
                  <span
                    className={`text-[11px] font-mono-code font-bold px-2 py-0.5 rounded border ${color.badge}`}
                  >
                    {score}%
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-snug line-clamp-2">
                  {cat.description}
                </p>
              </div>

              <div>
                {/* Progress bar */}
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden mb-2 border border-slate-800/50">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${color.bar}`}
                    style={{ width: `${Math.max(4, score)}%` }}
                  />
                </div>
                {/* AI summary snippet */}
                <p className="text-[11px] font-mono-code text-slate-300 bg-slate-950/60 p-2 rounded border border-slate-800/60 leading-relaxed">
                  {cat.data?.summary || 'No elevated risk detected in this dimension.'}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
