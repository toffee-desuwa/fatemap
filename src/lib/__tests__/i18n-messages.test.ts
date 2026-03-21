import en from '../../../messages/en.json';
import zh from '../../../messages/zh.json';

/** Recursively collect all leaf keys from a nested object */
function collectKeys(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = [];
  for (const [k, v] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${k}` : k;
    if (typeof v === 'object' && v !== null) {
      keys.push(...collectKeys(v as Record<string, unknown>, path));
    } else {
      keys.push(path);
    }
  }
  return keys.sort();
}

describe('i18n messages', () => {
  const enKeys = collectKeys(en);
  const zhKeys = collectKeys(zh);

  it('en.json has at least one key', () => {
    expect(enKeys.length).toBeGreaterThan(0);
  });

  it('en.json and zh.json have the same keys', () => {
    expect(enKeys).toEqual(zhKeys);
  });

  it('all en.json values are non-empty strings', () => {
    for (const key of enKeys) {
      const value = key.split('.').reduce((acc: unknown, k) => {
        return (acc as Record<string, unknown>)?.[k];
      }, en);
      expect(typeof value).toBe('string');
      expect((value as string).length).toBeGreaterThan(0);
    }
  });

  it('all zh.json values are non-empty strings', () => {
    for (const key of zhKeys) {
      const value = key.split('.').reduce((acc: unknown, k) => {
        return (acc as Record<string, unknown>)?.[k];
      }, zh);
      expect(typeof value).toBe('string');
      expect((value as string).length).toBeGreaterThan(0);
    }
  });

  it('has expected namespaces', () => {
    const namespaces = Object.keys(en);
    expect(namespaces).toContain('common');
    expect(namespaces).toContain('metadata');
    expect(namespaces).toContain('scenario');
    expect(namespaces).toContain('report');
  });

  it('report namespace has interpolation placeholders', () => {
    expect(en.report.epicenter).toContain('{flag}');
    expect(en.report.epicenter).toContain('{name}');
    expect(en.report.countryImpacts).toContain('{count}');
    expect(en.report.cityImpacts).toContain('{count}');
  });

  it('zh report namespace has matching interpolation placeholders', () => {
    expect(zh.report.epicenter).toContain('{flag}');
    expect(zh.report.epicenter).toContain('{name}');
    expect(zh.report.countryImpacts).toContain('{count}');
    expect(zh.report.cityImpacts).toContain('{count}');
  });
});
