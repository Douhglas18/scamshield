import React, { useState } from 'react';
import { ScamAnalysisResult, DisplaySettings } from '../types';
import {
  Copy,
  Check,
  Printer,
  Share2,
  FileDown,
  ShieldAlert,
  Send,
  ExternalLink,
} from 'lucide-react';

interface ReportUtilityToolbarProps {
  analysis: ScamAnalysisResult;
  displaySettings: DisplaySettings;
}

export const ReportUtilityToolbar: React.FC<ReportUtilityToolbarProps> = ({
  analysis,
  displaySettings,
}) => {
  const [copiedSummary, setCopiedSummary] = useState(false);
  const [copiedFull, setCopiedFull] = useState(false);
  const isHighContrast = displaySettings.highContrastMode;

  // Formatted Risk Summary tailored specifically for forwarding to friends and family
  const generateFamilyRiskSummary = () => {
    const flagsSummary = analysis.redFlags
      .slice(0, 3)
      .map(
        (rf, idx) =>
          `• [${rf.severity}] ${rf.title}\n  Quote: "${rf.quote}"\n  Why it's a scam: ${rf.explanation}`
      )
      .join('\n\n');

    return `⚠️ SCAMSHIELD FRAUD RISK ALERT ⚠️
Target: ${analysis.offerType} (${analysis.detectedEntities?.claimedOrganization || 'Claimed Company'})
Threat Index: ${analysis.overallThreatScore}% [${analysis.threatLevel}]
Verdict: ${analysis.verdict}

KEY WARNING SIGNS:
${flagsSummary || 'Multiple suspicious payment or identity harvesting patterns detected.'}

SAFEGUARD ADVICE:
1. Do not deposit any checks or wire money via Zelle, CashApp, or Bitcoin ATM.
2. Never send your SSN, banking password, or driver's license scan.
3. Verify directly with the legitimate company HR before taking any action.

Scanned via ScamShield Offer & Phishing Inspector
${typeof window !== 'undefined' ? window.location.href : 'https://ai.studio'}`;
  };

  // 1. One-Click Copy Risk Summary (for friends / family)
  const handleCopySummary = async () => {
    const summary = generateFamilyRiskSummary();
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(summary);
      }
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    } catch {
      // Fallback
      setCopiedSummary(true);
      setTimeout(() => setCopiedSummary(false), 2500);
    }
  };

  // Native Web Share API if supported
  const handleNativeShare = async () => {
    const summary = generateFamilyRiskSummary();
    if (navigator.share) {
      try {
        await navigator.share({
          title: `ScamShield Threat Audit: ${analysis.verdict}`,
          text: summary,
          url: window.location.href,
        });
      } catch (err) {
        // Fallback to clipboard if user cancels or fails
        handleCopySummary();
      }
    } else {
      handleCopySummary();
    }
  };

  // 2. Print / Download PDF Summary
  const handlePrintPdf = () => {
    window.print();
  };

  return (
    <div
      id="report-utility-toolbar"
      className={`rounded-xl border p-4 transition-all no-print ${
        isHighContrast
          ? 'bg-black border-2 border-white text-white'
          : 'bg-slate-900/90 border-slate-800 text-slate-200'
      }`}
    >
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Left: Section explanation */}
        <div className="flex items-center space-x-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
              isHighContrast
                ? 'bg-white text-black font-extrabold'
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            <Share2 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <span>Share & Save Threat Report</span>
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                Audit Export
              </span>
            </h4>
            <p className="text-xs text-slate-400">
              Forward a quick risk summary to friends/family or save a formal PDF document for your records.
            </p>
          </div>
        </div>

        {/* Right: Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Copy Risk Summary Button */}
          <button
            type="button"
            id="copy-risk-summary-btn"
            onClick={handleCopySummary}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg text-xs font-mono-code font-bold transition-all shadow-sm ${
              copiedSummary
                ? 'bg-emerald-950 text-emerald-300 border border-emerald-500'
                : isHighContrast
                ? 'bg-white text-black border border-white hover:bg-zinc-200'
                : 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-cyan-900/30'
            }`}
            title="Copy formatted risk breakdown to forward to family or friends via WhatsApp, SMS, or Slack"
          >
            {copiedSummary ? (
              <>
                <Check className="w-4 h-4 text-emerald-400" />
                <span>Copied Risk Summary!</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copy Risk Summary</span>
              </>
            )}
          </button>

          {/* Native Web Share Button (if supported or as backup) */}
          {typeof navigator !== 'undefined' && 'share' in navigator && (
            <button
              type="button"
              id="native-share-btn"
              onClick={handleNativeShare}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono-code font-semibold transition-all"
              title="Share report via device sharing menu"
            >
              <Send className="w-3.5 h-3.5 text-cyan-400" />
              <span>Share via Apps</span>
            </button>
          )}

          {/* Print / Download PDF Summary Button */}
          <button
            type="button"
            id="print-pdf-report-btn"
            onClick={handlePrintPdf}
            className={`flex items-center space-x-1.5 px-3.5 py-2 rounded-lg border text-xs font-mono-code font-bold transition-all ${
              isHighContrast
                ? 'bg-zinc-900 text-white border-white hover:bg-zinc-800'
                : 'bg-slate-800 hover:bg-slate-700 border-slate-700 text-slate-100 hover:text-white shadow-sm'
            }`}
            title="Print or Save clean PDF summary report for records"
          >
            <Printer className="w-4 h-4 text-amber-400" />
            <span>Print / Save PDF Report</span>
          </button>
        </div>
      </div>
    </div>
  );
};
