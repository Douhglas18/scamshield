import { describe, it, expect } from 'vitest';
import { analyzeOfferLocally } from '../utils/localAnalyzer';

describe('Advance-Fee Fraud Heuristics Engine', () => {
  it('detects mandatory candidate-paid training or certification fees as CRITICAL advance-fee fraud', () => {
    const trainingScamOffer = `
      Dear Candidate,
      We are delighted to offer you the Remote Customer Support Associate role.
      Before your official start date, you must complete the mandatory 3-week Certified Digital Support Specialist program.
      A training fee of $250.00 is required to unlock your learning modules and portal credentials.
      This amount will be fully reimbursed in your first paycheck.
    `;
    const result = analyzeOfferLocally(trainingScamOffer, 'Job Offer');

    expect(result.threatLevel).toBe('CRITICAL');
    expect(result.overallThreatScore).toBeGreaterThanOrEqual(85);
    expect(result.redFlags.some(rf => rf.id === 'rf-advance-fee-training')).toBe(true);
    expect(result.redFlags.find(rf => rf.id === 'rf-advance-fee-training')?.severity).toBe('CRITICAL');
  });

  it('detects candidate equipment purchase / hardware vendor deposit schemes', () => {
    const equipmentScamOffer = `
      Apex Operations is pleased to offer you the position of Quality Assurance Analyst.
      You will need a dedicated Apple MacBook Pro and encrypted dual monitors.
      Please purchase your equipment from our accredited vendor portal at hardware-apex-procurement.net.
      A refundable equipment deposit of $1,200 is required before hardware dispatch.
    `;
    const result = analyzeOfferLocally(equipmentScamOffer, 'Job Offer');

    expect(result.threatLevel).toBe('CRITICAL');
    expect(result.redFlags.some(rf => rf.id === 'rf-advance-fee-equipment')).toBe(true);
  });

  it('detects candidate-paid "soft" credit check and background screening fees', () => {
    const creditCheckScamOffer = `
      Hello, we reviewed your application for the Remote Project Coordinator opening.
      To schedule your final interview, our compliance team requires a soft credit check report.
      Please run your soft credit check through our verification link and submit the report fee of $29.99 before we can proceed with your interview.
    `;
    const result = analyzeOfferLocally(creditCheckScamOffer, 'Job Offer');

    expect(result.threatLevel).toBe('CRITICAL');
    expect(result.redFlags.some(rf => rf.id === 'rf-advance-fee-credit-check')).toBe(true);
    expect(result.redFlags.find(rf => rf.id === 'rf-advance-fee-credit-check')?.explanation).toContain('Fair Credit Reporting Act');
  });

  it('does NOT flag legitimate employer disclaimers stating candidates will never pay for equipment', () => {
    const legitimateOffer = `
      Stripe is pleased to extend an offer for the Software Engineer role.
      Base salary is $160,000 annually.
      All corporate hardware and equipment will be provisioned directly by our internal IT department at zero cost to you.
      At no point will you ever be asked to purchase equipment, wire funds, or pay fees.
      We conduct standard background checks through GoodHire at company expense.
    `;
    const result = analyzeOfferLocally(legitimateOffer, 'Job Offer');

    expect(result.threatLevel).toBe('SAFE');
    expect(result.redFlags.filter(rf => rf.category === 'payment_demand').length).toBe(0);
    expect(result.positiveIndicators.length).toBeGreaterThan(0);
  });
});
