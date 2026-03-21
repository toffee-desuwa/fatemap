'use client';

import { useEffect, useRef, useMemo } from 'react';
import type { SimulationResult } from '../../lib/types';
import { COUNTRIES } from '../../lib/countries';
import { CITIES } from '../../lib/cities';
import { AnimatedNumber } from '../charts/AnimatedNumber';

const SEVERITY_ORDER: Record<string, number> = {
  critical: 0,
  high: 1,
  medium: 2,
  low: 3,
};

const SEVERITY_BADGE: Record<string, string> = {
  critical: 'bg-[#ff3344] text-white',
  high: 'bg-[#ff8844] text-white',
  medium: 'bg-[#ffcc44] text-black',
  low: 'bg-[#4488ff] text-white',
};

// ISO alpha-3 → alpha-2 for flag emoji (our 48 countries)
const A3_TO_A2: Record<string, string> = {
  USA: 'US', CAN: 'CA', MEX: 'MX', BRA: 'BR', ARG: 'AR', CHL: 'CL', COL: 'CO', VEN: 'VE',
  GBR: 'GB', FRA: 'FR', DEU: 'DE', ITA: 'IT', ESP: 'ES', NLD: 'NL', POL: 'PL', UKR: 'UA', SWE: 'SE',
  RUS: 'RU', TUR: 'TR', ISR: 'IL', SAU: 'SA', IRN: 'IR', IRQ: 'IQ', ARE: 'AE', QAT: 'QA', EGY: 'EG',
  CHN: 'CN', JPN: 'JP', KOR: 'KR', PRK: 'KP', TWN: 'TW',
  IND: 'IN', PAK: 'PK', BGD: 'BD',
  IDN: 'ID', VNM: 'VN', THA: 'TH', PHL: 'PH', MYS: 'MY', SGP: 'SG', MMR: 'MM',
  KAZ: 'KZ', UZB: 'UZ',
  NGA: 'NG', ZAF: 'ZA', KEN: 'KE', ETH: 'ET',
  AUS: 'AU', NZL: 'NZ',
};

export function countryFlag(alpha3: string): string {
  const alpha2 = A3_TO_A2[alpha3];
  if (!alpha2) return '';
  return String.fromCodePoint(
    ...alpha2.split('').map((c) => 0x1f1e6 + c.charCodeAt(0) - 65),
  );
}

const countryMap = new Map(COUNTRIES.map((c) => [c.id, c]));
const cityMap = new Map(CITIES.map((c) => [c.id, c]));

interface ImpactReportProps {
  result: SimulationResult;
  selectedCountryId?: string;
  onCountryClick?: (countryId: string) => void;
  onClear?: () => void;
}

export function ImpactReport({
  result,
  selectedCountryId,
  onCountryClick,
  onClear,
}: ImpactReportProps) {
  const rowRefs = useRef<Map<string, HTMLDivElement>>(new Map());

  const sortedCountryImpacts = useMemo(
    () =>
      [...result.countryImpacts].sort(
        (a, b) =>
          (SEVERITY_ORDER[a.severity] ?? 9) -
          (SEVERITY_ORDER[b.severity] ?? 9),
      ),
    [result.countryImpacts],
  );

  // Scroll to selected country
  useEffect(() => {
    if (!selectedCountryId) return;
    const el = rowRefs.current.get(selectedCountryId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  }, [selectedCountryId]);

  const epicenterCountry = countryMap.get(result.epicenter.countryId);

  return (
    <div
      data-testid="impact-report"
      className="flex flex-col gap-4 p-4 overflow-y-auto"
    >
      {/* Event summary */}
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between">
          <h3
            data-testid="event-title"
            className="text-sm font-semibold text-[var(--color-foreground)]"
          >
            {result.event}
          </h3>
          {onClear && (
            <button
              onClick={onClear}
              data-testid="clear-button"
              className="shrink-0 ml-2 text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-foreground)] transition-colors"
            >
              ✕
            </button>
          )}
        </div>
        {epicenterCountry && (
          <span
            data-testid="epicenter"
            className="text-xs text-[var(--color-text-secondary)]"
          >
            Epicenter: {countryFlag(epicenterCountry.id)}{' '}
            {epicenterCountry.name}
          </span>
        )}
        <p
          data-testid="summary"
          className="text-xs text-[var(--color-text-secondary)] leading-relaxed"
        >
          {result.summary}
        </p>
      </div>

      {/* Country impacts */}
      <div className="flex flex-col gap-1">
        <h4
          data-testid="country-heading"
          className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider"
        >
          Country Impacts ({sortedCountryImpacts.length})
        </h4>
        <div className="flex flex-col gap-0.5">
          {sortedCountryImpacts.map((impact, i) => {
            const country = countryMap.get(impact.countryId);
            if (!country) return null;
            const isSelected = impact.countryId === selectedCountryId;
            return (
              <div
                key={impact.countryId}
                ref={(el) => {
                  if (el) rowRefs.current.set(impact.countryId, el);
                }}
                data-testid={`country-row-${impact.countryId}`}
                onClick={() => onCountryClick?.(impact.countryId)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ')
                    onCountryClick?.(impact.countryId);
                }}
                style={{ animationDelay: `${i * 100}ms` }}
                className={`flex items-center gap-2 rounded-md px-2 py-1.5 text-xs cursor-pointer transition-colors animate-[fadeSlideIn_300ms_ease-out_both] ${
                  isSelected
                    ? 'bg-[var(--color-surface-hover)] ring-1 ring-[var(--color-primary)]'
                    : 'hover:bg-[var(--color-surface-hover)]'
                }`}
              >
                <span className="shrink-0 w-6 text-center">
                  {countryFlag(impact.countryId)}
                </span>
                <span className="flex-1 min-w-0 truncate text-[var(--color-foreground)]">
                  {country.name}
                </span>
                <span
                  data-testid={`severity-${impact.countryId}`}
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${SEVERITY_BADGE[impact.severity] ?? ''}`}
                >
                  {impact.severity}
                </span>
                <span
                  className={`shrink-0 w-10 text-right font-mono ${
                    impact.direction === 'positive'
                      ? 'text-[#44ff88]'
                      : 'text-[var(--color-foreground)]'
                  }`}
                >
                  <AnimatedNumber
                    value={impact.impactPercent}
                    prefix={impact.impactPercent > 0 ? '+' : ''}
                    suffix="%"
                  />
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected country reason */}
      {selectedCountryId &&
        (() => {
          const impact = result.countryImpacts.find(
            (ci) => ci.countryId === selectedCountryId,
          );
          if (!impact) return null;
          return (
            <div
              data-testid="selected-reason"
              className="rounded-md bg-[var(--color-surface)] p-2 text-xs text-[var(--color-text-secondary)] leading-relaxed"
            >
              {impact.reason}
            </div>
          );
        })()}

      {/* City impacts */}
      {result.cityImpacts.length > 0 && (
        <div className="flex flex-col gap-1">
          <h4
            data-testid="city-heading"
            className="text-xs font-semibold text-[var(--color-text-secondary)] uppercase tracking-wider"
          >
            City Impacts ({result.cityImpacts.length})
          </h4>
          <div className="flex flex-col gap-0.5">
            {result.cityImpacts.map((impact, i) => {
              const city = cityMap.get(impact.cityId);
              if (!city) return null;
              return (
                <div
                  key={impact.cityId}
                  data-testid={`city-row-${impact.cityId}`}
                  style={{
                    animationDelay: `${(sortedCountryImpacts.length + i) * 100}ms`,
                  }}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-xs animate-[fadeSlideIn_300ms_ease-out_both]"
                >
                  <span className="shrink-0 w-6 text-center">
                    {countryFlag(city.countryId)}
                  </span>
                  <span className="flex-1 min-w-0 truncate text-[var(--color-foreground)]">
                    {city.name}
                  </span>
                  <span
                    data-testid={`city-severity-${impact.cityId}`}
                    className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-semibold uppercase ${SEVERITY_BADGE[impact.severity] ?? ''}`}
                  >
                    {impact.severity}
                  </span>
                  <span className="shrink-0 text-[10px] text-[var(--color-text-secondary)]">
                    {impact.impactType.replace(/_/g, ' ')}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
