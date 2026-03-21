import { SEVERITY_COLORS, SEVERITY_HEX, SEVERITY_BADGE } from '../colors';

describe('colors', () => {
  // --- SEVERITY_HEX ---
  it('derives hex strings from SEVERITY_COLORS RGB tuples', () => {
    expect(SEVERITY_HEX.critical).toBe('#ff3344');
    expect(SEVERITY_HEX.high).toBe('#ff8844');
    expect(SEVERITY_HEX.medium).toBe('#ffcc44');
    expect(SEVERITY_HEX.low).toBe('#4488ff');
    expect(SEVERITY_HEX.positive).toBe('#44ff88');
  });

  it('hex values match SEVERITY_COLORS RGB tuples', () => {
    for (const key of ['critical', 'high', 'medium', 'low', 'positive'] as const) {
      const [r, g, b] = SEVERITY_COLORS[key];
      const expected = `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
      expect(SEVERITY_HEX[key]).toBe(expected);
    }
  });

  // --- SEVERITY_BADGE ---
  it('has badge classes for all severity levels', () => {
    expect(SEVERITY_BADGE).toHaveProperty('critical');
    expect(SEVERITY_BADGE).toHaveProperty('high');
    expect(SEVERITY_BADGE).toHaveProperty('medium');
    expect(SEVERITY_BADGE).toHaveProperty('low');
  });

  it('badge classes contain hex colors from SEVERITY_HEX', () => {
    expect(SEVERITY_BADGE.critical).toContain(SEVERITY_HEX.critical);
    expect(SEVERITY_BADGE.high).toContain(SEVERITY_HEX.high);
    expect(SEVERITY_BADGE.medium).toContain(SEVERITY_HEX.medium);
    expect(SEVERITY_BADGE.low).toContain(SEVERITY_HEX.low);
  });

  it('medium severity uses dark text, others use white', () => {
    expect(SEVERITY_BADGE.medium).toContain('text-black');
    expect(SEVERITY_BADGE.critical).toContain('text-white');
    expect(SEVERITY_BADGE.high).toContain('text-white');
    expect(SEVERITY_BADGE.low).toContain('text-white');
  });
});
