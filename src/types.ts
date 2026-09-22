export type ThreatLevel = 'SAFE' | 'CAUTION' | 'HIGH' | 'CRITICAL';

export type RedFlagCategory =
  | 'payment_demand'
  | 'urgency'
  | 'sensitive_info'
  | 'suspicious_language'
  | 'unverified_contact'
  | 'unrealistic_terms';

export type RedFlagSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RedFlag {
  id: string;
  category: RedFlagCategory;
  title: string;
  severity: RedFlagSeverity;
  quote: string;
  explanation: string;
  verificationAdvice: string;
}

export interface CategoryBreakdownItem {
  score: number; // 0 - 100
  level: string;
  summary: string;
}

export interface CategoryBreakdown {
  suspiciousLanguage: CategoryBreakdownItem;
  paymentOrDepositDemands: CategoryBreakdownItem;
  urgencyTactics: CategoryBreakdownItem;
  sensitiveInfoRequests: CategoryBreakdownItem;
  identityOrDomainAnomalies: CategoryBreakdownItem;
}

export interface DetectedEntities {
  claimedOrganization?: string;
  claimedSender?: string;
  contactChannels?: string[];
  financialTerms?: string;
  paymentMethodsMentioned?: string[];
}

export interface ScamAnalysisResult {
  overallThreatScore: number; // 0 - 100
  threatLevel: ThreatLevel;
  verdict: string;
  offerType: string;
  summary: string;
  confidenceScore: number;
  breakdown: CategoryBreakdown;
  redFlags: RedFlag[];
  positiveIndicators: string[];
  detectedEntities: DetectedEntities;
  extractedLinks: string[];
  recommendedActions: string[];
  analyzedAt: string;
  isFallbackRuleEngine?: boolean;
  fallbackReason?: string;
}

export interface LinkHeuristics {
  isIpAddress: boolean;
  hasHomoglyphOrSpoof: boolean;
  subdomainStacking: boolean;
  suspiciousTld: boolean;
  insecureHttp: boolean;
  isShortener: boolean;
  hasCredentialKeywords: boolean;
  hasSuspiciousPort: boolean;
}

export interface LinkScanReport {
  id: string;
  url: string;
  domain: string;
  protocol: string;
  riskScore: number; // 0 - 100
  riskLevel: 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS';
  reasons: string[];
  heuristics: LinkHeuristics;
  scannedAt: string;
}

export interface PresetSample {
  id: string;
  title: string;
  category: 'Job Offer' | 'Rental Offer' | 'Check Scam' | 'Legitimate Offer' | 'Bank / Financial Alert' | 'Phishing Scam';
  threatExpectation: 'High Threat' | 'Critical Scam' | 'Verified Safe';
  description: string;
  text: string;
  senderDomain?: string;
}

export interface UploadedDoc {
  name: string;
  size: number;
  type: string;
  pageCount?: number;
  base64?: string;
  extractedText?: string;
}

export type ColorVisionMode = 'default' | 'deuteranopia' | 'tritanopia';

export interface DisplaySettings {
  colorVisionMode: ColorVisionMode;
  highContrastMode: boolean;
}

export interface SenderDomainReport {
  rawInput: string;
  extractedDomain: string;
  isEmail: boolean;
  isFreeWebmail: boolean;
  freeWebmailProvider?: string;
  isSuspiciousTld: boolean;
  tld?: string;
  isTyposquatting: boolean;
  impersonatedBrand?: string;
  isIpAddress: boolean;
  hasSuspiciousHyphens: boolean;
  riskScore: number;
  riskLevel: 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS';
  summary: string;
  flags: string[];
}
