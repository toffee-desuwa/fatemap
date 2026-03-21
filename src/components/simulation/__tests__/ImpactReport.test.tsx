import { render, screen, fireEvent } from '@testing-library/react';
import { ImpactReport, countryFlag } from '../ImpactReport';
import type { SimulationResult } from '@/lib/types';

// Minimal result factory
function makeResult(overrides: Partial<SimulationResult> = {}): SimulationResult {
  return {
    event: 'Taiwan Strait Crisis',
    timestamp: '2026-01-01T00:00:00Z',
    epicenter: { countryId: 'CHN', coordinates: [121.5, 25.0] },
    countryImpacts: [
      { countryId: 'CHN', severity: 'critical', direction: 'negative', impactPercent: -45, reason: 'Military escalation', reasonZh: '军事升级' },
      { countryId: 'USA', severity: 'high', direction: 'negative', impactPercent: -30, reason: 'Defense mobilization', reasonZh: '国防动员' },
      { countryId: 'JPN', severity: 'medium', direction: 'negative', impactPercent: -20, reason: 'Trade disruption', reasonZh: '贸易中断' },
      { countryId: 'AUS', severity: 'low', direction: 'mixed', impactPercent: -5, reason: 'Supply chain impact', reasonZh: '供应链影响' },
      { countryId: 'IND', severity: 'low', direction: 'positive', impactPercent: 10, reason: 'Alternative supplier', reasonZh: '替代供应商' },
    ],
    cityImpacts: [
      { cityId: 'shanghai', severity: 'critical', direction: 'negative', impactType: 'trade_disruption' },
      { cityId: 'tokyo', severity: 'high', direction: 'negative', impactType: 'market_crash' },
      { cityId: 'new-york', severity: 'medium', direction: 'negative', impactType: 'market_crash' },
    ],
    activatedRelationships: ['USA-CHN-trade'],
    summary: 'Major disruption across Pacific.',
    summaryZh: '太平洋地区严重中断。',
    ...overrides,
  };
}

// JSDOM doesn't implement scrollIntoView
beforeAll(() => {
  HTMLElement.prototype.scrollIntoView = jest.fn();
});

describe('ImpactReport', () => {
  const defaultProps = {
    result: makeResult(),
  };

  // --- Rendering ---

  it('renders the report container', () => {
    render(<ImpactReport {...defaultProps} />);
    expect(screen.getByTestId('impact-report')).toBeInTheDocument();
  });

  it('displays event title', () => {
    render(<ImpactReport {...defaultProps} />);
    expect(screen.getByTestId('event-title')).toHaveTextContent('Taiwan Strait Crisis');
  });

  it('displays epicenter country', () => {
    render(<ImpactReport {...defaultProps} />);
    const epicenter = screen.getByTestId('epicenter');
    expect(epicenter).toHaveTextContent('China');
  });

  it('displays summary text', () => {
    render(<ImpactReport {...defaultProps} />);
    expect(screen.getByTestId('summary')).toHaveTextContent('Major disruption across Pacific.');
  });

  // --- Country impacts ---

  it('renders country heading with count', () => {
    render(<ImpactReport {...defaultProps} />);
    expect(screen.getByTestId('country-heading')).toHaveTextContent('Country Impacts (5)');
  });

  it('renders all country rows', () => {
    render(<ImpactReport {...defaultProps} />);
    expect(screen.getByTestId('country-row-CHN')).toBeInTheDocument();
    expect(screen.getByTestId('country-row-USA')).toBeInTheDocument();
    expect(screen.getByTestId('country-row-JPN')).toBeInTheDocument();
    expect(screen.getByTestId('country-row-AUS')).toBeInTheDocument();
    expect(screen.getByTestId('country-row-IND')).toBeInTheDocument();
  });

  it('sorts countries by severity (critical first)', () => {
    render(<ImpactReport {...defaultProps} />);
    const rows = screen.getAllByTestId(/^country-row-/);
    expect(rows[0]).toHaveAttribute('data-testid', 'country-row-CHN');
    expect(rows[1]).toHaveAttribute('data-testid', 'country-row-USA');
    expect(rows[2]).toHaveAttribute('data-testid', 'country-row-JPN');
    // AUS and IND both low, order preserved
    expect(rows[3]).toHaveAttribute('data-testid', 'country-row-AUS');
    expect(rows[4]).toHaveAttribute('data-testid', 'country-row-IND');
  });

  it('shows severity badges with correct text', () => {
    render(<ImpactReport {...defaultProps} />);
    expect(screen.getByTestId('severity-CHN')).toHaveTextContent('critical');
    expect(screen.getByTestId('severity-USA')).toHaveTextContent('high');
    expect(screen.getByTestId('severity-JPN')).toHaveTextContent('medium');
    expect(screen.getByTestId('severity-AUS')).toHaveTextContent('low');
  });

  it('renders AnimatedNumber for impact percent', () => {
    render(<ImpactReport {...defaultProps} />);
    // AnimatedNumber renders span with data-testid="animated-number"
    const numbers = screen.getAllByTestId('animated-number');
    expect(numbers.length).toBe(5); // one per country
  });

  it('applies staggered animation delays to country rows', () => {
    render(<ImpactReport {...defaultProps} />);
    const rows = screen.getAllByTestId(/^country-row-/);
    expect(rows[0].style.animationDelay).toBe('0ms');
    expect(rows[1].style.animationDelay).toBe('100ms');
    expect(rows[2].style.animationDelay).toBe('200ms');
    expect(rows[3].style.animationDelay).toBe('300ms');
    expect(rows[4].style.animationDelay).toBe('400ms');
  });

  // --- Country click ---

  it('calls onCountryClick when a row is clicked', () => {
    const onCountryClick = jest.fn();
    render(<ImpactReport {...defaultProps} onCountryClick={onCountryClick} />);
    fireEvent.click(screen.getByTestId('country-row-USA'));
    expect(onCountryClick).toHaveBeenCalledWith('USA');
  });

  it('calls onCountryClick on Enter keydown', () => {
    const onCountryClick = jest.fn();
    render(<ImpactReport {...defaultProps} onCountryClick={onCountryClick} />);
    fireEvent.keyDown(screen.getByTestId('country-row-JPN'), { key: 'Enter' });
    expect(onCountryClick).toHaveBeenCalledWith('JPN');
  });

  it('does not crash when onCountryClick is not provided', () => {
    render(<ImpactReport {...defaultProps} />);
    fireEvent.click(screen.getByTestId('country-row-CHN'));
    // no error
  });

  // --- Selected country ---

  it('highlights selected country row', () => {
    render(<ImpactReport {...defaultProps} selectedCountryId="USA" />);
    const row = screen.getByTestId('country-row-USA');
    expect(row.className).toContain('ring-1');
  });

  it('shows reason for selected country', () => {
    render(<ImpactReport {...defaultProps} selectedCountryId="USA" />);
    const reason = screen.getByTestId('selected-reason');
    expect(reason).toHaveTextContent('Defense mobilization');
  });

  it('does not show reason when no country selected', () => {
    render(<ImpactReport {...defaultProps} />);
    expect(screen.queryByTestId('selected-reason')).not.toBeInTheDocument();
  });

  it('scrolls to selected country', () => {
    const spy = jest.spyOn(HTMLElement.prototype, 'scrollIntoView');
    const { rerender } = render(<ImpactReport {...defaultProps} />);
    spy.mockClear();
    rerender(<ImpactReport {...defaultProps} selectedCountryId="JPN" />);
    expect(spy).toHaveBeenCalledWith({ behavior: 'smooth', block: 'nearest' });
    spy.mockRestore();
  });

  // --- Clear button ---

  it('shows clear button when onClear is provided', () => {
    const onClear = jest.fn();
    render(<ImpactReport {...defaultProps} onClear={onClear} />);
    expect(screen.getByTestId('clear-button')).toBeInTheDocument();
  });

  it('hides clear button when onClear is not provided', () => {
    render(<ImpactReport {...defaultProps} />);
    expect(screen.queryByTestId('clear-button')).not.toBeInTheDocument();
  });

  it('calls onClear when clear button is clicked', () => {
    const onClear = jest.fn();
    render(<ImpactReport {...defaultProps} onClear={onClear} />);
    fireEvent.click(screen.getByTestId('clear-button'));
    expect(onClear).toHaveBeenCalledTimes(1);
  });

  // --- City impacts ---

  it('renders city heading with count', () => {
    render(<ImpactReport {...defaultProps} />);
    expect(screen.getByTestId('city-heading')).toHaveTextContent('City Impacts (3)');
  });

  it('renders all city rows', () => {
    render(<ImpactReport {...defaultProps} />);
    expect(screen.getByTestId('city-row-shanghai')).toBeInTheDocument();
    expect(screen.getByTestId('city-row-tokyo')).toBeInTheDocument();
    expect(screen.getByTestId('city-row-new-york')).toBeInTheDocument();
  });

  it('shows city severity badges', () => {
    render(<ImpactReport {...defaultProps} />);
    expect(screen.getByTestId('city-severity-shanghai')).toHaveTextContent('critical');
    expect(screen.getByTestId('city-severity-tokyo')).toHaveTextContent('high');
  });

  it('shows impact type with spaces', () => {
    render(<ImpactReport {...defaultProps} />);
    const shanghaiRow = screen.getByTestId('city-row-shanghai');
    expect(shanghaiRow).toHaveTextContent('trade disruption');
  });

  it('applies staggered animation to city rows after country rows', () => {
    render(<ImpactReport {...defaultProps} />);
    const cityRows = [
      screen.getByTestId('city-row-shanghai'),
      screen.getByTestId('city-row-tokyo'),
      screen.getByTestId('city-row-new-york'),
    ];
    // 5 country rows, so city rows start at 500ms
    expect(cityRows[0].style.animationDelay).toBe('500ms');
    expect(cityRows[1].style.animationDelay).toBe('600ms');
    expect(cityRows[2].style.animationDelay).toBe('700ms');
  });

  it('hides city section when no city impacts', () => {
    render(<ImpactReport result={makeResult({ cityImpacts: [] })} />);
    expect(screen.queryByTestId('city-heading')).not.toBeInTheDocument();
  });

  // --- Edge cases ---

  it('skips unknown country IDs gracefully', () => {
    const result = makeResult({
      countryImpacts: [
        { countryId: 'ZZZ', severity: 'low', direction: 'negative', impactPercent: -5, reason: 'Unknown', reasonZh: '未知' },
        { countryId: 'USA', severity: 'high', direction: 'negative', impactPercent: -30, reason: 'Impact', reasonZh: '影响' },
      ],
    });
    render(<ImpactReport result={result} />);
    expect(screen.queryByTestId('country-row-ZZZ')).not.toBeInTheDocument();
    expect(screen.getByTestId('country-row-USA')).toBeInTheDocument();
  });

  it('skips unknown city IDs gracefully', () => {
    const result = makeResult({
      cityImpacts: [
        { cityId: 'unknown-city', severity: 'low', direction: 'negative', impactType: 'other' },
        { cityId: 'tokyo', severity: 'high', direction: 'negative', impactType: 'market_crash' },
      ],
    });
    render(<ImpactReport result={result} />);
    expect(screen.queryByTestId('city-row-unknown-city')).not.toBeInTheDocument();
    expect(screen.getByTestId('city-row-tokyo')).toBeInTheDocument();
  });

  it('handles empty country impacts', () => {
    render(<ImpactReport result={makeResult({ countryImpacts: [] })} />);
    expect(screen.getByTestId('country-heading')).toHaveTextContent('Country Impacts (0)');
  });

  // --- countryFlag utility ---

  it('generates correct flag emoji for known countries', () => {
    // US flag is 🇺🇸 = U+1F1FA U+1F1F8
    expect(countryFlag('USA')).toBe('\u{1F1FA}\u{1F1F8}');
    expect(countryFlag('CHN')).toBe('\u{1F1E8}\u{1F1F3}');
    expect(countryFlag('JPN')).toBe('\u{1F1EF}\u{1F1F5}');
  });

  it('returns empty string for unknown country codes', () => {
    expect(countryFlag('ZZZ')).toBe('');
    expect(countryFlag('')).toBe('');
  });

  // --- Positive direction styling ---

  it('shows positive impact with green coloring', () => {
    render(<ImpactReport {...defaultProps} selectedCountryId="IND" />);
    const row = screen.getByTestId('country-row-IND');
    // The AnimatedNumber for IND should show +10%
    const numbers = row.querySelectorAll('[data-testid="animated-number"]');
    expect(numbers.length).toBe(1);
    expect(numbers[0]).toHaveTextContent('+10%');
  });
});
