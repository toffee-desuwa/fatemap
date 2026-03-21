import { render, screen } from '@testing-library/react';

// Use globalThis to capture dynamic import options (jest.mock is hoisted above variable declarations)
jest.mock('next/dynamic', () => {
  return (
    _loader: () => Promise<{ default: React.ComponentType }>,
    options?: { ssr?: boolean; loading?: () => React.ReactNode },
  ) => {
    (globalThis as Record<string, unknown>).__dashboardDynamicOptions = options;
    return function DynamicAppShell() {
      return <div data-testid="dynamic-app-shell" />;
    };
  };
});

import { DashboardClient } from '../DashboardClient';

function getDynamicOptions() {
  return (globalThis as Record<string, unknown>).__dashboardDynamicOptions as {
    ssr?: boolean;
    loading?: () => React.ReactNode;
  };
}

describe('DashboardClient', () => {
  it('renders dynamic AppShell', () => {
    render(<DashboardClient />);
    expect(screen.getByTestId('dynamic-app-shell')).toBeInTheDocument();
  });

  it('disables SSR for deck.gl compatibility', () => {
    expect(getDynamicOptions().ssr).toBe(false);
  });

  it('provides a loading fallback with correct content', () => {
    const opts = getDynamicOptions();
    expect(opts.loading).toBeDefined();
    const { container } = render(<>{opts.loading!()}</>);
    expect(container.textContent).toContain('Loading...');
  });

  it('loading fallback has dashboard-loading test ID', () => {
    render(<>{getDynamicOptions().loading!()}</>);
    expect(screen.getByTestId('dashboard-loading')).toBeInTheDocument();
  });
});
