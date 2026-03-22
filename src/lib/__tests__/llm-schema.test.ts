import { parseSimulationResponse } from '../llm-schema';

// Minimal valid SimulationResult JSON
const validResult = {
  event: 'What if Mainland China initiates a military blockade of Taiwan?',
  timestamp: '2026-03-21T00:00:00Z',
  epicenter: { countryId: 'CHN', coordinates: [121.5, 25.0] },
  countryImpacts: [
    {
      countryId: 'CHN',
      severity: 'critical',
      direction: 'negative',
      impactPercent: -40,
      reason: 'Military costs and sanctions',
      reasonZh: '军事开支和制裁',
    },
    {
      countryId: 'USA',
      severity: 'high',
      direction: 'negative',
      impactPercent: -20,
      reason: 'Trade disruption',
      reasonZh: '贸易中断',
    },
  ],
  cityImpacts: [
    {
      cityId: 'taipei',
      severity: 'critical',
      direction: 'negative',
      impactType: 'military_threat',
    },
    {
      cityId: 'shanghai',
      severity: 'high',
      direction: 'negative',
      impactType: 'trade_disruption',
    },
  ],
  activatedRelationships: ['USA-CHN-trade', 'USA-JPN-military_alliance'],
  summary: 'Major geopolitical crisis.',
  summaryZh: '重大地缘政治危机。',
};

describe('llm-schema', () => {
  describe('parseSimulationResponse', () => {
    it('validates a complete valid JSON string', () => {
      const { result, warnings } = parseSimulationResponse(
        JSON.stringify(validResult),
      );
      expect(result).not.toBeNull();
      expect(result!.event).toBe(validResult.event);
      expect(result!.countryImpacts).toHaveLength(2);
      expect(result!.cityImpacts).toHaveLength(2);
      expect(warnings).toHaveLength(0);
    });

    it('extracts JSON from markdown code fences', () => {
      const wrapped = '```json\n' + JSON.stringify(validResult) + '\n```';
      const { result, warnings } = parseSimulationResponse(wrapped);
      expect(result).not.toBeNull();
      expect(result!.event).toBe(validResult.event);
      expect(warnings).toHaveLength(0);
    });

    it('extracts JSON from bare ``` fences (no language tag)', () => {
      const wrapped = '```\n' + JSON.stringify(validResult) + '\n```';
      const { result } = parseSimulationResponse(wrapped);
      expect(result).not.toBeNull();
    });

    it('drops unknown countryId with warning', () => {
      const data = {
        ...validResult,
        countryImpacts: [
          ...validResult.countryImpacts,
          {
            countryId: 'FAKE',
            severity: 'low',
            direction: 'negative',
            impactPercent: -5,
            reason: 'Unknown',
            reasonZh: '未知',
          },
        ],
      };
      const { result, warnings } = parseSimulationResponse(
        JSON.stringify(data),
      );
      expect(result).not.toBeNull();
      expect(result!.countryImpacts).toHaveLength(2); // FAKE dropped
      expect(warnings.some((w) => w.includes('FAKE'))).toBe(true);
    });

    it('drops unknown cityId with warning', () => {
      const data = {
        ...validResult,
        cityImpacts: [
          ...validResult.cityImpacts,
          {
            cityId: 'nonexistent-city',
            severity: 'low',
            direction: 'positive',
            impactType: 'opportunity',
          },
        ],
      };
      const { result, warnings } = parseSimulationResponse(
        JSON.stringify(data),
      );
      expect(result).not.toBeNull();
      expect(result!.cityImpacts).toHaveLength(2); // unknown dropped
      expect(warnings.some((w) => w.includes('nonexistent-city'))).toBe(true);
    });

    it('clamps impactPercent > 50 to 50', () => {
      const data = {
        ...validResult,
        countryImpacts: [
          {
            ...validResult.countryImpacts[0],
            impactPercent: 80,
          },
        ],
      };
      const { result, warnings } = parseSimulationResponse(
        JSON.stringify(data),
      );
      expect(result).not.toBeNull();
      expect(result!.countryImpacts[0].impactPercent).toBe(50);
      expect(warnings.some((w) => w.includes('clamp'))).toBe(true);
    });

    it('clamps impactPercent < -50 to -50', () => {
      const data = {
        ...validResult,
        countryImpacts: [
          {
            ...validResult.countryImpacts[0],
            impactPercent: -80,
          },
        ],
      };
      const { result, warnings } = parseSimulationResponse(
        JSON.stringify(data),
      );
      expect(result).not.toBeNull();
      expect(result!.countryImpacts[0].impactPercent).toBe(-50);
      expect(warnings.some((w) => w.includes('clamp'))).toBe(true);
    });

    it('returns null with warnings for missing required fields', () => {
      const { result, warnings } = parseSimulationResponse(
        JSON.stringify({ event: 'test' }),
      );
      expect(result).toBeNull();
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('returns null for completely invalid JSON', () => {
      const { result, warnings } = parseSimulationResponse(
        'not json at all',
      );
      expect(result).toBeNull();
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('returns null for empty string', () => {
      const { result, warnings } = parseSimulationResponse('');
      expect(result).toBeNull();
      expect(warnings.length).toBeGreaterThan(0);
    });

    it('handles unknown epicenter countryId gracefully', () => {
      const data = {
        ...validResult,
        epicenter: { countryId: 'FAKE', coordinates: [0, 0] },
      };
      const { warnings } = parseSimulationResponse(JSON.stringify(data));
      expect(warnings.some((w) => w.includes('epicenter'))).toBe(true);
    });

    it('filters invalid activatedRelationships entries', () => {
      const data = {
        ...validResult,
        activatedRelationships: [
          'USA-CHN-trade',
          123, // invalid — not a string
          null,
        ],
      };
      const { result } = parseSimulationResponse(JSON.stringify(data));
      expect(result).not.toBeNull();
      expect(result!.activatedRelationships).toEqual(['USA-CHN-trade']);
    });

    it('handles LLM returning extra fields without breaking', () => {
      const data = {
        ...validResult,
        confidence: 0.85,
        reasoning: 'Based on historical precedent...',
      };
      const { result } = parseSimulationResponse(JSON.stringify(data));
      expect(result).not.toBeNull();
      expect(result!.event).toBe(validResult.event);
    });

    it('coerces numeric string impactPercent', () => {
      const data = {
        ...validResult,
        countryImpacts: [
          {
            ...validResult.countryImpacts[0],
            impactPercent: '-30',
          },
        ],
      };
      const { result } = parseSimulationResponse(JSON.stringify(data));
      expect(result).not.toBeNull();
      expect(result!.countryImpacts[0].impactPercent).toBe(-30);
    });
  });
});
