import { render, screen, fireEvent } from '@testing-library/react';
import { EventCard, CATEGORY_ICONS } from '../EventCard';
import type { PresetScenario } from '@/lib/types';

const mockScenario: PresetScenario = {
  id: 'test-scenario',
  name: 'Test Scenario',
  nameCn: '测试场景',
  category: 'military',
  description: 'A test scenario description',
  descriptionZh: '测试场景描述',
  eventText: 'What if test?',
  keywords: ['test'],
  result: {
    event: 'Test event',
    timestamp: '2026-01-01T00:00:00Z',
    epicenter: { countryId: 'USA', coordinates: [-98, 39] },
    countryImpacts: [],
    cityImpacts: [],
    activatedRelationships: [],
    summary: 'Summary',
    summaryZh: '摘要',
  },
};

describe('EventCard', () => {
  const onClick = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders with correct test id', () => {
    render(<EventCard scenario={mockScenario} onClick={onClick} />);
    expect(screen.getByTestId('event-card-test-scenario')).toBeInTheDocument();
  });

  it('shows English name by default', () => {
    render(<EventCard scenario={mockScenario} onClick={onClick} />);
    expect(screen.getByText('Test Scenario')).toBeInTheDocument();
  });

  it('shows Chinese name when locale is zh', () => {
    render(<EventCard scenario={mockScenario} onClick={onClick} locale="zh" />);
    expect(screen.getByText('测试场景')).toBeInTheDocument();
  });

  it('shows English description by default', () => {
    render(<EventCard scenario={mockScenario} onClick={onClick} />);
    expect(screen.getByText('A test scenario description')).toBeInTheDocument();
  });

  it('shows Chinese description when locale is zh', () => {
    render(<EventCard scenario={mockScenario} onClick={onClick} locale="zh" />);
    expect(screen.getByText('测试场景描述')).toBeInTheDocument();
  });

  it('shows category icon', () => {
    render(<EventCard scenario={mockScenario} onClick={onClick} />);
    expect(screen.getByText('⚔️')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    render(<EventCard scenario={mockScenario} onClick={onClick} />);
    fireEvent.click(screen.getByTestId('event-card-test-scenario'));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('applies active styling when active', () => {
    render(<EventCard scenario={mockScenario} onClick={onClick} active />);
    const button = screen.getByTestId('event-card-test-scenario');
    expect(button.className).toContain('primary');
  });

  it('does not apply active styling when not active', () => {
    render(<EventCard scenario={mockScenario} onClick={onClick} active={false} />);
    const button = screen.getByTestId('event-card-test-scenario');
    expect(button.className).not.toContain('primary');
  });

  it('renders as a button element', () => {
    render(<EventCard scenario={mockScenario} onClick={onClick} />);
    const el = screen.getByTestId('event-card-test-scenario');
    expect(el.tagName).toBe('BUTTON');
  });

  it('has icons for all 8 categories', () => {
    const categories = ['military', 'trade', 'energy', 'climate', 'health', 'political', 'economic', 'technology'];
    for (const cat of categories) {
      expect(CATEGORY_ICONS[cat]).toBeDefined();
    }
    expect(Object.keys(CATEGORY_ICONS)).toHaveLength(8);
  });

  it('uses fallback icon for unknown category', () => {
    const unknownScenario = { ...mockScenario, category: 'unknown' as PresetScenario['category'] };
    render(<EventCard scenario={unknownScenario} onClick={onClick} />);
    expect(screen.getByText('📌')).toBeInTheDocument();
  });
});
