import React, { useState, useRef, useEffect } from 'react';
import { SAMPLE_PRESETS } from '../data/presets';
import { UploadedDoc, SenderDomainReport } from '../types';
import { extractPdfDocument } from '../utils/pdfExtractor';
import { scanSenderDomainOrUrl } from '../utils/linkScanner';
import {
  FileText,
  UploadCloud,
  Sparkles,
  ShieldAlert,
  ShieldCheck,
  Globe,
  Mail,
  Trash2,
  Clipboard,
  Shield,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  X,
  FileCheck,
  Play,
  HelpCircle,
  ExternalLink,
} from 'lucide-react';

interface OfferInputProps {
  inputText: string;
  setInputText: (text: string) => void;
  offerTypeHint: string;
  setOfferTypeHint: (type: string) => void;
  senderDomain: string;
  setSenderDomain: (domain: string) => void;
  uploadedDoc: UploadedDoc | null;
  setUploadedDoc: (doc: UploadedDoc | null) => void;
  onAnalyze: (overrideText?: string, overrideSender?: string) => void;
  isLoading: boolean;
  error: string | null;
}

const SCAN_STEPS = [
  'Tokenizing document syntax and sender domain credentials...',
  'Inspecting advance-fee and equipment check demands...',
  'Evaluating urgency coercion & psychological pressure...',
  'Scrutinizing sensitive personal data harvesting vectors...',
  'Running Gemini AI neural fraud heuristics & cross-referencing brand...',
  'Synthesizing final Scam Threat Index...',
];

export const OfferInput: React.FC<OfferInputProps> = ({
  inputText,
  setInputText,
  offerTypeHint,
  setOfferTypeHint,
  senderDomain,
  setSenderDomain,
  uploadedDoc,
  setUploadedDoc,
  onAnalyze,
  isLoading,
  error,
}) => {
  const [activeStepIdx, setActiveStepIdx] = useState(0);
  const [inputMode, setInputMode] = useState<'text' | 'pdf'>('text');
  const [isDragging, setIsDragging] = useState(false);
  const [isExtractingPdf, setIsExtractingPdf] = useState(false);
  const [pdfError, setPdfError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Live real-time domain scan report
  const [domainReport, setDomainReport] = useState<SenderDomainReport | null>(null);

  useEffect(() => {
    if (senderDomain.trim()) {
      setDomainReport(scanSenderDomainOrUrl(senderDomain));
    } else {
      setDomainReport(null);
    }
  }, [senderDomain]);

  // Cycle through inspection stages during loading
  useEffect(() => {
    if (!isLoading) {
      setActiveStepIdx(0);
      return;
    }
    const interval = setInterval(() => {
      setActiveStepIdx((prev) => (prev + 1) % SCAN_STEPS.length);
    }, 1200);
    return () => clearInterval(interval);
  }, [isLoading]);

  const handlePasteClipboard = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setInputText(text);
    } catch {
      // Ignore if permission denied
    }
  };

  const handlePasteDomain = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) setSenderDomain(text.trim());
    } catch {
      // Ignore if permission denied
    }
  };

  // One-click demo triggers for live presentations
  const handleTriggerPreset = (presetId: string, autoRun = false) => {
    const found = SAMPLE_PRESETS.find((p) => p.id === presetId);
    if (found) {
      setInputText(found.text);
      if (found.senderDomain) {
        setSenderDomain(found.senderDomain);
      }
      if (found.category.includes('Job')) setOfferTypeHint('Job Offer');
      else if (found.category.includes('Rental')) setOfferTypeHint('Rental Offer');
      else setOfferTypeHint('Auto-Detect');

      setUploadedDoc(null);
      setInputMode('text');

      if (autoRun) {
        onAnalyze(found.text, found.senderDomain);
      }
    }
  };

  const handleFileChange = async (file: File) => {
    setPdfError(null);
    setIsExtractingPdf(true);

    try {
      if (file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf')) {
        const result = await extractPdfDocument(file);
        setUploadedDoc({
          name: result.filename,
          size: result.size,
          type: 'application/pdf',
          pageCount: result.pageCount,
          base64: result.base64,
          extractedText: result.text,
        });

        // Populate text editor with extracted text if not already populated
        if (result.text && (!inputText || inputText.trim().length === 0)) {
          setInputText(result.text);
        }
      } else {
        // Plain text, eml, doc, etc.
        const text = await file.text();
        setUploadedDoc({
          name: file.name,
          size: file.size,
          type: file.type || 'text/plain',
          extractedText: text,
        });
        if (!inputText || inputText.trim().length === 0) {
          setInputText(text);
        }
      }
    } catch (err: any) {
      console.error('File parsing error:', err);
      setPdfError(err?.message || 'Failed to parse document. You can still paste the text directly.');
    } finally {
      setIsExtractingPdf(false);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange(e.dataTransfer.files[0]);
    }
  };

  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charCount = inputText.length;
  const canAnalyze =
    !isLoading &&
    ((inputText.trim().length >= 15) || (uploadedDoc && uploadedDoc.size > 0));

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/90 p-5 sm:p-6 space-y-6 shadow-xl">
      {/* 1. DEMO PRESET BUTTONS (One-Click Sample Triggers for Live Demos) */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
          <div className="flex items-center space-x-2">
            <span className="p-1.5 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              <Sparkles className="w-4 h-4" />
            </span>
            <div>
              <h3 className="text-sm font-bold text-white tracking-wide">
                Live Demo Presets
              </h3>
              <p className="text-xs text-slate-400">
                One-click sample triggers to demonstrate instant AI threat detection in real-time
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-mono-code">
            <span className="text-slate-400">Category:</span>
            <select
              id="offer-type-select"
              value={offerTypeHint}
              onChange={(e) => setOfferTypeHint(e.target.value)}
              disabled={isLoading}
              aria-label="Target Offer Type"
              className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-slate-200 text-xs font-mono-code focus:outline-none focus:border-cyan-500"
            >
              <option value="Auto-Detect">Auto-Detect</option>
              <option value="Job Offer">Job Offer</option>
              <option value="Rental Offer">Rental Lease Offer</option>
              <option value="Bank / Financial Alert">Bank / Financial Alert</option>
              <option value="Phishing Scam Alert">Phishing Scam Alert</option>
              <option value="Contract / Gig">Contract / Freelance Gig</option>
            </select>
          </div>
        </div>

        {/* Dual Primary Hero Demo Buttons: Scam vs. Genuine */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
          {/* LOAD SCAM OFFER TRIGGER */}
          <button
            id="demo-load-scam-button"
            type="button"
            onClick={() => handleTriggerPreset('job-equipment-check-scam')}
            disabled={isLoading}
            className="group relative text-left p-3.5 rounded-xl border border-red-500/30 bg-gradient-to-br from-red-950/40 via-slate-900 to-slate-950 hover:border-red-500/70 hover:from-red-950/60 transition-all shadow-lg shadow-red-950/20 active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                <span className="p-2 rounded-lg bg-red-500/20 border border-red-500/40 text-red-400 shrink-0 group-hover:scale-110 transition-transform">
                  <ShieldAlert className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Load Scam Offer</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase bg-red-500/20 text-red-400 border border-red-500/30">
                      Fraud Sample
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Fake $4,850 Cashier Check & Zelle Equipment Vendor Scam
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono-code text-red-400 flex items-center gap-1 shrink-0 pt-1">
                <span>Load Sample</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono-code text-slate-400">
              <span className="truncate">Sender: hr-apexsolutions@gmail.com</span>
              <span className="text-red-400 font-semibold">[Threat: 95%+]</span>
            </div>
          </button>

          {/* LOAD GENUINE OFFER TRIGGER */}
          <button
            id="demo-load-genuine-button"
            type="button"
            onClick={() => handleTriggerPreset('legitimate-tech-job-offer')}
            disabled={isLoading}
            className="group relative text-left p-3.5 rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-950/40 via-slate-900 to-slate-950 hover:border-emerald-500/70 hover:from-emerald-950/60 transition-all shadow-lg shadow-emerald-950/20 active:scale-[0.99]"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center space-x-2.5">
                <span className="p-2 rounded-lg bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 shrink-0 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-5 h-5" />
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">Load Genuine Offer</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-mono-code font-bold uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                      Legit Sample
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Authentic Nexus Cloud Software Engineer Offer & 401(k)
                  </p>
                </div>
              </div>
              <span className="text-[11px] font-mono-code text-emerald-400 flex items-center gap-1 shrink-0 pt-1">
                <span>Load Sample</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </span>
            </div>
            <div className="mt-2.5 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono-code text-slate-400">
              <span className="truncate">Sender: nexuscloud.io</span>
              <span className="text-emerald-400 font-semibold">[Threat: &lt;10%]</span>
            </div>
          </button>
        </div>

        {/* Secondary preset chips */}
        <div className="flex flex-wrap items-center gap-2 pt-1 text-xs">
          <span className="text-[11px] font-mono-code text-slate-400">More Scenarios:</span>
          <button
            type="button"
            onClick={() => handleTriggerPreset('legitimate-bank-fraud-alert')}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-emerald-800/60 hover:border-emerald-600 text-emerald-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>Legitimate Bank SMS Alert (Safe)</span>
          </button>
          <button
            type="button"
            onClick={() => handleTriggerPreset('bank-phishing-account-lock-scam')}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-red-800/60 hover:border-red-600 text-red-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span>Fake Bank Lock & Credential Phishing</span>
          </button>
          <button
            type="button"
            onClick={() => handleTriggerPreset('rental-deposit-lockbox-scam')}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
            <span>Rental Deposit Scam</span>
          </button>
          <button
            type="button"
            onClick={() => handleTriggerPreset('crypto-vip-task-scam')}
            disabled={isLoading}
            className="px-2.5 py-1 rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
            <span>VIP Crypto Task Scam</span>
          </button>
        </div>
      </div>

      {/* 2. SENDER / COMPANY URL INPUT */}
      <div className="rounded-xl border border-slate-800 bg-slate-950/60 p-4 space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor="sender-domain-input" className="text-xs font-bold text-white flex items-center gap-2">
            <Globe className="w-3.5 h-3.5 text-cyan-400" />
            <span>Sender Email Domain or Company Website URL</span>
            <span className="text-[10px] font-mono-code text-slate-400 font-normal">
              (e.g. hr@company.com or https://company.com)
            </span>
          </label>
          {senderDomain && (
            <button
              type="button"
              onClick={() => setSenderDomain('')}
              className="text-[11px] font-mono-code text-slate-400 hover:text-rose-400 transition-colors"
            >
              Clear Domain
            </button>
          )}
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
            <Mail className="w-4 h-4" />
          </div>
          <input
            id="sender-domain-input"
            type="text"
            value={senderDomain}
            onChange={(e) => setSenderDomain(e.target.value)}
            disabled={isLoading}
            placeholder="e.g. hr-apexsolutions@gmail.com or careers@nexuscloud.io or https://google-jobs-portal.xyz"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-24 py-2.5 text-xs sm:text-sm font-mono-code text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />
          <button
            id="paste-domain-button"
            type="button"
            onClick={handlePasteDomain}
            disabled={isLoading}
            className="absolute right-2 top-2 px-2.5 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 text-xs font-mono-code transition-colors flex items-center gap-1"
            title="Paste from clipboard"
          >
            <Clipboard className="w-3 h-3" />
            <span className="hidden sm:inline">Paste</span>
          </button>
        </div>

        {/* Real-time Domain Heuristic Assessment Callout */}
        {domainReport && domainReport.extractedDomain && (
          <div
            id="domain-assessment-card"
            className={`p-3 rounded-xl border text-xs font-mono-code space-y-1.5 transition-all ${
              domainReport.riskLevel === 'DANGEROUS'
                ? 'bg-rose-950/40 border-rose-500/50 text-rose-200'
                : domainReport.riskLevel === 'SUSPICIOUS'
                ? 'bg-amber-950/40 border-amber-500/50 text-amber-200'
                : 'bg-emerald-950/40 border-emerald-500/50 text-emerald-200'
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {domainReport.riskLevel === 'DANGEROUS' ? (
                  <ShieldAlert className="w-4 h-4 text-rose-400 shrink-0" />
                ) : domainReport.riskLevel === 'SUSPICIOUS' ? (
                  <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                )}
                <span className="font-bold">
                  Domain Analysis: {domainReport.extractedDomain}
                </span>
              </div>
              <span className="font-bold px-2 py-0.5 rounded text-[10px] bg-black/40 border border-current uppercase">
                {domainReport.riskLevel === 'DANGEROUS'
                  ? 'High Risk Domain'
                  : domainReport.riskLevel === 'SUSPICIOUS'
                  ? 'Suspicious Domain'
                  : 'Verified Safe Domain'}
              </span>
            </div>

            {/* Specific Risk Explanations */}
            {domainReport.flags.length > 0 ? (
              <ul className="list-disc list-inside space-y-1 text-[11px] opacity-90 pl-1">
                {domainReport.flags.map((flag, idx) => (
                  <li key={idx}>{flag}</li>
                ))}
              </ul>
            ) : (
              <p className="text-[11px] opacity-90">
                Corporate domain format recognized. No generic free email or typosquatting signature detected.
              </p>
            )}
          </div>
        )}
      </div>

      {/* 3. INPUT OPTIONS: DIRECT TEXT / PDF UPLOAD */}
      <div className="space-y-3">
        {/* Toggle between Text Editor and PDF Upload */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
          <div className="flex items-center space-x-2">
            <button
              id="input-mode-text-tab"
              type="button"
              onClick={() => setInputMode('text')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono-code font-bold transition-all flex items-center gap-1.5 ${
                inputMode === 'text'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Copy-Paste Text</span>
            </button>

            <button
              id="input-mode-pdf-tab"
              type="button"
              onClick={() => setInputMode('pdf')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-mono-code font-bold transition-all flex items-center gap-1.5 ${
                inputMode === 'pdf'
                  ? 'bg-cyan-500 text-slate-950 shadow-md shadow-cyan-500/20'
                  : 'bg-slate-950 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              <UploadCloud className="w-3.5 h-3.5" />
              <span>Upload PDF / Document</span>
              {uploadedDoc && (
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              )}
            </button>
          </div>

          {/* Uploaded File Badge */}
          {uploadedDoc && (
            <div className="flex items-center space-x-2 text-xs font-mono-code text-cyan-300 bg-cyan-950/60 border border-cyan-800/80 px-2.5 py-1 rounded-lg">
              <FileCheck className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate max-w-[160px] sm:max-w-[240px]">
                {uploadedDoc.name}
              </span>
              <button
                type="button"
                onClick={() => setUploadedDoc(null)}
                className="text-slate-400 hover:text-rose-400 p-0.5"
                title="Remove uploaded document"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* PDF UPLOAD DRAG-AND-DROP ZONE */}
        {inputMode === 'pdf' && (
          <div
            id="pdf-drop-zone"
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
              isDragging
                ? 'border-cyan-400 bg-cyan-950/30 scale-[1.01]'
                : 'border-slate-700 bg-slate-950/70 hover:border-cyan-500/60 hover:bg-slate-950'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,.txt,.docx,.eml,application/pdf,text/plain"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleFileChange(e.target.files[0]);
                }
              }}
            />

            <div className="max-w-md mx-auto space-y-3 pointer-events-none">
              <div className="w-14 h-14 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400 shadow-inner">
                {isExtractingPdf ? (
                  <Loader2 className="w-7 h-7 animate-spin text-cyan-400" />
                ) : (
                  <UploadCloud className="w-7 h-7" />
                )}
              </div>

              <div>
                <h4 className="text-sm font-bold text-white">
                  {isExtractingPdf
                    ? 'Extracting Document Text & Layout...'
                    : 'Upload Offer Letter or Contract PDF'}
                </h4>
                <p className="text-xs text-slate-400 mt-1">
                  Drag and drop your PDF here, or browse files on your device.
                </p>
                <p className="text-[11px] text-slate-500 font-mono-code mt-0.5">
                  Supports PDF, TXT, DOCX, EML (up to 25MB)
                </p>
              </div>

              {uploadedDoc && (
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-slate-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span className="font-semibold">{uploadedDoc.name}</span>
                  <span className="text-slate-400">
                    ({(uploadedDoc.size / 1024).toFixed(1)} KB)
                  </span>
                  {uploadedDoc.pageCount && (
                    <span className="text-cyan-400 font-mono-code">
                      • {uploadedDoc.pageCount} {uploadedDoc.pageCount === 1 ? 'Page' : 'Pages'}
                    </span>
                  )}
                </div>
              )}

              {pdfError && (
                <div className="text-xs text-rose-400 bg-rose-950/40 p-2 rounded-lg border border-rose-800">
                  {pdfError}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TEXT EDITING AREA */}
        <div className={`relative ${inputMode === 'pdf' ? 'pt-2' : ''}`}>
          {inputMode === 'pdf' && (
            <div className="flex items-center justify-between pb-1.5 text-xs text-slate-400">
              <span className="font-mono-code">
                {uploadedDoc ? 'Extracted Text Preview / Editable Content:' : 'Or paste text directly:'}
              </span>
              <button
                type="button"
                onClick={() => setInputMode('text')}
                className="text-cyan-400 hover:underline font-mono-code text-[11px]"
              >
                Expand Full Text Area
              </button>
            </div>
          )}

          <textarea
            id="offer-letter-textarea"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={isLoading}
            rows={inputMode === 'pdf' ? 6 : 9}
            placeholder="Paste full text of the job offer letter, email, lease agreement, WhatsApp/Telegram pitch, or employment terms here...&#10;&#10;e.g. 'Apex Global is pleased to offer you $48.50/hr... you will receive a $4,850 cashier's check to purchase home equipment via Zelle...'"
            className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs sm:text-sm font-mono-code text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all resize-y leading-relaxed"
          />

          {/* Floating Action Icons on Textarea */}
          <div className="absolute right-3 top-3 flex items-center space-x-1.5">
            <button
              id="paste-clipboard-button"
              type="button"
              onClick={handlePasteClipboard}
              disabled={isLoading}
              className="p-1.5 rounded-md bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-slate-200 text-xs transition-colors"
              title="Paste from clipboard"
            >
              <Clipboard className="w-3.5 h-3.5" />
            </button>
            {inputText && (
              <button
                id="clear-input-button"
                type="button"
                onClick={() => {
                  setInputText('');
                  setUploadedDoc(null);
                }}
                disabled={isLoading}
                className="p-1.5 rounded-md bg-slate-900/80 hover:bg-slate-800 border border-slate-700 text-slate-400 hover:text-rose-400 text-xs transition-colors"
                title="Clear input"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Error Callout */}
      {error && (
        <div
          id="analysis-error-banner"
          className="p-3.5 rounded-xl bg-rose-950/40 border border-rose-500/40 text-rose-300 text-xs flex items-start space-x-2.5"
        >
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <span className="font-semibold">Analysis Failed: </span>
            <span>{error}</span>
          </div>
        </div>
      )}

      {/* Loading Progress State */}
      {isLoading && (
        <div className="p-4 rounded-xl bg-slate-950 border border-cyan-800/60 text-center space-y-2.5 shadow-inner">
          <div className="flex items-center justify-center space-x-2 text-cyan-400">
            <Loader2 className="w-5 h-5 animate-spin" />
            <span className="text-xs font-mono-code font-bold uppercase tracking-wider">
              ScamShield AI Neural Threat Engine Active
            </span>
          </div>
          <p className="text-xs font-mono-code text-slate-300 animate-pulse">
            {SCAN_STEPS[activeStepIdx]}
          </p>
          <div className="w-48 mx-auto bg-slate-900 rounded-full h-1 overflow-hidden border border-slate-800">
            <div className="h-full bg-cyan-400 rounded-full animate-pulse w-full" />
          </div>
        </div>
      )}

      {/* Bottom Bar: Character metrics & Submit */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-1 border-t border-slate-800/80">
        <div className="text-[11px] font-mono-code text-slate-400 flex items-center space-x-3">
          <span>
            Words: <strong className="text-slate-200">{wordCount}</strong>
          </span>
          <span>•</span>
          <span>
            Characters: <strong className="text-slate-200">{charCount}</strong>
          </span>
          {uploadedDoc && (
            <>
              <span>•</span>
              <span className="text-cyan-400 font-semibold">
                PDF Attached ({uploadedDoc.name})
              </span>
            </>
          )}
        </div>

        <button
          id="submit-inspect-button"
          type="button"
          onClick={() => onAnalyze()}
          disabled={!canAnalyze}
          className="w-full sm:w-auto px-7 py-3 rounded-xl bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 text-white font-mono-code font-bold text-xs tracking-wider uppercase flex items-center justify-center space-x-2.5 shadow-lg shadow-cyan-950/60 disabled:opacity-40 disabled:cursor-not-allowed transition-all transform active:scale-95"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Analyzing Document...</span>
            </>
          ) : (
            <>
              <Shield className="w-4 h-4" />
              <span>Inspect with ScamShield AI</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </div>
    </div>
  );
};
