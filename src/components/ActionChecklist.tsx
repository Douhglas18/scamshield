import React, { useState } from 'react';
import { ScamAnalysisResult, DisplaySettings } from '../types';
import {
  CheckCircle2,
  AlertTriangle,
  ExternalLink,
  Copy,
  Check,
  Building,
  Mail,
  FileText,
  ShieldX,
  Send,
  Flag,
  Info,
} from 'lucide-react';

interface ActionChecklistProps {
  analysis: ScamAnalysisResult;
  displaySettings: DisplaySettings;
}

export const ActionChecklist: React.FC<ActionChecklistProps> = ({ analysis, displaySettings }) => {
  const isHighContrast = displaySettings.highContrastMode;
  const isSevere = analysis.overallThreatScore >= 50;

  // Track checked steps
  const [completedSteps, setCompletedSteps] = useState<Record<string, boolean>>({
    step_no_money: false,
    step_verify_hr: false,
    step_report_phishing: false,
    step_protect_identity: false,
  });

  const [copiedTemplate, setCopiedTemplate] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  const toggleStep = (stepId: string) => {
    setCompletedSteps((prev) => ({
      ...prev,
      [stepId]: !prev[stepId],
    }));
  };

  const totalSteps = isSevere ? 4 : 3;
  const finishedCount = Object.values(completedSteps).filter(Boolean).length;
  const progressPercent = Math.round((finishedCount / totalSteps) * 100);

  // Generate customized HR verification letter template
  const orgName = analysis.detectedEntities?.claimedOrganization || 'Your Organization';
  const claimedContact = analysis.detectedEntities?.claimedSender || 'recruitment contact';
  const roleType = analysis.offerType || 'Position';

  const hrEmailTemplate = `Subject: Employment Verification Inquiry - Potential Impersonation of ${orgName}

Dear ${orgName} Human Resources / Talent Acquisition Team,

I recently received an offer of employment claiming to be from ${orgName} for a ${roleType} role, communicated by ${claimedContact}.

Before proceeding or sharing any sensitive onboarding details, I am writing to verify the authenticity of this communication directly through your official corporate talent department.

Details of the received communication:
• Claimed Recruiter/Contact: ${claimedContact}
• Contact Channel/Domain: ${(analysis.detectedEntities?.contactChannels || []).join(', ') || 'Unverified address'}
• Key Terms Mentioned: ${analysis.detectedEntities?.financialTerms || 'Not specified'}

Could you please confirm whether this correspondence was legitimately issued by your authorized HR team?

Thank you for your assistance in safeguarding candidate security.

Sincerely,
[Your Full Name]
[Your Phone Number]
[Your Email Address]`;

  const handleCopyHrTemplate = () => {
    navigator.clipboard.writeText(hrEmailTemplate);
    setCopiedTemplate(true);
    setTimeout(() => setCopiedTemplate(false), 2500);
  };

  return (
    <div
      id="what-should-i-do-next-section"
      className={`rounded-2xl border transition-all ${
        isHighContrast
          ? 'bg-black border-2 border-white text-white p-6 shadow-none'
          : 'bg-slate-900/90 border-slate-800 p-6 shadow-xl backdrop-blur-sm'
      }`}
    >
      {/* Section Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
        <div className="flex items-center space-x-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center ${
              isHighContrast
                ? 'bg-white text-black font-extrabold'
                : isSevere
                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
            }`}
          >
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight text-white flex items-center gap-2">
              <span>"What Should I Do Next?" Checklist</span>
              <span className="text-xs font-mono-code font-normal text-cyan-400 px-2 py-0.5 rounded-full bg-cyan-950/80 border border-cyan-800/60">
                Action Plan
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Follow these verified defensive steps to safeguard your finances and identity.
            </p>
          </div>
        </div>

        {/* Action progress badge */}
        <div className="flex items-center space-x-2 text-xs font-mono-code self-start sm:self-auto">
          <span className="text-slate-400">Safeguards Completed:</span>
          <span
            className={`px-2.5 py-1 rounded-lg font-bold border ${
              finishedCount === totalSteps
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/40'
                : 'bg-slate-800 text-cyan-300 border-slate-700'
            }`}
          >
            {finishedCount} / {totalSteps} ({progressPercent}%)
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-800/80 rounded-full h-1.5 my-4 overflow-hidden">
        <div
          className={`h-full transition-all duration-500 ${
            finishedCount === totalSteps
              ? 'bg-emerald-500'
              : isSevere
              ? 'bg-gradient-to-r from-cyan-500 to-amber-500'
              : 'bg-gradient-to-r from-cyan-500 to-emerald-500'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Core Action Steps List */}
      <div className="space-y-3.5 mt-4">
        {/* Step 1: Do Not Send Money or Banking Details */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            completedSteps.step_no_money
              ? 'bg-slate-950/50 border-emerald-500/40 opacity-90'
              : isHighContrast
              ? 'bg-zinc-950 border border-white'
              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3.5 flex-1">
              <button
                type="button"
                onClick={() => toggleStep('step_no_money')}
                className={`w-6 h-6 rounded-lg flex items-center justify-center border mt-0.5 transition-all shrink-0 ${
                  completedSteps.step_no_money
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                    : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-transparent'
                }`}
                aria-label="Toggle step 1 completion"
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </button>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                    <ShieldX className="w-4 h-4 text-rose-400" />
                    1. Do not send money, wire deposits, or banking login credentials
                  </span>
                  {completedSteps.step_no_money && (
                    <span className="text-[10px] font-mono-code font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      SECURED
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Never deposit an advance cashier's check to purchase "home office equipment" or forward funds via
                  Zelle, Venmo, CashApp, Bitcoin ATMs, or wire transfer. Legitimate corporations provide equipment directly
                  and will <strong>never</strong> demand candidate reimbursement or upfront security fees.
                </p>
                <div className="pt-1.5 flex flex-wrap gap-2 text-[11px] font-mono-code">
                  <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300">
                    ❌ No Zelle / Wire transfers
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300">
                    ❌ Refuse advance check checks
                  </span>
                  <span className="px-2 py-0.5 rounded bg-rose-950/60 border border-rose-800 text-rose-300">
                    ❌ Withhold online banking passwords
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 2: Verify the Offer Directly Via Corporate HR */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            completedSteps.step_verify_hr
              ? 'bg-slate-950/50 border-emerald-500/40 opacity-90'
              : isHighContrast
              ? 'bg-zinc-950 border border-white'
              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3.5 flex-1">
              <button
                type="button"
                onClick={() => toggleStep('step_verify_hr')}
                className={`w-6 h-6 rounded-lg flex items-center justify-center border mt-0.5 transition-all shrink-0 ${
                  completedSteps.step_verify_hr
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                    : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-transparent'
                }`}
                aria-label="Toggle step 2 completion"
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </button>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                    <Building className="w-4 h-4 text-cyan-400" />
                    2. Verify the offer directly via the company's official corporate HR email / portal
                  </span>
                  {completedSteps.step_verify_hr && (
                    <span className="text-[10px] font-mono-code font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      VERIFIED
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Do not reply to the email address or phone number in the letter. Instead, navigate independently to the company's
                  official website, locate their verified talent acquisition or corporate headquarters email, and request formal verification.
                </p>

                {/* Verification Email Generator */}
                <div className="pt-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(true)}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-cyan-950/80 hover:bg-cyan-900/80 border border-cyan-700/60 text-cyan-200 text-xs font-mono-code transition-all"
                  >
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>View HR Verification Email Template</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleCopyHrTemplate}
                    className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 text-xs font-mono-code transition-all"
                  >
                    {copiedTemplate ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-300">Copied Template to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Pre-Filled Inquiry</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Report to Phishing & Fraud Registries */}
        <div
          className={`p-4 rounded-xl border transition-all ${
            completedSteps.step_report_phishing
              ? 'bg-slate-950/50 border-emerald-500/40 opacity-90'
              : isHighContrast
              ? 'bg-zinc-950 border border-white'
              : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start space-x-3.5 flex-1">
              <button
                type="button"
                onClick={() => toggleStep('step_report_phishing')}
                className={`w-6 h-6 rounded-lg flex items-center justify-center border mt-0.5 transition-all shrink-0 ${
                  completedSteps.step_report_phishing
                    ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                    : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-transparent'
                }`}
                aria-label="Toggle step 3 completion"
              >
                <Check className="w-4 h-4 stroke-[3]" />
              </button>
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                    <Flag className="w-4 h-4 text-amber-400" />
                    3. Report the suspicious sender & domain to official phishing registries
                  </span>
                  {completedSteps.step_report_phishing && (
                    <span className="text-[10px] font-mono-code font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                      REPORTED
                    </span>
                  )}
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Submitting fraudulent domain names and recruitment handles protects other job seekers and triggers domain takedowns across global security vendors.
                </p>

                {/* Reporting Action Links */}
                <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
                  <a
                    href="https://www.ic3.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono-code transition-all"
                  >
                    <span>FBI IC3 Portal</span>
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  </a>
                  <a
                    href="https://reportfraud.ftc.gov"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono-code transition-all"
                  >
                    <span>FTC Report Fraud</span>
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  </a>
                  <a
                    href="https://safebrowsing.google.com/safebrowsing/report_phish/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono-code transition-all"
                  >
                    <span>Google Safe Browsing</span>
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  </a>
                  <a
                    href="https://apwg.org/reportphishing/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-between p-2 rounded-lg bg-slate-900 hover:bg-slate-800/80 border border-slate-800 text-slate-300 hover:text-white text-xs font-mono-code transition-all"
                  >
                    <span>APWG Registry</span>
                    <ExternalLink className="w-3.5 h-3.5 text-cyan-400" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 4 (If Severe): Identity Protection & Credit Freeze */}
        {isSevere && (
          <div
            className={`p-4 rounded-xl border transition-all ${
              completedSteps.step_protect_identity
                ? 'bg-slate-950/50 border-emerald-500/40 opacity-90'
                : isHighContrast
                ? 'bg-zinc-950 border border-white'
                : 'bg-slate-950/80 border-slate-800 hover:border-slate-700'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start space-x-3.5 flex-1">
                <button
                  type="button"
                  onClick={() => toggleStep('step_protect_identity')}
                  className={`w-6 h-6 rounded-lg flex items-center justify-center border mt-0.5 transition-all shrink-0 ${
                    completedSteps.step_protect_identity
                      ? 'bg-emerald-500 border-emerald-400 text-slate-950'
                      : 'bg-slate-900 border-slate-700 hover:border-slate-500 text-transparent'
                  }`}
                  aria-label="Toggle step 4 completion"
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                </button>
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-100 flex items-center gap-1.5">
                      <ShieldX className="w-4 h-4 text-purple-400" />
                      4. Freeze credit files if SSN or photo ID was previously submitted
                    </span>
                    {completedSteps.step_protect_identity && (
                      <span className="text-[10px] font-mono-code font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                        MONITORED
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    If you already shared your Social Security Number, passport copy, or driver's license with this sender, immediately place a free fraud alert or security freeze with the three major credit bureaus (Equifax, Experian, TransUnion) via <strong>IdentityTheft.gov</strong>.
                  </p>
                  <div className="pt-1.5 flex items-center gap-2">
                    <a
                      href="https://www.identitytheft.gov"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1.5 px-3 py-1 rounded bg-slate-900 border border-slate-800 hover:border-slate-700 text-cyan-300 text-xs font-mono-code"
                    >
                      <span>Visit IdentityTheft.gov</span>
                      <ExternalLink className="w-3 h-3 text-cyan-400" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* HR Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Mail className="w-5 h-5 text-cyan-400" />
                <h4 className="text-sm font-bold text-white font-mono-code">
                  Corporate HR Verification Inquiry
                </h4>
              </div>
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono-code px-2 py-1 rounded bg-slate-800"
              >
                ✕ Close
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Copy this formal inquiry letter and email it to the verified human resources department of{' '}
              <strong>{orgName}</strong> to independently authenticate the communication.
            </p>

            <pre className="p-4 rounded-xl bg-slate-950 border border-slate-800 text-xs font-mono-code text-slate-200 overflow-x-auto whitespace-pre-wrap leading-relaxed max-h-80">
              {hrEmailTemplate}
            </pre>

            <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setShowTemplateModal(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono-code font-semibold"
              >
                Close
              </button>
              <button
                type="button"
                onClick={handleCopyHrTemplate}
                className="flex items-center space-x-1.5 px-4 py-2 rounded-lg bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-mono-code font-semibold shadow-lg shadow-cyan-900/40"
              >
                {copiedTemplate ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    <span>Copy Full Letter</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
