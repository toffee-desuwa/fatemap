import {
  createCountryFillLayer,
  convertTopoJson,
  ISO_NUMERIC_TO_ALPHA3,
} from '../country-regions';
import { SEVERITY_COLORS } from '../colors';
import type { CountryImpact, AnimationPhase } from '../types';
import type { FeatureCollection, Feature, Polygon } from 'geojson';
import type { Topology, GeometryCollection } from 'topojson-specification';

// Mock deck.gl GeoJsonLayer — store props for inspection
jest.mock('@deck.gl/layers', () => ({
  GeoJsonLayer: jest.fn().mockImplementation((props) => ({ props })),
}));

// ── Helpers ──────────────────────────────────────────────────────

function makeFeature(alpha3: string | null): Feature<Polygon> {
  return {
    type: 'Feature',
    properties: { alpha3, name: `Country-${alpha3}` },
    geometry: {
      type: 'Polygon',
      coordinates: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
    },
  };
}

function makeGeoJson(alpha3s: (string | null)[]): FeatureCollection {
  return {
    type: 'FeatureCollection',
    features: alpha3s.map(makeFeature),
  };
}

const mockImpacts: CountryImpact[] = [
  { countryId: 'USA', severity: 'critical', direction: 'negative', impactPercent: -30, reason: 'Trade war', reasonZh: '贸易战' },
  { countryId: 'CHN', severity: 'high', direction: 'negative', impactPercent: -25, reason: 'Export loss', reasonZh: '出口损失' },
  { countryId: 'JPN', severity: 'medium', direction: 'mixed', impactPercent: -10, reason: 'Collateral', reasonZh: '附带影响' },
  { countryId: 'AUS', severity: 'low', direction: 'positive', impactPercent: 5, reason: 'Benefit', reasonZh: '受益' },
];

const geojson = makeGeoJson(['USA', 'CHN', 'JPN', 'AUS', 'BRA', null]);

const baseOptions = {
  geojson,
  countryImpacts: mockImpacts,
  animationPhase: 'network' as AnimationPhase,
};

// ── ISO mapping ──────────────────────────────────────────────────

describe('ISO_NUMERIC_TO_ALPHA3', () => {
  it('maps all 48 countries', () => {
    const values = Object.values(ISO_NUMERIC_TO_ALPHA3);
    expect(values).toHaveLength(48);
    expect(new Set(values).size).toBe(48);
  });

  it('maps known numeric codes correctly', () => {
    expect(ISO_NUMERIC_TO_ALPHA3['840']).toBe('USA');
    expect(ISO_NUMERIC_TO_ALPHA3['156']).toBe('CHN');
    expect(ISO_NUMERIC_TO_ALPHA3['392']).toBe('JPN');
    expect(ISO_NUMERIC_TO_ALPHA3['826']).toBe('GBR');
    expect(ISO_NUMERIC_TO_ALPHA3['158']).toBe('TWN');
  });
});

// ── convertTopoJson ─────────────────────────────────────────────

describe('convertTopoJson', () => {
  function makeTopo(features: { id: string; name: string }[]): Topology<{ countries: GeometryCollection }> {
    return {
      type: 'Topology',
      objects: {
        countries: {
          type: 'GeometryCollection',
          geometries: features.map((f) => ({
            type: 'Polygon' as const,
            id: f.id,
            arcs: [[0]],
            properties: { name: f.name },
          })),
        },
      },
      arcs: [[[0, 0], [1, 0], [1, 1], [0, 1], [0, 0]]],
    };
  }

  it('converts TopoJSON to GeoJSON FeatureCollection', () => {
    const topo = makeTopo([{ id: '840', name: 'United States of America' }]);
    const fc = convertTopoJson(topo);
    expect(fc.type).toBe('FeatureCollection');
    expect(fc.features.length).toBeGreaterThanOrEqual(1);
  });

  it('adds alpha3 property from numeric ID', () => {
    const topo = makeTopo([
      { id: '840', name: 'United States of America' },
      { id: '156', name: 'China' },
    ]);
    const fc = convertTopoJson(topo);
    const usa = fc.features.find((f) => f.properties?.alpha3 === 'USA');
    const chn = fc.features.find((f) => f.properties?.alpha3 === 'CHN');
    expect(usa).toBeDefined();
    expect(chn).toBeDefined();
  });

  it('sets alpha3 to null for unknown numeric IDs', () => {
    const topo = makeTopo([{ id: '999', name: 'Unknown' }]);
    const fc = convertTopoJson(topo);
    expect(fc.features[0].properties?.alpha3).toBeNull();
  });

  it('preserves original properties', () => {
    const topo = makeTopo([{ id: '840', name: 'United States of America' }]);
    const fc = convertTopoJson(topo);
    expect(fc.features[0].properties?.name).toBe('United States of America');
  });
});

// ── createCountryFillLayer ──────────────────────────────────────

describe('createCountryFillLayer', () => {
  it('returns a layer with id "country-fill"', () => {
    const layer = createCountryFillLayer(baseOptions);
    expect(layer.props.id).toBe('country-fill');
  });

  it('layer is filled and stroked', () => {
    const layer = createCountryFillLayer(baseOptions);
    expect(layer.props.filled).toBe(true);
    expect(layer.props.stroked).toBe(true);
  });

  it('layer is pickable', () => {
    const layer = createCountryFillLayer(baseOptions);
    expect(layer.props.pickable).toBe(true);
  });

  it('passes geojson as data', () => {
    const layer = createCountryFillLayer(baseOptions);
    expect(layer.props.data).toBe(geojson);
  });

  // ── Phase behavior ──

  it('idle phase: all countries transparent', () => {
    const layer = createCountryFillLayer({ ...baseOptions, animationPhase: 'idle' });
    const getFillColor = layer.props.getFillColor as (f: Feature) => number[];

    for (const f of geojson.features) {
      expect(getFillColor(f)).toEqual([0, 0, 0, 0]);
    }
  });

  it('ripple phase: affected countries have fill', () => {
    const layer = createCountryFillLayer({ ...baseOptions, animationPhase: 'ripple' });
    const getFillColor = layer.props.getFillColor as (f: Feature) => number[];

    const usaColor = getFillColor(geojson.features[0]); // USA — critical
    expect(usaColor[3]).toBeGreaterThan(0);
  });

  it('network phase: affected countries have fill', () => {
    const layer = createCountryFillLayer(baseOptions);
    const getFillColor = layer.props.getFillColor as (f: Feature) => number[];

    const usaColor = getFillColor(geojson.features[0]);
    expect(usaColor[3]).toBeGreaterThan(0);
  });

  it('persistent phase: affected countries have fill', () => {
    const layer = createCountryFillLayer({ ...baseOptions, animationPhase: 'persistent' });
    const getFillColor = layer.props.getFillColor as (f: Feature) => number[];

    const usaColor = getFillColor(geojson.features[0]);
    expect(usaColor[3]).toBeGreaterThan(0);
  });

  // ── Severity colors ──

  it('critical severity uses critical color', () => {
    const layer = createCountryFillLayer(baseOptions);
    const getFillColor = layer.props.getFillColor as (f: Feature) => number[];

    const color = getFillColor(geojson.features[0]); // USA — critical negative
    expect(color.slice(0, 3)).toEqual([...SEVERITY_COLORS.critical]);
    expect(color[3]).toBe(180);
  });

  it('high severity uses high color', () => {
    const layer = createCountryFillLayer(baseOptions);
    const getFillColor = layer.props.getFillColor as (f: Feature) => number[];

    const color = getFillColor(geojson.features[1]); // CHN — high negative
    expect(color.slice(0, 3)).toEqual([...SEVERITY_COLORS.high]);
    expect(color[3]).toBe(140);
  });

  it('medium severity uses medium color', () => {
    const layer = createCountryFillLayer(baseOptions);
    const getFillColor = layer.props.getFillColor as (f: Feature) => number[];

    const color = getFillColor(geojson.features[2]); // JPN — medium mixed
    expect(color.slice(0, 3)).toEqual([...SEVERITY_COLORS.medium]);
    expect(color[3]).toBe(100);
  });

  it('low severity uses low color with alpha 60', () => {
    const layer = createCountryFillLayer(baseOptions);
    const getFillColor = layer.props.getFillColor as (f: Feature) => number[];

    // AUS — low positive, so color should be positive green, alpha 60
    const color = getFillColor(geojson.features[3]);
    expect(color[3]).toBe(60);
  });

  it('positive direction uses positive (green) color', () => {
    const layer = createCountryFillLayer(baseOptions);
    const getFillColor = layer.props.getFillColor as (f: Feature) => number[];

    const color = getFillColor(geojson.features[3]); // AUS — low positive
    expect(color.slice(0, 3)).toEqual([...SEVERITY_COLORS.positive]);
  });

  it('negative direction uses severity color', () => {
    const layer = createCountryFillLayer(baseOptions);
    const getFillColor = layer.props.getFillColor as (f: Feature) => number[];

    const color = getFillColor(geojson.features[0]); // USA — critical negative
    expect(color.slice(0, 3)).toEqual([...SEVERITY_COLORS.critical]);
  });

  it('mixed direction uses severity color (not positive)', () => {
    const layer = createCountryFillLayer(baseOptions);
    const getFillColor = layer.props.getFillColor as (f: Feature) => number[];

    const color = getFillColor(geojson.features[2]); // JPN — medium mixed
    expect(color.slice(0, 3)).toEqual([...SEVERITY_COLORS.medium]);
  });

  // ── Unaffected / missing ──

  it('unaffected country returns transparent', () => {
    const layer = createCountryFillLayer(baseOptions);
    const getFillColor = layer.props.getFillColor as (f: Feature) => number[];

    const color = getFillColor(geojson.features[4]); // BRA — no impact
    expect(color).toEqual([0, 0, 0, 0]);
  });

  it('feature with null alpha3 returns transparent', () => {
    const layer = createCountryFillLayer(baseOptions);
    const getFillColor = layer.props.getFillColor as (f: Feature) => number[];

    const color = getFillColor(geojson.features[5]); // null alpha3
    expect(color).toEqual([0, 0, 0, 0]);
  });

  // ── Edge cases ──

  it('empty countryImpacts: all countries transparent', () => {
    const layer = createCountryFillLayer({ ...baseOptions, countryImpacts: [] });
    const getFillColor = layer.props.getFillColor as (f: Feature) => number[];

    for (const f of geojson.features) {
      expect(getFillColor(f)).toEqual([0, 0, 0, 0]);
    }
  });

  it('empty geojson: layer still created', () => {
    const emptyGeo = makeGeoJson([]);
    const layer = createCountryFillLayer({ ...baseOptions, geojson: emptyGeo });
    expect(layer.props.id).toBe('country-fill');
    expect((layer.props.data as FeatureCollection).features).toHaveLength(0);
  });

  it('has updateTriggers for getFillColor', () => {
    const layer = createCountryFillLayer(baseOptions);
    expect(layer.props.updateTriggers).toBeDefined();
    expect(layer.props.updateTriggers.getFillColor).toBeDefined();
  });

  it('higher severity has higher alpha', () => {
    const layer = createCountryFillLayer(baseOptions);
    const getFillColor = layer.props.getFillColor as (f: Feature) => number[];

    const critAlpha = getFillColor(geojson.features[0])[3]; // critical → 180
    const highAlpha = getFillColor(geojson.features[1])[3]; // high → 140
    const medAlpha = getFillColor(geojson.features[2])[3];  // medium → 100
    const lowAlpha = getFillColor(geojson.features[3])[3];  // low → 60

    expect(critAlpha).toBeGreaterThan(highAlpha);
    expect(highAlpha).toBeGreaterThan(medAlpha);
    expect(medAlpha).toBeGreaterThan(lowAlpha);
  });

  it('border color is semi-transparent white', () => {
    const layer = createCountryFillLayer(baseOptions);
    expect(layer.props.getLineColor).toEqual([255, 255, 255, 40]);
  });
});
