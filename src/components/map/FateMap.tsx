'use client';

/**
 * F014: FateMap — main interactive map wiring all visualization layers.
 * Combines country fill, network glow, city markers, and shockwave ripple
 * on a deck.gl + MapLibre GL base map with requestAnimationFrame animation.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import DeckGL from '@deck.gl/react';
import { Map as MapGL } from 'react-map-gl/maplibre';
import type { PickingInfo } from '@deck.gl/core';
import type { FeatureCollection, Feature, Geometry } from 'geojson';
import type { Topology, GeometryCollection } from 'topojson-specification';
import 'maplibre-gl/dist/maplibre-gl.css';

import type { AnimationPhase, SimulationResult } from '@/lib/types';
import { COUNTRIES } from '@/lib/countries';
import { CITIES } from '@/lib/cities';
import { RELATIONSHIPS } from '@/lib/relationships';
import { convertTopoJson, createCountryFillLayer } from '@/lib/country-regions';
import { createNetworkGlowLayers } from '@/lib/network-glow';
import { createCityMarkerLayers } from '@/lib/city-markers';
import { createShockwaveLayers } from '@/lib/impact-wave';

const MAP_STYLE = 'https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json';

const INITIAL_VIEW_STATE = {
  longitude: 20,
  latitude: 20,
  zoom: 1.5,
  pitch: 0,
  bearing: 0,
};

export interface FateMapProps {
  simulationResult: SimulationResult | null;
  animationPhase: AnimationPhase;
  onCountryClick?: (countryId: string) => void;
  onCityClick?: (cityId: string) => void;
}

export function FateMap({
  simulationResult,
  animationPhase,
  onCountryClick,
  onCityClick,
}: FateMapProps) {
  const [geojson, setGeojson] = useState<FeatureCollection | null>(null);
  const [animationTime, setAnimationTime] = useState(0);
  const rafRef = useRef<number>(0);
  const startTimeRef = useRef<number>(0);

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
      .catch(() => {
        // GeoJSON load failed — map renders without country fills
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Animation loop via requestAnimationFrame
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

  // Build layers
  const layers = [];

  // 1. Country fill (bottom)
  if (geojson) {
    layers.push(
      createCountryFillLayer({
        geojson,
        countryImpacts: simulationResult?.countryImpacts ?? [],
        animationPhase,
      }),
    );
  }

  // 2. Network glow lines
  layers.push(
    ...createNetworkGlowLayers({
      relationships: RELATIONSHIPS,
      countries: COUNTRIES,
      countryImpacts: simulationResult?.countryImpacts ?? [],
      activatedIds: simulationResult?.activatedRelationships ?? [],
      animationPhase,
      pulseTime: animationTime,
    }),
  );

  // 3. City impact markers
  layers.push(
    ...createCityMarkerLayers({
      cities: CITIES,
      cityImpacts: simulationResult?.cityImpacts ?? [],
      animationTime,
      animationPhase,
    }),
  );

  // 4. Shockwave ripple rings (top)
  if (simulationResult) {
    layers.push(
      ...createShockwaveLayers({
        epicenter: simulationResult.epicenter.coordinates,
        animationTime,
        animationPhase,
      }),
    );
  }

  const handleClick = useCallback(
    (info: PickingInfo) => {
      if (!info.object) return;
      const layer = info.layer;
      if (!layer) return;

      // Country fill click
      if (layer.id === 'country-fill') {
        const feature = info.object as Feature<Geometry>;
        const alpha3 = (feature.properties as Record<string, unknown> | null)?.alpha3 as
          | string
          | undefined;
        if (alpha3 && onCountryClick) {
          onCountryClick(alpha3);
        }
      }

      // City dot click
      if (layer.id === 'city-marker-dot') {
        const data = info.object as { cityId?: string };
        if (data.cityId && onCityClick) {
          onCityClick(data.cityId);
        }
      }
    },
    [onCountryClick, onCityClick],
  );

  const getTooltip = useCallback((info: PickingInfo) => {
    if (!info.object || !info.layer) return null;

    if (info.layer.id === 'city-marker-dot') {
      const data = info.object as { cityId?: string; severity?: string };
      const city = CITIES.find((c) => c.id === data.cityId);
      if (city) {
        return {
          text: `${city.name} (${city.nameCn})`,
          style: {
            backgroundColor: 'rgba(0, 0, 0, 0.8)',
            color: '#fff',
            fontSize: '12px',
            padding: '4px 8px',
            borderRadius: '4px',
          },
        };
      }
    }

    if (info.layer.id === 'country-fill') {
      const feature = info.object as Feature<Geometry>;
      const alpha3 = (feature.properties as Record<string, unknown> | null)?.alpha3 as
        | string
        | undefined;
      if (alpha3) {
        const country = COUNTRIES.find((c) => c.id === alpha3);
        if (country) {
          return {
            text: `${country.name} (${country.nameCn})`,
            style: {
              backgroundColor: 'rgba(0, 0, 0, 0.8)',
              color: '#fff',
              fontSize: '12px',
              padding: '4px 8px',
              borderRadius: '4px',
            },
          };
        }
      }
    }

    return null;
  }, []);

  return (
    <div className="relative h-full w-full" data-testid="fate-map">
      <DeckGL
        initialViewState={INITIAL_VIEW_STATE}
        controller={true}
        layers={layers}
        onClick={handleClick}
        getTooltip={getTooltip}
      >
        <MapGL reuseMaps mapStyle={MAP_STYLE} />
      </DeckGL>
    </div>
  );
}
