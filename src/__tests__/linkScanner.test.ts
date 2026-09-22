import { describe, it, expect } from 'vitest';
import { scanSenderDomainOrUrl, extractUrlsFromText } from '../utils/linkScanner';

describe('Link & Domain Scanner', () => {
  it('identifies free consumer webmail services as high risk for corporate offers', () => {
    const report = scanSenderDomainOrUrl('recruiter.apexcorp@gmail.com');

    expect(report.isFreeWebmail).toBe(true);
    expect(report.freeWebmailProvider).toContain('Gmail');
    expect(report.riskLevel).toBe('SUSPICIOUS');
    expect(report.extractedDomain).toBe('gmail.com');
  });

  it('verifies authentic enterprise root domains as SAFE', () => {
    const report = scanSenderDomainOrUrl('careers@nexuscloud.io');

    expect(report.isFreeWebmail).toBe(false);
    expect(report.riskLevel).toBe('SAFE');
    expect(report.extractedDomain).toBe('nexuscloud.io');
  });

  it('detects suspicious TLDs often used for phishing campaigns', () => {
    const report = scanSenderDomainOrUrl('https://portal-verification-service.xyz/login');

    expect(report.isSuspiciousTld).toBe(true);
    expect(report.riskLevel).toBe('DANGEROUS');
  });

  it('extracts all hyperlinks and domains embedded in arbitrary text', () => {
    const sampleText = `
      Please visit https://chase-fraud-prevention.net/auth to confirm.
      Contact support at http://helpdesk-verify.top or check out google.com.
    `;
    const links = extractUrlsFromText(sampleText);

    expect(links.length).toBeGreaterThanOrEqual(2);
    expect(links.some(l => l.includes('chase-fraud-prevention.net'))).toBe(true);
    expect(links.some(l => l.includes('helpdesk-verify.top'))).toBe(true);
  });
});
