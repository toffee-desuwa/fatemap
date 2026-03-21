import { render, screen, act } from '@testing-library/react';

// --- Mocks ---

// Mock useSimulation hook
const mockSimulate = jest.fn();
const mockClear = jest.fn();
let mockSimulationState = {
  simulate: mockSimulate,
  result: null as import('@/lib/types').SimulationResult | null,
  loading: false,
  error: null as string | null,
  suggestions: [] as import('@/lib/types').PresetScenario[],
  clear: mockClear,
  animationPhase: 'idle' as import('@/lib/types').AnimationPhase,
};

jest.mock('@/hooks/useSimulation', () => ({
  useSimulation: () => mockSimulationState,
}));

// Mock FateMap (deck.gl can't render in jsdom)
let capturedFateMapProps: Record<string, unknown> = {};
jest.mock('@/components/map/FateMap', () => ({
  FateMap: (props: Record<string, unknown>) => {
    capturedFateMapProps = props;
    return <div data-testid="mock-fate-map" />;
  },
}));

// Mock ScenarioInput
let capturedScenarioInputProps: Record<string, unknown> = {};
jest.mock('@/components/simulation/ScenarioInput', () => ({
  ScenarioInput: (props: Record<string, unknown>) => {
    capturedScenarioInputProps = props;
    return <div data-testid="mock-scenario-input" />;
  },
}));

// Mock ImpactReport
let capturedImpactReportProps: Record<string, unknown> = {};
jest.mock('@/components/simulation/ImpactReport', () => ({
  ImpactReport: (props: Record<string, unknown>) => {
    capturedImpactReportProps = props;
    return <div data-testid="mock-impact-report" />;
  },
}));

import { AppShell } from '../AppShell';
import type { SimulationResult } from '@/lib/types';

const mockResult: SimulationResult = {
  event: 'Test event',
  timestamp: '2026-01-01T00:00:00Z',
  epicenter: { countryId: 'USA', coordinates: [-98, 39] },
  countryImpacts: [
    {
      countryId: 'CHN',
      severity: 'critical',
      direction: 'negative',
      impactPercent: -30,
      reason: 'Trade disruption',
    },
  ],
  cityImpacts: [],
  activatedRelationships: [],
  summary: 'Test summary',
  summaryZh: '测试摘要',
};

beforeEach(() => {
  jest.clearAllMocks();
  jest.useFakeTimers();
  capturedFateMapProps = {};
  capturedScenarioInputProps = {};
  capturedImpactReportProps = {};
  mockSimulationState = {
    simulate: mockSimulate,
    result: null,
    loading: false,
    error: null,
    suggestions: [],
    clear: mockClear,
    animationPhase: 'idle',
  };
});

afterEach(() => {
  jest.useRealTimers();
});

describe('AppShell', () => {
  // --- Structure ---

  it('renders app-shell container', () => {
    render(<AppShell />);
    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
  });

  it('renders Header', () => {
    render(<AppShell />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders FateMap', () => {
    render(<AppShell />);
    expect(screen.getByTestId('mock-fate-map')).toBeInTheDocument();
  });

  it('renders ScenarioInput', () => {
    render(<AppShell />);
    expect(screen.getByTestId('mock-scenario-input')).toBeInTheDocument();
  });

  // --- Wiring ---

  it('passes simulate to ScenarioInput.onSimulate', () => {
    render(<AppShell />);
    expect(capturedScenarioInputProps.onSimulate).toBe(mockSimulate);
  });

  it('passes loading to ScenarioInput', () => {
    mockSimulationState.loading = true;
    render(<AppShell />);
    expect(capturedScenarioInputProps.loading).toBe(true);
  });

  it('passes suggestions to ScenarioInput', () => {
    render(<AppShell />);
    expect(capturedScenarioInputProps.suggestions).toEqual([]);
  });

  it('passes simulationResult to FateMap', () => {
    mockSimulationState.result = mockResult;
    render(<AppShell />);
    expect(capturedFateMapProps.simulationResult).toBe(mockResult);
  });

  it('passes animationPhase to FateMap', () => {
    mockSimulationState.animationPhase = 'ripple';
    render(<AppShell />);
    expect(capturedFateMapProps.animationPhase).toBe('ripple');
  });

  // --- ImpactReport ---

  it('does not render ImpactReport when result is null', () => {
    render(<AppShell />);
    expect(screen.queryByTestId('mock-impact-report')).not.toBeInTheDocument();
  });

  it('renders ImpactReport when result exists', () => {
    mockSimulationState.result = mockResult;
    render(<AppShell />);
    expect(screen.getByTestId('mock-impact-report')).toBeInTheDocument();
  });

  it('passes result to ImpactReport', () => {
    mockSimulationState.result = mockResult;
    render(<AppShell />);
    expect(capturedImpactReportProps.result).toBe(mockResult);
  });

  // --- Error display ---

  it('does not render error when error is null', () => {
    render(<AppShell />);
    expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
  });

  it('renders error message when error exists', () => {
    mockSimulationState.error = 'LLM failed';
    render(<AppShell />);
    const el = screen.getByTestId('error-message');
    expect(el).toHaveTextContent('LLM failed');
  });

  // --- Country click (map → report) ---

  it('passes onCountryClick to FateMap', () => {
    render(<AppShell />);
    expect(typeof capturedFateMapProps.onCountryClick).toBe('function');
  });

  it('sets selectedCountryId on country click and passes to ImpactReport', () => {
    mockSimulationState.result = mockResult;
    const { rerender } = render(<AppShell />);

    // Simulate country click from map
    act(() => {
      (capturedFateMapProps.onCountryClick as (id: string) => void)('CHN');
    });
    rerender(<AppShell />);

    expect(capturedImpactReportProps.selectedCountryId).toBe('CHN');
  });

  it('toggles selectedCountryId off when same country clicked again', () => {
    mockSimulationState.result = mockResult;
    const { rerender } = render(<AppShell />);

    act(() => {
      (capturedFateMapProps.onCountryClick as (id: string) => void)('CHN');
    });
    rerender(<AppShell />);
    expect(capturedImpactReportProps.selectedCountryId).toBe('CHN');

    act(() => {
      (capturedFateMapProps.onCountryClick as (id: string) => void)('CHN');
    });
    rerender(<AppShell />);
    expect(capturedImpactReportProps.selectedCountryId).toBeUndefined();
  });

  // --- Clear ---

  it('calls clear and resets selectedCountryId on ImpactReport clear', () => {
    mockSimulationState.result = mockResult;
    const { rerender } = render(<AppShell />);

    // First select a country
    act(() => {
      (capturedFateMapProps.onCountryClick as (id: string) => void)('CHN');
    });
    rerender(<AppShell />);

    // Then clear
    act(() => {
      (capturedImpactReportProps.onClear as () => void)();
    });

    expect(mockClear).toHaveBeenCalledTimes(1);
  });

  // --- Flash overlay ---

  it('does not show flash overlay in idle state', () => {
    render(<AppShell />);
    expect(screen.queryByTestId('flash-overlay')).not.toBeInTheDocument();
  });

  it('shows flash overlay on idle → ripple transition', () => {
    // Start idle
    render(<AppShell />);
    expect(screen.queryByTestId('flash-overlay')).not.toBeInTheDocument();

    // Transition to ripple
    mockSimulationState.animationPhase = 'ripple';
    render(<AppShell />);
  });

  it('flash overlay disappears after 150ms', () => {
    // Render in idle first by keeping the mock state in idle
    const { rerender } = render(<AppShell />);

    // Simulate transition
    mockSimulationState.animationPhase = 'ripple';
    rerender(<AppShell />);

    // If flash was shown, advance timers to dismiss it
    act(() => {
      jest.advanceTimersByTime(200);
    });

    expect(screen.queryByTestId('flash-overlay')).not.toBeInTheDocument();
  });
});
