/**
 * F012: City impact markers — pulsing ScatterplotLayer markers for affected cities.
 * Two-layer approach: outer halo (pulsing, severity-colored) + inner dot (white, fixed).
 * Adapted from FreightSeer's pulsing-ports.ts.
 */

import { ScatterplotLayer } from '@deck.gl/layers';
import type { City, CityImpact, AnimationPhase } from './types';
import { SEVERITY_COLORS } from './colors';

/** Stagger delay per city (ms) for fade-in during network phase */
const STAGGER_DELAY_MS = 100;

/** Base halo radius in pixels */
const HALO_RADIUS = 10;
/** Pulse amplitude in pixels (radius oscillates ± this value) */
const PULSE_AMPLITUDE = 3;
/** Inner dot radius in pixels */
const DOT_RADIUS = 4;
/** Halo base opacity (0-255) */
const HALO_OPACITY = 70; // ~0.27

interface CityMarkerData {
  coordinates: [number, number];
  cityId: string;
  severity: CityImpact['severity'];
  direction: CityImpact['direction'];
  /** Index for staggered fade-in */
  index: number;
}

/** Calculate pulsing halo radius. Oscillates around HALO_RADIUS. */
export function getCityPulseRadius(animationTime: number): number {
  return HALO_RADIUS + Math.sin(animationTime * 2) * PULSE_AMPLITUDE;
}

/** Calculate fade-in opacity (0-1) based on stagger index and animation time (seconds). */
export function getStaggerOpacity(index: number, animationTimeSec: number): number {
  const fadeStart = (index * STAGGER_DELAY_MS) / 1000;
  const fadeEnd = fadeStart + 0.3; // 300ms fade duration
  if (animationTimeSec <= fadeStart) return 0;
  if (animationTimeSec >= fadeEnd) return 1;
  return (animationTimeSec - fadeStart) / (fadeEnd - fadeStart);
}

function getSeverityColor(
  severity: CityImpact['severity'],
  direction: CityImpact['direction'],
): [number, number, number] {
  if (direction === 'positive') return SEVERITY_COLORS.positive;
  return SEVERITY_COLORS[severity];
}

export interface CityMarkerOptions {
  cities: City[];
  cityImpacts: CityImpact[];
  animationTime: number;
  animationPhase: AnimationPhase;
}

// --- Cache for expensive map rebuild (avoid rebuilding 60x/sec) ---
let _cachedCities: City[] | null = null;
let _cachedCityMap: Map<string, City> | null = null;
let _cachedCityImpacts: CityImpact[] | null = null;
let _cachedCityData: CityMarkerData[] | null = null;

/**
 * Create 2 ScatterplotLayers for city impact markers:
 * 1. Outer halo: pulsing radius, severity-colored, low opacity
 * 2. Inner dot: fixed 3px, white, full opacity
 *
 * Only renders impacted cities during network/persistent phase.
 */
export function createCityMarkerLayers({
  cities,
  cityImpacts,
  animationTime,
  animationPhase,
}: CityMarkerOptions): ScatterplotLayer<CityMarkerData>[] {
  const isVisible = animationPhase === 'network' || animationPhase === 'persistent';

  // Cache cityMap — cities array is a static module-level constant
  if (_cachedCities !== cities) {
    _cachedCities = cities;
    _cachedCityMap = new Map(cities.map((c) => [c.id, c]));
    _cachedCityData = null; // invalidate data cache when cities change
  }
  const cityMap = _cachedCityMap!;

  // Cache data array — only rebuild when cityImpacts reference changes
  if (_cachedCityImpacts !== cityImpacts || _cachedCityData === null) {
    _cachedCityImpacts = cityImpacts;
    _cachedCityData = cityImpacts
      .map((impact, index) => {
        const city = cityMap.get(impact.cityId);
        if (!city) return null;
        return {
          coordinates: city.coordinates,
          cityId: impact.cityId,
          severity: impact.severity,
          direction: impact.direction,
          index,
        };
      })
      .filter((d): d is CityMarkerData => d !== null);
  }

  const data: CityMarkerData[] = isVisible ? _cachedCityData : [];

  const haloLayer = new ScatterplotLayer<CityMarkerData>({
    id: 'city-marker-halo',
    data,
    getPosition: (d) => d.coordinates,
    getFillColor: (d) => {
      const color = getSeverityColor(d.severity, d.direction);
      const stagger = getStaggerOpacity(d.index, animationTime);
      return [...color, Math.round(HALO_OPACITY * stagger)] as [number, number, number, number];
    },
    getRadius: () => getCityPulseRadius(animationTime),
    radiusUnits: 'pixels' as const,
    pickable: false,
    updateTriggers: {
      getFillColor: [animationPhase, animationTime],
      getRadius: [animationTime],
    },
  });

  const dotLayer = new ScatterplotLayer<CityMarkerData>({
    id: 'city-marker-dot',
    data,
    getPosition: (d) => d.coordinates,
    getFillColor: (d) => {
      const stagger = getStaggerOpacity(d.index, animationTime);
      return [255, 255, 255, Math.round(255 * stagger)] as [number, number, number, number];
    },
    getRadius: DOT_RADIUS,
    radiusUnits: 'pixels' as const,
    pickable: true,
    updateTriggers: {
      getFillColor: [animationPhase, animationTime],
    },
  });

  return [haloLayer, dotLayer];
}
