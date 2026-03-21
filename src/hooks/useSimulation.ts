import { useState, useCallback, useRef } from 'react';
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

  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([]);

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
    async (input: string) => {
      if (!input.trim()) return;

      // Reset state for new simulation
      setError(null);
      setSuggestions([]);

      // 1. Try keyword match
      const preset = matchScenario(input);
      if (preset) {
        setResult(preset.result);
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
        setLoading(true);
        const { result: llmResult, error: llmError } = await analyzeWithLlm(
          input,
          provider,
          apiKey,
        );
        setLoading(false);

        if (llmResult) {
          setResult(llmResult);
          startAnimationCycle();
          return;
        }

        // LLM failed — set error and fall through to suggestions
        setError(llmError ?? 'Unknown LLM error');
      }

      // 3. No match, no key (or LLM failed) — show suggestions
      setResult(null);
      setSuggestions(findClosestScenarios(input, 3));
    },
    [startAnimationCycle],
  );

  const clear = useCallback(() => {
    clearTimers();
    setResult(null);
    setError(null);
    setSuggestions([]);
    setAnimationPhase('idle');
  }, [clearTimers]);

  return { simulate, result, loading, error, suggestions, clear, animationPhase };
}
