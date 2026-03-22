/**
 * F010: Network glow lines for relationship visualization.
 * Creates a 3-layer glow stack (outer, mid, core) using PathLayer
 * to render activated relationship lines with severity-based colors.
 */

import { PathLayer } from '@deck.gl/layers';
import type { Relationship, Country, CountryImpact, AnimationPhase } from './types';
import { SEVERITY_COLORS } from './colors';

interface GlowParams {
  width: number;
  opacity: number;
}

interface GlowConfig {
  outer: GlowParams;
  mid: GlowParams;
  core: GlowParams;
}

/** Glow parameters per relationship state */
export const NETWORK_GLOW_CONFIGS: Record<'idle' | 'activated' | 'dimmed', GlowConfig> = {
  idle: {
    outer: { width: 4, opacity: 0.05 },
    mid: { width: 2, opacity: 0.1 },
    core: { width: 1, opacity: 0.2 },
  },
  activated: {
    outer: { width: 12, opacity: 0.25 },
    mid: { width: 7, opacity: 0.55 },
    core: { width: 3, opacity: 1.0 },
  },
  dimmed: {
    outer: { width: 3, opacity: 0.03 },
    mid: { width: 1.5, opacity: 0.06 },
    core: { width: 0.8, opacity: 0.1 },
  },
};

/** Width multipliers based on relationship strength (1-5) */
const STRENGTH_WIDTH: Record<number, number> = {
  1: 1,
  2: 1.5,
  3: 2,
  4: 2.5,
  5: 3,
};

/** Pulse multiplier for critical severity lines. Oscillates 0.7-1.0. */
export function getNetworkPulseMultiplier(pulseTime: number): number {
  return 0.85 + Math.sin(pulseTime * 4) * 0.15;
}

/** Internal data structure for path rendering */
interface NetworkSegment {
  id: string;
  path: [number, number][];
  strength: Relationship['strength'];
  severity: CountryImpact['severity'] | 'unaffected';
  activated: boolean;
}

/** Build segments from relationships, resolving coordinates and severity */
function buildSegments(
  relationships: Relationship[],
  countryMap: Map<string, Country>,
  activatedSet: Set<string>,
  impactMap: Map<string, CountryImpact>,
): NetworkSegment[] {
  const segments: NetworkSegment[] = [];

  for (const rel of relationships) {
    const fromCountry = countryMap.get(rel.from);
    const toCountry = countryMap.get(rel.to);
    if (!fromCountry || !toCountry) continue;

    const activated = activatedSet.has(rel.id);

    // Resolve severity from the highest-impact country in the relationship
    let severity: CountryImpact['severity'] | 'unaffected' = 'unaffected';
    if (activated) {
      const fromImpact = impactMap.get(rel.from);
      const toImpact = impactMap.get(rel.to);
      severity = pickHigherSeverity(
        fromImpact?.severity ?? 'unaffected',
        toImpact?.severity ?? 'unaffected',
      );
    }

    segments.push({
      id: rel.id,
      path: [fromCountry.center, toCountry.center],
      strength: rel.strength,
      severity,
      activated,
    });
  }

  return segments;
}

const SEVERITY_RANK: Record<string, number> = {
  critical: 4,
  high: 3,
  medium: 2,
  low: 1,
  unaffected: 0,
};

function pickHigherSeverity(
  a: CountryImpact['severity'] | 'unaffected',
  b: CountryImpact['severity'] | 'unaffected',
): CountryImpact['severity'] | 'unaffected' {
  return (SEVERITY_RANK[a] ?? 0) >= (SEVERITY_RANK[b] ?? 0) ? a : b;
}

function getColor(
  severity: CountryImpact['severity'] | 'unaffected',
): [number, number, number] {
  if (severity === 'unaffected') return SEVERITY_COLORS.unaffected;
  return SEVERITY_COLORS[severity];
}

export interface NetworkGlowOptions {
  relationships: Relationship[];
  countries: Country[];
  countryImpacts: CountryImpact[];
  activatedIds: string[];
  animationPhase: AnimationPhase;
  pulseTime?: number;
}

// --- Cache for expensive map/segment rebuilds (avoid rebuilding 60x/sec) ---
let _cachedCountries: Country[] | null = null;
let _cachedCountryMap: Map<string, Country> | null = null;
let _cachedActivatedIds: string[] | null = null;
let _cachedActivatedSet: Set<string> | null = null;
let _cachedImpacts: CountryImpact[] | null = null;
let _cachedImpactMap: Map<string, CountryImpact> | null = null;
let _cachedRelationships: Relationship[] | null = null;
let _cachedSegments: NetworkSegment[] | null = null;

/**
 * Create 3 PathLayer instances forming a glow stack for relationship network.
 * Returns [outerGlow, midGlow, coreLine] — render outer first, core on top.
 */
export function createNetworkGlowLayers({
  relationships,
  countries,
  countryImpacts,
  activatedIds,
  animationPhase,
  pulseTime,
}: NetworkGlowOptions): PathLayer<NetworkSegment>[] {
  // Cache countryMap — countries array is a static module-level constant
  if (_cachedCountries !== countries) {
    _cachedCountries = countries;
    _cachedCountryMap = new Map(countries.map((c) => [c.id, c]));
  }
  const countryMap = _cachedCountryMap!;

  // Cache activatedSet by reference equality of activatedIds
  if (_cachedActivatedIds !== activatedIds) {
    _cachedActivatedIds = activatedIds;
    _cachedActivatedSet = new Set(activatedIds);
  }
  const activatedSet = _cachedActivatedSet!;

  // Cache impactMap by reference equality of countryImpacts
  if (_cachedImpacts !== countryImpacts) {
    _cachedImpacts = countryImpacts;
    _cachedImpactMap = new Map(countryImpacts.map((ci) => [ci.countryId, ci]));
  }
  const impactMap = _cachedImpactMap!;

  // Cache segments — only rebuild when data inputs change
  if (
    _cachedRelationships !== relationships ||
    _cachedCountries !== countries ||
    _cachedActivatedIds !== activatedIds ||
    _cachedImpacts !== countryImpacts ||
    _cachedSegments === null
  ) {
    _cachedRelationships = relationships;
    _cachedSegments = buildSegments(relationships, countryMap, activatedSet, impactMap);
  }
  const segments = _cachedSegments;

  const isNetworkPhase = animationPhase === 'network' || animationPhase === 'persistent';
  const pulse =
    pulseTime !== undefined && isNetworkPhase
      ? getNetworkPulseMultiplier(pulseTime)
      : 1;

  const getConfig = (d: NetworkSegment): GlowConfig => {
    if (animationPhase === 'idle' || animationPhase === 'ripple') {
      return NETWORK_GLOW_CONFIGS.idle;
    }
    return d.activated ? NETWORK_GLOW_CONFIGS.activated : NETWORK_GLOW_CONFIGS.dimmed;
  };

  const strengthMultiplier = (d: NetworkSegment): number =>
    STRENGTH_WIDTH[d.strength] ?? 1;

  const applyPulse = (opacity: number, d: NetworkSegment): number => {
    if (isNetworkPhase && d.activated && d.severity === 'critical' && pulseTime !== undefined) {
      return opacity * pulse;
    }
    return opacity;
  };

  const resolveColor = (d: NetworkSegment): [number, number, number] => {
    if (!isNetworkPhase || !d.activated) return SEVERITY_COLORS.unaffected;
    return getColor(d.severity);
  };

  const updateTriggers = [animationPhase, activatedIds, pulseTime];

  const layerDefs: { key: keyof GlowConfig; pickable: boolean }[] = [
    { key: 'outer', pickable: false },
    { key: 'mid', pickable: false },
    { key: 'core', pickable: true },
  ];

  return layerDefs.map(
    ({ key, pickable }) =>
      new PathLayer<NetworkSegment>({
        id: `network-glow-${key}`,
        data: segments,
        getPath: (d) => d.path,
        getColor: (d) => {
          const config = getConfig(d);
          const color = resolveColor(d);
          return [...color, Math.round(applyPulse(config[key].opacity, d) * 255)] as [
            number,
            number,
            number,
            number,
          ];
        },
        getWidth: (d) => getConfig(d)[key].width * strengthMultiplier(d),
        widthUnits: 'pixels' as const,
        pickable,
        updateTriggers: { getColor: updateTriggers, getWidth: updateTriggers },
      }),
  );
}
