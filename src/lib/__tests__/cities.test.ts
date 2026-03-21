import { CITIES } from '../cities';
import { COUNTRIES } from '../countries';
import type { City } from '../types';

const VALID_TYPES = [
  'financial',
  'port',
  'tech',
  'political',
  'energy',
  'manufacturing',
  'logistics',
] as const;

const countryIds = new Set(COUNTRIES.map((c) => c.id));

describe('CITIES dataset', () => {
  it('has exactly 84 cities', () => {
    expect(CITIES).toHaveLength(84);
  });

  it('all IDs are unique', () => {
    const ids = CITIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs are non-empty kebab-case strings', () => {
    for (const c of CITIES) {
      expect(c.id).toMatch(/^[a-z][a-z0-9-]+$/);
    }
  });

  it('all cities have non-empty name and nameCn', () => {
    for (const c of CITIES) {
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.nameCn.length).toBeGreaterThan(0);
    }
  });

  it('all coordinates are valid [lng, lat]', () => {
    for (const c of CITIES) {
      const [lng, lat] = c.coordinates;
      expect(lng).toBeGreaterThanOrEqual(-180);
      expect(lng).toBeLessThanOrEqual(180);
      expect(lat).toBeGreaterThanOrEqual(-90);
      expect(lat).toBeLessThanOrEqual(90);
    }
  });

  it('all countryId references exist in COUNTRIES', () => {
    for (const c of CITIES) {
      expect(countryIds.has(c.countryId)).toBe(true);
    }
  });

  it('all types are valid City type values', () => {
    for (const c of CITIES) {
      expect(VALID_TYPES).toContain(c.type);
    }
  });

  it('all importance values are 1-5', () => {
    for (const c of CITIES) {
      expect(c.importance).toBeGreaterThanOrEqual(1);
      expect(c.importance).toBeLessThanOrEqual(5);
    }
  });

  it('satisfies City interface typing', () => {
    const first: City = CITIES[0];
    expect(first).toBeDefined();
  });
});
