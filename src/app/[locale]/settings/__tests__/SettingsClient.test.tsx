import { render, screen } from '@testing-library/react';

// Mock Header and ApiKeySettings to isolate
jest.mock('@/components/layout/Header', () => ({
  Header: ({ currentPage }: { currentPage?: string }) => (
    <div data-testid="mock-header" data-current-page={currentPage} />
  ),
}));

jest.mock('@/components/settings/ApiKeySettings', () => ({
  ApiKeySettings: () => <div data-testid="mock-api-key-settings" />,
}));

import { SettingsClient } from '../SettingsClient';

describe('SettingsClient', () => {
  it('renders settings page container', () => {
    render(<SettingsClient />);
    expect(screen.getByTestId('settings-page')).toBeInTheDocument();
  });

  it('renders Header with currentPage=settings', () => {
    render(<SettingsClient />);
    const header = screen.getByTestId('mock-header');
    expect(header).toHaveAttribute('data-current-page', 'settings');
  });

  it('renders ApiKeySettings', () => {
    render(<SettingsClient />);
    expect(screen.getByTestId('mock-api-key-settings')).toBeInTheDocument();
  });
});
