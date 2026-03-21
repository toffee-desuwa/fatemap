import { matchScenario, findClosestScenarios } from '../keyword-analyzer';

describe('keyword-analyzer', () => {
  describe('matchScenario', () => {
    it('returns exact match for "Taiwan Strait military conflict"', () => {
      const result = matchScenario('Taiwan Strait military conflict');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('taiwan-strait-crisis');
    });

    it('returns match for Chinese input "台湾海峡军事冲突"', () => {
      const result = matchScenario('台湾海峡军事冲突');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('taiwan-strait-crisis');
    });

    it('returns match for partial input "Suez Canal blocked"', () => {
      const result = matchScenario('Suez Canal blocked');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('suez-canal-closure');
    });

    it('returns null for random gibberish', () => {
      const result = matchScenario('xyzzy flurble borkbork');
      expect(result).toBeNull();
    });

    it('returns null for empty string', () => {
      const result = matchScenario('');
      expect(result).toBeNull();
    });

    it('returns null for single unrelated word', () => {
      const result = matchScenario('banana');
      expect(result).toBeNull();
    });

    it('is case insensitive', () => {
      const result = matchScenario('TAIWAN STRAIT military');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('taiwan-strait-crisis');
    });

    it('picks best match when multiple scenarios share keywords', () => {
      // "China tariff trade war" should match trade-related scenario
      const result = matchScenario('China tariff trade war');
      expect(result).not.toBeNull();
      expect(result!.id).toBe('us-china-trade-war');
    });
  });

  describe('findClosestScenarios', () => {
    it('returns multiple scenarios sorted by score descending', () => {
      const results = findClosestScenarios('China military conflict', 5);
      expect(results.length).toBeGreaterThan(0);
      expect(results.length).toBeLessThanOrEqual(5);
    });

    it('returns empty array for gibberish', () => {
      const results = findClosestScenarios('xyzzy flurble borkbork');
      expect(results).toEqual([]);
    });

    it('respects limit parameter', () => {
      const results = findClosestScenarios('China military trade war conflict', 2);
      expect(results.length).toBeLessThanOrEqual(2);
    });

    it('defaults to returning all matches when no limit given', () => {
      const results = findClosestScenarios('China military');
      expect(results.length).toBeGreaterThanOrEqual(1);
    });
  });
});
