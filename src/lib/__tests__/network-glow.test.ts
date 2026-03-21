import {
  createNetworkGlowLayers,
  NETWORK_GLOW_CONFIGS,
  getNetworkPulseMultiplier,
} from '../network-glow';
import { SEVERITY_COLORS } from '../colors';
import type { Relationship, Country, CountryImpact, AnimationPhase } from '../types';

// Mock deck.gl PathLayer — store props for inspection
jest.mock('@deck.gl/layers', () => ({
  PathLayer: jest.fn().mockImplementation((props) => ({ props })),
}));

const mockCountries: Country[] = [
  { id: 'USA', name: 'United States', nameCn: '美国', center: [-98.58, 39.83], capital: [-77.04, 38.9], region: 'North America' },
  { id: 'CHN', name: 'China', nameCn: '中国', center: [104.2, 35.86], capital: [116.41, 39.9], region: 'East Asia' },
  { id: 'JPN', name: 'Japan', nameCn: '日本', center: [138.25, 36.2], capital: [139.69, 35.69], region: 'East Asia' },
];

const mockRelationships: Relationship[] = [
  { id: 'USA-CHN-trade', from: 'USA', to: 'CHN', type: 'trade', strength: 5 },
  { id: 'USA-JPN-trade', from: 'USA', to: 'JPN', type: 'trade', strength: 4 },
  { id: 'CHN-JPN-trade', from: 'CHN', to: 'JPN', type: 'trade', strength: 3 },
];

const mockImpacts: CountryImpact[] = [
  { countryId: 'USA', severity: 'critical', direction: 'negative', impactPercent: -30, reason: 'Trade war', reasonZh: '贸易战' },
  { countryId: 'CHN', severity: 'high', direction: 'negative', impactPercent: -25, reason: 'Export loss', reasonZh: '出口损失' },
  { countryId: 'JPN', severity: 'medium', direction: 'mixed', impactPercent: -10, reason: 'Collateral', reasonZh: '附带影响' },
];

const baseOptions = {
  relationships: mockRelationships,
  countries: mockCountries,
  countryImpacts: mockImpacts,
  activatedIds: ['USA-CHN-trade', 'CHN-JPN-trade'],
  animationPhase: 'network' as AnimationPhase,
};

describe('createNetworkGlowLayers', () => {
  it('returns exactly 3 layers', () => {
    const layers = createNetworkGlowLayers(baseOptions);
    expect(layers).toHaveLength(3);
  });

  it('layers have correct IDs (outer, mid, core)', () => {
    const layers = createNetworkGlowLayers(baseOptions);
    expect(layers[0].props.id).toBe('network-glow-outer');
    expect(layers[1].props.id).toBe('network-glow-mid');
    expect(layers[2].props.id).toBe('network-glow-core');
  });

  it('only core layer is pickable', () => {
    const layers = createNetworkGlowLayers(baseOptions);
    expect(layers[0].props.pickable).toBe(false);
    expect(layers[1].props.pickable).toBe(false);
    expect(layers[2].props.pickable).toBe(true);
  });

  it('all layers use pixel width units', () => {
    const layers = createNetworkGlowLayers(baseOptions);
    for (const layer of layers) {
      expect(layer.props.widthUnits).toBe('pixels');
    }
  });

  it('idle phase uses idle config for all lines', () => {
    const layers = createNetworkGlowLayers({
      ...baseOptions,
      animationPhase: 'idle',
    });
    // All segments get idle config — check core opacity
    const data = layers[2].props.data;
    for (const segment of data) {
      const color = layers[2].props.getColor(segment);
      expect(color[3]).toBe(Math.round(NETWORK_GLOW_CONFIGS.idle.core.opacity * 255));
    }
  });

  it('ripple phase uses idle config (lines stay dim during shockwave)', () => {
    const layers = createNetworkGlowLayers({
      ...baseOptions,
      animationPhase: 'ripple',
    });
    const data = layers[2].props.data;
    for (const segment of data) {
      const color = layers[2].props.getColor(segment);
      expect(color[3]).toBe(Math.round(NETWORK_GLOW_CONFIGS.idle.core.opacity * 255));
    }
  });

  it('network phase uses activated config for activated relationships', () => {
    const layers = createNetworkGlowLayers(baseOptions);
    const data = layers[2].props.data;
    const activated = data.find((d: { id: string }) => d.id === 'USA-CHN-trade');
    const color = layers[2].props.getColor(activated);
    expect(color[3]).toBe(Math.round(NETWORK_GLOW_CONFIGS.activated.core.opacity * 255));
  });

  it('network phase uses dimmed config for non-activated relationships', () => {
    const layers = createNetworkGlowLayers(baseOptions);
    const data = layers[2].props.data;
    const dimmed = data.find((d: { id: string }) => d.id === 'USA-JPN-trade');
    const color = layers[2].props.getColor(dimmed);
    expect(color[3]).toBe(Math.round(NETWORK_GLOW_CONFIGS.dimmed.core.opacity * 255));
  });

  it('persistent phase maintains activated glow', () => {
    const layers = createNetworkGlowLayers({
      ...baseOptions,
      animationPhase: 'persistent',
    });
    const data = layers[2].props.data;
    const activated = data.find((d: { id: string }) => d.id === 'USA-CHN-trade');
    const color = layers[2].props.getColor(activated);
    expect(color[3]).toBe(Math.round(NETWORK_GLOW_CONFIGS.activated.core.opacity * 255));
  });
});

describe('color mapping', () => {
  it('activated relationship uses severity color (critical = red)', () => {
    const layers = createNetworkGlowLayers(baseOptions);
    const data = layers[2].props.data;
    // USA-CHN: USA=critical, CHN=high → picks critical
    const segment = data.find((d: { id: string }) => d.id === 'USA-CHN-trade');
    const color = layers[2].props.getColor(segment);
    expect(color[0]).toBe(SEVERITY_COLORS.critical[0]); // 255
    expect(color[1]).toBe(SEVERITY_COLORS.critical[1]); // 51
    expect(color[2]).toBe(SEVERITY_COLORS.critical[2]); // 68
  });

  it('picks higher severity between from/to countries', () => {
    const layers = createNetworkGlowLayers(baseOptions);
    const data = layers[2].props.data;
    // CHN-JPN: CHN=high, JPN=medium → picks high
    const segment = data.find((d: { id: string }) => d.id === 'CHN-JPN-trade');
    const color = layers[2].props.getColor(segment);
    expect(color[0]).toBe(SEVERITY_COLORS.high[0]); // 255
    expect(color[1]).toBe(SEVERITY_COLORS.high[1]); // 136
    expect(color[2]).toBe(SEVERITY_COLORS.high[2]); // 68
  });

  it('non-activated relationships use unaffected color', () => {
    const layers = createNetworkGlowLayers(baseOptions);
    const data = layers[2].props.data;
    const dimmed = data.find((d: { id: string }) => d.id === 'USA-JPN-trade');
    const color = layers[2].props.getColor(dimmed);
    expect(color[0]).toBe(SEVERITY_COLORS.unaffected[0]); // 51
    expect(color[1]).toBe(SEVERITY_COLORS.unaffected[1]); // 68
    expect(color[2]).toBe(SEVERITY_COLORS.unaffected[2]); // 85
  });

  it('idle phase uses unaffected color for all lines', () => {
    const layers = createNetworkGlowLayers({
      ...baseOptions,
      animationPhase: 'idle',
    });
    const data = layers[2].props.data;
    for (const segment of data) {
      const color = layers[2].props.getColor(segment);
      expect(color[0]).toBe(SEVERITY_COLORS.unaffected[0]);
    }
  });
});

describe('width calculation', () => {
  it('width scales with relationship strength', () => {
    const layers = createNetworkGlowLayers(baseOptions);
    const data = layers[2].props.data;
    const strength5 = data.find((d: { id: string }) => d.id === 'USA-CHN-trade'); // strength 5
    const strength3 = data.find((d: { id: string }) => d.id === 'CHN-JPN-trade'); // strength 3
    const w5 = layers[2].props.getWidth(strength5);
    const w3 = layers[2].props.getWidth(strength3);
    expect(w5).toBeGreaterThan(w3);
  });

  it('outer layer is wider than mid, mid wider than core', () => {
    const layers = createNetworkGlowLayers(baseOptions);
    const data = layers[2].props.data;
    const segment = data[0];
    const outerW = layers[0].props.getWidth(segment);
    const midW = layers[1].props.getWidth(segment);
    const coreW = layers[2].props.getWidth(segment);
    expect(outerW).toBeGreaterThan(midW);
    expect(midW).toBeGreaterThan(coreW);
  });
});

describe('getNetworkPulseMultiplier', () => {
  it('oscillates between 0.7 and 1.0', () => {
    for (let t = 0; t < 60; t += 0.1) {
      const m = getNetworkPulseMultiplier(t);
      expect(m).toBeGreaterThanOrEqual(0.7 - 0.001);
      expect(m).toBeLessThanOrEqual(1.0 + 0.001);
    }
  });

  it('returns 0.85 at time 0', () => {
    expect(getNetworkPulseMultiplier(0)).toBeCloseTo(0.85, 5);
  });

  it('reaches peak of 1.0', () => {
    const peakTime = Math.PI / 6;
    expect(getNetworkPulseMultiplier(peakTime)).toBeCloseTo(1.0, 5);
  });

  it('reaches trough of 0.7', () => {
    const troughTime = Math.PI / 2;
    expect(getNetworkPulseMultiplier(troughTime)).toBeCloseTo(0.7, 5);
  });
});

describe('pulse effect', () => {
  it('applies pulse to critical severity activated lines', () => {
    const troughTime = Math.PI / 2; // multiplier = 0.7
    const layers = createNetworkGlowLayers({
      ...baseOptions,
      pulseTime: troughTime,
    });
    const data = layers[2].props.data;
    // USA-CHN is critical+activated → pulse applies
    const critical = data.find((d: { id: string }) => d.id === 'USA-CHN-trade');
    const color = layers[2].props.getColor(critical);
    const expectedOpacity = Math.round(NETWORK_GLOW_CONFIGS.activated.core.opacity * 0.7 * 255);
    expect(color[3]).toBe(expectedOpacity);
  });

  it('does not apply pulse to non-critical activated lines', () => {
    const troughTime = Math.PI / 2;
    const layers = createNetworkGlowLayers({
      ...baseOptions,
      pulseTime: troughTime,
    });
    const data = layers[2].props.data;
    // CHN-JPN is high severity (not critical) → no pulse
    const high = data.find((d: { id: string }) => d.id === 'CHN-JPN-trade');
    const color = layers[2].props.getColor(high);
    const expectedOpacity = Math.round(NETWORK_GLOW_CONFIGS.activated.core.opacity * 255);
    expect(color[3]).toBe(expectedOpacity);
  });

  it('does not apply pulse to dimmed lines', () => {
    const troughTime = Math.PI / 2;
    const layers = createNetworkGlowLayers({
      ...baseOptions,
      pulseTime: troughTime,
    });
    const data = layers[2].props.data;
    const dimmed = data.find((d: { id: string }) => d.id === 'USA-JPN-trade');
    const color = layers[2].props.getColor(dimmed);
    const expectedOpacity = Math.round(NETWORK_GLOW_CONFIGS.dimmed.core.opacity * 255);
    expect(color[3]).toBe(expectedOpacity);
  });
});

describe('NETWORK_GLOW_CONFIGS', () => {
  it('has all 3 states defined', () => {
    expect(Object.keys(NETWORK_GLOW_CONFIGS)).toEqual(['idle', 'activated', 'dimmed']);
  });

  it('outer is widest in each state', () => {
    for (const state of Object.keys(NETWORK_GLOW_CONFIGS) as Array<keyof typeof NETWORK_GLOW_CONFIGS>) {
      const config = NETWORK_GLOW_CONFIGS[state];
      expect(config.outer.width).toBeGreaterThan(config.mid.width);
      expect(config.mid.width).toBeGreaterThan(config.core.width);
    }
  });

  it('core has highest opacity in each state', () => {
    for (const state of Object.keys(NETWORK_GLOW_CONFIGS) as Array<keyof typeof NETWORK_GLOW_CONFIGS>) {
      const config = NETWORK_GLOW_CONFIGS[state];
      expect(config.core.opacity).toBeGreaterThan(config.mid.opacity);
      expect(config.mid.opacity).toBeGreaterThan(config.outer.opacity);
    }
  });
});

describe('edge cases', () => {
  it('handles empty relationships', () => {
    const layers = createNetworkGlowLayers({
      ...baseOptions,
      relationships: [],
    });
    expect(layers).toHaveLength(3);
    expect(layers[0].props.data).toHaveLength(0);
  });

  it('handles empty activatedIds', () => {
    const layers = createNetworkGlowLayers({
      ...baseOptions,
      activatedIds: [],
      animationPhase: 'network',
    });
    const data = layers[2].props.data;
    // All should be dimmed
    for (const segment of data) {
      const color = layers[2].props.getColor(segment);
      expect(color[3]).toBe(Math.round(NETWORK_GLOW_CONFIGS.dimmed.core.opacity * 255));
    }
  });

  it('skips relationships with unknown country IDs', () => {
    const layers = createNetworkGlowLayers({
      ...baseOptions,
      relationships: [
        ...mockRelationships,
        { id: 'XXX-YYY-trade', from: 'XXX', to: 'YYY', type: 'trade', strength: 3 },
      ],
    });
    // Only 3 valid segments (XXX-YYY skipped)
    expect(layers[0].props.data).toHaveLength(3);
  });

  it('includes updateTriggers for animationPhase and pulseTime', () => {
    const layers = createNetworkGlowLayers({
      ...baseOptions,
      pulseTime: 5,
    });
    expect(layers[0].props.updateTriggers.getColor).toContain('network');
    expect(layers[0].props.updateTriggers.getColor).toContain(5);
  });
});
