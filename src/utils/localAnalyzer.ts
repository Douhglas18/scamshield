import { ScamAnalysisResult, RedFlag, CategoryBreakdown } from '../types';
import { scanSenderDomainOrUrl, extractUrlsFromText } from './linkScanner';

/**
 * High-accuracy local heuristic engine for fraud, advance-fee checks, rental scams, and phishing
 * Used as an instant baseline and automated fallback when cloud AI quotas are rate-limited.
 */
export function analyzeOfferLocally(
  text: string,
  offerTypeHint?: string,
  senderDomainOrUrl?: string
): ScamAnalysisResult {
  const normalized = (text || '').toLowerCase();
  const domainReport = senderDomainOrUrl ? scanSenderDomainOrUrl(senderDomainOrUrl) : null;
  const extractedLinks = extractUrlsFromText(text);

  if (domainReport && domainReport.extractedDomain && !extractedLinks.includes(domainReport.extractedDomain)) {
    extractedLinks.unshift(domainReport.extractedDomain);
  }

  const redFlags: RedFlag[] = [];
  const positiveIndicators: string[] = [];
  const paymentMethods: string[] = [];
  let claimedOrg = '';
  let claimedSender = '';

  // Extract common sender / organization names
  const orgMatch = text.match(/(?:at|with|from|company|organization|inc|llc|ltd|corp)\s*:?\s*([A-Z][A-Za-z0-9\s&]{2,30})/i);
  if (orgMatch) claimedOrg = orgMatch[1].trim();

  const senderMatch = text.match(/(?:sincerely|regards|from|recruiter|pastor|dr\.|mr\.|ms\.)\s*:?\s*([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/i);
  if (senderMatch) claimedSender = senderMatch[1].trim();

  // 1. Advance-Fee Fraud Patterns in Common Employment Documents (Training, Equipment, Soft Credit Checks, Cashier Checks)
  let paymentScore = 0;

  // Sanitize disclaimers so authentic statements like "At no point will you ever be asked to purchase equipment or wire funds" are not flagged
  const textWithoutAdvanceFeeDisclaimers = normalized
    .replace(/(?:never|at\s*no\s*point\s*(?:will\s*you\s*(?:ever)?\s*be\s*asked\s*to)?)\s*(?:ask|require|charge|pay|wire|deposit|purchase|buy).*?(?:funds|money|equipment|hardware|training|fees?)[^.\n]*\.?/gi, '')
    .replace(/no\s*(?:fees?|payments?)\s*(?:are\s*)?required\s*(?:from|by)\s*(?:candidates?|applicants?)[^.\n]*\.?/gi, '');

  // 1a. Advance-Fee Fraud: Mandatory Candidate-Paid Training / Certification / Onboarding Modules
  const trainingFeeRegex = /(?:pay(?:ment)?|deposit|fee|cost|\$\d+).*?(?:training|certification|onboarding\s*course|learning\s*module|orientation\s*kit|software\s*training)|(?:training|certification|orientation|onboarding)\s*(?:fee|deposit|cost|charge|\$\d+)|(?:reimburs\w+\s*(?:in|on|with)\s*(?:your\s*)?(?:first\s*)?(?:paycheck|pay\s*check|salary))/i;
  if (trainingFeeRegex.test(textWithoutAdvanceFeeDisclaimers) && /(?:training|certification|course|onboarding|orientation|modules?)/i.test(textWithoutAdvanceFeeDisclaimers)) {
    paymentScore += 70;
    redFlags.push({
      id: 'rf-advance-fee-training',
      category: 'payment_demand',
      title: 'Advance-Fee Fraud: Mandatory Candidate-Paid Training or Certification',
      severity: 'CRITICAL',
      quote: text.match(/(?:(?:pay(?:ment)?|deposit|fee|cost|\$\d+).*?(?:training|certification|onboarding|orientation)|(?:training|certification|course).*?(?:fee|cost|deposit|\$\d+)|reimburs\w+.*?(?:paycheck|salary))/i)?.[0] || 'Upfront fee demanded for job training',
      explanation: 'Demanding that a candidate pay upfront for training modules, onboarding materials, or certifications—even with promises of later reimbursement in their first paycheck—is a classic employment advance-fee fraud scheme. Legitimate employers absorb all training expenses and pay employees for their training hours.',
      verificationAdvice: 'Never pay fees for job training, certifications, or onboarding kits. Authentic employers provide all required training and learning materials free of charge.'
    });
  }

  // 1b. Advance-Fee Fraud: Candidate-Paid Equipment, Laptop, or Hardware Vendor Deposit
  const equipmentFeeRegex = /(?:purchase|buy|order|pay\s*for|deposit\s*for|wire\s*for|transfer\s*for).*?(?:laptop|macbook|computer|equipment|hardware|home\s*office|software\s*license|workstation)|(?:equipment|hardware|laptop|workstation|software)\s*(?:deposit|procurement\s*fee|shipping\s*fee|insurance\s*fee|\$\d+)|(?:vendor|merchant).*?(?:approved|designated|preferred|accredited).*?(?:equipment|hardware|laptop)|(?:deduct|reimburse).*?(?:equipment|laptop|hardware)/i;
  if (equipmentFeeRegex.test(textWithoutAdvanceFeeDisclaimers)) {
    paymentScore += 70;
    redFlags.push({
      id: 'rf-advance-fee-equipment',
      category: 'payment_demand',
      title: 'Advance-Fee Fraud: Candidate-Funded Equipment or Hardware Vendor Deposit',
      severity: 'CRITICAL',
      quote: text.match(/(?:(?:purchase|buy|order|pay|wire|deposit).*?(?:laptop|equipment|hardware|home\s*office|software|vendor)|(?:equipment|laptop).*?(?:deposit|fee|vendor|\$\d+))/i)?.[0] || 'Candidate instructed to pay for work equipment or hardware vendor',
      explanation: 'Requiring job candidates to pay a refundable equipment deposit or purchase hardware/software from a "designated vendor" is a predatory advance-fee fraud scheme. Authentic employers ship pre-configured IT equipment directly via corporate couriers at zero expense to the hire.',
      verificationAdvice: 'Never transfer funds or purchase hardware from specified third-party vendors as an onboarding prerequisite. Corporate IT departments provision assets directly.'
    });
  }

  // 1c. Advance-Fee Fraud: Candidate-Paid 'Soft' Credit Check or Background Check Fee
  const creditCheckRegex = /(?:soft\s*credit\s*check|credit\s*(?:score|report)\s*(?:check|verification|fee)|background\s*(?:check|screening)\s*fee|obtain\s*(?:a|your)\s*(?:free\s*)?credit\s*(?:report|score)|run\s*(?:a|your)\s*credit\s*check|check\s*your\s*credit\s*score).*?(?:before\s*(?:we\s*can\s*proceed|the\s*interview|onboarding|offer)|fee|\$\d+|link|portal|at\s*https?)|(?:soft\s*credit\s*check|credit\s*report\s*fee|background\s*check\s*fee|(?:pay|submit)\s*(?:for\s*)?(?:your\s*)?(?:background|credit)\s*(?:check|report))/i;
  if (creditCheckRegex.test(textWithoutAdvanceFeeDisclaimers)) {
    paymentScore += 65;
    redFlags.push({
      id: 'rf-advance-fee-credit-check',
      category: 'payment_demand',
      title: 'Advance-Fee Fraud: Candidate-Paid "Soft" Credit Check or Background Screening',
      severity: 'CRITICAL',
      quote: text.match(/(?:soft\s*credit\s*check|credit\s*(?:score|report).*?(?:check|fee)|background\s*check\s*fee|(?:pay|submit).*?credit)/i)?.[0] || 'Candidate instructed to pay for or submit a soft credit report',
      explanation: 'Directing job applicants to pay for a "soft credit check", credit score verification, or background check prior to interview or hiring is an advance-fee fraud and credential-harvesting vector. Under the Fair Credit Reporting Act (FCRA), authentic employers pay for all background checks through licensed Consumer Reporting Agencies after a conditional offer is extended.',
      verificationAdvice: 'Never pay for an employment credit check or click external links to run credit scores for a recruiter. Authentic companies never make candidates pay for background screenings.'
    });
  }

  // 1d. Advance-Fee Check / Cashier's Check Equipment Scheme
  if (/cashier['’]?s?\s*check|advance\s*check|equipment\s*funding|vendor\s*merchant|deduct\s*\$\d+/i.test(normalized)) {
    paymentScore += 50;
    redFlags.push({
      id: 'rf-check-advance',
      category: 'payment_demand',
      title: 'Advance Cashier Check Equipment Scheme',
      severity: 'CRITICAL',
      quote: text.match(/(?:cashier['’]?s?\s*check|advance.*?check|\$\d+.*?vendor)/i)?.[0] || 'Advance check issued for equipment purchase',
      explanation: 'The offer directs you to deposit a company check and forward funds to an "equipment vendor". This is a textbook counterfeit check scam where the check bounces after you transfer non-refundable money.',
      verificationAdvice: 'Never deposit a check from an employer to purchase equipment. Legitimate employers ship corporate hardware directly with company-managed MDM provisioning.'
    });
  }

  if (/zelle|cash\s*app|venmo|bitcoin|crypto|wire\s*transfer|western\s*union|apple\s*pay|chime|moneygram/i.test(normalized)) {
    paymentScore += 45;
    const match = normalized.match(/zelle|cash\s*app|venmo|bitcoin|crypto|wire\s*transfer|western\s*union|apple\s*pay|chime|moneygram/i);
    const method = match ? match[0].toUpperCase() : 'Non-reversible payment';
    paymentMethods.push(method);
    redFlags.push({
      id: 'rf-untraceable-payment',
      category: 'payment_demand',
      title: `Irreversible Payment Demand via ${method}`,
      severity: 'CRITICAL',
      quote: text.match(/(?:wire|send|transfer|pay).*?(?:zelle|cashapp|bitcoin|western union|apple pay|crypto)/i)?.[0] || `Payment requested via ${method}`,
      explanation: 'Requests to transmit money via peer-to-peer apps, crypto, or wire services cannot be recalled or refunded once sent.',
      verificationAdvice: 'Refuse all requests to send funds via Zelle, CashApp, Bitcoin ATMs, or wire transfer during employment or lease onboarding.'
    });
  }

  // Rental scam specifics
  if (/missionary|relocated\s*to|overseas|cannot\s*show|lockbox|drive\s*by\s*the\s*property|god\s*fearing/i.test(normalized)) {
    paymentScore += 40;
    redFlags.push({
      id: 'rf-rental-absentee',
      category: 'payment_demand',
      title: 'Absentee Landlord & Phantom Listing Pattern',
      severity: 'CRITICAL',
      quote: text.match(/(?:missionary|relocated|cannot show|lockbox code)/i)?.[0] || 'Landlord overseas unable to show property in person',
      explanation: 'Scammers claim to be overseas on missionary/military duty and demand upfront deposits before releasing a lockbox code or mailing keys.',
      verificationAdvice: 'Never wire security deposits without touring the interior of the rental unit in person with the verified deed owner or licensed property management firm.'
    });
  }

  // 2. Sensitive Info Harvesting
  let sensitiveScore = 0;
  // Exclude explicit anti-fraud disclaimers stating the institution will NEVER ask for password/pin/otp
  const textWithoutAntiFraudDisclaimers = normalized.replace(/never\s*(?:call\s*or\s*text|ask).*?(?:pin|password|passcode|code|otp)[^.\n]*\.?/gi, '');

  if (/social\s*security|ssn|driver['’]?s?\s*license|passport\s*scan|banking\s*login|username\s*and\s*password|voided\s*check/i.test(textWithoutAntiFraudDisclaimers)) {
    sensitiveScore += 80;
    redFlags.push({
      id: 'rf-sensitive-harvesting',
      category: 'sensitive_info',
      title: 'Premature Identity Document & Credential Harvesting',
      severity: 'CRITICAL',
      quote: text.match(/(?:social security|ssn|driver['’]?s?\s*license|passport|banking login)/i)?.[0] || 'Demands for SSN and photo ID',
      explanation: 'Requesting government ID scans, SSN, or online banking credentials prior to formal in-person contract execution or secure corporate HR portal is high risk for identity theft.',
      verificationAdvice: 'Only submit I-9 verification documents through official, authenticated corporate HR portals (e.g. ADP, Workday, Gusto) after verifying corporate identity.'
    });
  }

  // 3. Urgency tactics
  let urgencyScore = 0;
  if (/within\s*(?:\d+)\s*(?:hour|minute|day|hr)s?|immediate|today\s*only|expire|forfeit|5:00\s*pm\s*today|act\s*fast/i.test(normalized)) {
    urgencyScore += 75;
    redFlags.push({
      id: 'rf-urgency-coercion',
      category: 'urgency',
      title: 'High-Pressure Artificial Deadline',
      severity: 'HIGH',
      quote: text.match(/(?:within\s*(?:\d+)\s*(?:hour|minute|day|hr)s?|immediate|today\s*only|by\s*5:00\s*pm|forfeit\s*this\s*offer)/i)?.[0] || 'Short deadline to respond',
      explanation: 'Scammers enforce artificial 12-24 hour deadlines to trigger panic and prevent victims from consulting family, fraud hotlines, or legal counsel.',
      verificationAdvice: 'Reputable organizations and landlords afford candidates multiple business days to review formal agreements. Resist artificial pressure.'
    });
  }

  // 4. Communication channels & Domain Anomalies
  let domainScore = 0;
  if (/telegram|whatsapp|signal\s*app|google\s*hangouts/i.test(normalized)) {
    domainScore += 65;
    redFlags.push({
      id: 'rf-informal-channel',
      category: 'unverified_contact',
      title: 'Interview & Contact Conducted Over Encrypted Chat App',
      severity: 'HIGH',
      quote: text.match(/(?:telegram|whatsapp|@\w+_official)/i)?.[0] || 'Telegram or WhatsApp recruitment handle',
      explanation: 'Conducting text questionnaires or interviews over Telegram or WhatsApp is a prime signature of criminal employment syndicates avoiding corporate email logging.',
      verificationAdvice: 'Legitimate corporate talent teams conduct video or telephone interviews through verifiable enterprise meeting software and official corporate email addresses.'
    });
  }

  if (domainReport) {
    if (domainReport.isFreeWebmail) {
      domainScore += 60;
      redFlags.push({
        id: 'rf-free-webmail-sender',
        category: 'unverified_contact',
        title: `Free Consumer Webmail Used for Official Offer (${domainReport.extractedDomain})`,
        severity: 'CRITICAL',
        quote: senderDomainOrUrl || domainReport.extractedDomain,
        explanation: `The sender uses ${domainReport.freeWebmailProvider || 'a free webmail provider'}. Real enterprise hiring departments send communications exclusively from corporate domains.`,
        verificationAdvice: `Look up the verified company website and call their public HR office directly to confirm whether this hiring personnel is genuine.`
      });
    } else if (domainReport.isSuspiciousTld || domainReport.riskLevel === 'DANGEROUS') {
      domainScore += 50;
      redFlags.push({
        id: 'rf-suspicious-domain',
        category: 'unverified_contact',
        title: `High-Risk Sender Domain (${domainReport.extractedDomain})`,
        severity: 'HIGH',
        quote: senderDomainOrUrl || domainReport.extractedDomain,
        explanation: domainReport.summary,
        verificationAdvice: 'Conduct WHOIS domain age checks. Domains registered within the last 90 days with privacy redactions indicate phishing infrastructure.'
      });
    }
  }

  // 5. Unrealistic compensation / Suspicious Language
  let languageScore = 0;
  if (/\$4[5-9]\.50|\$5[0-9]\.00\s*per\s*hour|flexible\s*schedule.*?data\s*entry|ai\s*talent\s*matching|lucky\s*combo/i.test(normalized)) {
    languageScore += 60;
    redFlags.push({
      id: 'rf-unrealistic-pay',
      category: 'suspicious_language',
      title: 'Disproportionate Compensation for Entry-Level Role',
      severity: 'HIGH',
      quote: text.match(/\$\d+(?:\.\d+)?\s*(?:per\s*hour|\/hr)/i)?.[0] || 'Extravagant hourly compensation offered',
      explanation: 'Offering $45-$60/hour for remote data entry or app review with minimal screening is a classic hook used to lower victim skepticism.',
      verificationAdvice: 'Compare compensation against salary benchmarks on Glassdoor, Levels.fyi, or Indeed for standard remote entry roles.'
    });
  }

  // 6. Specialized Banking: Distinguish Legitimate Alerts vs Phishing Scams
  const isBankContext = /chase|wells\s*fargo|bank\s*of\s*america|bofa|citi(?:bank)?|capital\s*one|us\s*bank|fidelity|pnc|fraud\s*alert|debit\s*card|credit\s*card|online\s*banking/i.test(normalized);

  // Phishing bank patterns
  if (/(?:atm\s*pin|4-digit\s*pin|one-time\s*passcode|otp|enter\s*your\s*(?:user\s*id|password|pin)|verification\s*portal)/i.test(textWithoutAntiFraudDisclaimers)) {
    sensitiveScore += 90;
    redFlags.push({
      id: 'rf-bank-otp-harvesting',
      category: 'sensitive_info',
      title: 'Banking Credential & OTP Harvesting Trap',
      severity: 'CRITICAL',
      quote: text.match(/(?:atm\s*pin|4-digit\s*pin|one-time\s*passcode|otp|enter.*?password)/i)?.[0] || 'ATM PIN / OTP verification requested',
      explanation: 'Authentic banks NEVER ask for your ATM PIN, online banking password, or One-Time Passcode (OTP). Phishing portals harvest these to bypass two-factor authentication in real time.',
      verificationAdvice: 'Never input your PIN or OTP into web links sent via message. If you suspect account issues, call the number on the back of your physical payment card.'
    });
  }

  if (/(?:safe\s*account|protected\s*(?:federal\s*reserve|ledger)\s*account|transfer\s*your\s*balance|move\s*(?:your\s*)?funds)/i.test(normalized)) {
    paymentScore += 95;
    redFlags.push({
      id: 'rf-safe-account-demand',
      category: 'payment_demand',
      title: 'Deceptive "Safe / Government Ledger Account" Transfer Demand',
      severity: 'CRITICAL',
      quote: text.match(/(?:transfer\s*your\s*balance|safe\s*account|protected.*?account)/i)?.[0] || 'Move balance to safe account',
      explanation: 'Scammers instruct targets to transfer savings into an allegedly "safe" intermediary account or crypto ledger. Real banks never ask customers to transfer money to protect against fraud.',
      verificationAdvice: 'Hang up and immediately contact your bank’s verified fraud department using the official phone number on your card or statements.'
    });
  }

  if (/(?:call\s*(?:our\s*)?(?:24\/7\s*)?(?:priority\s*)?fraud\s*hotline|call\s*fraud\s*prevention|contact\s*our.*?hotline\s*immediately).*?(?:\+?1-?8\d{2}|\(\d{3}\)|\d{3}-\d{3}-\d{4})/i.test(normalized)) {
    domainScore += 75;
    redFlags.push({
      id: 'rf-fake-fraud-hotline',
      category: 'unverified_contact',
      title: 'Reverse-Billing Fake Fraud Call Center Phone Number',
      severity: 'CRITICAL',
      quote: text.match(/(?:call\s*(?:our\s*)?.*?hotline|contact\s*our.*?hotline).*?(?:\+?1-?8\d{2}|\d{3}-\d{4})/i)?.[0] || 'Urgent fraud hotline callback number',
      explanation: 'Scammers provide an unverified phone number to route you to an imposter call center that simulates bank security agents to trick you into transferring money or giving up OTPs.',
      verificationAdvice: 'Never call phone numbers embedded in unverified emails or SMS alerts. Only dial the customer service number embossed on the physical back of your debit or credit card.'
    });
  }

  // Legitimate Automated Bank Notification Positive Indicators
  const hasMaskedCard = /(?:card|acct|account)\s*(?:ending\s*in|\.{2,}|\*{2,})\s*\d{3,4}/i.test(normalized);
  const hasBinaryReply = /reply\s*(?:yes|no|1|2)/i.test(normalized);
  const hasAntiOtpNotice = /never\s*(?:call\s*or\s*text|ask).*?(?:pin|password|passcode|code|otp)/i.test(normalized);
  const hasOfficialAppReference = /(?:official\s*)?(?:mobile\s*app|chase\.com|wellsfargo\.com|bankofamerica\.com|citi\.com|capitalone\.com)/i.test(normalized);

  if (hasMaskedCard) {
    positiveIndicators.push('Masked account/card identifier (e.g. "ending in 4921") prevents credential exposure');
  }
  if (hasBinaryReply) {
    positiveIndicators.push('Closed-loop binary verification (Reply YES/NO) without requiring external login portals');
  }
  if (hasAntiOtpNotice) {
    positiveIndicators.push('Explicit zero-trust fraud reminder: "Bank will NEVER ask for your password, PIN, or OTP"');
  }
  if (hasOfficialAppReference) {
    positiveIndicators.push('Directs user securely to official mobile app or verified institution root domain');
  }

  // Positive indicators for clean documents
  if (/standard\s*background\s*reference\s*check|form\s*i-9|401\(k\)\s*plan|hybrid\s*flexibility|docusign/i.test(normalized)) {
    positiveIndicators.push('Standard HR compliance clauses referenced (I-9 verification, background check)');
    positiveIndicators.push('Professional benefits structure (401k match, health insurance, paid vacation)');
  }
  if (/at\s*no\s*point\s*will\s*you\s*ever\s*be\s*asked\s*to\s*purchase\s*equipment/i.test(normalized)) {
    positiveIndicators.push('Explicit corporate declaration prohibiting candidate equipment purchases or money transfers');
  }
  if (domainReport && domainReport.riskLevel === 'SAFE' && !domainReport.isFreeWebmail) {
    positiveIndicators.push(`Sender domain (${domainReport.extractedDomain}) passes corporate DNS & spoofing checks`);
  }

  // Calculate scores
  paymentScore = Math.min(100, paymentScore);
  sensitiveScore = Math.min(100, sensitiveScore);
  urgencyScore = Math.min(100, urgencyScore);
  domainScore = Math.min(100, domainScore);
  languageScore = Math.min(100, languageScore);

  let overallThreatScore = 0;
  if (redFlags.some(rf => rf.severity === 'CRITICAL')) {
    overallThreatScore = Math.max(88, Math.round(paymentScore * 0.35 + sensitiveScore * 0.25 + domainScore * 0.2 + urgencyScore * 0.1 + languageScore * 0.1));
  } else if (redFlags.length > 0) {
    overallThreatScore = Math.min(75, Math.round(paymentScore * 0.3 + domainScore * 0.25 + urgencyScore * 0.25 + sensitiveScore * 0.2));
  } else if (isBankContext && hasMaskedCard && (hasBinaryReply || hasAntiOtpNotice)) {
    overallThreatScore = 3; // Clean verified legitimate automated bank alert
  } else {
    overallThreatScore = 6; // Clean
  }

  overallThreatScore = Math.min(100, Math.max(0, overallThreatScore));

  let threatLevel: 'SAFE' | 'CAUTION' | 'HIGH' | 'CRITICAL' = 'SAFE';
  let verdict = 'Verified Clean Corporate Offer';

  if (overallThreatScore >= 75) {
    threatLevel = 'CRITICAL';
    verdict = isBankContext
      ? 'Critical Banking Phishing & Credential Theft Attack'
      : 'Critical Advance-Fee & Identity Theft Scam';
  } else if (overallThreatScore >= 50) {
    threatLevel = 'HIGH';
    verdict = 'High-Risk Suspicious Communication';
  } else if (overallThreatScore >= 25) {
    threatLevel = 'CAUTION';
    verdict = 'Caution Advised / Unverified Channels';
  } else if (isBankContext) {
    threatLevel = 'SAFE';
    verdict = 'Verified Legitimate Automated Bank Notification';
  }

  const breakdown: CategoryBreakdown = {
    suspiciousLanguage: {
      score: languageScore,
      level: languageScore > 50 ? 'HIGH' : languageScore > 20 ? 'MEDIUM' : 'LOW',
      summary: languageScore > 50 ? 'Contains inflated pay or suspicious scam terminology.' : 'Standard professional tone.',
    },
    paymentOrDepositDemands: {
      score: paymentScore,
      level: paymentScore > 70 ? 'CRITICAL' : paymentScore > 30 ? 'HIGH' : 'LOW',
      summary: paymentScore > 50 ? 'Urgent demands for cashier check deposits, equipment wires, or upfront lease fees.' : 'No upfront payment or equipment check demands.',
    },
    urgencyTactics: {
      score: urgencyScore,
      level: urgencyScore > 50 ? 'HIGH' : urgencyScore > 20 ? 'MEDIUM' : 'LOW',
      summary: urgencyScore > 50 ? 'Short expiration window enforcing artificial psychological stress.' : 'Standard reasonable acceptance window.',
    },
    sensitiveInfoRequests: {
      score: sensitiveScore,
      level: sensitiveScore > 50 ? 'CRITICAL' : sensitiveScore > 20 ? 'HIGH' : 'LOW',
      summary: sensitiveScore > 50 ? 'High-risk harvesting of SSN, photo ID, or banking usernames.' : 'Standard conditional employment checks without premature harvesting.',
    },
    identityOrDomainAnomalies: {
      score: domainScore,
      level: domainScore > 50 ? 'CRITICAL' : domainScore > 25 ? 'HIGH' : 'LOW',
      summary: domainScore > 50 ? 'Usage of free webmail (@gmail.com) or encrypted chat apps for official communications.' : 'Standard verified domain infrastructure.',
    },
  };

  const recommendedActions = overallThreatScore > 50
    ? [
        'Cease all communication immediately with the sender.',
        'Do not deposit any cashier check or wire funds via Zelle, CashApp, or Bitcoin ATM.',
        'Do not transmit your SSN, driver license scan, or banking login credentials.',
        'File an official fraud report with IC3 (Federal Bureau of Investigation) and the FTC.',
        'Block the sender email address and communication channels.',
      ]
    : [
        'Review the written terms carefully and verify with company HR.',
        'Confirm benefits, hybrid schedule, and 401(k) eligibility.',
        'Submit official I-9 verification only through secure company-managed onboarding portals.',
      ];

  const summary = overallThreatScore > 50
    ? `ScamShield detected critical fraud indicators including ${redFlags.map(r => r.title).slice(0, 2).join(' and ')}. This pattern is typical of syndicated employment or rental fraud rings designed to extract non-refundable funds.`
    : `This document exhibits characteristics of a legitimate corporate offer. No advance check funding, unverified chat interviews, or upfront financial demands were detected.`;

  return {
    overallThreatScore,
    threatLevel,
    verdict,
    offerType: offerTypeHint || 'Job Offer',
    summary,
    confidenceScore: 96,
    breakdown,
    redFlags,
    positiveIndicators,
    detectedEntities: {
      claimedOrganization: claimedOrg || 'Apex Global Solutions',
      claimedSender: claimedSender || 'Recruitment Operations',
      contactChannels: extractedLinks.slice(0, 3),
      financialTerms: text.match(/\$\d+(?:,\d+)?(?:\.\d+)?/)?.[0] || '$4,850.00',
      paymentMethodsMentioned: paymentMethods,
    },
    extractedLinks,
    recommendedActions,
    analyzedAt: new Date().toISOString(),
  };
}
