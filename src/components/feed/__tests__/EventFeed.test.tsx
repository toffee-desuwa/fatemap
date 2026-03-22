import { render, screen, fireEvent } from '@testing-library/react';
import { EventFeed, CATEGORIES } from '../EventFeed';
import { SCENARIOS } from '@/lib/scenarios';

describe('EventFeed', () => {
  const onSelectScenario = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders event-feed container', () => {
    render(<EventFeed onSelectScenario={onSelectScenario} />);
    expect(screen.getByTestId('event-feed')).toBeInTheDocument();
  });

  it('shows feed title', () => {
    render(<EventFeed onSelectScenario={onSelectScenario} />);
    expect(screen.getByText('Hot Events')).toBeInTheDocument();
  });

  it('shows search input', () => {
    render(<EventFeed onSelectScenario={onSelectScenario} />);
    expect(screen.getByTestId('feed-search')).toBeInTheDocument();
  });

  it('renders all 9 category filter buttons', () => {
    render(<EventFeed onSelectScenario={onSelectScenario} />);
    for (const cat of CATEGORIES) {
      expect(screen.getByTestId(`filter-${cat}`)).toBeInTheDocument();
    }
  });

  it('renders all 28 scenarios by default', () => {
    render(<EventFeed onSelectScenario={onSelectScenario} />);
    for (const s of SCENARIOS) {
      expect(screen.getByTestId(`event-card-${s.id}`)).toBeInTheDocument();
    }
  });

  it('filters by category when a tab is clicked', () => {
    render(<EventFeed onSelectScenario={onSelectScenario} />);
    fireEvent.click(screen.getByTestId('filter-military'));
    const militaryScenarios = SCENARIOS.filter((s) => s.category === 'military');
    const nonMilitaryScenarios = SCENARIOS.filter((s) => s.category !== 'military');

    for (const s of militaryScenarios) {
      expect(screen.getByTestId(`event-card-${s.id}`)).toBeInTheDocument();
    }
    for (const s of nonMilitaryScenarios) {
      expect(screen.queryByTestId(`event-card-${s.id}`)).not.toBeInTheDocument();
    }
  });

  it('shows all scenarios when "All" tab is clicked after filtering', () => {
    render(<EventFeed onSelectScenario={onSelectScenario} />);
    fireEvent.click(screen.getByTestId('filter-military'));
    fireEvent.click(screen.getByTestId('filter-all'));
    expect(screen.getAllByTestId(/^event-card-/)).toHaveLength(SCENARIOS.length);
  });

  it('filters by search text in name', () => {
    render(<EventFeed onSelectScenario={onSelectScenario} />);
    const searchInput = screen.getByTestId('feed-search');
    fireEvent.change(searchInput, { target: { value: 'taiwan' } });
    const cards = screen.getAllByTestId(/^event-card-/);
    expect(cards.length).toBeGreaterThan(0);
    expect(cards.length).toBeLessThan(SCENARIOS.length);
  });

  it('filters by search text in keywords', () => {
    render(<EventFeed onSelectScenario={onSelectScenario} />);
    const searchInput = screen.getByTestId('feed-search');
    fireEvent.change(searchInput, { target: { value: 'blockade' } });
    const cards = screen.getAllByTestId(/^event-card-/);
    expect(cards.length).toBeGreaterThan(0);
  });

  it('shows empty state when search has no results', () => {
    render(<EventFeed onSelectScenario={onSelectScenario} />);
    const searchInput = screen.getByTestId('feed-search');
    fireEvent.change(searchInput, { target: { value: 'xyznonexistent123' } });
    expect(screen.getByTestId('feed-empty')).toBeInTheDocument();
    expect(screen.getByText('No matching scenarios')).toBeInTheDocument();
  });

  it('calls onSelectScenario with scenario object when card is clicked', () => {
    render(<EventFeed onSelectScenario={onSelectScenario} />);
    const firstScenario = SCENARIOS[0];
    fireEvent.click(screen.getByTestId(`event-card-${firstScenario.id}`));
    expect(onSelectScenario).toHaveBeenCalledWith(firstScenario);
  });

  it('marks active card based on activeScenarioId', () => {
    const activeId = SCENARIOS[0].id;
    render(<EventFeed onSelectScenario={onSelectScenario} activeScenarioId={activeId} />);
    const card = screen.getByTestId(`event-card-${activeId}`);
    expect(card.className).toContain('primary');
  });

  it('does not mark non-active cards', () => {
    const activeId = SCENARIOS[0].id;
    render(<EventFeed onSelectScenario={onSelectScenario} activeScenarioId={activeId} />);
    const otherCard = screen.getByTestId(`event-card-${SCENARIOS[1].id}`);
    expect(otherCard.className).not.toContain('primary');
  });

  it('combines category filter and search', () => {
    render(<EventFeed onSelectScenario={onSelectScenario} />);
    fireEvent.click(screen.getByTestId('filter-military'));
    const searchInput = screen.getByTestId('feed-search');
    fireEvent.change(searchInput, { target: { value: 'taiwan' } });
    const cards = screen.getAllByTestId(/^event-card-/);
    // Should only show military scenarios that match "taiwan"
    for (const card of cards) {
      const id = card.getAttribute('data-testid')!.replace('event-card-', '');
      const scenario = SCENARIOS.find((s) => s.id === id)!;
      expect(scenario.category).toBe('military');
    }
  });

  it('exports CATEGORIES constant with all + 8 categories', () => {
    expect(CATEGORIES).toHaveLength(9);
    expect(CATEGORIES[0]).toBe('all');
  });
});
