/**
 * F011: Country fill layer for severity-based polygon visualization.
 * Converts TopoJSON → GeoJSON and creates a GeoJsonLayer with
 * severity-driven fill colors mapped via ISO 3166-1 numeric → alpha-3 codes.
 */

import { GeoJsonLayer } from '@deck.gl/layers';
import { feature } from 'topojson-client';
import type { Topology, GeometryCollection } from 'topojson-specification';
import type { Feature, FeatureCollection, Geometry } from 'geojson';
import type { CountryImpact, AnimationPhase } from './types';
import { SEVERITY_COLORS } from './colors';

/**
 * ISO 3166-1 numeric → alpha-3 mapping for the 48 FateMap countries.
 * Keys are the numeric codes used in Natural Earth TopoJSON `id` field.
 */
export const ISO_NUMERIC_TO_ALPHA3: Record<string, string> = {
  '840': 'USA', '124': 'CAN', '484': 'MEX',
  '076': 'BRA', '032': 'ARG', '152': 'CHL', '170': 'COL', '862': 'VEN',
  '826': 'GBR', '250': 'FRA', '276': 'DEU', '380': 'ITA', '724': 'ESP',
  '528': 'NLD', '616': 'POL', '804': 'UKR', '752': 'SWE', '578': 'NOR',
  '756': 'CHE', '792': 'TUR', '300': 'GRC',
  '156': 'CHN', '392': 'JPN', '410': 'KOR', '408': 'PRK', '158': 'TWN',
  '702': 'SGP', '704': 'VNM', '764': 'THA', '360': 'IDN', '608': 'PHL',
  '458': 'MYS',
  '356': 'IND', '586': 'PAK', '050': 'BGD',
  '643': 'RUS', '398': 'KAZ',
  '682': 'SAU', '364': 'IRN', '368': 'IRQ', '376': 'ISR', '784': 'ARE',
  '818': 'EGY',
  '566': 'NGA', '710': 'ZAF', '231': 'ETH',
  '036': 'AUS', '554': 'NZL',
};

/** Alpha opacity per severity level (0-255) */
const SEVERITY_ALPHA: Record<string, number> = {
  critical: 200,
  high: 165,
  medium: 125,
  low: 80,
};

/**
 * Convert world-atlas TopoJSON (countries-110m.json) to a GeoJSON FeatureCollection.
 * Each feature gets an `alpha3` property resolved from the numeric ID.
 */
export function convertTopoJson(
  topo: Topology<{ countries: GeometryCollection }>,
): FeatureCollection {
  const fc = feature(topo, topo.objects.countries) as FeatureCollection;
  for (const f of fc.features) {
    const numericId = String(f.id ?? '');
    f.properties = {
      ...f.properties,
      alpha3: ISO_NUMERIC_TO_ALPHA3[numericId] ?? null,
    };
  }
  return fc;
}

export interface CountryFillOptions {
  geojson: FeatureCollection;
  countryImpacts: CountryImpact[];
  animationPhase: AnimationPhase;
}

// --- Cache for expensive map rebuild (avoid rebuilding 60x/sec) ---
let _cachedCountryImpacts: CountryImpact[] | null = null;
let _cachedImpactMap: Map<string, CountryImpact> | null = null;

/**
 * Create a GeoJsonLayer rendering country polygons with severity-based fill colors.
 * - idle: all transparent
 * - ripple/network/persistent: affected countries colored by severity, unaffected transparent
 * - positive direction overrides severity color with green
 */
export function createCountryFillLayer({
  geojson,
  countryImpacts,
  animationPhase,
}: CountryFillOptions): GeoJsonLayer {
  // Cache impactMap — only rebuild when countryImpacts reference changes
  if (_cachedCountryImpacts !== countryImpacts) {
    _cachedCountryImpacts = countryImpacts;
    _cachedImpactMap = new Map(countryImpacts.map((ci) => [ci.countryId, ci]));
  }
  const impactMap = _cachedImpactMap!;
  const isActive = animationPhase !== 'idle';

  return new GeoJsonLayer({
    id: 'country-fill',
    data: geojson,
    filled: true,
    stroked: true,
    getLineColor: [255, 255, 255, 60],
    lineWidthMinPixels: 0.5,
    getFillColor: (f: Feature<Geometry>) => {
      if (!isActive) return [0, 0, 0, 0];

      const alpha3 = (f.properties as Record<string, unknown> | null)?.alpha3 as string | null;
      if (!alpha3) return [0, 0, 0, 0];

      const impact = impactMap.get(alpha3);
      if (!impact) return [0, 0, 0, 0];

      const baseColor =
        impact.direction === 'positive'
          ? SEVERITY_COLORS.positive
          : SEVERITY_COLORS[impact.severity];
      const alpha = SEVERITY_ALPHA[impact.severity] ?? 60;
      return [...baseColor, alpha] as [number, number, number, number];
    },
    pickable: true,
    updateTriggers: {
      getFillColor: [animationPhase, countryImpacts],
    },
  });
}
