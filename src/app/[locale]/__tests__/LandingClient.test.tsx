/**
 * Tests for LandingClient — the landing page content component.
 * Mocks next/dynamic to avoid deck.gl in jsdom.
 */

import { render, screen } from '@testing-library/react';

// Mock dynamic import to avoid deck.gl
jest.mock('next/dynamic', () => {
  return function mockDynamic() {
    return function MockHeroMapLoader() {
      return <div data-testid="mock-hero-map-loader" />;
    };
  };
});

import { LandingClient } from '../LandingClient';

describe('LandingClient', () => {
  beforeEach(() => {
    render(<LandingClient />);
  });

  it('renders hero section', () => {
    expect(screen.getByTestId('hero-section')).toBeInTheDocument();
  });

  it('renders app name in hero title', () => {
    expect(screen.getByTestId('hero-title')).toHaveTextContent('FateMap');
  });

  it('renders tagline', () => {
    expect(screen.getByTestId('hero-tagline')).toHaveTextContent('Input any event');
  });

  it('renders hero CTA linking to dashboard', () => {
    const cta = screen.getByTestId('hero-cta');
    expect(cta).toHaveTextContent('Try It Now');
    expect(cta).toHaveAttribute('href', '/dashboard');
  });

  it('renders features section', () => {
    expect(screen.getByTestId('features-section')).toBeInTheDocument();
  });

  it('renders 6 feature cards', () => {
    for (let i = 1; i <= 6; i++) {
      expect(screen.getByTestId(`feature-card-${i}`)).toBeInTheDocument();
    }
  });

  it('renders feature card titles', () => {
    expect(screen.getByText('28 Preset Scenarios')).toBeInTheDocument();
    expect(screen.getByText('AI-Powered Analysis')).toBeInTheDocument();
    expect(screen.getByText('Real-Time Visualization')).toBeInTheDocument();
    expect(screen.getByText('142 Relationships')).toBeInTheDocument();
    expect(screen.getByText('Bilingual Interface')).toBeInTheDocument();
    expect(screen.getAllByText('Open Source').length).toBeGreaterThanOrEqual(1);
  });

  it('renders feature card descriptions', () => {
    expect(screen.getByText(/28 preset geopolitical scenarios/i)).toBeInTheDocument();
    expect(screen.getByText(/Bring your own API key/i)).toBeInTheDocument();
  });

  it('renders tech section with badges', () => {
    expect(screen.getByTestId('tech-section')).toBeInTheDocument();
    expect(screen.getByTestId('tech-badge-techDeckgl')).toHaveTextContent('deck.gl WebGL');
    expect(screen.getByTestId('tech-badge-techAi')).toHaveTextContent('BYOK AI');
    expect(screen.getByTestId('tech-badge-techOpenSource')).toHaveTextContent('Open Source');
  });

  it('renders bottom CTA linking to dashboard', () => {
    const cta = screen.getByTestId('bottom-cta');
    expect(cta).toHaveTextContent('Try It Now');
    expect(cta).toHaveAttribute('href', '/dashboard');
  });

  it('renders footer', () => {
    expect(screen.getByTestId('footer')).toHaveTextContent('FateMap');
  });

  it('renders hero map loader', () => {
    expect(screen.getByTestId('mock-hero-map-loader')).toBeInTheDocument();
  });

  it('has scroll indicator hidden on mobile', () => {
    const hero = screen.getByTestId('hero-section');
    const scrollContainer = hero.querySelector('.animate-bounce');
    expect(scrollContainer).toBeInTheDocument();
    expect(scrollContainer?.className).toContain('hidden');
    expect(scrollContainer?.className).toContain('md:block');
  });

  // --- Responsive ---

  it('hero section uses 60vh on mobile, full screen on md+', () => {
    const hero = screen.getByTestId('hero-section');
    expect(hero.className).toContain('h-[60vh]');
    expect(hero.className).toContain('md:h-screen');
  });

  it('hero title uses smaller text on mobile', () => {
    const title = screen.getByTestId('hero-title');
    expect(title.className).toContain('text-4xl');
    expect(title.className).toContain('lg:text-8xl');
  });
});
