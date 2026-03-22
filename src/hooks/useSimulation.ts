import { useState, useCallback, useRef, useEffect } from 'react';
import type {
  SimulationResult,
  PresetScenario,
  AnimationPhase,
} from '../lib/types';
import { matchScenario, findClosestScenarios } from '../lib/keyword-analyzer';
import { analyzeWithLlm } from '../lib/llm-analyzer';
import { getProvider } from '../lib/llm-providers';

const RIPPLE_DURATION = 2000;
const NETWORK_DURATION = 3000; // 5s total from start

export function useSimulation() {
  const [result, setResult] = useState<SimulationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<PresetScenario[]>([]);
  const [animationPhase, setAnimationPhase] = useState<AnimationPhase>('idle');
  const [activeScenarioId, setActiveScenarioId] = useState<string | undefined>();

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);
  const abortRef = useRef<AbortController | null>(null);

  const clearTimers = useCallback(() => {
    for (const t of timersRef.current) clearTimeout(t);
    timersRef.current = [];
  }, []);

  const startAnimationCycle = useCallback(() => {
    clearTimers();
    setAnimationPhase('ripple');

    const t1 = setTimeout(() => setAnimationPhase('network'), RIPPLE_DURATION);
    const t2 = setTimeout(
      () => setAnimationPhase('persistent'),
      RIPPLE_DURATION + NETWORK_DURATION,
    );
    timersRef.current = [t1, t2];
  }, [clearTimers]);

  const simulate = useCallback(
    async (input: string, directPreset?: PresetScenario) => {
      if (!input.trim()) return;

      // Reset state for new simulation
      setError(null);
      setSuggestions([]);

      // 1. Use direct preset if provided (from chips/feed click), else keyword match
      const preset = directPreset ?? matchScenario(input);
      if (preset) {
        setResult(preset.result);
        setActiveScenarioId(preset.id);
        setLoading(false);
        startAnimationCycle();
        return;
      }

      // 2. Check for LLM key
      const providerId =
        typeof window !== 'undefined'
          ? localStorage.getItem('fatemap-llm-provider')
          : null;
      const apiKey =
        typeof window !== 'undefined'
          ? localStorage.getItem('fatemap-llm-apikey')
          : null;
      const provider = providerId ? getProvider(providerId) : undefined;

      if (provider && apiKey) {
        // Abort any in-flight LLM request before starting a new one
        abortRef.current?.abort();
        abortRef.current = new AbortController();

        setLoading(true);
        try {
          const { result: llmResult, error: llmError } = await analyzeWithLlm(
            input,
            provider,
            apiKey,
            abortRef.current.signal,
          );
          setLoading(false);

          if (llmResult) {
            setResult(llmResult);
            setActiveScenarioId(undefined);
            startAnimationCycle();
            return;
          }

          // LLM failed — set error and fall through to suggestions
          setError(llmError ?? 'Unknown LLM error');
        } catch (err) {
          // Silently ignore AbortError — means a newer request superseded this one
          if (err instanceof DOMException && err.name === 'AbortError') {
            return;
          }
          setLoading(false);
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      }

      // 3. No match, no key (or LLM failed) — show suggestions
      setResult(null);
      setSuggestions(findClosestScenarios(input, 3));
    },
    [startAnimationCycle],
  );

  const clear = useCallback(() => {
    abortRef.current?.abort();
    abortRef.current = null;
    clearTimers();
    setResult(null);
    setError(null);
    setSuggestions([]);
    setAnimationPhase('idle');
    setActiveScenarioId(undefined);
  }, [clearTimers]);

  // Abort any in-flight LLM request on unmount
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  return { simulate, result, loading, error, suggestions, clear, animationPhase, activeScenarioId };
}
