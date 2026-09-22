import React, { useState } from 'react';
import { DetectedEntities, ScamAnalysisResult, DisplaySettings } from '../types';
import {
  Building2,
  User,
  MessageSquare,
  DollarSign,
  CreditCard,
  ShieldCheck,
  CheckCircle,
  Copy,
  Check,
  Share2,
} from 'lucide-react';

interface EntitiesAndChecklistProps {
  analysis: ScamAnalysisResult;
  displaySettings?: DisplaySettings;
}

export const EntitiesAndChecklist: React.FC<EntitiesAndChecklistProps> = ({
  analysis,
  displaySettings,
}) => {
  const [copied, setCopied] = useState(false);
  const isHighContrast = displaySettings?.highContrastMode ?? false;

  const entities = analysis.detectedEntities || {};
  const positive = analysis.positiveIndicators || [];
  const checklist = analysis.recommendedActions || [];

  const handleCopyReport = () => {
    const reportText = `=== SCAMSHIELD FRAUD INSPECTION AUDIT ===
Target Type: ${analysis.offerType}
Threat Index: ${analysis.overallThreatScore}% [${analysis.threatLevel}]
Verdict: ${analysis.verdict}
Summary: ${analysis.summary}

--- KEY ENTITIES ---
Claimed Organization: ${entities.claimedOrganization || 'Unspecified'}
Claimed Sender: ${entities.claimedSender || 'Unspecified'}
Contact Channels: ${(entities.contactChannels || []).join(', ') || 'None stated'}
Financial Terms: ${entities.financialTerms || 'None specified'}
Payment Methods Mentioned: ${(entities.paymentMethodsMentioned || []).join(', ') || 'None'}

--- DETECTED RED FLAGS (${analysis.redFlags.length}) ---
${analysis.redFlags
  .map(
    (rf, i) =>
      `[${rf.severity}] #${i + 1} ${rf.title}\nQuote: "${rf.quote}"\nThreat: ${rf.explanation}\nVerification Safeguard: ${rf.verificationAdvice}\n`
  )
  .join('\n')}

--- RECOMMENDED DEFENSIVE CHECKLIST ---
${checklist.map((c, i) => `${i + 1}. ${c}`).join('\n')}

Audit Timestamp: ${analysis.analyzedAt}
Verified via ScamShield Enterprise AI Engine
`;

    navigator.clipboard.writeText(reportText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Left: Discovered Document Entities & Contacts */}
      <div
        className={`rounded-xl border p-5 space-y-4 ${
          isHighContrast
            ? 'bg-black border-2 border-white text-white'
            : 'border-slate-800 bg-slate-900/80 text-slate-100'
        }`}
      >
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Building2 className="w-4 h-4 text-cyan-400" />
            <span>Document Entity Extraction</span>
          </h4>
          <span className="text-[11px] font-mono-code text-slate-400">Forensic Identity Signals</span>
        </div>

        <div className="space-y-3 text-xs">
          <div className="flex items-start justify-between py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" /> Claimed Entity:
            </span>
            <span className="font-semibold text-slate-200 text-right">
              {entities.claimedOrganization || 'Unspecified / Generic'}
            </span>
          </div>

          <div className="flex items-start justify-between py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-slate-500" /> Claimed Sender:
            </span>
            <span className="font-semibold text-slate-200 text-right">
              {entities.claimedSender || 'Not provided'}
            </span>
          </div>

          <div className="flex items-start justify-between py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-slate-500" /> Channels:
            </span>
            <div className="text-right flex flex-wrap gap-1 justify-end max-w-[65%]">
              {entities.contactChannels && entities.contactChannels.length > 0 ? (
                entities.contactChannels.map((c, i) => (
                  <span
                    key={i}
                    className="font-mono-code text-[11px] px-2 py-0.5 rounded bg-slate-800 border border-slate-700 text-cyan-300"
                  >
                    {c}
                  </span>
                ))
              ) : (
                <span className="text-slate-400">None detected</span>
              )}
            </div>
          </div>

          <div className="flex items-start justify-between py-1.5 border-b border-slate-800/60">
            <span className="text-slate-400 flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-slate-500" /> Compensation / Rent:
            </span>
            <span className="font-semibold text-amber-300 text-right">
              {entities.financialTerms || 'Not stated'}
            </span>
          </div>

          <div className="flex items-start justify-between py-1.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <CreditCard className="w-3.5 h-3.5 text-slate-500" /> Payment Mediums:
            </span>
            <div className="text-right flex flex-wrap gap-1 justify-end max-w-[65%]">
              {entities.paymentMethodsMentioned && entities.paymentMethodsMentioned.length > 0 ? (
                entities.paymentMethodsMentioned.map((pm, i) => (
                  <span
                    key={i}
                    className="font-mono-code text-[11px] px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300 font-semibold"
                  >
                    {pm}
                  </span>
                ))
              ) : (
                <span className="text-slate-400">No payment methods requested</span>
              )}
            </div>
          </div>
        </div>

        {/* Positive Reassuring Markers (if any) */}
        {positive.length > 0 && (
          <div className="pt-3 border-t border-slate-800 space-y-2">
            <h5 className="text-xs font-semibold text-emerald-400 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5" />
              <span>Positive Legitimacy Markers ({positive.length})</span>
            </h5>
            <div className="space-y-1">
              {positive.map((item, idx) => (
                <div key={idx} className="flex items-start gap-1.5 text-xs text-slate-300">
                  <span className="text-emerald-400 font-bold mt-0.5">✓</span>
                  <span>{item}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Right: Immediate Defensive Action Checklist */}
      <div
        className={`rounded-xl border p-5 space-y-4 flex flex-col justify-between ${
          isHighContrast
            ? 'bg-black border-2 border-white text-white'
            : 'border-slate-800 bg-slate-900/80 text-slate-100'
        }`}
      >
        <div className="space-y-3">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Defensive Action Checklist</span>
            </h4>
            <span className="text-[11px] font-mono-code text-slate-400">Next Steps</span>
          </div>

          <div className="space-y-2.5">
            {checklist.map((item, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-lg bg-slate-950/70 border border-slate-800/80 flex items-start space-x-2 text-xs text-slate-200"
              >
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-cyan-950 border border-cyan-800 text-cyan-300 font-mono-code text-[11px] shrink-0 mt-0.5">
                  {idx + 1}
                </span>
                <span className="leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Copy Report Button */}
        <div className="pt-3 border-t border-slate-800">
          <button
            id="copy-audit-report-button"
            onClick={handleCopyReport}
            className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono-code font-semibold transition-all border border-slate-700 shadow-sm"
          >
            {copied ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span className="text-emerald-300">Copied Full Security Audit to Clipboard!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4 text-cyan-400" />
                <span>Export & Copy Security Threat Audit</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
