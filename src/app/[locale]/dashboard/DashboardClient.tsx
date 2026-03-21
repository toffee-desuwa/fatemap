'use client';

import dynamic from 'next/dynamic';

const AppShell = dynamic(() => import('@/components/layout/AppShell').then((m) => m.AppShell), {
  ssr: false,
  loading: () => (
    <div
      data-testid="dashboard-loading"
      className="flex h-screen items-center justify-center bg-[var(--color-background)]"
    >
      <div className="text-[var(--color-text-muted)]">Loading...</div>
    </div>
  ),
});

export function DashboardClient() {
  return <AppShell />;
}
