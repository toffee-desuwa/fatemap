'use client';

import type { PresetScenario } from '@/lib/types';

const CATEGORY_ICONS: Record<string, string> = {
  military: '⚔️',
  trade: '📊',
  energy: '⚡',
  climate: '🌍',
  health: '🏥',
  political: '🏛️',
  economic: '💰',
  technology: '💻',
};

interface EventCardProps {
  scenario: PresetScenario;
  onClick: () => void;
  active?: boolean;
  locale?: string;
}

export function EventCard({ scenario, onClick, active, locale }: EventCardProps) {
  const icon = CATEGORY_ICONS[scenario.category] ?? '📌';
  const name = locale === 'zh' ? scenario.nameCn : scenario.name;
  const description = locale === 'zh' ? scenario.descriptionZh : scenario.description;

  return (
    <button
      data-testid={`event-card-${scenario.id}`}
      onClick={onClick}
      className={`w-full text-left px-3 py-2 rounded-md transition-colors text-xs ${
        active
          ? 'bg-[var(--color-primary)]/15 border border-[var(--color-primary)]/40'
          : 'hover:bg-white/5 border border-transparent'
      }`}
    >
      <div className="flex items-start gap-1.5">
        <span className="text-sm leading-none mt-0.5" aria-hidden="true">
          {icon}
        </span>
        <div className="min-w-0 flex-1">
          <div className="font-medium text-[var(--color-foreground)] truncate">
            {name}
          </div>
          <div className="text-[var(--color-muted)] mt-0.5 line-clamp-2 leading-tight">
            {description}
          </div>
        </div>
      </div>
    </button>
  );
}

export { CATEGORY_ICONS };
