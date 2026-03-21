'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import { FateMap } from '@/components/map/FateMap';
import { ScenarioInput } from '@/components/simulation/ScenarioInput';
import { ImpactReport } from '@/components/simulation/ImpactReport';
import { EventFeed } from '@/components/feed/EventFeed';
import { Header } from './Header';

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

  return (
    <div data-testid="app-shell" className="flex h-screen flex-col">
      <Header currentPage="dashboard" />

      <div className="relative flex-1 grid grid-cols-1 md:grid-cols-[1fr_360px] lg:grid-cols-[240px_1fr_360px]">
        {/* Left sidebar — Event Feed (desktop only) */}
        <div className="hidden lg:block border-r border-[var(--color-border)] bg-[var(--color-background)] overflow-hidden">
          <EventFeed
            onSelectScenario={simulate}
            activeScenarioId={activeScenarioId}
          />
        </div>

        {/* Map area */}
        <div className="relative overflow-hidden">
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
              className="absolute top-[180px] inset-x-2 z-10 rounded-md bg-[var(--color-background)]/90 px-4 py-2 text-xs text-[var(--color-primary)] md:hidden"
            >
              {error}
            </div>
          )}

          {/* Mobile: bottom sheet for results */}
          {result && (
            <div data-testid="mobile-report" className="absolute bottom-0 inset-x-0 z-10 max-h-[50vh] overflow-y-auto rounded-t-xl border-t border-[var(--color-border)] bg-[var(--color-background)] shadow-[0_-4px_20px_rgba(0,0,0,0.3)] md:hidden">
              <div className="flex justify-center pt-2 pb-1">
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
        </div>

        {/* Right panel (tablet+ only) */}
        <div className="hidden md:flex flex-col border-l border-[var(--color-border)] bg-[var(--color-background)] overflow-hidden">
          <ScenarioInput
            onSimulate={simulate}
            loading={loading}
            suggestions={suggestions}
          />

          {error && (
            <div
              data-testid="error-message"
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
        </div>
      </div>
    </div>
  );
}
