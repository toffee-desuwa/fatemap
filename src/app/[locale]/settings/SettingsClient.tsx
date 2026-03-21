'use client';

import { Header } from '@/components/layout/Header';
import { ApiKeySettings } from '@/components/settings/ApiKeySettings';

export function SettingsClient() {
  return (
    <div
      data-testid="settings-page"
      className="flex min-h-screen flex-col bg-[var(--color-background)]"
    >
      <Header currentPage="settings" />
      <main className="flex-1">
        <ApiKeySettings />
      </main>
    </div>
  );
}
