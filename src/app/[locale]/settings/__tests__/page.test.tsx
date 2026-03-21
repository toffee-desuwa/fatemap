import { render, screen } from '@testing-library/react';

// Mock SettingsClient to avoid deck.gl / localStorage in jsdom
jest.mock('../SettingsClient', () => ({
  SettingsClient: () => <div data-testid="mock-settings-client" />,
}));

import SettingsPage from '../page';

describe('SettingsPage', () => {
  it('renders SettingsClient', async () => {
    const jsx = await SettingsPage({ params: Promise.resolve({ locale: 'en' }) });
    render(jsx);
    expect(screen.getByTestId('mock-settings-client')).toBeInTheDocument();
  });

  it('works with zh locale', async () => {
    const jsx = await SettingsPage({ params: Promise.resolve({ locale: 'zh' }) });
    render(jsx);
    expect(screen.getByTestId('mock-settings-client')).toBeInTheDocument();
  });
});
