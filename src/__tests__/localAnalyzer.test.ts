import { describe, it, expect } from 'vitest';
import { analyzeOfferLocally } from '../utils/localAnalyzer';

describe('Local Heuristic Fraud Analyzer', () => {
  it('detects advance-fee cashier check equipment scams as CRITICAL', () => {
    const scamText = `
      Congratulations! Apex Global Solutions is pleased to offer you the Remote Data Analyst position.
      We will issue an advance cashier's check of $4,850.00 to purchase your home office equipment.
      You must deposit this check immediately and wire the remaining balance to our certified vendor via Zelle within 24 hours.
    `;
    const result = analyzeOfferLocally(scamText, 'Job Offer', 'hr-apex@gmail.com');

    expect(result.threatLevel).toBe('CRITICAL');
    expect(result.overallThreatScore).toBeGreaterThanOrEqual(80);
    expect(result.redFlags.some(rf => rf.category === 'payment_demand')).toBe(true);
    expect(result.redFlags.some(rf => rf.category === 'unverified_contact')).toBe(true);
  });

  it('validates authentic tech employment offers as SAFE with low threat index', () => {
    const authenticText = `
      Nexus Cloud Technologies is pleased to offer you the position of Senior Full-Stack Engineer.
      Base salary is $145,000 per year, with standard health benefits and 401(k) retirement matching.
      This offer is contingent upon standard background reference verification and Form I-9 compliance through our official ADP portal.
      All corporate hardware will be provisioned and shipped directly by our internal IT department on your official start date.
      At no point will you ever be asked to purchase equipment or wire funds.
    `;
    const result = analyzeOfferLocally(authenticText, 'Job Offer', 'careers@nexuscloud.io');

    expect(result.threatLevel).toBe('SAFE');
    expect(result.overallThreatScore).toBeLessThanOrEqual(15);
    expect(result.positiveIndicators.length).toBeGreaterThan(0);
    expect(result.redFlags.length).toBe(0);
  });

  it('detects absentee landlord rental scams with lockbox codes', () => {
    const rentalScamText = `
      I am currently overseas on a missionary trip and cannot show the apartment in person.
      Drive by the property to inspect the neighborhood. If you like it, wire the $1,500 security deposit via CashApp or Western Union, and I will mail you the keys and provide the lockbox code.
    `;
    const result = analyzeOfferLocally(rentalScamText, 'Rental Offer');

    expect(result.threatLevel).toBe('CRITICAL');
    expect(result.redFlags.some(rf => rf.title.includes('Absentee Landlord') || rf.category === 'payment_demand')).toBe(true);
  });

  it('flags unverified chat app recruitment channels like Telegram', () => {
    const telegramOfferText = `
      Your resume was reviewed. Please connect with Dr. Miller on Telegram @apex_careers_official for your immediate text interview.
    `;
    const result = analyzeOfferLocally(telegramOfferText, 'Job Offer');

    expect(result.redFlags.some(rf => rf.id === 'rf-informal-channel')).toBe(true);
  });
});
