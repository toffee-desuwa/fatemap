import { renderHook, act } from '@testing-library/react';
import { useSimulation } from '../useSimulation';
import type { SimulationResult, PresetScenario } from '../../lib/types';

// Mock keyword-analyzer
const mockMatchScenario = jest.fn<PresetScenario | null, [string]>();
const mockFindClosest = jest.fn<PresetScenario[], [string, number?]>();
jest.mock('../../lib/keyword-analyzer', () => ({
  matchScenario: (...args: [string]) => mockMatchScenario(...args),
  findClosestScenarios: (...args: [string, number?]) =>
    mockFindClosest(...args),
}));

// Mock llm-analyzer
const mockAnalyzeWithLlm = jest.fn();
jest.mock('../../lib/llm-analyzer', () => ({
  analyzeWithLlm: (...args: unknown[]) => mockAnalyzeWithLlm(...args),
}));

// Mock llm-providers
jest.mock('../../lib/llm-providers', () => ({
  getProvider: (id: string) =>
    id === 'deepseek'
      ? {
          id: 'deepseek',
          name: 'DeepSeek',
          baseUrl: 'https://api.deepseek.com',
          model: 'deepseek-chat',
          format: 'openai',
          buildHeaders: () => ({}),
        }
      : undefined,
}));

const fakeResult: SimulationResult = {
  event: 'Test event',
  timestamp: '2026-01-01T00:00:00Z',
  epicenter: { countryId: 'CHN', coordinates: [121.5, 25.0] },
  countryImpacts: [
    {
      countryId: 'CHN',
      severity: 'critical',
      direction: 'negative',
      impactPercent: -40,
      reason: 'Direct impact',
      reasonZh: '直接影响',
    },
  ],
  cityImpacts: [
    {
      cityId: 'taipei',
      severity: 'critical',
      direction: 'negative',
      impactType: 'military_threat',
    },
  ],
  activatedRelationships: ['USA-CHN-trade'],
  summary: 'Test summary',
  summaryZh: '测试摘要',
};

const fakeScenario: PresetScenario = {
  id: 'taiwan-strait-crisis',
  name: 'Taiwan Strait Crisis',
  nameCn: '台海危机',
  category: 'military',
  description: 'A military conflict in the Taiwan Strait',
  descriptionZh: '台湾海峡军事冲突',
  eventText: 'What if Mainland China initiates a military blockade of Taiwan?',
  keywords: ['Taiwan', 'Strait', 'military', 'conflict', '台湾', '海峡'],
  result: fakeResult,
};

const fakeSuggestions: PresetScenario[] = [
  { ...fakeScenario, id: 'suggestion-1', name: 'Suggestion 1' },
  { ...fakeScenario, id: 'suggestion-2', name: 'Suggestion 2' },
  { ...fakeScenario, id: 'suggestion-3', name: 'Suggestion 3' },
];

describe('useSimulation', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.clearAllMocks();
    localStorage.clear();
    mockMatchScenario.mockReturnValue(null);
    mockFindClosest.mockReturnValue([]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('starts in idle state with no result', () => {
    const { result } = renderHook(() => useSimulation());
    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.animationPhase).toBe('idle');
    expect(result.current.activeScenarioId).toBeUndefined();
  });

  it('returns preset result instantly on keyword match', async () => {
    mockMatchScenario.mockReturnValue(fakeScenario);
    const { result } = renderHook(() => useSimulation());

    await act(async () => {
      await result.current.simulate('Taiwan Strait conflict');
    });

    expect(result.current.result).toEqual(fakeResult);
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.activeScenarioId).toBe('taiwan-strait-crisis');
  });

  it('returns suggestions when no match and no LLM key', async () => {
    mockMatchScenario.mockReturnValue(null);
    mockFindClosest.mockReturnValue(fakeSuggestions);
    const { result } = renderHook(() => useSimulation());

    await act(async () => {
      await result.current.simulate('random unknown scenario');
    });

    expect(result.current.result).toBeNull();
    expect(result.current.suggestions).toHaveLength(3);
    expect(result.current.loading).toBe(false);
  });

  it('calls LLM analyzer when no match but key is configured', async () => {
    mockMatchScenario.mockReturnValue(null);
    mockAnalyzeWithLlm.mockResolvedValue({ result: fakeResult });
    localStorage.setItem('fatemap-llm-provider', 'deepseek');
    localStorage.setItem('fatemap-llm-apikey', 'sk-test-key');

    const { result } = renderHook(() => useSimulation());

    await act(async () => {
      await result.current.simulate('custom geopolitical scenario');
    });

    expect(mockAnalyzeWithLlm).toHaveBeenCalledTimes(1);
    expect(result.current.result).toEqual(fakeResult);
    expect(result.current.loading).toBe(false);
  });

  it('sets error and suggestions when LLM fails', async () => {
    mockMatchScenario.mockReturnValue(null);
    mockFindClosest.mockReturnValue(fakeSuggestions);
    mockAnalyzeWithLlm.mockResolvedValue({
      result: null,
      error: 'API error: 429 Too Many Requests',
    });
    localStorage.setItem('fatemap-llm-provider', 'deepseek');
    localStorage.setItem('fatemap-llm-apikey', 'sk-test-key');

    const { result } = renderHook(() => useSimulation());

    await act(async () => {
      await result.current.simulate('some scenario');
    });

    expect(result.current.error).toBe('API error: 429 Too Many Requests');
    expect(result.current.suggestions).toHaveLength(3);
    expect(result.current.result).toBeNull();
  });

  it('transitions animation phases: idle → ripple → network → persistent', async () => {
    mockMatchScenario.mockReturnValue(fakeScenario);
    const { result } = renderHook(() => useSimulation());

    await act(async () => {
      await result.current.simulate('Taiwan Strait conflict');
    });

    // Immediately after simulate, should be in ripple phase
    expect(result.current.animationPhase).toBe('ripple');

    // After 2s → network
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.animationPhase).toBe('network');

    // After another 3s (5s total) → persistent
    act(() => {
      jest.advanceTimersByTime(3000);
    });
    expect(result.current.animationPhase).toBe('persistent');
  });

  it('clear() resets all state back to idle', async () => {
    mockMatchScenario.mockReturnValue(fakeScenario);
    const { result } = renderHook(() => useSimulation());

    await act(async () => {
      await result.current.simulate('Taiwan Strait conflict');
    });
    expect(result.current.result).not.toBeNull();

    act(() => {
      result.current.clear();
    });

    expect(result.current.result).toBeNull();
    expect(result.current.error).toBeNull();
    expect(result.current.suggestions).toEqual([]);
    expect(result.current.animationPhase).toBe('idle');
    expect(result.current.activeScenarioId).toBeUndefined();
  });

  it('sets activeScenarioId on preset match', async () => {
    mockMatchScenario.mockReturnValue(fakeScenario);
    const { result } = renderHook(() => useSimulation());

    await act(async () => {
      await result.current.simulate('Taiwan');
    });

    expect(result.current.activeScenarioId).toBe('taiwan-strait-crisis');
  });

  it('clears activeScenarioId on LLM result', async () => {
    // First set active via preset
    mockMatchScenario.mockReturnValueOnce(fakeScenario);
    const { result } = renderHook(() => useSimulation());

    await act(async () => {
      await result.current.simulate('Taiwan');
    });
    expect(result.current.activeScenarioId).toBe('taiwan-strait-crisis');

    // Then LLM result
    mockMatchScenario.mockReturnValueOnce(null);
    mockAnalyzeWithLlm.mockResolvedValue({ result: fakeResult });
    localStorage.setItem('fatemap-llm-provider', 'deepseek');
    localStorage.setItem('fatemap-llm-apikey', 'sk-test-key');

    await act(async () => {
      await result.current.simulate('custom scenario');
    });
    expect(result.current.activeScenarioId).toBeUndefined();
  });

  it('sets loading=true during LLM call', async () => {
    mockMatchScenario.mockReturnValue(null);
    localStorage.setItem('fatemap-llm-provider', 'deepseek');
    localStorage.setItem('fatemap-llm-apikey', 'sk-test-key');

    let resolvePromise: (v: { result: SimulationResult }) => void;
    mockAnalyzeWithLlm.mockReturnValue(
      new Promise((resolve) => {
        resolvePromise = resolve;
      }),
    );

    const { result } = renderHook(() => useSimulation());

    let simulatePromise: Promise<void>;
    act(() => {
      simulatePromise = result.current.simulate('custom scenario');
    });

    // Loading should be true while waiting
    expect(result.current.loading).toBe(true);

    await act(async () => {
      resolvePromise!({ result: fakeResult });
      await simulatePromise!;
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.result).toEqual(fakeResult);
  });

  it('does nothing for empty input', async () => {
    const { result } = renderHook(() => useSimulation());

    await act(async () => {
      await result.current.simulate('');
    });

    expect(result.current.result).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(mockMatchScenario).not.toHaveBeenCalled();
  });

  it('aborts previous LLM request when simulate is called again rapidly', async () => {
    mockMatchScenario.mockReturnValue(null);
    localStorage.setItem('fatemap-llm-provider', 'deepseek');
    localStorage.setItem('fatemap-llm-apikey', 'sk-test-key');

    // Track all signals passed to analyzeWithLlm
    const signals: (AbortSignal | undefined)[] = [];
    let resolveFirst: (v: { result: SimulationResult | null }) => void;
    let resolveSecond: (v: { result: SimulationResult }) => void;

    mockAnalyzeWithLlm
      .mockImplementationOnce(
        (
          _input: string,
          _provider: unknown,
          _key: string,
          signal?: AbortSignal,
        ) => {
          signals.push(signal);
          return new Promise((resolve) => {
            resolveFirst = resolve;
          });
        },
      )
      .mockImplementationOnce(
        (
          _input: string,
          _provider: unknown,
          _key: string,
          signal?: AbortSignal,
        ) => {
          signals.push(signal);
          return new Promise((resolve) => {
            resolveSecond = resolve;
          });
        },
      );

    const { result } = renderHook(() => useSimulation());

    // Fire first simulation (don't await — it's in-flight)
    let firstPromise: Promise<void>;
    act(() => {
      firstPromise = result.current.simulate('scenario A');
    });

    // Fire second simulation immediately — should abort the first
    let secondPromise: Promise<void>;
    act(() => {
      secondPromise = result.current.simulate('scenario B');
    });

    expect(mockAnalyzeWithLlm).toHaveBeenCalledTimes(2);
    // The first request's signal should now be aborted
    expect(signals[0]?.aborted).toBe(true);
    // The second request's signal should still be active
    expect(signals[1]?.aborted).toBe(false);

    // Resolve both to clean up
    await act(async () => {
      resolveFirst!({ result: null });
      resolveSecond!({ result: fakeResult });
      await firstPromise!;
      await secondPromise!;
    });

    // Only the second result should be set
    expect(result.current.result).toEqual(fakeResult);
  });

  it('silently ignores AbortError without setting error state', async () => {
    mockMatchScenario.mockReturnValue(null);
    localStorage.setItem('fatemap-llm-provider', 'deepseek');
    localStorage.setItem('fatemap-llm-apikey', 'sk-test-key');

    // First call rejects with AbortError
    mockAnalyzeWithLlm.mockImplementationOnce(() => {
      const err = new DOMException('The operation was aborted.', 'AbortError');
      return Promise.reject(err);
    });

    // Second call succeeds
    mockAnalyzeWithLlm.mockResolvedValueOnce({ result: fakeResult });

    const { result } = renderHook(() => useSimulation());

    // Fire simulation that will be aborted
    await act(async () => {
      await result.current.simulate('scenario A');
    });

    // Error should NOT be set — AbortError is silently ignored
    expect(result.current.error).toBeNull();
    // Result should be null since the aborted call returned early
    // and didn't fall through to suggestions (the `return` in catch)
    expect(result.current.result).toBeNull();
  });

  it('sets error state on non-AbortError exception during LLM call', async () => {
    mockMatchScenario.mockReturnValue(null);
    mockFindClosest.mockReturnValue(fakeSuggestions);
    localStorage.setItem('fatemap-llm-provider', 'deepseek');
    localStorage.setItem('fatemap-llm-apikey', 'sk-test-key');

    const fetchError = new TypeError('Failed to fetch');
    mockAnalyzeWithLlm.mockReset();
    mockAnalyzeWithLlm.mockImplementation(() => Promise.reject(fetchError));

    const { result } = renderHook(() => useSimulation());

    await act(async () => {
      await result.current.simulate('some scenario');
    });

    // Verify the mock was actually called
    expect(mockAnalyzeWithLlm).toHaveBeenCalledTimes(1);
    expect(result.current.error).toBe('Failed to fetch');
    expect(result.current.loading).toBe(false);
    expect(result.current.result).toBeNull();
    expect(result.current.suggestions).toHaveLength(3);
  });

  it('clears previous timers when simulating again', async () => {
    mockMatchScenario.mockReturnValue(fakeScenario);
    const { result } = renderHook(() => useSimulation());

    // First simulation
    await act(async () => {
      await result.current.simulate('Taiwan Strait conflict');
    });
    expect(result.current.animationPhase).toBe('ripple');

    // Advance 1s into first animation
    act(() => {
      jest.advanceTimersByTime(1000);
    });

    // New simulation resets phase cycle
    await act(async () => {
      await result.current.simulate('Taiwan Strait conflict');
    });
    expect(result.current.animationPhase).toBe('ripple');

    // Full 2s from new simulation → network
    act(() => {
      jest.advanceTimersByTime(2000);
    });
    expect(result.current.animationPhase).toBe('network');
  });
});
