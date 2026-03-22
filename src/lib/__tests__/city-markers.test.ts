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

/**
 * The ScatterplotLayer mock replaces real layers with { props: Record<string, any> }.
 * This interface describes the shape of the mocked props we inspect in tests.
 */
interface MockCityMarkerData {
  cityId: string;
  coordinates: [number, number];
  severity: string;
  direction: string;
  index: number;
}

interface MockScatterplotProps {
  id: string;
  data: MockCityMarkerData[];
  getFillColor: (d: MockCityMarkerData) => number[];
  getRadius: number | ((d: MockCityMarkerData) => number);
  radiusUnits: string;
  pickable: boolean;
  updateTriggers: Record<string, unknown>;
}

/** Extract typed mock props from layer created with mocked ScatterplotLayer constructor. */
function mockProps(layer: unknown): MockScatterplotProps {
  return (layer as { props: MockScatterplotProps }).props;
}

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
    expect(mockProps(layers[0]).id).toBe('city-marker-halo');
    expect(mockProps(layers[1]).id).toBe('city-marker-dot');
  });

  it('only dot layer is pickable', () => {
    const layers = createCityMarkerLayers(baseOptions);
    expect(mockProps(layers[0]).pickable).toBe(false);
    expect(mockProps(layers[1]).pickable).toBe(true);
  });

  it('both layers use pixel radius units', () => {
    const layers = createCityMarkerLayers(baseOptions);
    expect(mockProps(layers[0]).radiusUnits).toBe('pixels');
    expect(mockProps(layers[1]).radiusUnits).toBe('pixels');
  });

  it('idle phase produces empty data', () => {
    const layers = createCityMarkerLayers({ ...baseOptions, animationPhase: 'idle' });
    expect(mockProps(layers[0]).data).toHaveLength(0);
    expect(mockProps(layers[1]).data).toHaveLength(0);
  });

  it('ripple phase produces empty data', () => {
    const layers = createCityMarkerLayers({ ...baseOptions, animationPhase: 'ripple' });
    expect(mockProps(layers[0]).data).toHaveLength(0);
    expect(mockProps(layers[1]).data).toHaveLength(0);
  });

  it('network phase produces data for all impacted cities', () => {
    const layers = createCityMarkerLayers(baseOptions);
    expect(mockProps(layers[0]).data).toHaveLength(3);
    expect(mockProps(layers[1]).data).toHaveLength(3);
  });

  it('persistent phase produces data for all impacted cities', () => {
    const layers = createCityMarkerLayers({ ...baseOptions, animationPhase: 'persistent' });
    expect(mockProps(layers[0]).data).toHaveLength(3);
  });

  it('skips cities not found in cities array', () => {
    const impacts: CityImpact[] = [
      { cityId: 'nonexistent', severity: 'low', direction: 'negative', impactType: 'other' },
      { cityId: 'new-york', severity: 'high', direction: 'negative', impactType: 'market_crash' },
    ];
    const layers = createCityMarkerLayers({ ...baseOptions, cityImpacts: impacts });
    const p = mockProps(layers[0]);
    expect(p.data).toHaveLength(1);
    expect(p.data[0].cityId).toBe('new-york');
  });

  it('empty cityImpacts returns empty data', () => {
    const layers = createCityMarkerLayers({ ...baseOptions, cityImpacts: [] });
    expect(mockProps(layers[0]).data).toHaveLength(0);
  });

  it('empty cities returns empty data', () => {
    const layers = createCityMarkerLayers({ ...baseOptions, cities: [] });
    expect(mockProps(layers[0]).data).toHaveLength(0);
  });

  it('halo color uses severity colors for negative direction', () => {
    const layers = createCityMarkerLayers({ ...baseOptions, animationTime: 5.0 });
    const p = mockProps(layers[0]);
    const criticalData = p.data[0]; // critical + negative
    const color = p.getFillColor(criticalData);
    expect(color[0]).toBe(SEVERITY_COLORS.critical[0]);
    expect(color[1]).toBe(SEVERITY_COLORS.critical[1]);
    expect(color[2]).toBe(SEVERITY_COLORS.critical[2]);
  });

  it('halo color uses positive color for positive direction', () => {
    const layers = createCityMarkerLayers({ ...baseOptions, animationTime: 5.0 });
    const p = mockProps(layers[0]);
    const positiveData = p.data[2]; // tokyo — positive
    const color = p.getFillColor(positiveData);
    expect(color[0]).toBe(SEVERITY_COLORS.positive[0]);
    expect(color[1]).toBe(SEVERITY_COLORS.positive[1]);
    expect(color[2]).toBe(SEVERITY_COLORS.positive[2]);
  });

  it('dot layer uses white color', () => {
    const layers = createCityMarkerLayers({ ...baseOptions, animationTime: 5.0 });
    const p = mockProps(layers[1]);
    const data = p.data[0];
    const color = p.getFillColor(data);
    expect(color[0]).toBe(255);
    expect(color[1]).toBe(255);
    expect(color[2]).toBe(255);
  });

  it('dot layer has fixed radius', () => {
    const layers = createCityMarkerLayers(baseOptions);
    expect(mockProps(layers[1]).getRadius).toBe(4);
  });

  it('data includes correct coordinates from city lookup', () => {
    const layers = createCityMarkerLayers(baseOptions);
    const data = mockProps(layers[0]).data;
    expect(data[0].coordinates).toEqual([-74.01, 40.71]); // new-york
    expect(data[1].coordinates).toEqual([121.47, 31.23]); // shanghai
  });

  it('data includes stagger index for fade-in', () => {
    const layers = createCityMarkerLayers(baseOptions);
    const data = mockProps(layers[0]).data;
    expect(data[0].index).toBe(0);
    expect(data[1].index).toBe(1);
    expect(data[2].index).toBe(2);
  });

  it('has updateTriggers for animation', () => {
    const layers = createCityMarkerLayers(baseOptions);
    expect(mockProps(layers[0]).updateTriggers.getFillColor).toBeDefined();
    expect(mockProps(layers[0]).updateTriggers.getRadius).toBeDefined();
    expect(mockProps(layers[1]).updateTriggers.getFillColor).toBeDefined();
  });
});

describe('getCityPulseRadius', () => {
  it('returns value around base radius', () => {
    const r = getCityPulseRadius(0);
    expect(r).toBeGreaterThanOrEqual(7);  // 10 - 3
    expect(r).toBeLessThanOrEqual(13);    // 10 + 3
  });

  it('varies with animation time', () => {
    const r0 = getCityPulseRadius(0);
    const r1 = getCityPulseRadius(1);
    expect(r0).not.toEqual(r1);
  });

  it('peaks at expected sine point', () => {
    // sin(t * 2) = 1 when t = π/4
    const rPeak = getCityPulseRadius(Math.PI / 4);
    expect(rPeak).toBeCloseTo(13, 1); // 10 + 3
  });

  it('troughs at expected sine point', () => {
    // sin(t * 2) = -1 when t = 3π/4
    const rTrough = getCityPulseRadius((3 * Math.PI) / 4);
    expect(rTrough).toBeCloseTo(7, 1); // 10 - 3
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
