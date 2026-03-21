'use client';

import { useMemo, useState } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { SCENARIOS } from '@/lib/scenarios';
import { EventCard } from './EventCard';

const CATEGORIES = [
  'all',
  'military',
  'trade',
  'energy',
  'climate',
  'health',
  'political',
  'economic',
  'technology',
] as const;

interface EventFeedProps {
  onSelectScenario: (eventText: string) => void;
  activeScenarioId?: string;
}

export function EventFeed({ onSelectScenario, activeScenarioId }: EventFeedProps) {
  const t = useTranslations('feed');
  const locale = useLocale();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    let list = SCENARIOS;
    if (selectedCategory !== 'all') {
      list = list.filter((s) => s.category === selectedCategory);
    }
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.nameCn.includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.descriptionZh.includes(q) ||
          s.keywords.some((k) => k.toLowerCase().includes(q))
      );
    }
    return list;
  }, [selectedCategory, search]);

  return (
    <div data-testid="event-feed" className="flex flex-col h-full">
      {/* Header */}
      <div className="px-3 pt-3 pb-2">
        <h2 className="text-sm font-semibold text-[var(--color-foreground)]">
          {t('title')}
        </h2>
      </div>

      {/* Search */}
      <div className="px-3 pb-2">
        <input
          type="text"
          data-testid="feed-search"
          placeholder={t('search')}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-md border border-[var(--color-border)] bg-transparent px-2 py-1 text-xs text-[var(--color-foreground)] placeholder:text-[var(--color-muted)] focus:border-[var(--color-primary)] focus:outline-none"
        />
      </div>

      {/* Category tabs */}
      <div className="flex flex-wrap gap-1 px-3 pb-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            data-testid={`filter-${cat}`}
            onClick={() => setSelectedCategory(cat)}
            className={`rounded-full px-2 py-0.5 text-[10px] transition-colors ${
              selectedCategory === cat
                ? 'bg-[var(--color-primary)] text-white'
                : 'bg-white/5 text-[var(--color-muted)] hover:bg-white/10'
            }`}
          >
            {t(`category.${cat}`)}
          </button>
        ))}
      </div>

      {/* Scenario list */}
      <div className="flex-1 overflow-y-auto px-2 pb-2 space-y-1">
        {filtered.length === 0 ? (
          <div data-testid="feed-empty" className="px-3 py-4 text-xs text-[var(--color-muted)] text-center">
            {t('noResults')}
          </div>
        ) : (
          filtered.map((scenario) => (
            <EventCard
              key={scenario.id}
              scenario={scenario}
              onClick={() => onSelectScenario(scenario.eventText)}
              active={activeScenarioId === scenario.id}
              locale={locale}
            />
          ))
        )}
      </div>
    </div>
  );
}

export { CATEGORIES };
