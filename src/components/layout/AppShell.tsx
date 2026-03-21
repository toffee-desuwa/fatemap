'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { useSimulation } from '@/hooks/useSimulation';
import { FateMap } from '@/components/map/FateMap';
import { ScenarioInput } from '@/components/simulation/ScenarioInput';
import { ImpactReport } from '@/components/simulation/ImpactReport';
import { Header } from './Header';

export function AppShell() {
  const { simulate, result, loading, error, suggestions, clear, animationPhase } =
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

      <div className="relative flex-1 grid grid-cols-[1fr_360px]">
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
        </div>

        {/* Right panel */}
        <div className="flex flex-col border-l border-[var(--color-border)] bg-[var(--color-background)] overflow-hidden">
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
