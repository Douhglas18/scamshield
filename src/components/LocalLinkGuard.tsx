import React, { useState, useEffect } from 'react';
import { LinkScanReport } from '../types';
import { scanUrlLocally, extractUrlsFromText } from '../utils/linkScanner';
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Link as LinkIcon,
  Search,
  ExternalLink,
  Laptop,
  CheckCircle,
  XCircle,
  HelpCircle,
  RefreshCw,
} from 'lucide-react';

interface LocalLinkGuardProps {
  documentText: string;
  extractedLinksFromAI?: string[];
  isEnabled: boolean;
}

export const LocalLinkGuard: React.FC<LocalLinkGuardProps> = ({
  documentText,
  extractedLinksFromAI = [],
  isEnabled,
}) => {
  const [manualUrlInput, setManualUrlInput] = useState('');
  const [scannedReports, setScannedReports] = useState<LinkScanReport[]>([]);
  const [manualScanResult, setManualScanResult] = useState<LinkScanReport | null>(null);

  // Scan all links in document automatically whenever documentText or extractedLinks change
  useEffect(() => {
    if (!isEnabled) {
      setScannedReports([]);
      return;
    }

    const textUrls = extractUrlsFromText(documentText);
    const combinedUrls = Array.from(new Set([...textUrls, ...extractedLinksFromAI]));

    if (combinedUrls.length > 0) {
      const reports = combinedUrls.map((u) => scanUrlLocally(u));
      setScannedReports(reports);
    } else {
      setScannedReports([]);
    }
  }, [documentText, extractedLinksFromAI, isEnabled]);

  const handleManualScan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!manualUrlInput.trim()) return;

    const report = scanUrlLocally(manualUrlInput.trim());
    setManualScanResult(report);
  };

  const getRiskBadge = (level: 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS') => {
    switch (level) {
      case 'DANGEROUS':
        return {
          bg: 'bg-red-500/20 text-red-300 border-red-500/50',
          icon: AlertTriangle,
          text: 'MALICIOUS / HIGH RISK',
        };
      case 'SUSPICIOUS':
        return {
          bg: 'bg-amber-500/20 text-amber-300 border-amber-500/50',
          icon: AlertTriangle,
          text: 'SUSPICIOUS',
        };
      default:
        return {
          bg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50',
          icon: ShieldCheck,
          text: 'CLEAN / LOW RISK',
        };
    }
  };

  return (
    <div
      id="local-link-guard-section"
      className="rounded-2xl border border-slate-800 bg-slate-900/80 p-5 space-y-5 shadow-xl"
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl bg-cyan-950/60 border border-cyan-800 text-cyan-400">
            <Laptop className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-white">Local Shield Link Guard</h3>
              <span className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-emerald-950/70 border border-emerald-800 text-emerald-300 uppercase">
                Device Real-Time Heuristics
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Evaluates suspicious URLs client-side against homoglyph spoofing, deceptive subdomains, and credential theft vectors.
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-xs font-mono-code">
          <span className="text-slate-400">Status:</span>
          {isEnabled ? (
            <span className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/40">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Active Protection
            </span>
          ) : (
            <span className="text-slate-400 font-semibold px-2 py-0.5 rounded bg-slate-800 border border-slate-700">
              Paused
            </span>
          )}
        </div>
      </div>

      {/* Manual URL Inspection Sandbox */}
      <div className="p-4 rounded-xl bg-slate-950/70 border border-slate-800/90 space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="url-guard-input" className="text-xs font-mono-code font-semibold text-slate-300 flex items-center gap-1.5">
            <Search className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive URL Threat Sandbox</span>
          </label>
          <span className="text-[11px] text-slate-400 font-mono-code">Instant Local Evaluation</span>
        </div>

        <form onSubmit={handleManualScan} className="flex gap-2">
          <div className="relative flex-1">
            <LinkIcon className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              id="url-guard-input"
              type="text"
              value={manualUrlInput}
              onChange={(e) => setManualUrlInput(e.target.value)}
              placeholder="e.g. http://paypal-security-auth.top/verify?user=8491 or app-optima-vip77.top"
              className="w-full bg-slate-900 border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs font-mono-code text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
            />
          </div>
          <button
            id="scan-url-button"
            type="submit"
            className="px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold font-mono-code transition-colors shrink-0 flex items-center gap-1.5 shadow-md shadow-cyan-950"
          >
            <span>Scan Link</span>
          </button>
        </form>

        {/* Manual Scan Result Callout */}
        {manualScanResult && (
          <div
            id="manual-scan-result-card"
            className={`mt-3 p-3.5 rounded-lg border text-xs space-y-2.5 transition-all ${
              manualScanResult.riskLevel === 'DANGEROUS'
                ? 'bg-red-950/40 border-red-500/40 text-red-200'
                : manualScanResult.riskLevel === 'SUSPICIOUS'
                ? 'bg-amber-950/40 border-amber-500/40 text-amber-200'
                : 'bg-emerald-950/30 border-emerald-500/40 text-emerald-200'
            }`}
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center space-x-2">
                <span className="font-mono-code font-bold truncate max-w-xs sm:max-w-md">
                  {manualScanResult.url}
                </span>
              </div>
              <span
                className={`font-mono-code text-[11px] font-bold px-2 py-0.5 rounded border ${
                  getRiskBadge(manualScanResult.riskLevel).bg
                }`}
              >
                Risk Score: {manualScanResult.riskScore}% —{' '}
                {getRiskBadge(manualScanResult.riskLevel).text}
              </span>
            </div>

            {/* Diagnostics List */}
            <div className="space-y-1 pt-1 border-t border-slate-800/60 font-mono-code text-[11px]">
              {manualScanResult.reasons.map((r, i) => (
                <div key={i} className="flex items-start gap-1.5">
                  <span className="text-cyan-400 mt-0.5">•</span>
                  <span>{r}</span>
                </div>
              ))}
            </div>

            {/* Heuristics Matrix Checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-2 text-[10px] font-mono-code">
              <div className="flex items-center gap-1">
                {manualScanResult.heuristics.hasHomoglyphOrSpoof ? (
                  <XCircle className="w-3 h-3 text-red-400" />
                ) : (
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                )}
                <span>Spoof / Typosquat</span>
              </div>
              <div className="flex items-center gap-1">
                {manualScanResult.heuristics.subdomainStacking ? (
                  <XCircle className="w-3 h-3 text-red-400" />
                ) : (
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                )}
                <span>Subdomain Stacking</span>
              </div>
              <div className="flex items-center gap-1">
                {manualScanResult.heuristics.isIpAddress ? (
                  <XCircle className="w-3 h-3 text-red-400" />
                ) : (
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                )}
                <span>Raw IP Host</span>
              </div>
              <div className="flex items-center gap-1">
                {manualScanResult.heuristics.insecureHttp ? (
                  <XCircle className="w-3 h-3 text-amber-400" />
                ) : (
                  <CheckCircle className="w-3 h-3 text-emerald-400" />
                )}
                <span>Encrypted HTTPS</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Embedded Links Discovered in Document */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-mono-code font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
            <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
            <span>Document Embedded Links ({scannedReports.length})</span>
          </h4>
          {scannedReports.length > 0 && (
            <span className="text-[11px] font-mono-code text-slate-400">
              Auto-inspected on device
            </span>
          )}
        </div>

        {scannedReports.length === 0 ? (
          <div className="p-4 rounded-xl bg-slate-950/40 border border-slate-800/80 text-center text-xs text-slate-400">
            No external hyperlinks or domains detected inside the current offer text. You can test any URL directly in the sandbox above.
          </div>
        ) : (
          <div className="space-y-2.5">
            {scannedReports.map((report) => {
              const badge = getRiskBadge(report.riskLevel);
              const BadgeIcon = badge.icon;

              return (
                <div
                  key={report.id}
                  className={`p-3.5 rounded-xl border bg-slate-950/80 transition-all space-y-2 ${
                    report.riskLevel === 'DANGEROUS'
                      ? 'border-red-500/40 shadow-sm shadow-red-950/50'
                      : report.riskLevel === 'SUSPICIOUS'
                      ? 'border-amber-500/40'
                      : 'border-slate-800'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2 truncate">
                      <span className="p-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
                        <LinkIcon className="w-3.5 h-3.5 text-cyan-400" />
                      </span>
                      <span className="font-mono-code text-xs text-white font-medium truncate">
                        {report.url}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 shrink-0">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono-code font-bold border ${badge.bg}`}
                      >
                        <BadgeIcon className="w-3 h-3" />
                        {report.riskScore}% {badge.text}
                      </span>
                    </div>
                  </div>

                  {/* Reasons & Heuristics */}
                  <div className="text-[11px] font-mono-code text-slate-300 space-y-1 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                    {report.reasons.map((r, idx) => (
                      <div key={idx} className="flex items-start gap-1.5">
                        <span className="text-cyan-400 mt-0.5">•</span>
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
