/**
 * Tests for FateHeroMap — auto-cycling hero map for landing page.
 * Mocks deck.gl and MapLibre GL since jsdom has no WebGL.
 */

import { render, screen, act } from '@testing-library/react';

// --- Mocks ---

let capturedDeckProps: Record<string, unknown> = {};

jest.mock('@deck.gl/react', () => {
  const MockDeckGL = (props: Record<string, unknown>) => {
    capturedDeckProps = props;
    return <div data-testid="mock-deckgl">{props.children as React.ReactNode}</div>;
  };
  MockDeckGL.displayName = 'MockDeckGL';
  return { __esModule: true, default: MockDeckGL };
});

let capturedMapProps: Record<string, unknown> = {};

jest.mock('react-map-gl/maplibre', () => ({
  Map: (props: Record<string, unknown>) => {
    capturedMapProps = props;
    return <div data-testid="mock-mapgl" />;
  },
}));

jest.mock('maplibre-gl/dist/maplibre-gl.css', () => ({}));

const mockCreateCountryFillLayer = jest.fn((_opts: Record<string, unknown>) => ({
  id: 'country-fill',
  _type: 'GeoJsonLayer',
}));
const mockConvertTopoJson = jest.fn((_topo: unknown) => ({
  type: 'FeatureCollection' as const,
  features: [],
}));

jest.mock('@/lib/country-regions', () => ({
  convertTopoJson: (arg: unknown) => mockConvertTopoJson(arg),
  createCountryFillLayer: (arg: Record<string, unknown>) => mockCreateCountryFillLayer(arg),
}));

const mockCreateNetworkGlowLayers = jest.fn((_opts: Record<string, unknown>) => [
  { id: 'network-glow-outer' },
  { id: 'network-glow-mid' },
  { id: 'network-glow-core' },
]);

jest.mock('@/lib/network-glow', () => ({
  createNetworkGlowLayers: (arg: Record<string, unknown>) => mockCreateNetworkGlowLayers(arg),
}));

const mockCreateCityMarkerLayers = jest.fn((_opts: Record<string, unknown>) => [
  { id: 'city-marker-halo' },
  { id: 'city-marker-dot' },
]);

jest.mock('@/lib/city-markers', () => ({
  createCityMarkerLayers: (arg: Record<string, unknown>) => mockCreateCityMarkerLayers(arg),
}));

const mockCreateShockwaveLayers = jest.fn((_opts: Record<string, unknown>) => [
  { id: 'shockwave-ring-0' },
  { id: 'shockwave-ring-1' },
  { id: 'shockwave-ring-2' },
  { id: 'shockwave-ring-3' },
]);

jest.mock('@/lib/impact-wave', () => ({
  createShockwaveLayers: (arg: Record<string, unknown>) => mockCreateShockwaveLayers(arg),
}));

// Mock fetch for GeoJSON
const mockTopoJson = { type: 'Topology', objects: { countries: { type: 'GeometryCollection', geometries: [] } } };
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve(mockTopoJson),
  }),
) as jest.Mock;

import { FateHeroMap } from '../FateHeroMap';

describe('FateHeroMap', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();
    capturedDeckProps = {};
    capturedMapProps = {};
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('renders with testid', async () => {
    await act(async () => {
      render(<FateHeroMap />);
    });
    expect(screen.getByTestId('fate-hero-map')).toBeInTheDocument();
  });

  it('renders DeckGL and MapGL', async () => {
    await act(async () => {
      render(<FateHeroMap />);
    });
    expect(screen.getByTestId('mock-deckgl')).toBeInTheDocument();
    expect(screen.getByTestId('mock-mapgl')).toBeInTheDocument();
  });

  it('disables controller (non-interactive)', async () => {
    await act(async () => {
      render(<FateHeroMap />);
    });
    expect(capturedDeckProps.controller).toBe(false);
  });

  it('has no click handler', async () => {
    await act(async () => {
      render(<FateHeroMap />);
    });
    expect(capturedDeckProps.onClick).toBeUndefined();
  });

  it('has no tooltip handler', async () => {
    await act(async () => {
      render(<FateHeroMap />);
    });
    expect(capturedDeckProps.getTooltip).toBeUndefined();
  });

  it('fetches GeoJSON on mount', async () => {
    await act(async () => {
      render(<FateHeroMap />);
    });
    expect(global.fetch).toHaveBeenCalledWith('/geo/countries-110m.json');
  });

  it('converts TopoJSON after fetch', async () => {
    await act(async () => {
      render(<FateHeroMap />);
    });
    await act(async () => {
      await Promise.resolve();
    });
    expect(mockConvertTopoJson).toHaveBeenCalledWith(mockTopoJson);
  });

  it('sets initial view state', async () => {
    await act(async () => {
      render(<FateHeroMap />);
    });
    const viewState = capturedDeckProps.initialViewState as Record<string, number>;
    expect(viewState.longitude).toBe(20);
    expect(viewState.latitude).toBe(15);
    expect(viewState.zoom).toBe(1.5);
  });

  it('has MapGL onLoad prop', async () => {
    await act(async () => {
      render(<FateHeroMap />);
    });
    expect(typeof capturedMapProps.onLoad).toBe('function');
  });

  it('creates all layer types', async () => {
    await act(async () => {
      render(<FateHeroMap />);
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(mockCreateCountryFillLayer).toHaveBeenCalled();
    expect(mockCreateNetworkGlowLayers).toHaveBeenCalled();
    expect(mockCreateCityMarkerLayers).toHaveBeenCalled();
    expect(mockCreateShockwaveLayers).toHaveBeenCalled();
  });

  it('creates 10 layers total', async () => {
    await act(async () => {
      render(<FateHeroMap />);
    });
    await act(async () => {
      await Promise.resolve();
    });

    const layers = capturedDeckProps.layers as unknown[];
    // 1 country fill + 3 network glow + 2 city markers + 4 shockwave = 10
    expect(layers).toHaveLength(10);
  });

  it('starts in idle phase', async () => {
    await act(async () => {
      render(<FateHeroMap />);
    });
    await act(async () => {
      await Promise.resolve();
    });

    // Before onLoad, layers should use idle phase
    const countryFillCall = mockCreateCountryFillLayer.mock.calls[0][0] as Record<string, unknown>;
    expect(countryFillCall.animationPhase).toBe('idle');
  });

  it('passes scenario result data to layers', async () => {
    await act(async () => {
      render(<FateHeroMap />);
    });
    await act(async () => {
      await Promise.resolve();
    });

    // Country fill should receive countryImpacts from first scenario
    const countryFillCall = mockCreateCountryFillLayer.mock.calls[0][0] as Record<string, unknown>;
    expect(Array.isArray(countryFillCall.countryImpacts)).toBe(true);
    expect((countryFillCall.countryImpacts as unknown[]).length).toBeGreaterThan(0);

    // Shockwave should receive epicenter coordinates
    const shockwaveCall = mockCreateShockwaveLayers.mock.calls[0][0] as Record<string, unknown>;
    expect(Array.isArray(shockwaveCall.epicenter)).toBe(true);
    expect((shockwaveCall.epicenter as number[]).length).toBe(2);
  });

  it('uses taiwan-strait-crisis as first scenario', async () => {
    await act(async () => {
      render(<FateHeroMap />);
    });
    await act(async () => {
      await Promise.resolve();
    });

    // First scenario epicenter should be Taiwan [120.96, 23.70]
    const shockwaveCall = mockCreateShockwaveLayers.mock.calls[0][0] as Record<string, unknown>;
    const epicenter = shockwaveCall.epicenter as number[];
    expect(epicenter[0]).toBeCloseTo(120.96, 1);
    expect(epicenter[1]).toBeCloseTo(23.7, 1);
  });
});
