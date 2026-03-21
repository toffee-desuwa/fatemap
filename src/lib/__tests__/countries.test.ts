import { COUNTRIES } from '../countries';
import type { Country } from '../types';

describe('COUNTRIES dataset', () => {
  it('has exactly 48 countries', () => {
    expect(COUNTRIES).toHaveLength(48);
  });

  it('all IDs are unique', () => {
    const ids = COUNTRIES.map((c) => c.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs are valid ISO 3166-1 alpha-3 format (3 uppercase letters)', () => {
    for (const c of COUNTRIES) {
      expect(c.id).toMatch(/^[A-Z]{3}$/);
    }
  });

  it('all countries have non-empty name and nameCn', () => {
    for (const c of COUNTRIES) {
      expect(c.name.length).toBeGreaterThan(0);
      expect(c.nameCn.length).toBeGreaterThan(0);
    }
  });

  it('all center coordinates are valid [lng, lat]', () => {
    for (const c of COUNTRIES) {
      const [lng, lat] = c.center;
      expect(lng).toBeGreaterThanOrEqual(-180);
      expect(lng).toBeLessThanOrEqual(180);
      expect(lat).toBeGreaterThanOrEqual(-90);
      expect(lat).toBeLessThanOrEqual(90);
    }
  });

  it('all capital coordinates are valid [lng, lat]', () => {
    for (const c of COUNTRIES) {
      const [lng, lat] = c.capital;
      expect(lng).toBeGreaterThanOrEqual(-180);
      expect(lng).toBeLessThanOrEqual(180);
      expect(lat).toBeGreaterThanOrEqual(-90);
      expect(lat).toBeLessThanOrEqual(90);
    }
  });

  it('all countries have a non-empty region', () => {
    for (const c of COUNTRIES) {
      expect(c.region.length).toBeGreaterThan(0);
    }
  });

  it('satisfies Country interface typing', () => {
    // Type-level check: ensure array is typed correctly
    const first: Country = COUNTRIES[0];
    expect(first).toBeDefined();
  });
});
