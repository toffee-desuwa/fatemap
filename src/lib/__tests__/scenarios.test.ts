import { SCENARIOS } from '../scenarios';
import { COUNTRIES } from '../countries';
import { CITIES } from '../cities';
import { RELATIONSHIPS } from '../relationships';

const countryIds = new Set(COUNTRIES.map((c) => c.id));
const cityIds = new Set(CITIES.map((c) => c.id));
const relationshipIds = new Set(RELATIONSHIPS.map((r) => r.id));

const VALID_CATEGORIES = [
  'military',
  'economic',
  'climate',
  'health',
  'political',
  'trade',
  'energy',
  'technology',
] as const;

const VALID_SEVERITIES = ['critical', 'high', 'medium', 'low'] as const;
const VALID_DIRECTIONS = ['negative', 'positive', 'mixed'] as const;

describe('SCENARIOS', () => {
  it('contains exactly 28 scenarios', () => {
    expect(SCENARIOS).toHaveLength(28);
  });

  it('has unique IDs', () => {
    const ids = SCENARIOS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('has kebab-case IDs', () => {
    for (const s of SCENARIOS) {
      expect(s.id).toMatch(/^[a-z][a-z0-9-]+$/);
    }
  });

  it('has valid categories', () => {
    for (const s of SCENARIOS) {
      expect(VALID_CATEGORIES).toContain(s.category);
    }
  });

  it('covers all 8 categories', () => {
    const categories = new Set(SCENARIOS.map((s) => s.category));
    expect(categories.size).toBe(8);
  });

  it('has non-empty keywords', () => {
    for (const s of SCENARIOS) {
      expect(s.keywords.length).toBeGreaterThanOrEqual(3);
    }
  });

  it('has valid epicenter countryId', () => {
    for (const s of SCENARIOS) {
      expect(countryIds).toContain(s.result.epicenter.countryId);
    }
  });

  it('has valid epicenter coordinates', () => {
    for (const s of SCENARIOS) {
      const [lng, lat] = s.result.epicenter.coordinates;
      expect(lng).toBeGreaterThanOrEqual(-180);
      expect(lng).toBeLessThanOrEqual(180);
      expect(lat).toBeGreaterThanOrEqual(-90);
      expect(lat).toBeLessThanOrEqual(90);
    }
  });

  it('has all countryImpact countryIds in COUNTRIES', () => {
    for (const s of SCENARIOS) {
      for (const ci of s.result.countryImpacts) {
        expect(countryIds).toContain(ci.countryId);
      }
    }
  });

  it('has 5-15 country impacts per scenario', () => {
    for (const s of SCENARIOS) {
      expect(s.result.countryImpacts.length).toBeGreaterThanOrEqual(5);
      expect(s.result.countryImpacts.length).toBeLessThanOrEqual(15);
    }
  });

  it('has valid country impact severity and direction', () => {
    for (const s of SCENARIOS) {
      for (const ci of s.result.countryImpacts) {
        expect(VALID_SEVERITIES).toContain(ci.severity);
        expect(VALID_DIRECTIONS).toContain(ci.direction);
      }
    }
  });

  it('has impactPercent in range -50 to +50', () => {
    for (const s of SCENARIOS) {
      for (const ci of s.result.countryImpacts) {
        expect(ci.impactPercent).toBeGreaterThanOrEqual(-50);
        expect(ci.impactPercent).toBeLessThanOrEqual(50);
      }
    }
  });

  it('has all cityImpact cityIds in CITIES', () => {
    for (const s of SCENARIOS) {
      for (const ci of s.result.cityImpacts) {
        expect(cityIds).toContain(ci.cityId);
      }
    }
  });

  it('has 3-8 city impacts per scenario', () => {
    for (const s of SCENARIOS) {
      expect(s.result.cityImpacts.length).toBeGreaterThanOrEqual(3);
      expect(s.result.cityImpacts.length).toBeLessThanOrEqual(8);
    }
  });

  it('has all activatedRelationships in RELATIONSHIPS', () => {
    for (const s of SCENARIOS) {
      for (const rid of s.result.activatedRelationships) {
        expect(relationshipIds).toContain(rid);
      }
    }
  });

  it('has non-empty summary and summaryZh', () => {
    for (const s of SCENARIOS) {
      expect(s.result.summary.length).toBeGreaterThan(10);
      expect(s.result.summaryZh.length).toBeGreaterThan(5);
    }
  });

  it('has non-empty name, nameCn, description, descriptionZh', () => {
    for (const s of SCENARIOS) {
      expect(s.name.length).toBeGreaterThan(0);
      expect(s.nameCn.length).toBeGreaterThan(0);
      expect(s.description.length).toBeGreaterThan(0);
      expect(s.descriptionZh.length).toBeGreaterThan(0);
    }
  });
});
