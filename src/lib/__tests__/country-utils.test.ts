import { countryFlag, countryMap, cityMap } from '../country-utils';
import { COUNTRIES } from '../countries';
import { CITIES } from '../cities';

describe('country-utils', () => {
  // --- countryFlag ---
  it('converts known alpha-3 codes to flag emoji', () => {
    expect(countryFlag('USA')).toBe('\u{1F1FA}\u{1F1F8}');
    expect(countryFlag('CHN')).toBe('\u{1F1E8}\u{1F1F3}');
    expect(countryFlag('JPN')).toBe('\u{1F1EF}\u{1F1F5}');
    expect(countryFlag('GBR')).toBe('\u{1F1EC}\u{1F1E7}');
  });

  it('returns empty string for unknown codes', () => {
    expect(countryFlag('ZZZ')).toBe('');
    expect(countryFlag('')).toBe('');
  });

  it('covers all 48 countries', () => {
    for (const c of COUNTRIES) {
      const flag = countryFlag(c.id);
      expect(flag.length).toBeGreaterThan(0);
    }
  });

  // --- countryMap ---
  it('contains all countries keyed by id', () => {
    expect(countryMap.size).toBe(COUNTRIES.length);
    for (const c of COUNTRIES) {
      expect(countryMap.get(c.id)).toBe(c);
    }
  });

  // --- cityMap ---
  it('contains all cities keyed by id', () => {
    expect(cityMap.size).toBe(CITIES.length);
    for (const c of CITIES) {
      expect(cityMap.get(c.id)).toBe(c);
    }
  });
});
