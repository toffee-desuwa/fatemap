import { render, screen, fireEvent } from '@testing-library/react';
import { ScenarioInput } from '../ScenarioInput';
import type { PresetScenario } from '@/lib/types';
import { SCENARIOS } from '@/lib/scenarios';

// Build a minimal mock preset for suggestion tests
function mockPreset(overrides: Partial<PresetScenario> = {}): PresetScenario {
  return {
    id: 'test-scenario',
    name: 'Test Scenario',
    nameCn: '测试场景',
    category: 'military',
    description: 'A test',
    descriptionZh: '测试',
    eventText: 'What if test event?',
    keywords: ['test'],
    result: {
      event: 'test',
      timestamp: '2026-01-01T00:00:00Z',
      epicenter: { countryId: 'USA', coordinates: [-98, 39] },
      countryImpacts: [],
      cityImpacts: [],
      activatedRelationships: [],
      summary: 'Test',
      summaryZh: '测试',
    },
    ...overrides,
  };
}

describe('ScenarioInput', () => {
  const defaultProps = {
    onSimulate: jest.fn(),
    loading: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // --- Rendering ---

  it('renders textarea with placeholder', () => {
    render(<ScenarioInput {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('What if...?');
    expect(textarea).toBeInTheDocument();
    expect(textarea.tagName).toBe('TEXTAREA');
  });

  it('renders submit button', () => {
    render(<ScenarioInput {...defaultProps} />);
    expect(screen.getByText('Simulate')).toBeInTheDocument();
  });

  it('renders character counter', () => {
    render(<ScenarioInput {...defaultProps} />);
    expect(screen.getByText('0/1000')).toBeInTheDocument();
  });

  it('renders 6 example buttons', () => {
    render(<ScenarioInput {...defaultProps} />);
    expect(screen.getByText('Taiwan Strait Military Crisis')).toBeInTheDocument();
    expect(screen.getByText('US-China Full Trade War')).toBeInTheDocument();
    expect(screen.getByText('Strait of Hormuz Blockade')).toBeInTheDocument();
    expect(screen.getByText('Pacific Mega-Typhoon')).toBeInTheDocument();
    expect(screen.getByText('Ukraine-Russia Conflict Escalation')).toBeInTheDocument();
    expect(screen.getByText('Global Semiconductor Disruption')).toBeInTheDocument();
  });

  // --- Input behavior ---

  it('updates character counter on input', () => {
    render(<ScenarioInput {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('What if...?');
    fireEvent.change(textarea, { target: { value: 'Hello' } });
    expect(screen.getByText('5/1000')).toBeInTheDocument();
  });

  it('enforces 1000 char max', () => {
    render(<ScenarioInput {...defaultProps} />);
    const textarea = screen.getByPlaceholderText('What if...?') as HTMLTextAreaElement;
    const longText = 'a'.repeat(1500);
    fireEvent.change(textarea, { target: { value: longText } });
    expect(textarea.value.length).toBe(1000);
  });

  // --- Submit ---

  it('submit button disabled when input is empty', () => {
    render(<ScenarioInput {...defaultProps} />);
    const btn = screen.getByText('Simulate');
    expect(btn).toBeDisabled();
  });

  it('submit button disabled when loading', () => {
    render(<ScenarioInput {...defaultProps} loading={true} />);
    const textarea = screen.getByPlaceholderText('What if...?');
    fireEvent.change(textarea, { target: { value: 'test' } });
    const btn = screen.getByText('Simulate');
    expect(btn).toBeDisabled();
  });

  it('calls onSimulate on submit click', () => {
    const onSimulate = jest.fn();
    render(<ScenarioInput {...defaultProps} onSimulate={onSimulate} />);
    const textarea = screen.getByPlaceholderText('What if...?');
    fireEvent.change(textarea, { target: { value: 'What if Taiwan?' } });
    fireEvent.click(screen.getByText('Simulate'));
    expect(onSimulate).toHaveBeenCalledWith('What if Taiwan?');
  });

  it('calls onSimulate on Enter key', () => {
    const onSimulate = jest.fn();
    render(<ScenarioInput {...defaultProps} onSimulate={onSimulate} />);
    const textarea = screen.getByPlaceholderText('What if...?');
    fireEvent.change(textarea, { target: { value: 'Test input' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: false });
    expect(onSimulate).toHaveBeenCalledWith('Test input');
  });

  it('does not submit on Shift+Enter', () => {
    const onSimulate = jest.fn();
    render(<ScenarioInput {...defaultProps} onSimulate={onSimulate} />);
    const textarea = screen.getByPlaceholderText('What if...?');
    fireEvent.change(textarea, { target: { value: 'Test input' } });
    fireEvent.keyDown(textarea, { key: 'Enter', shiftKey: true });
    expect(onSimulate).not.toHaveBeenCalled();
  });

  it('trims whitespace before submitting', () => {
    const onSimulate = jest.fn();
    render(<ScenarioInput {...defaultProps} onSimulate={onSimulate} />);
    const textarea = screen.getByPlaceholderText('What if...?');
    fireEvent.change(textarea, { target: { value: '  spaced  ' } });
    fireEvent.click(screen.getByText('Simulate'));
    expect(onSimulate).toHaveBeenCalledWith('spaced');
  });

  it('does not submit when only whitespace', () => {
    const onSimulate = jest.fn();
    render(<ScenarioInput {...defaultProps} onSimulate={onSimulate} />);
    const textarea = screen.getByPlaceholderText('What if...?');
    fireEvent.change(textarea, { target: { value: '   ' } });
    fireEvent.click(screen.getByText('Simulate'));
    expect(onSimulate).not.toHaveBeenCalled();
  });

  // --- Loading state ---

  it('shows simulating text when loading', () => {
    render(<ScenarioInput {...defaultProps} loading={true} />);
    expect(screen.getByText('Simulating...')).toBeInTheDocument();
  });

  it('hides simulating text when not loading', () => {
    render(<ScenarioInput {...defaultProps} loading={false} />);
    expect(screen.queryByText('Simulating...')).not.toBeInTheDocument();
  });

  it('hides example buttons when loading', () => {
    render(<ScenarioInput {...defaultProps} loading={true} />);
    expect(screen.queryByText('Taiwan Strait Military Crisis')).not.toBeInTheDocument();
  });

  it('disables textarea when loading', () => {
    render(<ScenarioInput {...defaultProps} loading={true} />);
    expect(screen.getByPlaceholderText('What if...?')).toBeDisabled();
  });

  // --- Example buttons ---

  it('fills input and submits on example click', () => {
    const onSimulate = jest.fn();
    render(<ScenarioInput {...defaultProps} onSimulate={onSimulate} />);
    const taiwanBtn = screen.getByText('Taiwan Strait Military Crisis');
    fireEvent.click(taiwanBtn);

    const taiwanScenario = SCENARIOS.find((s) => s.id === 'taiwan-strait-crisis')!;
    expect(onSimulate).toHaveBeenCalledWith(taiwanScenario.eventText, taiwanScenario);
  });

  it('updates textarea value on example click', () => {
    render(<ScenarioInput {...defaultProps} />);
    fireEvent.click(screen.getByText('Taiwan Strait Military Crisis'));

    const textarea = screen.getByPlaceholderText('What if...?') as HTMLTextAreaElement;
    const taiwanScenario = SCENARIOS.find((s) => s.id === 'taiwan-strait-crisis')!;
    expect(textarea.value).toBe(taiwanScenario.eventText);
  });

  // --- Suggestions ---

  it('renders suggestion chips when provided', () => {
    const suggestions = [
      mockPreset({ id: 's1', name: 'Suggestion One' }),
      mockPreset({ id: 's2', name: 'Suggestion Two' }),
    ];
    render(<ScenarioInput {...defaultProps} suggestions={suggestions} />);
    expect(screen.getByText('Did you mean:')).toBeInTheDocument();
    expect(screen.getByText('Suggestion One')).toBeInTheDocument();
    expect(screen.getByText('Suggestion Two')).toBeInTheDocument();
  });

  it('does not render suggestions when empty', () => {
    render(<ScenarioInput {...defaultProps} suggestions={[]} />);
    expect(screen.queryByText('Did you mean:')).not.toBeInTheDocument();
  });

  it('does not render suggestions when undefined', () => {
    render(<ScenarioInput {...defaultProps} />);
    expect(screen.queryByText('Did you mean:')).not.toBeInTheDocument();
  });

  it('hides suggestions when loading', () => {
    const suggestions = [mockPreset({ id: 's1', name: 'Suggestion One' })];
    render(<ScenarioInput {...defaultProps} loading={true} suggestions={suggestions} />);
    expect(screen.queryByText('Did you mean:')).not.toBeInTheDocument();
  });

  it('fills input and submits on suggestion click', () => {
    const onSimulate = jest.fn();
    const suggestions = [
      mockPreset({ id: 's1', name: 'Suggestion One', eventText: 'What if suggestion?' }),
    ];
    render(<ScenarioInput {...defaultProps} onSimulate={onSimulate} suggestions={suggestions} />);
    fireEvent.click(screen.getByText('Suggestion One'));
    expect(onSimulate).toHaveBeenCalledWith('What if suggestion?', suggestions[0]);
  });
});
