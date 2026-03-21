/**
 * Tests for FateMap component — the main interactive map.
 * Mocks deck.gl and MapLibre GL since jsdom has no WebGL.
 */

import { render, waitFor } from '@testing-library/react';
import type { SimulationResult } from '@/lib/types';

// --- Mocks ---

// Capture DeckGL props for assertions
let capturedDeckProps: Record<string, unknown> = {};

jest.mock('@deck.gl/react', () => {
  const MockDeckGL = (props: Record<string, unknown>) => {
    capturedDeckProps = props;
    return <div data-testid="mock-deckgl">{props.children as React.ReactNode}</div>;
  };
  MockDeckGL.displayName = 'MockDeckGL';
  return { __esModule: true, default: MockDeckGL };
});

jest.mock('react-map-gl/maplibre', () => ({
  Map: (props: Record<string, unknown>) => (
    <div data-testid="mock-mapgl" data-style={props.mapStyle as string} />
  ),
}));

jest.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}));

// Mock layer creators to return identifiable objects
const mockCreateCountryFillLayer = jest.fn(() => ({
  id: 'country-fill',
  _type: 'GeoJsonLayer',
}));
const mockConvertTopoJson = jest.fn(() => ({
  type: 'FeatureCollection' as const,
  features: [],
}));

jest.mock('@/lib/country-regions', () => ({
  convertTopoJson: (...args: unknown[]) => mockConvertTopoJson(...args),
  createCountryFillLayer: (...args: unknown[]) => mockCreateCountryFillLayer(...args),
}));

const mockCreateNetworkGlowLayers = jest.fn(() => [
  { id: 'network-glow-outer' },
  { id: 'network-glow-mid' },
  { id: 'network-glow-core' },
]);
jest.mock('@/lib/network-glow', () => ({
  createNetworkGlowLayers: (...args: unknown[]) => mockCreateNetworkGlowLayers(...args),
}));

const mockCreateCityMarkerLayers = jest.fn(() => [
  { id: 'city-marker-halo' },
  { id: 'city-marker-dot' },
]);
jest.mock('@/lib/city-markers', () => ({
  createCityMarkerLayers: (...args: unknown[]) => mockCreateCityMarkerLayers(...args),
}));

const mockCreateShockwaveLayers = jest.fn(() => [
  { id: 'shockwave-ring-0' },
  { id: 'shockwave-ring-1' },
  { id: 'shockwave-ring-2' },
  { id: 'shockwave-ring-3' },
]);
jest.mock('@/lib/impact-wave', () => ({
  createShockwaveLayers: (...args: unknown[]) => mockCreateShockwaveLayers(...args),
}));

// Mock fetch for GeoJSON
const mockTopoJson = { objects: { countries: { type: 'GeometryCollection', geometries: [] } } };
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(mockTopoJson),
  }),
) as jest.Mock;

// Mock requestAnimationFrame
let rafCallback: FrameRequestCallback | null = null;
let rafId = 1;
global.requestAnimationFrame = jest.fn((cb: FrameRequestCallback) => {
  rafCallback = cb;
  return rafId++;
}) as unknown as typeof requestAnimationFrame;
global.cancelAnimationFrame = jest.fn();

// Import after mocks
import { FateMap, type FateMapProps } from '../FateMap';

const fakeResult: SimulationResult = {
  event: 'Test event',
  timestamp: '2026-01-01T00:00:00Z',
  epicenter: { countryId: 'CHN', coordinates: [121.5, 25.0] },
  countryImpacts: [
    {
      countryId: 'CHN',
      severity: 'critical',
      direction: 'negative',
      impactPercent: -30,
      reason: 'test',
      reasonZh: '测试',
    },
  ],
  cityImpacts: [
    {
      cityId: 'shanghai',
      severity: 'high',
      direction: 'negative',
      impactType: 'trade_disruption',
    },
  ],
  activatedRelationships: ['USA-CHN-trade'],
  summary: 'Test summary',
  summaryZh: '测试摘要',
};

function renderMap(overrides: Partial<FateMapProps> = {}) {
  const props: FateMapProps = {
    simulationResult: null,
    animationPhase: 'idle',
    ...overrides,
  };
  return render(<FateMap {...props} />);
}

describe('FateMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    capturedDeckProps = {};
    rafCallback = null;
    (global.fetch as jest.Mock).mockImplementation(() =>
      Promise.resolve({ json: () => Promise.resolve(mockTopoJson) }),
    );
  });

  describe('rendering', () => {
    it('renders with data-testid fate-map', () => {
      const { getByTestId } = renderMap();
      expect(getByTestId('fate-map')).toBeInTheDocument();
    });

    it('renders DeckGL with controller enabled', () => {
      renderMap();
      expect(capturedDeckProps.controller).toBe(true);
    });

    it('renders MapGL child with dark-matter style', () => {
      const { getByTestId } = renderMap();
      const mapgl = getByTestId('mock-mapgl');
      expect(mapgl.getAttribute('data-style')).toContain('dark-matter');
    });

    it('sets initial view state with zoom ~1.5', () => {
      renderMap();
      const viewState = capturedDeckProps.initialViewState as Record<string, number>;
      expect(viewState.zoom).toBe(1.5);
      expect(viewState.pitch).toBe(0);
    });
  });

  describe('GeoJSON fetch', () => {
    it('fetches countries-110m.json on mount', async () => {
      renderMap();
      await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith('/geo/countries-110m.json');
      });
    });

    it('converts TopoJSON after fetch', async () => {
      renderMap();
      await waitFor(() => {
        expect(mockConvertTopoJson).toHaveBeenCalledWith(mockTopoJson);
      });
    });

    it('does not crash if fetch fails', async () => {
      (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));
      const { getByTestId } = renderMap();
      await waitFor(() => {
        expect(getByTestId('fate-map')).toBeInTheDocument();
      });
    });
  });

  describe('layer composition — idle state', () => {
    it('creates network glow layers with idle phase', async () => {
      renderMap({ animationPhase: 'idle' });
      await waitFor(() => {
        expect(mockCreateNetworkGlowLayers).toHaveBeenCalled();
      });
      const args = mockCreateNetworkGlowLayers.mock.calls[0][0] as Record<string, unknown>;
      expect(args.animationPhase).toBe('idle');
    });

    it('creates city marker layers with idle phase', () => {
      renderMap({ animationPhase: 'idle' });
      const args = mockCreateCityMarkerLayers.mock.calls[0][0] as Record<string, unknown>;
      expect(args.animationPhase).toBe('idle');
    });

    it('does not create shockwave layers without simulationResult', () => {
      renderMap({ simulationResult: null });
      expect(mockCreateShockwaveLayers).not.toHaveBeenCalled();
    });

    it('passes empty countryImpacts when no result', () => {
      renderMap({ simulationResult: null });
      const args = mockCreateNetworkGlowLayers.mock.calls[0][0] as Record<string, unknown>;
      expect(args.countryImpacts).toEqual([]);
      expect(args.activatedIds).toEqual([]);
    });
  });

  describe('layer composition — with simulation result', () => {
    it('creates shockwave layers with epicenter coordinates', () => {
      renderMap({ simulationResult: fakeResult, animationPhase: 'ripple' });
      expect(mockCreateShockwaveLayers).toHaveBeenCalled();
      const args = mockCreateShockwaveLayers.mock.calls[0][0] as Record<string, unknown>;
      expect(args.epicenter).toEqual([121.5, 25.0]);
      expect(args.animationPhase).toBe('ripple');
    });

    it('passes countryImpacts to network glow layers', () => {
      renderMap({ simulationResult: fakeResult, animationPhase: 'network' });
      const args = mockCreateNetworkGlowLayers.mock.calls[0][0] as Record<string, unknown>;
      expect(args.countryImpacts).toEqual(fakeResult.countryImpacts);
      expect(args.activatedIds).toEqual(fakeResult.activatedRelationships);
    });

    it('passes cityImpacts to city marker layers', () => {
      renderMap({ simulationResult: fakeResult, animationPhase: 'network' });
      const args = mockCreateCityMarkerLayers.mock.calls[0][0] as Record<string, unknown>;
      expect(args.cityImpacts).toEqual(fakeResult.cityImpacts);
    });

    it('creates country fill layer after GeoJSON loads', async () => {
      renderMap({ simulationResult: fakeResult, animationPhase: 'ripple' });
      await waitFor(() => {
        expect(mockCreateCountryFillLayer).toHaveBeenCalled();
      });
      const args = mockCreateCountryFillLayer.mock.calls[0][0] as Record<string, unknown>;
      expect(args.animationPhase).toBe('ripple');
      expect(args.countryImpacts).toEqual(fakeResult.countryImpacts);
    });

    it('total layer count is correct with all layers active', async () => {
      renderMap({ simulationResult: fakeResult, animationPhase: 'network' });
      await waitFor(() => {
        expect(mockCreateCountryFillLayer).toHaveBeenCalled();
      });
      // 1 country fill + 3 network glow + 2 city markers + 4 shockwave = 10
      const layers = capturedDeckProps.layers as unknown[];
      expect(layers.length).toBe(10);
    });
  });

  describe('animation', () => {
    it('does not start animation loop in idle phase', () => {
      renderMap({ animationPhase: 'idle' });
      expect(global.requestAnimationFrame).not.toHaveBeenCalled();
    });

    it('starts animation loop in ripple phase', () => {
      renderMap({ animationPhase: 'ripple' });
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    it('starts animation loop in network phase', () => {
      renderMap({ animationPhase: 'network' });
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    it('starts animation loop in persistent phase', () => {
      renderMap({ animationPhase: 'persistent' });
      expect(global.requestAnimationFrame).toHaveBeenCalled();
    });

    it('cancels animation on phase change back to idle', () => {
      const { rerender } = render(
        <FateMap simulationResult={null} animationPhase="ripple" />,
      );
      expect(global.requestAnimationFrame).toHaveBeenCalled();

      rerender(<FateMap simulationResult={null} animationPhase="idle" />);
      expect(global.cancelAnimationFrame).toHaveBeenCalled();
    });

    it('animation callback updates animationTime', () => {
      renderMap({ simulationResult: fakeResult, animationPhase: 'ripple' });
      expect(rafCallback).not.toBeNull();

      // Simulate frame at 500ms
      jest.spyOn(performance, 'now').mockReturnValue(500);
      if (rafCallback) rafCallback(500);

      // Should have requested next frame
      expect(global.requestAnimationFrame).toHaveBeenCalledTimes(2);
    });
  });

  describe('click handling', () => {
    it('calls onCountryClick when country-fill layer clicked', () => {
      const onCountryClick = jest.fn();
      renderMap({ onCountryClick });

      const onClick = capturedDeckProps.onClick as (info: Record<string, unknown>) => void;
      onClick({
        object: { properties: { alpha3: 'CHN' } },
        layer: { id: 'country-fill' },
      });

      expect(onCountryClick).toHaveBeenCalledWith('CHN');
    });

    it('calls onCityClick when city-marker-dot layer clicked', () => {
      const onCityClick = jest.fn();
      renderMap({ onCityClick });

      const onClick = capturedDeckProps.onClick as (info: Record<string, unknown>) => void;
      onClick({
        object: { cityId: 'shanghai' },
        layer: { id: 'city-marker-dot' },
      });

      expect(onCityClick).toHaveBeenCalledWith('shanghai');
    });

    it('does not crash on click with no object', () => {
      const onCountryClick = jest.fn();
      renderMap({ onCountryClick });

      const onClick = capturedDeckProps.onClick as (info: Record<string, unknown>) => void;
      onClick({ object: null, layer: null });

      expect(onCountryClick).not.toHaveBeenCalled();
    });

    it('does not call handler if alpha3 is missing from country', () => {
      const onCountryClick = jest.fn();
      renderMap({ onCountryClick });

      const onClick = capturedDeckProps.onClick as (info: Record<string, unknown>) => void;
      onClick({
        object: { properties: { alpha3: null } },
        layer: { id: 'country-fill' },
      });

      expect(onCountryClick).not.toHaveBeenCalled();
    });
  });

  describe('tooltip', () => {
    it('returns city tooltip for city-marker-dot hover', () => {
      renderMap();
      const getTooltip = capturedDeckProps.getTooltip as (
        info: Record<string, unknown>,
      ) => { text: string } | null;

      const result = getTooltip({
        object: { cityId: 'shanghai' },
        layer: { id: 'city-marker-dot' },
      });

      expect(result).not.toBeNull();
      expect(result!.text).toContain('Shanghai');
    });

    it('returns country tooltip for country-fill hover', () => {
      renderMap();
      const getTooltip = capturedDeckProps.getTooltip as (
        info: Record<string, unknown>,
      ) => { text: string } | null;

      const result = getTooltip({
        object: { properties: { alpha3: 'USA' } },
        layer: { id: 'country-fill' },
      });

      expect(result).not.toBeNull();
      expect(result!.text).toContain('United States');
    });

    it('returns null for unknown layer', () => {
      renderMap();
      const getTooltip = capturedDeckProps.getTooltip as (
        info: Record<string, unknown>,
      ) => { text: string } | null;

      const result = getTooltip({
        object: {},
        layer: { id: 'unknown-layer' },
      });

      expect(result).toBeNull();
    });

    it('returns null when no object', () => {
      renderMap();
      const getTooltip = capturedDeckProps.getTooltip as (
        info: Record<string, unknown>,
      ) => { text: string } | null;

      const result = getTooltip({ object: null, layer: null });
      expect(result).toBeNull();
    });
  });
});
