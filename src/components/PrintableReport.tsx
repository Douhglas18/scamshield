import React from 'react';
import { ScamAnalysisResult } from '../types';

interface PrintableReportProps {
  analysis: ScamAnalysisResult;
}

export const PrintableReport: React.FC<PrintableReportProps> = ({ analysis }) => {
  const entities = analysis.detectedEntities || {};
  const isSevere = analysis.overallThreatScore >= 50;

  return (
    <div id="scamshield-printable-report" className="print-only text-black bg-white p-8 max-w-4xl mx-auto font-sans">
      {/* Printable Header */}
      <div className="border-b-2 border-black pb-4 mb-6 flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-black">
            ScamShield — Threat Audit Report
          </h1>
          <p className="text-xs text-gray-600 font-mono">
            Document & Phishing Threat Intelligence Inspection Summary
          </p>
        </div>
        <div className="text-right text-xs font-mono">
          <div>Report ID: #SS-{Date.now().toString().slice(-6)}</div>
          <div>Generated: {new Date(analysis.analyzedAt).toLocaleString()}</div>
          <div className="font-bold text-gray-800">Status: OFFICIAL RECORD</div>
        </div>
      </div>

      {/* Threat Index Summary Box */}
      <div className={`p-4 rounded-lg border-2 mb-6 ${isSevere ? 'border-red-600 bg-red-50' : 'border-green-600 bg-green-50'}`}>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-xs font-bold uppercase tracking-wider text-gray-700">
              Evaluated Offer Type: {analysis.offerType}
            </div>
            <div className="text-xl font-black text-black mt-1">
              Verdict: {analysis.verdict}
            </div>
            <p className="text-xs text-gray-700 mt-2 max-w-2xl leading-relaxed">
              {analysis.summary}
            </p>
          </div>
          <div className="text-center px-6 py-3 border-l-2 border-gray-300">
            <div className="text-3xl font-black">{analysis.overallThreatScore}%</div>
            <div className={`text-xs font-black uppercase px-2 py-0.5 mt-1 rounded ${isSevere ? 'bg-red-600 text-white' : 'bg-green-600 text-white'}`}>
              {analysis.threatLevel}
            </div>
          </div>
        </div>
      </div>

      {/* Forensic Entities Table */}
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase border-b border-gray-400 pb-1 mb-2">
          Extracted Entities & Communication Channels
        </h2>
        <table className="w-full text-xs border border-gray-300">
          <tbody>
            <tr className="border-b border-gray-300">
              <td className="p-2 font-bold bg-gray-100 w-1/3">Claimed Organization:</td>
              <td className="p-2">{entities.claimedOrganization || 'Unspecified / Generic'}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="p-2 font-bold bg-gray-100">Claimed Sender / Recruiter:</td>
              <td className="p-2">{entities.claimedSender || 'Not provided'}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="p-2 font-bold bg-gray-100">Contact Channels / Domains:</td>
              <td className="p-2">{(entities.contactChannels || []).join(', ') || 'None detected'}</td>
            </tr>
            <tr className="border-b border-gray-300">
              <td className="p-2 font-bold bg-gray-100">Stated Compensation / Rent:</td>
              <td className="p-2 font-bold text-gray-900">{entities.financialTerms || 'Not stated'}</td>
            </tr>
            <tr>
              <td className="p-2 font-bold bg-gray-100">Payment Methods Mentioned:</td>
              <td className="p-2 font-bold text-red-700">
                {(entities.paymentMethodsMentioned || []).join(', ') || 'No upfront payment requested'}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Detected Red Flags Table */}
      <div className="mb-6">
        <h2 className="text-sm font-black uppercase border-b border-gray-400 pb-1 mb-2">
          Detected Red Flags ({analysis.redFlags.length})
        </h2>
        {analysis.redFlags.length === 0 ? (
          <p className="text-xs text-gray-600 py-2">No red flags detected in this document.</p>
        ) : (
          <div className="space-y-3">
            {analysis.redFlags.map((rf, idx) => (
              <div key={idx} className="p-3 border border-gray-300 rounded text-xs bg-gray-50">
                <div className="flex justify-between font-bold">
                  <span>
                    #{idx + 1}. {rf.title}
                  </span>
                  <span className="text-red-700 font-mono">[{rf.severity}]</span>
                </div>
                <div className="mt-1 text-gray-800 font-serif italic">"{rf.quote}"</div>
                <div className="mt-1 text-gray-700">{rf.explanation}</div>
                <div className="mt-1 font-semibold text-gray-900">
                  Safeguard: {rf.verificationAdvice}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recommended Defensive Actions */}
      <div className="mb-8">
        <h2 className="text-sm font-black uppercase border-b border-gray-400 pb-1 mb-2">
          Required Defensive Actions Checklist
        </h2>
        <ul className="list-disc list-inside text-xs space-y-1 text-gray-800">
          <li><strong>Do not send money:</strong> Never wire funds via Zelle, CashApp, or crypto, and never deposit advance cashier checks.</li>
          <li><strong>Verify directly with Corporate HR:</strong> Contact the legitimate organization independently via their official corporate talent portal.</li>
          <li><strong>Report suspicious domains:</strong> Report to the FBI IC3 (ic3.gov) and FTC (reportfraud.ftc.gov).</li>
          {analysis.recommendedActions.map((act, i) => (
            <li key={i}>{act}</li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <div className="border-t border-gray-400 pt-3 text-[10px] text-gray-500 flex justify-between font-mono">
        <div>ScamShield AI Inspector &copy; 2026 &bull; Real-Time Phishing & Offer Guard</div>
        <div>Confidential &bull; Prepared for candidate safety verification</div>
      </div>
    </div>
  );
};
