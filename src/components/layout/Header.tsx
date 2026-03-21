'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { LocaleSwitcher } from './LocaleSwitcher';

export interface HeaderProps {
  currentPage?: 'dashboard' | 'settings';
}

export function Header({ currentPage }: HeaderProps) {
  const t = useTranslations('common');
  const [hasLlmKey, setHasLlmKey] = useState(false);

  useEffect(() => {
    const provider = localStorage.getItem('fatemap-llm-provider');
    const key = localStorage.getItem('fatemap-llm-apikey');
    setHasLlmKey(!!(provider && key));
  }, []);

  return (
    <header
      data-testid="header"
      className="flex h-12 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-surface)] px-4"
    >
      {/* Left: Brand + Nav */}
      <div className="flex items-center gap-6">
        <Link
          href="/dashboard"
          className="text-sm font-bold tracking-wider text-[var(--color-primary)]"
          data-testid="brand"
        >
          {t('appName')}
        </Link>
        <nav className="flex items-center gap-4" data-testid="nav">
          <Link
            href="/dashboard"
            data-testid="nav-dashboard"
            className={`text-xs transition-colors ${
              currentPage === 'dashboard'
                ? 'text-[var(--color-foreground)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-foreground)]'
            }`}
          >
            {t('dashboard')}
          </Link>
          <Link
            href="/settings"
            data-testid="nav-settings"
            className={`text-xs transition-colors ${
              currentPage === 'settings'
                ? 'text-[var(--color-foreground)]'
                : 'text-[var(--color-text-secondary)] hover:text-[var(--color-foreground)]'
            }`}
          >
            {t('settings')}
          </Link>
        </nav>
      </div>

      {/* Right: AI status + Locale + GitHub */}
      <div className="flex items-center gap-3">
        <span
          data-testid="ai-status"
          className="flex items-center gap-1.5 text-xs"
        >
          <span
            className={`inline-block h-2 w-2 rounded-full ${
              hasLlmKey ? 'bg-[#44ff88]' : 'bg-[var(--color-text-secondary)]'
            }`}
          />
          <span className="text-[var(--color-text-secondary)]">
            {hasLlmKey ? t('aiConnected') : t('aiPresetOnly')}
          </span>
        </span>
        <LocaleSwitcher />
        <a
          href="https://github.com"
          target="_blank"
          rel="noopener noreferrer"
          data-testid="github-link"
          className="text-xs text-[var(--color-text-secondary)] hover:text-[var(--color-foreground)] transition-colors"
        >
          {t('github')}
        </a>
      </div>
    </header>
  );
}
