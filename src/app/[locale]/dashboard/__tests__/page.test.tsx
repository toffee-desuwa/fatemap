import { render, screen } from '@testing-library/react';

// Mock DashboardClient to avoid deck.gl in jsdom
jest.mock('../DashboardClient', () => ({
  DashboardClient: () => <div data-testid="mock-dashboard-client" />,
}));

import DashboardPage from '../page';

describe('DashboardPage', () => {
  it('renders DashboardClient', async () => {
    const jsx = await DashboardPage({ params: Promise.resolve({ locale: 'en' }) });
    render(jsx);
    expect(screen.getByTestId('mock-dashboard-client')).toBeInTheDocument();
  });

  it('works with zh locale', async () => {
    const jsx = await DashboardPage({ params: Promise.resolve({ locale: 'zh' }) });
    render(jsx);
    expect(screen.getByTestId('mock-dashboard-client')).toBeInTheDocument();
  });
});
