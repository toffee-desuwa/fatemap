'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import { FateMap } from '@/components/map/FateMap';
import { ScenarioInput } from '@/components/simulation/ScenarioInput';
import { ImpactReport } from '@/components/simulation/ImpactReport';
import { EventFeed } from '@/components/feed/EventFeed';
import { Header } from './Header';
import type { PresetScenario } from '@/lib/types';

export function AppShell() {
  const { simulate, result, loading, error, suggestions, clear, animationPhase, activeScenarioId } =
    useSimulation();
  const [selectedCountryId, setSelectedCountryId] = useState<string | undefined>();
  const [showFlash, setShowFlash] = useState(false);
  const prevPhaseRef = useRef(animationPhase);

  // Flash effect on idle → ripple transition
  useEffect(() => {
    if (prevPhaseRef.current === 'idle' && animationPhase === 'ripple') {
      setShowFlash(true);
      const timer = setTimeout(() => setShowFlash(false), 150);
      return () => clearTimeout(timer);
    }
    prevPhaseRef.current = animationPhase;
  }, [animationPhase]);

  const handleCountryClick = useCallback((countryId: string) => {
    setSelectedCountryId((prev) => (prev === countryId ? undefined : countryId));
  }, []);

  const handleClear = useCallback(() => {
    clear();
    setSelectedCountryId(undefined);
  }, [clear]);

  const handleSelectScenario = useCallback((scenario: PresetScenario) => {
    simulate(scenario.eventText, scenario);
  }, [simulate]);

  return (
    <div data-testid="app-shell" className="flex h-screen flex-col">
      <Header currentPage="dashboard" />

      <div className="relative flex-1 min-h-0 grid grid-cols-1 md:grid-cols-[1fr_360px] lg:grid-cols-[240px_1fr_360px]">
        {/* Left sidebar — Event Feed (desktop only) */}
        <aside className="hidden lg:block border-r border-[var(--color-border)] bg-[var(--color-background)] overflow-hidden">
          <EventFeed
            onSelectScenario={handleSelectScenario}
            activeScenarioId={activeScenarioId}
          />
        </aside>

        {/* Map area */}
        <main className="relative overflow-hidden">
          <FateMap
            simulationResult={result}
            animationPhase={animationPhase}
            onCountryClick={handleCountryClick}
            onCityClick={() => {}}
          />

          {/* Flash overlay */}
          {showFlash && (
            <div
              data-testid="flash-overlay"
              className="pointer-events-none absolute inset-0 animate-[flashPulse_150ms_ease-out_forwards] bg-white"
            />
          )}

          {/* Mobile: floating input at top */}
          <div data-testid="mobile-input" className="absolute top-2 inset-x-2 z-10 rounded-lg bg-[var(--color-background)]/90 backdrop-blur-sm shadow-lg md:hidden">
            <ScenarioInput
              onSimulate={simulate}
              loading={loading}
              suggestions={suggestions}
            />
          </div>

          {/* Mobile: error below input */}
          {error && (
            <div
              data-testid="mobile-error"
              aria-live="assertive"
              role="alert"
              className="absolute inset-x-2 z-10 rounded-md bg-[var(--color-background)]/90 px-4 py-2 text-xs text-[var(--color-primary)] md:hidden"
              style={{ top: 'calc(env(safe-area-inset-top, 0px) + 4.5rem)' }}
            >
              {error}
            </div>
          )}

          {/* Mobile: bottom sheet for results */}
          {result && (
            <div data-testid="mobile-report" className="absolute bottom-0 inset-x-0 z-10 max-h-[50vh] overflow-y-auto rounded-t-xl border-t border-[var(--color-border)] bg-[var(--color-background)] shadow-[0_-4px_20px_rgba(0,0,0,0.3)] md:hidden">
              <div className="flex justify-center py-1 min-h-[44px] items-center cursor-grab">
                <div className="h-1 w-8 rounded-full bg-[var(--color-text-secondary)]/40" />
              </div>
              <ImpactReport
                result={result}
                selectedCountryId={selectedCountryId}
                onCountryClick={handleCountryClick}
                onClear={handleClear}
              />
            </div>
          )}
        </main>

        {/* Right panel (tablet+ only) */}
        <aside className="hidden md:flex flex-col border-l border-[var(--color-border)] bg-[var(--color-background)] overflow-hidden">
          <ScenarioInput
            onSimulate={simulate}
            loading={loading}
            suggestions={suggestions}
          />

          {error && (
            <div
              data-testid="error-message"
              aria-live="assertive"
              role="alert"
              className="px-4 pb-2 text-xs text-[var(--color-primary)]"
            >
              {error}
            </div>
          )}

          {result && (
            <div className="flex-1 overflow-y-auto">
              <ImpactReport
                result={result}
                selectedCountryId={selectedCountryId}
                onCountryClick={handleCountryClick}
                onClear={handleClear}
              />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
