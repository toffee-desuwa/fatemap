import {
  createCityMarkerLayers,
  getCityPulseRadius,
  getStaggerOpacity,
} from '../city-markers';
import { SEVERITY_COLORS } from '../colors';
import type { City, CityImpact, AnimationPhase } from '../types';

// Mock deck.gl ScatterplotLayer — store props for inspection
jest.mock('@deck.gl/layers', () => ({
  ScatterplotLayer: jest.fn().mockImplementation((props) => ({ props })),
}));

const mockCities: City[] = [
  { id: 'new-york', name: 'New York', nameCn: '纽约', coordinates: [-74.01, 40.71], countryId: 'USA', type: 'financial', importance: 5 },
  { id: 'shanghai', name: 'Shanghai', nameCn: '上海', coordinates: [121.47, 31.23], countryId: 'CHN', type: 'port', importance: 5 },
  { id: 'tokyo', name: 'Tokyo', nameCn: '东京', coordinates: [139.69, 35.69], countryId: 'JPN', type: 'financial', importance: 5 },
];

const mockCityImpacts: CityImpact[] = [
  { cityId: 'new-york', severity: 'critical', direction: 'negative', impactType: 'market_crash' },
  { cityId: 'shanghai', severity: 'high', direction: 'negative', impactType: 'trade_disruption' },
  { cityId: 'tokyo', severity: 'medium', direction: 'positive', impactType: 'opportunity' },
];

const baseOptions = {
  cities: mockCities,
  cityImpacts: mockCityImpacts,
  animationTime: 1.0,
  animationPhase: 'network' as AnimationPhase,
};

describe('createCityMarkerLayers', () => {
  it('returns exactly 2 layers', () => {
    const layers = createCityMarkerLayers(baseOptions);
    expect(layers).toHaveLength(2);
  });

  it('layers have correct IDs (halo + dot)', () => {
    const layers = createCityMarkerLayers(baseOptions);
    expect(layers[0].props.id).toBe('city-marker-halo');
    expect(layers[1].props.id).toBe('city-marker-dot');
  });

  it('only dot layer is pickable', () => {
    const layers = createCityMarkerLayers(baseOptions);
    expect(layers[0].props.pickable).toBe(false);
    expect(layers[1].props.pickable).toBe(true);
  });

  it('both layers use pixel radius units', () => {
    const layers = createCityMarkerLayers(baseOptions);
    expect(layers[0].props.radiusUnits).toBe('pixels');
    expect(layers[1].props.radiusUnits).toBe('pixels');
  });

  it('idle phase produces empty data', () => {
    const layers = createCityMarkerLayers({ ...baseOptions, animationPhase: 'idle' });
    expect(layers[0].props.data).toHaveLength(0);
    expect(layers[1].props.data).toHaveLength(0);
  });

  it('ripple phase produces empty data', () => {
    const layers = createCityMarkerLayers({ ...baseOptions, animationPhase: 'ripple' });
    expect(layers[0].props.data).toHaveLength(0);
    expect(layers[1].props.data).toHaveLength(0);
  });

  it('network phase produces data for all impacted cities', () => {
    const layers = createCityMarkerLayers(baseOptions);
    expect(layers[0].props.data).toHaveLength(3);
    expect(layers[1].props.data).toHaveLength(3);
  });

  it('persistent phase produces data for all impacted cities', () => {
    const layers = createCityMarkerLayers({ ...baseOptions, animationPhase: 'persistent' });
    expect(layers[0].props.data).toHaveLength(3);
  });

  it('skips cities not found in cities array', () => {
    const impacts: CityImpact[] = [
      { cityId: 'nonexistent', severity: 'low', direction: 'negative', impactType: 'other' },
      { cityId: 'new-york', severity: 'high', direction: 'negative', impactType: 'market_crash' },
    ];
    const layers = createCityMarkerLayers({ ...baseOptions, cityImpacts: impacts });
    expect(layers[0].props.data).toHaveLength(1);
    expect(layers[0].props.data[0].cityId).toBe('new-york');
  });

  it('empty cityImpacts returns empty data', () => {
    const layers = createCityMarkerLayers({ ...baseOptions, cityImpacts: [] });
    expect(layers[0].props.data).toHaveLength(0);
  });

  it('empty cities returns empty data', () => {
    const layers = createCityMarkerLayers({ ...baseOptions, cities: [] });
    expect(layers[0].props.data).toHaveLength(0);
  });

  it('halo color uses severity colors for negative direction', () => {
    const layers = createCityMarkerLayers({ ...baseOptions, animationTime: 5.0 });
    const getFillColor = layers[0].props.getFillColor;
    const criticalData = layers[0].props.data[0]; // critical + negative
    const color = getFillColor(criticalData);
    expect(color[0]).toBe(SEVERITY_COLORS.critical[0]);
    expect(color[1]).toBe(SEVERITY_COLORS.critical[1]);
    expect(color[2]).toBe(SEVERITY_COLORS.critical[2]);
  });

  it('halo color uses positive color for positive direction', () => {
    const layers = createCityMarkerLayers({ ...baseOptions, animationTime: 5.0 });
    const getFillColor = layers[0].props.getFillColor;
    const positiveData = layers[0].props.data[2]; // tokyo — positive
    const color = getFillColor(positiveData);
    expect(color[0]).toBe(SEVERITY_COLORS.positive[0]);
    expect(color[1]).toBe(SEVERITY_COLORS.positive[1]);
    expect(color[2]).toBe(SEVERITY_COLORS.positive[2]);
  });

  it('dot layer uses white color', () => {
    const layers = createCityMarkerLayers({ ...baseOptions, animationTime: 5.0 });
    const getFillColor = layers[1].props.getFillColor;
    const data = layers[1].props.data[0];
    const color = getFillColor(data);
    expect(color[0]).toBe(255);
    expect(color[1]).toBe(255);
    expect(color[2]).toBe(255);
  });

  it('dot layer has fixed radius', () => {
    const layers = createCityMarkerLayers(baseOptions);
    expect(layers[1].props.getRadius).toBe(3);
  });

  it('data includes correct coordinates from city lookup', () => {
    const layers = createCityMarkerLayers(baseOptions);
    const data = layers[0].props.data;
    expect(data[0].coordinates).toEqual([-74.01, 40.71]); // new-york
    expect(data[1].coordinates).toEqual([121.47, 31.23]); // shanghai
  });

  it('data includes stagger index for fade-in', () => {
    const layers = createCityMarkerLayers(baseOptions);
    const data = layers[0].props.data;
    expect(data[0].index).toBe(0);
    expect(data[1].index).toBe(1);
    expect(data[2].index).toBe(2);
  });

  it('has updateTriggers for animation', () => {
    const layers = createCityMarkerLayers(baseOptions);
    expect(layers[0].props.updateTriggers.getFillColor).toBeDefined();
    expect(layers[0].props.updateTriggers.getRadius).toBeDefined();
    expect(layers[1].props.updateTriggers.getFillColor).toBeDefined();
  });
});

describe('getCityPulseRadius', () => {
  it('returns value around base radius', () => {
    const r = getCityPulseRadius(0);
    expect(r).toBeGreaterThanOrEqual(5); // 7 - 2
    expect(r).toBeLessThanOrEqual(9);    // 7 + 2
  });

  it('varies with animation time', () => {
    const r0 = getCityPulseRadius(0);
    const r1 = getCityPulseRadius(1);
    expect(r0).not.toEqual(r1);
  });

  it('peaks at expected sine point', () => {
    // sin(t * 2) = 1 when t = π/4
    const rPeak = getCityPulseRadius(Math.PI / 4);
    expect(rPeak).toBeCloseTo(9, 1); // 7 + 2
  });

  it('troughs at expected sine point', () => {
    // sin(t * 2) = -1 when t = 3π/4
    const rTrough = getCityPulseRadius((3 * Math.PI) / 4);
    expect(rTrough).toBeCloseTo(5, 1); // 7 - 2
  });
});

describe('getStaggerOpacity', () => {
  it('returns 0 before fade start', () => {
    expect(getStaggerOpacity(2, 0)).toBe(0); // index 2 starts at 0.2s
  });

  it('returns 1 after fade end', () => {
    expect(getStaggerOpacity(0, 5.0)).toBe(1); // index 0 fades 0-0.3s
  });

  it('returns partial opacity during fade', () => {
    // index 0: fadeStart=0, fadeEnd=0.3
    const opacity = getStaggerOpacity(0, 0.15);
    expect(opacity).toBeCloseTo(0.5, 1);
  });

  it('later indices fade in later', () => {
    const t = 0.15; // 150ms
    const opacity0 = getStaggerOpacity(0, t); // starts at 0ms
    const opacity3 = getStaggerOpacity(3, t); // starts at 300ms
    expect(opacity0).toBeGreaterThan(0);
    expect(opacity3).toBe(0);
  });

  it('returns 0 at exactly fade start', () => {
    // index 1: fadeStart = 0.1s
    expect(getStaggerOpacity(1, 0.1)).toBe(0);
  });

  it('returns 1 at exactly fade end', () => {
    // index 0: fadeEnd = 0.3s
    expect(getStaggerOpacity(0, 0.3)).toBe(1);
  });
});
