import { LinkScanReport, LinkHeuristics, SenderDomainReport } from '../types';

// High-profile target domains for typosquatting / spoof detection
const HIGH_VALUE_BRANDS = [
  { brand: 'google', domains: ['google.com', 'google.io'] },
  { brand: 'paypal', domains: ['paypal.com', 'paypal.me'] },
  { brand: 'microsoft', domains: ['microsoft.com', 'outlook.com', 'live.com'] },
  { brand: 'apple', domains: ['apple.com', 'icloud.com'] },
  { brand: 'amazon', domains: ['amazon.com', 'aws.amazon.com'] },
  { brand: 'chase', domains: ['chase.com'] },
  { brand: 'wellsfargo', domains: ['wellsfargo.com'] },
  { brand: 'bankofamerica', domains: ['bankofamerica.com'] },
  { brand: 'docusign', domains: ['docusign.com', 'docusign.net'] },
  { brand: 'workday', domains: ['workday.com', 'myworkdayjobs.com'] },
  { brand: 'adp', domains: ['adp.com', 'workforcenow.adp.com'] },
  { brand: 'linkedin', domains: ['linkedin.com'] },
  { brand: 'indeed', domains: ['indeed.com'] },
  { brand: 'zillow', domains: ['zillow.com'] },
  { brand: 'airbnb', domains: ['airbnb.com'] },
  { brand: 'fedex', domains: ['fedex.com'] },
  { brand: 'ups', domains: ['ups.com'] },
  { brand: 'telegram', domains: ['telegram.org', 't.me'] }
];

const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'cam', 'work', 'click', 'zip', 'mov', 'fit', 'bid',
  'racing', 'download', 'cf', 'gq', 'ml', 'tk', 'country', 'stream',
  'link', 'rest', 'guru', 'zone', 'party', 'date', 'faith', 'loan'
]);

const KNOWN_SHORTENERS = new Set([
  'bit.ly', 'tinyurl.com', 't.co', 'cutt.ly', 'is.gd', 'rb.gy', 'ow.ly',
  'buff.ly', 'adf.ly', 'goo.gl', 'shorte.st', 'rebrand.ly'
]);

const PHISHING_KEYWORDS = [
  'login', 'signin', 'sign-in', 'verify', 'verification', 'account-update',
  'confirm-identity', 'wallet', 'ssn', 'passcode', 'security-alert', 'auth',
  'authenticate', 'secure-portal', 'bank', 'payroll-check', 'claim-funds'
];

/**
 * Extract all URLs from arbitrary text
 */
export function extractUrlsFromText(text: string): string[] {
  if (!text) return [];

  // Match http/https URLs and loose domain.com/path occurrences
  const urlRegex = /(?:https?:\/\/|www\.)[^\s<>"'{}|\\^`[\]]+|(?:[a-zA-Z0-9-]+\.)+(?:com|org|net|xyz|top|io|co|us|uk|info|biz|me|online|app|dev|tech|store|site)(?:\/[^\s<>"'{}|\\^`[\]]*)?/gi;
  
  const matches = text.match(urlRegex) || [];
  const cleaned: string[] = [];
  const seen = new Set<string>();

  for (const match of matches) {
    let url = match.trim().replace(/[.,;:)]+$/, ''); // clean trailing punctuation
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }
    const lower = url.toLowerCase();
    if (!seen.has(lower)) {
      seen.add(lower);
      cleaned.push(url);
    }
  }

  return cleaned;
}

/**
 * Calculate Levenshtein Distance for typosquatting detection
 */
function getLevenshteinDistance(a: string, b: string): number {
  const matrix: number[][] = [];
  for (let i = 0; i <= b.length; i++) matrix[i] = [i];
  for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1,     // insertion
          matrix[i - 1][j] + 1      // deletion
        );
      }
    }
  }
  return matrix[b.length][a.length];
}

/**
 * Scan a single URL on local device using deep heuristics
 */
export function scanUrlLocally(rawUrl: string): LinkScanReport {
  let normalized = rawUrl.trim();
  if (!normalized.startsWith('http://') && !normalized.startsWith('https://')) {
    normalized = 'http://' + normalized;
  }

  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return {
      id: Math.random().toString(36).substring(2, 9),
      url: rawUrl,
      domain: 'malformed-url',
      protocol: 'unknown',
      riskScore: 90,
      riskLevel: 'DANGEROUS',
      reasons: ['Malformed URL structure cannot be safely parsed or validated.'],
      heuristics: {
        isIpAddress: false,
        hasHomoglyphOrSpoof: false,
        subdomainStacking: false,
        suspiciousTld: false,
        insecureHttp: true,
        isShortener: false,
        hasCredentialKeywords: false,
        hasSuspiciousPort: false
      },
      scannedAt: new Date().toISOString()
    };
  }

  const hostname = parsed.hostname.toLowerCase();
  const pathname = parsed.pathname.toLowerCase();
  const search = parsed.search.toLowerCase();
  const fullPath = pathname + search;

  const reasons: string[] = [];
  let score = 0;

  // 1. IP Address Hostname Check (e.g. http://192.168.1.1)
  const isIpV4 = /^(\d{1,3}\.){3}\d{1,3}$/.test(hostname);
  const isIpV6 = hostname.startsWith('[') && hostname.endsWith(']');
  const isIpAddress = isIpV4 || isIpV6;
  if (isIpAddress) {
    score += 55;
    reasons.push(`Raw IP address (${hostname}) used as host instead of legitimate registered domain`);
  }

  // 2. Insecure HTTP Protocol
  const insecureHttp = parsed.protocol === 'http:';
  if (insecureHttp) {
    score += 20;
    reasons.push('Unencrypted HTTP protocol detected. Legitimate offer letters use TLS/HTTPS.');
  }

  // 3. Suspicious / High-Abuse TLD Check
  const domainParts = hostname.split('.');
  const tld = domainParts.length > 1 ? domainParts[domainParts.length - 1] : '';
  const suspiciousTld = SUSPICIOUS_TLDS.has(tld);
  if (suspiciousTld) {
    score += 40;
    reasons.push(`High-abuse TLD (.${tld}) frequently leveraged in disposable phishing campaigns`);
  }

  // 4. URL Shortener / Redirect Cloaking
  const isShortener = KNOWN_SHORTENERS.has(hostname) || KNOWN_SHORTENERS.has(domainParts.slice(-2).join('.'));
  if (isShortener) {
    score += 35;
    reasons.push(`URL shortener (${hostname}) masks ultimate destination landing page`);
  }

  // 5. Deceptive Subdomain Stacking (e.g. google.com.verify-login.xyz)
  let subdomainStacking = false;
  const registeredDomain = domainParts.slice(-2).join('.');
  for (const { brand, domains } of HIGH_VALUE_BRANDS) {
    const isExactBrandDomain = domains.some(d => hostname === d || hostname.endsWith('.' + d));
    if (!isExactBrandDomain) {
      if (hostname.includes(brand) || hostname.includes(brand.replace('o', '0'))) {
        subdomainStacking = true;
        score += 60;
        reasons.push(`Deceptive brand imitation: Subdomain contains "${brand}" but base domain is "${registeredDomain}"`);
        break;
      }
    }
  }

  // 6. Homoglyphs & Typosquatting (e.g. paypa1.com, g00gle.com)
  let hasHomoglyphOrSpoof = false;
  // Normalized visual homoglyphs
  const normalizedHost = hostname
    .replace(/0/g, 'o')
    .replace(/1/g, 'l')
    .replace(/3/g, 'e')
    .replace(/5/g, 's')
    .replace(/@/g, 'a')
    .replace(/vv/g, 'w');

  for (const { brand, domains } of HIGH_VALUE_BRANDS) {
    if (domains.includes(hostname)) continue; // legitimate

    const baseName = domainParts.length >= 2 ? domainParts[domainParts.length - 2] : hostname;
    const normBaseName = baseName
      .replace(/0/g, 'o')
      .replace(/1/g, 'l')
      .replace(/3/g, 'e')
      .replace(/5/g, 's');

    if (normBaseName === brand && baseName !== brand) {
      hasHomoglyphOrSpoof = true;
      score += 70;
      reasons.push(`Character substitution detected: "${baseName}" mimics brand "${brand}"`);
      break;
    }

    const dist = getLevenshteinDistance(normBaseName, brand);
    if (dist === 1 && brand.length >= 4 && !domains.includes(hostname)) {
      hasHomoglyphOrSpoof = true;
      score += 65;
      reasons.push(`Typosquatting alert: "${baseName}" is 1 typo away from protected brand "${brand}"`);
      break;
    }
  }

  // 7. Credential Harvesting Keywords in Path or Parameters
  let hasCredentialKeywords = false;
  const matchedKeywords = PHISHING_KEYWORDS.filter(kw => fullPath.includes(kw));
  if (matchedKeywords.length > 0) {
    hasCredentialKeywords = true;
    score += Math.min(35, matchedKeywords.length * 15);
    reasons.push(`Credential harvesting path indicators detected: [${matchedKeywords.join(', ')}]`);
  }

  // 8. Non-standard HTTP ports (e.g. :8080, :8888, :3000)
  const port = parsed.port;
  const hasSuspiciousPort = !!port && !['80', '443'].includes(port);
  if (hasSuspiciousPort) {
    score += 30;
    reasons.push(`Non-standard web port (:${port}) atypical for commercial offer letters`);
  }

  // Bound score between 0 and 100
  const finalScore = Math.min(100, Math.max(0, score));

  let riskLevel: 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS' = 'SAFE';
  if (finalScore >= 60) {
    riskLevel = 'DANGEROUS';
  } else if (finalScore >= 25) {
    riskLevel = 'SUSPICIOUS';
  } else {
    riskLevel = 'SAFE';
    if (reasons.length === 0) {
      reasons.push('Standard domain syntax and secure HTTPS protocol observed. No spoofing signatures triggered.');
    }
  }

  const heuristics: LinkHeuristics = {
    isIpAddress,
    hasHomoglyphOrSpoof,
    subdomainStacking,
    suspiciousTld,
    insecureHttp,
    isShortener,
    hasCredentialKeywords,
    hasSuspiciousPort
  };

  return {
    id: Math.random().toString(36).substring(2, 9),
    url: rawUrl,
    domain: hostname,
    protocol: parsed.protocol.replace(':', ''),
    riskScore: finalScore,
    riskLevel,
    reasons,
    heuristics,
    scannedAt: new Date().toISOString()
  };
}

const FREE_WEBMAIL_DOMAINS: Record<string, string> = {
  'gmail.com': 'Google Gmail',
  'yahoo.com': 'Yahoo Mail',
  'hotmail.com': 'Microsoft Hotmail',
  'outlook.com': 'Microsoft Outlook',
  'aol.com': 'AOL Mail',
  'proton.me': 'ProtonMail',
  'protonmail.com': 'ProtonMail',
  'zoho.com': 'Zoho Mail',
  'icloud.com': 'Apple iCloud',
  'mail.ru': 'Mail.ru',
  'yandex.com': 'Yandex Mail',
  'live.com': 'Microsoft Live',
  'gmx.com': 'GMX Mail',
};

/**
 * Scan sender email domain or company website URL for fraud, lookalikes, or free webmail risks
 */
export function scanSenderDomainOrUrl(rawInput: string): SenderDomainReport {
  const trimmed = rawInput.trim();
  if (!trimmed) {
    return {
      rawInput: '',
      extractedDomain: '',
      isEmail: false,
      isFreeWebmail: false,
      isSuspiciousTld: false,
      isTyposquatting: false,
      isIpAddress: false,
      hasSuspiciousHyphens: false,
      riskScore: 0,
      riskLevel: 'SAFE',
      summary: 'No sender domain provided.',
      flags: [],
    };
  }

  const isEmail = trimmed.includes('@');
  let domain = trimmed;

  if (isEmail) {
    domain = trimmed.split('@').pop() || '';
  } else {
    // Strip protocol and path
    domain = trimmed.replace(/^https?:\/\//i, '').split('/')[0].split('?')[0];
  }

  // Remove port and trim
  domain = domain.split(':')[0].toLowerCase().trim();

  const flags: string[] = [];
  let riskScore = 0;

  // 1. Free Webmail check
  const isFreeWebmail = !!FREE_WEBMAIL_DOMAINS[domain];
  const freeWebmailProvider = FREE_WEBMAIL_DOMAINS[domain];

  if (isFreeWebmail) {
    riskScore += 50;
    flags.push(`Free consumer webmail service (${freeWebmailProvider}). Legitimate corporate employers and institutions virtually never issue formal employment offers or leases from personal free webmail addresses.`);
  }

  // 2. IP address check
  const isIpAddress = /^(\d{1,3}\.){3}\d{1,3}$/.test(domain);
  if (isIpAddress) {
    riskScore += 80;
    flags.push(`Direct numerical IP address (${domain}) instead of a registered corporate domain.`);
  }

  // 3. TLD check
  const parts = domain.split('.');
  const tld = parts.length > 1 ? parts[parts.length - 1] : '';
  const isSuspiciousTld = SUSPICIOUS_TLDS.has(tld);
  if (isSuspiciousTld) {
    riskScore += 45;
    flags.push(`Suspicious high-risk TLD (.${tld}) frequently leveraged in disposable phishing campaigns and advance-fee schemes.`);
  }

  // 4. Typosquatting / brand impersonation
  let isTyposquatting = false;
  let impersonatedBrand: string | undefined;

  for (const item of HIGH_VALUE_BRANDS) {
    const isExact = item.domains.includes(domain);
    if (!isExact) {
      if (domain.includes(item.brand)) {
        isTyposquatting = true;
        impersonatedBrand = item.brand;
        riskScore += 55;
        flags.push(`Possible brand impersonation of "${item.brand}". The domain contains the brand name but does not match official company infrastructure.`);
        break;
      }
      for (const official of item.domains) {
        const offName = official.split('.')[0];
        const dist = getLevenshteinDistance(parts[0], offName);
        if (dist === 1 && parts[0].length >= 4) {
          isTyposquatting = true;
          impersonatedBrand = item.brand;
          riskScore += 65;
          flags.push(`Lookalike typosquatting detected (${parts[0]} vs authentic ${official}).`);
          break;
        }
      }
      if (isTyposquatting) break;
    }
  }

  // 5. Hyphens and domain stacking
  const hasSuspiciousHyphens = (domain.match(/-/g) || []).length >= 2;
  if (hasSuspiciousHyphens) {
    riskScore += 25;
    flags.push(`Excessive hyphenation in domain (${domain}), often used to mimic legitimate corporate portals.`);
  }

  if (parts.length > 3) {
    riskScore += 20;
    flags.push(`Deep subdomain nesting (${parts.length - 1} levels) indicating potential dynamic redirection.`);
  }

  riskScore = Math.min(100, Math.max(0, riskScore));

  let riskLevel: 'SAFE' | 'SUSPICIOUS' | 'DANGEROUS' = 'SAFE';
  if (riskScore >= 60) {
    riskLevel = 'DANGEROUS';
  } else if (riskScore >= 25) {
    riskLevel = 'SUSPICIOUS';
  }

  let summary = 'Standard domain structure. No immediate fraud patterns detected locally.';
  if (riskLevel === 'DANGEROUS') {
    summary = `High fraud risk detected on sender domain (${domain}). Immediate verification required.`;
  } else if (riskLevel === 'SUSPICIOUS') {
    summary = `Suspicious sender domain characteristics observed (${domain}). Review with caution.`;
  }

  return {
    rawInput,
    extractedDomain: domain,
    isEmail,
    isFreeWebmail,
    freeWebmailProvider,
    isSuspiciousTld,
    tld,
    isTyposquatting,
    impersonatedBrand,
    isIpAddress,
    hasSuspiciousHyphens,
    riskScore,
    riskLevel,
    summary,
    flags,
  };
}
