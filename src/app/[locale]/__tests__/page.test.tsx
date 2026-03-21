/**
 * Tests for the landing page server component.
 * Mocks LandingClient to avoid deck.gl in jsdom.
 */

import { render, screen } from '@testing-library/react';

// Mock LandingClient to avoid deck.gl
jest.mock('../LandingClient', () => ({
  LandingClient: () => <div data-testid="mock-landing-client" />,
}));

import LandingPage from '../page';

describe('LandingPage', () => {
  it('renders LandingClient', async () => {
    const jsx = await LandingPage({ params: Promise.resolve({ locale: 'en' }) });
    render(jsx);
    expect(screen.getByTestId('mock-landing-client')).toBeInTheDocument();
  });

  it('works with zh locale', async () => {
    const jsx = await LandingPage({ params: Promise.resolve({ locale: 'zh' }) });
    render(jsx);
    expect(screen.getByTestId('mock-landing-client')).toBeInTheDocument();
  });
});
