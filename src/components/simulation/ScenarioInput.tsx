'use client';

import { useState, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import type { PresetScenario } from '../../lib/types';
import { SCENARIOS } from '../../lib/scenarios';

const MAX_LENGTH = 1000;

// 6 diverse examples: one each from military, trade, energy, climate, political, technology
const EXAMPLE_IDS = [
  'taiwan-strait-crisis',
  'us-china-trade-war',
  'hormuz-strait-blockade',
  'pacific-mega-typhoon',
  'ukraine-russia-escalation',
  'semiconductor-disruption',
] as const;

const EXAMPLES = EXAMPLE_IDS.map(
  (id) => SCENARIOS.find((s) => s.id === id)!,
);

interface ScenarioInputProps {
  onSimulate: (input: string) => void;
  loading: boolean;
  suggestions?: PresetScenario[];
}

export function ScenarioInput({
  onSimulate,
  loading,
  suggestions,
}: ScenarioInputProps) {
  const t = useTranslations('scenario');
  const [input, setInput] = useState('');

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || loading) return;
    onSimulate(trimmed);
  }, [input, loading, onSimulate]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit],
  );

  const handleExample = useCallback(
    (scenario: PresetScenario) => {
      setInput(scenario.eventText);
      onSimulate(scenario.eventText);
    },
    [onSimulate],
  );

  const handleSuggestion = useCallback(
    (scenario: PresetScenario) => {
      setInput(scenario.eventText);
      onSimulate(scenario.eventText);
    },
    [onSimulate],
  );

  return (
    <div className="flex flex-col gap-3 p-4">
      {/* Input area */}
      <div className="relative">
        <textarea
          value={input}
          onChange={(e) =>
            setInput(e.target.value.slice(0, MAX_LENGTH))
          }
          onKeyDown={handleKeyDown}
          placeholder={t('placeholder')}
          maxLength={MAX_LENGTH}
          rows={3}
          disabled={loading}
          className="w-full resize-none rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-3 pr-16 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-text-secondary)] focus:border-[var(--color-primary)] focus:outline-none disabled:opacity-50"
        />
        <div className="absolute right-2 bottom-2 flex items-center gap-2">
          <span className="text-xs text-[var(--color-text-secondary)]">
            {input.length}/{MAX_LENGTH}
          </span>
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || loading}
            className="rounded-md bg-[var(--color-primary)] px-3 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {t('submit')}
          </button>
        </div>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="text-center text-sm text-[var(--color-primary)] animate-pulse">
          {t('simulating')}
        </div>
      )}

      {/* Suggestion chips */}
      {suggestions && suggestions.length > 0 && !loading && (
        <div className="flex flex-col gap-2">
          <span className="text-xs text-[var(--color-text-secondary)]">
            {t('didYouMean')}
          </span>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((s) => (
              <button
                key={s.id}
                onClick={() => handleSuggestion(s)}
                className="rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1 text-xs text-[var(--color-foreground)] transition-colors hover:border-[var(--color-primary)] hover:bg-[var(--color-surface-hover)]"
              >
                {s.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Example buttons */}
      {!loading && (
        <div className="flex flex-wrap gap-1.5">
          {EXAMPLES.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => handleExample(scenario)}
              className="rounded-md border border-[var(--color-border)] bg-[var(--color-surface)] px-2.5 py-1 text-xs text-[var(--color-text-secondary)] transition-colors hover:border-[var(--color-primary-light)] hover:text-[var(--color-foreground)]"
            >
              {scenario.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
