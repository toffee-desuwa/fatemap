import { RELATIONSHIPS } from '../relationships';
import { COUNTRIES } from '../countries';

const countryIds = new Set(COUNTRIES.map((c) => c.id));

const VALID_TYPES = [
  'trade',
  'military_alliance',
  'energy_dependency',
  'supply_chain',
  'political',
  'geographic_proximity',
] as const;

describe('RELATIONSHIPS', () => {
  it('contains exactly 142 relationships', () => {
    expect(RELATIONSHIPS).toHaveLength(142);
  });

  it('has unique IDs', () => {
    const ids = RELATIONSHIPS.map((r) => r.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('IDs match {from}-{to}-{type} pattern', () => {
    for (const r of RELATIONSHIPS) {
      expect(r.id).toBe(`${r.from}-${r.to}-${r.type}`);
    }
  });

  it('all from/to reference valid country IDs', () => {
    for (const r of RELATIONSHIPS) {
      expect(countryIds).toContain(r.from);
      expect(countryIds).toContain(r.to);
    }
  });

  it('from and to are different countries', () => {
    for (const r of RELATIONSHIPS) {
      expect(r.from).not.toBe(r.to);
    }
  });

  it('all types are valid enum values', () => {
    for (const r of RELATIONSHIPS) {
      expect(VALID_TYPES).toContain(r.type);
    }
  });

  it('all strengths are integers 1-5', () => {
    for (const r of RELATIONSHIPS) {
      expect(r.strength).toBeGreaterThanOrEqual(1);
      expect(r.strength).toBeLessThanOrEqual(5);
      expect(Number.isInteger(r.strength)).toBe(true);
    }
  });

  it('covers all six relationship types', () => {
    const types = new Set(RELATIONSHIPS.map((r) => r.type));
    for (const t of VALID_TYPES) {
      expect(types).toContain(t);
    }
  });

  it('has no duplicate from-to-type combinations', () => {
    const keys = RELATIONSHIPS.map((r) => `${r.from}-${r.to}-${r.type}`);
    expect(new Set(keys).size).toBe(keys.length);
  });
});
