import React, { useState } from 'react';
import { ScamAnalysisResult, UploadedDoc, DisplaySettings } from './types';
import { SAMPLE_PRESETS } from './data/presets';
import { analyzeOfferLocally } from './utils/localAnalyzer';
import { Header } from './components/Header';
import { OfferInput } from './components/OfferInput';
import { ThreatGauge } from './components/ThreatGauge';
import { CategoryMatrix } from './components/CategoryMatrix';
import { RedFlagsList } from './components/RedFlagsList';
import { LocalLinkGuard } from './components/LocalLinkGuard';
import { EntitiesAndChecklist } from './components/EntitiesAndChecklist';
import { ActionChecklist } from './components/ActionChecklist';
import { ReportUtilityToolbar } from './components/ReportUtilityToolbar';
import { PrintableReport } from './components/PrintableReport';
import { ActiveScanningRadar } from './components/ActiveScanningRadar';
import { FallbackToast } from './components/FallbackToast';
import { Footer } from './components/Footer';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import {
  ShieldAlert,
  ShieldCheck,
  Zap,
  Lock,
  Search,
  Eye,
  Crosshair,
  AlertTriangle,
  Award,
} from 'lucide-react';

export default function App() {
  const [inputText, setInputText] = useState<string>(SAMPLE_PRESETS[0].text);
  const [offerTypeHint, setOfferTypeHint] = useState<string>('Job Offer');
  const [senderDomain, setSenderDomain] = useState<string>(SAMPLE_PRESETS[0].senderDomain || 'hr-apexsolutions@gmail.com');
  const [uploadedDoc, setUploadedDoc] = useState<UploadedDoc | null>(null);
  
  // Accessibility & Display Settings
  const [displaySettings, setDisplaySettings] = useState<DisplaySettings>(() => {
    try {
      const saved = localStorage.getItem('scamshield_display_settings');
      if (saved) return JSON.parse(saved);
    } catch {}
    return { colorVisionMode: 'default', highContrastMode: false };
  });

  const handleUpdateDisplaySettings = (newSettings: Partial<DisplaySettings>) => {
    setDisplaySettings((prev) => {
      const updated = { ...prev, ...newSettings };
      try {
        localStorage.setItem('scamshield_display_settings', JSON.stringify(updated));
      } catch {}
      return updated;
    });
  };

  // Initialize with local deep analysis of the default preset to guarantee instant render with 0 API tokens burned on mount
  const [analysis, setAnalysis] = useState<ScamAnalysisResult | null>(() =>
    analyzeOfferLocally(SAMPLE_PRESETS[0].text, 'Job Offer', SAMPLE_PRESETS[0].senderDomain)
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [realTimeProtection, setRealTimeProtection] = useState<boolean>(true);
  const [activeScanCount, setActiveScanCount] = useState<number>(1);

  // Trigger analysis function calling server endpoint
  const handleAnalyze = async (overrideText?: string, overrideSender?: string) => {
    const textToAnalyze = overrideText !== undefined ? overrideText : inputText;
    const domainToAnalyze = overrideSender !== undefined ? overrideSender : senderDomain;

    if ((!textToAnalyze || textToAnalyze.trim().length < 15) && !uploadedDoc) {
      setError('Please provide at least 15 characters of offer letter or message text, or upload a document.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/analyze-offer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          text: textToAnalyze,
          offerTypeHint,
          senderDomainOrUrl: domainToAnalyze,
          fileData: uploadedDoc?.base64
            ? {
                name: uploadedDoc.name,
                mimeType: uploadedDoc.type,
                base64: uploadedDoc.base64,
              }
            : undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(
          errorData.error || `Server responded with status ${res.status}: ${res.statusText}`
        );
      }

      const data: ScamAnalysisResult = await res.json();
      setAnalysis(data);
      setActiveScanCount((prev) => prev + 1);

      // Smooth scroll to results
      setTimeout(() => {
        const el = document.getElementById('inspection-results-container');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err: any) {
      console.error('Inspection failed, generating local fallback:', err);
      // Fallback locally on network issue so the user still gets full fraud inspection
      const localResult = analyzeOfferLocally(textToAnalyze, offerTypeHint, domainToAnalyze);
      setAnalysis({
        ...localResult,
        isFallbackRuleEngine: true,
        fallbackReason: err?.message || 'Network issue. Analysis produced by ScamShield Local Engine.',
      });
      setActiveScanCount((prev) => prev + 1);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col selection:bg-cyan-500 selection:text-white transition-colors duration-200 ${
        displaySettings.highContrastMode
          ? 'high-contrast-mode bg-black text-white'
          : 'bg-[#0b0f19] text-slate-100'
      }`}
    >
      {/* Top Navigation & Built-in Accessibility Bar */}
      <Header
        realTimeProtection={realTimeProtection}
        onToggleProtection={() => setRealTimeProtection(!realTimeProtection)}
        activeScanCount={activeScanCount}
        displaySettings={displaySettings}
        onUpdateDisplaySettings={handleUpdateDisplaySettings}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 no-print">
        {/* Hero Banner / Threat Telemetry Stats */}
        <section
          className={`relative overflow-hidden rounded-3xl border p-6 sm:p-8 shadow-2xl transition-all ${
            displaySettings.highContrastMode
              ? 'bg-black border-2 border-white'
              : 'border-slate-800 bg-gradient-to-br from-slate-900 via-slate-950 to-[#070a12]'
          }`}
        >
          {!displaySettings.highContrastMode && (
            <>
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 -mb-10 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
            </>
          )}

          <div className="relative z-10 max-w-3xl space-y-3">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono-code ${
                displaySettings.highContrastMode
                  ? 'bg-black border border-white text-white'
                  : 'bg-cyan-950/70 border border-cyan-800/60 text-cyan-300'
              }`}
            >
              <Crosshair className="w-3.5 h-3.5 text-cyan-400" />
              <span>AI-Powered Fraud Intelligence & Link Heuristics</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
              Scam
              <span className={displaySettings.highContrastMode ? 'text-white underline' : 'text-cyan-400'}>
                Shield
              </span>{' '}
              Offer Letter & Phishing Inspector
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
              Inspect employment offer letters, rental leases, and recruiter messages against advance-fee check scams, absentee landlord fraud, artificial urgency, and sensitive data harvesting.
            </p>

            {/* Feature highlights bar */}
            <div className="pt-2 flex flex-wrap gap-4 text-xs font-mono-code text-slate-400">
              <span className="flex items-center gap-1.5 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-emerald-400" /> 0-100% Threat Index
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Lock className="w-4 h-4 text-cyan-400" /> Local Link Heuristics Guard
              </span>
              <span className="flex items-center gap-1.5 text-slate-300">
                <Zap className="w-4 h-4 text-amber-400" /> Gemini & Local Fallback Guard
              </span>
            </div>
          </div>
        </section>

        {/* PWA App Install Banner */}
        <section id="pwa-install-banner-section">
          <PWAInstallButton variant="banner" />
        </section>

        {/* Input Document Section */}
        <section id="input-section">
          <OfferInput
            inputText={inputText}
            setInputText={setInputText}
            offerTypeHint={offerTypeHint}
            setOfferTypeHint={setOfferTypeHint}
            senderDomain={senderDomain}
            setSenderDomain={setSenderDomain}
            uploadedDoc={uploadedDoc}
            setUploadedDoc={setUploadedDoc}
            onAnalyze={handleAnalyze}
            isLoading={isLoading}
            error={error}
          />
        </section>

        {/* Active Scanning Radar Animation (Jury / Live Demo Polish) */}
        {isLoading && (
          <section id="scanning-radar-section" className="pt-2 animate-in fade-in duration-300">
            <ActiveScanningRadar
              offerTypeHint={offerTypeHint}
              senderDomain={senderDomain}
              displaySettings={displaySettings}
            />
          </section>
        )}

        {/* Live Inspection Results Container */}
        {!isLoading && analysis && (
          <section id="inspection-results-container" className="space-y-6 pt-2">
            {/* Fallback Notice Banner */}
            {analysis.isFallbackRuleEngine && (
              <div
                id="fallback-engine-notice"
                className="rounded-xl border border-amber-500/40 bg-amber-950/30 p-3 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono-code text-amber-200"
              >
                <div className="flex items-center space-x-2.5">
                  <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                  <span>
                    <strong>ScamShield Local Heuristics Active:</strong> {analysis.fallbackReason || 'High-accuracy rule heuristics used for instant zero-downtime protection.'}
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 text-[10px] uppercase font-bold border border-amber-500/30 self-start sm:self-auto shrink-0">
                  Zero-Downtime Guard
                </span>
              </div>
            )}

            {/* Utility Features for Easy Sharing & PDF Export */}
            <ReportUtilityToolbar
              analysis={analysis}
              displaySettings={displaySettings}
            />

            {/* Threat Gauge & Verdict Card with Pattern Overlays & Direct Explanatory Bullet Cards */}
            <ThreatGauge
              score={analysis.overallThreatScore}
              threatLevel={analysis.threatLevel}
              verdict={analysis.verdict}
              offerType={analysis.offerType}
              confidenceScore={analysis.confidenceScore}
              displaySettings={displaySettings}
              redFlags={analysis.redFlags}
            />

            {/* Executive Summary Card */}
            <div
              className={`rounded-2xl border p-5 space-y-2 transition-all ${
                displaySettings.highContrastMode
                  ? 'bg-black border-2 border-white text-white'
                  : 'border-slate-800 bg-slate-900/80 text-slate-200'
              }`}
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <h3 className="text-xs font-mono-code font-bold uppercase tracking-wider text-cyan-400">
                  Forensic Summary & Legitimate Assessment
                </h3>
                <span className="text-[11px] font-mono-code text-slate-400">
                  Target: {analysis.offerType}
                </span>
              </div>
              <p className="text-sm text-slate-200 leading-relaxed">
                {analysis.summary}
              </p>
            </div>

            {/* 5-Pillar Category Breakdown Matrix */}
            <CategoryMatrix
              breakdown={analysis.breakdown}
              displaySettings={displaySettings}
            />

            {/* Red Flags & Explanations */}
            <RedFlagsList
              redFlags={analysis.redFlags}
              displaySettings={displaySettings}
            />

            {/* Discovered Entities & Initial Audit */}
            <EntitiesAndChecklist
              analysis={analysis}
              displaySettings={displaySettings}
            />

            {/* "What Should I Do Next?" Interactive Defensive Checklist */}
            <ActionChecklist
              analysis={analysis}
              displaySettings={displaySettings}
            />

            {/* Client-side Real-time Local Link Guard */}
            <LocalLinkGuard
              documentText={inputText}
              extractedLinksFromAI={analysis.extractedLinks}
              isEnabled={realTimeProtection}
            />
          </section>
        )}
      </main>

      {/* Printable Report View (Visible only during window.print()) */}
      {analysis && <PrintableReport analysis={analysis} />}

      {/* Fallback Toast for rate limits / offline rule execution */}
      {analysis?.isFallbackRuleEngine && (
        <FallbackToast
          reason={analysis.fallbackReason}
          displaySettings={displaySettings}
          onRetry={() => handleAnalyze()}
        />
      )}

      <Footer />
      <OfflineIndicator />
    </div>
  );
}
