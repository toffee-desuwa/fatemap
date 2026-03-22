'use client';

/**
 * F021: FateHeroMap — non-interactive hero map that auto-cycles preset scenarios.
 * Reuses the same layer stack as FateMap but simplified:
 * no click handlers, no tooltips, controller disabled.
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Map as MapGL } from 'react-map-gl/maplibre';
import type { Layer } from '@deck.gl/core';
import type { FeatureCollection } from 'geojson';
import type { Topology, GeometryCollection } from 'topojson-specification';
import 'maplibre-gl/dist/maplibre-gl.css';

import type { AnimationPhase, SimulationResult } from '@/lib/types';
import { COUNTRIES } from '@/lib/countries';
import { CITIES } from '@/lib/cities';
import { RELATIONSHIPS } from '@/lib/relationships';
import { SCENARIOS } from '@/lib/scenarios';
import { convertTopoJson, createCountryFillLayer } from '@/lib/country-regions';
import { createNetworkGlowLayers } from '@/lib/network-glow';
import { createCityMarkerLayers } from '@/lib/city-markers';
import { createShockwaveLayers } from '@/lib/impact-wave';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const INITIAL_VIEW_STATE = {
  longitude: 20,
  latitude: 15,
  zoom: 1.5,
  pitch: 0,
  bearing: 0,
  minZoom: 0.8,
  maxZoom: 6,
};

/** 3 visually diverse scenarios for the hero cycling */
const HERO_SCENARIO_IDS = [
  'taiwan-strait-crisis',
  'hormuz-strait-blockade',
  'ukraine-russia-escalation',
] as const;

const HERO_SCENARIOS = HERO_SCENARIO_IDS.map(
  (id) => SCENARIOS.find((s) => s.id === id),
).filter((s): s is (typeof SCENARIOS)[number] => s !== undefined);

/** Subtle bearing offsets per scenario for camera drift effect */
const BEARING_OFFSETS = [-5, 0, 5];

/** Cycle interval in ms */
const CYCLE_INTERVAL = 10_000;
/** Delay after map load before first scenario */
const START_DELAY = 1_000;
/** Duration of ripple phase in ms */
const RIPPLE_DURATION = 2_000;
/** Duration of network phase in ms */
const NETWORK_DURATION = 3_000;

export function FateHeroMap() {
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
  const [scenarioIndex, setScenarioIndex] = useState(0);
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('idle');
  const [animationTime, setAnimationTime] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);
  const cycleTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  /** Track ALL pending timeouts so clearTimers() can cancel every one */
  const pendingTimersRef = useRef<Set<ReturnType<typeof setTimeout>>>(new Set());
  const mapLoadedRef = useRef(false);

  /** Schedule a timeout and track it for cleanup */
  const safeTimeout = useCallback((fn: () => void, delay: number) => {
    const id = setTimeout(() => {
      pendingTimersRef.current.delete(id);
      fn();
    }, delay);
    pendingTimersRef.current.add(id);
    return id;
  }, []);

  const currentResult: SimulationResult = HERO_SCENARIOS[scenarioIndex].result;

  /** View state with subtle bearing drift per scenario */
  const viewState = useMemo(
    () => ({
      ...INITIAL_VIEW_STATE,
      bearing: BEARING_OFFSETS[scenarioIndex % BEARING_OFFSETS.length],
    }),
    [scenarioIndex],
  );

  // Fetch TopoJSON on mount
  useEffect(() => {
    let cancelled = false;
    fetch('/geo/countries-110m.json')
      .then((r) => r.json())
      .then((topo: Topology<{ countries: GeometryCollection }>) => {
        if (!cancelled) {
          setGeojson(convertTopoJson(topo));
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, []);

  /** Start a single scenario animation cycle */
  const startScenario = useCallback(() => {
    setAnimationPhase('ripple');

    safeTimeout(() => {
      setAnimationPhase('network');

      safeTimeout(() => {
        setAnimationPhase('persistent');
      }, NETWORK_DURATION);
    }, RIPPLE_DURATION);
  }, [safeTimeout]);

  /** Clear all timers */
  const clearTimers = useCallback(() => {
    if (cycleTimerRef.current) {
      clearInterval(cycleTimerRef.current);
      cycleTimerRef.current = null;
    }
    pendingTimersRef.current.forEach((id) => clearTimeout(id));
    pendingTimersRef.current.clear();
    cancelAnimationFrame(rafRef.current);
  }, []);

  // Auto-cycle scenarios
  useEffect(() => {
    if (!mapLoadedRef.current) {
      // Wait for onLoad
      return;
    }

    // Start first scenario after delay
    safeTimeout(() => {
      startScenario();
    }, START_DELAY);

    // Set up cycling
    cycleTimerRef.current = setInterval(() => {
      setAnimationPhase('idle');
      setAnimationTime(0);

      // Brief idle gap, then next scenario (tracked by safeTimeout)
      safeTimeout(() => {
        setScenarioIndex((prev) => (prev + 1) % HERO_SCENARIOS.length);
        startScenario();
      }, 200);
    }, CYCLE_INTERVAL);

    return () => {
      clearTimers();
    };
  }, [startScenario, clearTimers, safeTimeout]);

  // Animation loop
  useEffect(() => {
    if (animationPhase === 'idle') {
      setAnimationTime(0);
      return;
    }

    startTimeRef.current = performance.now();

    const tick = () => {
      const elapsed = (performance.now() - startTimeRef.current) / 1000;
      setAnimationTime(elapsed);
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [animationPhase]);

  // Build layers (memoized to avoid rebuilding on every render)
  const layers = useMemo(() => {
    const layerArray: Layer[] = [];

    if (geojson) {
      layerArray.push(
        createCountryFillLayer({
          geojson,
          countryImpacts: currentResult.countryImpacts,
          animationPhase,
        }),
      );
    }

    layerArray.push(
      ...createNetworkGlowLayers({
        relationships: RELATIONSHIPS,
        countries: COUNTRIES,
        countryImpacts: currentResult.countryImpacts,
        activatedIds: currentResult.activatedRelationships,
        animationPhase,
        pulseTime: animationTime,
      }),
    );

    layerArray.push(
      ...createCityMarkerLayers({
        cities: CITIES,
        cityImpacts: currentResult.cityImpacts,
        animationTime,
        animationPhase,
      }),
    );

    layerArray.push(
      ...createShockwaveLayers({
        epicenter: currentResult.epicenter.coordinates,
        animationTime,
        animationPhase,
      }),
    );

    return layerArray;
  }, [geojson, currentResult, animationPhase, animationTime]);

  const handleMapLoad = useCallback(() => {
    mapLoadedRef.current = true;
    // Trigger re-render to start the cycle effect
    setScenarioIndex(0);
  }, []);

  return (
    <div
      className="absolute inset-0 bg-[var(--color-background)]"
      data-testid="fate-hero-map"
    >
      <DeckGL
        initialViewState={viewState}
        controller={false}
        layers={layers}
      >
        <MapGL reuseMaps mapStyle={MAP_STYLE} onLoad={handleMapLoad} />
      </DeckGL>
    </div>
  );
}
