import { describe, it, expect } from 'vitest';
import { analyzeOfferLocally } from '../utils/localAnalyzer';

describe('Bank Fraud Alert vs. Phishing Scam Engine', () => {
  it('correctly classifies authentic automated bank SMS alerts as SAFE', () => {
    const legitimateBankAlert = `
      Chase Fraud Alert: Did you attempt a $68.42 purchase at WALMART STORE #1420 on debit card ending in 4921?

      Reply YES if you authorized this charge.
      Reply NO if you did not.

      Security Notice: Chase will NEVER call or text asking for your password, PIN, or one-time verification passcode (OTP). You can also review alerts anytime securely in the official Chase Mobile app or at chase.com.
    `;
    const result = analyzeOfferLocally(legitimateBankAlert, 'Bank / Financial Alert', 'alerts@notify.chase.com');

    expect(result.threatLevel).toBe('SAFE');
    expect(result.overallThreatScore).toBeLessThanOrEqual(10);
    expect(result.verdict).toContain('Legitimate Automated Bank Notification');
    expect(result.positiveIndicators.some(ind => ind.includes('Masked account/card identifier'))).toBe(true);
    expect(result.positiveIndicators.some(ind => ind.includes('Reply YES/NO'))).toBe(true);
    expect(result.redFlags.length).toBe(0);
  });

  it('detects banking phishing attacks with OTP/PIN harvesting as CRITICAL', () => {
    const phishingScam = `
      URGENT NOTIFICATION FROM CHASE ONLINE SECURITY CENTER
      Your account has been suspended due to unauthorized activity.
      To restore your account within 2 hours:
      1. Click https://chase-fraud-prevention.net/restore
      2. Enter your User ID, Password, and 4-digit ATM PIN.
      3. Enter the 6-digit One-Time Passcode (OTP) sent to your mobile device.
      Failure to verify will result in permanent account termination.
    `;
    const result = analyzeOfferLocally(phishingScam, 'Bank / Financial Alert', 'security-alerts@chase-fraud-prevention.net');

    expect(result.threatLevel).toBe('CRITICAL');
    expect(result.overallThreatScore).toBeGreaterThanOrEqual(85);
    expect(result.verdict).toContain('Banking Phishing');
    expect(result.redFlags.some(rf => rf.id === 'rf-bank-otp-harvesting')).toBe(true);
    expect(result.redFlags.some(rf => rf.category === 'urgency')).toBe(true);
  });

  it('detects fake fraud department hotline phone numbers', () => {
    const reverseBillingScam = `
      Bank of America Security Alert: A charge of $945.00 is pending. If you did not make this purchase, contact our 24/7 priority fraud hotline immediately at +1-888-912-0482 to stop the wire.
    `;
    const result = analyzeOfferLocally(reverseBillingScam, 'Bank / Financial Alert');

    expect(result.redFlags.some(rf => rf.id === 'rf-fake-fraud-hotline')).toBe(true);
  });

  it('detects safe account transfer scams', () => {
    const safeAccountScam = `
      Wells Fargo Alert: Your account is compromised. You must transfer your balance to a protected federal reserve ledger account immediately to safeguard your funds.
    `;
    const result = analyzeOfferLocally(safeAccountScam, 'Bank / Financial Alert');

    expect(result.redFlags.some(rf => rf.id === 'rf-safe-account-demand')).toBe(true);
    expect(result.threatLevel).toBe('CRITICAL');
  });
});
