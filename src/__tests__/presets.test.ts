import { describe, it, expect } from 'vitest';
import { SAMPLE_PRESETS } from '../data/presets';

describe('Sample Presets Integrity', () => {
  it('contains at least 5 representative fraud and legitimate presets', () => {
    expect(SAMPLE_PRESETS.length).toBeGreaterThanOrEqual(5);
  });

  it('validates that each preset contains required metadata and non-empty text', () => {
    SAMPLE_PRESETS.forEach(preset => {
      expect(preset.id).toBeTruthy();
      expect(preset.title).toBeTruthy();
      expect(preset.category).toBeTruthy();
      expect(preset.threatExpectation).toBeTruthy();
      expect(preset.description).toBeTruthy();
      expect(preset.text.trim().length).toBeGreaterThan(30);
    });
  });

  it('includes both Verified Safe and Critical Scam reference presets', () => {
    const safePresets = SAMPLE_PRESETS.filter(p => p.threatExpectation === 'Verified Safe');
    const criticalPresets = SAMPLE_PRESETS.filter(p => p.threatExpectation === 'Critical Scam');

    expect(safePresets.length).toBeGreaterThanOrEqual(2);
    expect(criticalPresets.length).toBeGreaterThanOrEqual(2);
  });
});
