import { render, screen } from '@testing-library/react';
import { Header } from '../Header';

// localStorage mock
const localStorageMock: Record<string, string> = {};

beforeEach(() => {
  Object.keys(localStorageMock).forEach(
    (key) => delete localStorageMock[key],
  );
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(
    (key: string) => localStorageMock[key] ?? null,
  );
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('Header', () => {
  // --- Rendering ---

  it('renders header element', () => {
    render(<Header />);
    expect(screen.getByTestId('header')).toBeInTheDocument();
  });

  it('renders brand link pointing to dashboard', () => {
    render(<Header />);
    const brand = screen.getByTestId('brand');
    expect(brand).toHaveTextContent('FateMap');
    expect(brand).toHaveAttribute('href', '/dashboard');
  });

  it('renders dashboard nav link', () => {
    render(<Header />);
    const link = screen.getByTestId('nav-dashboard');
    expect(link).toHaveTextContent('Dashboard');
    expect(link).toHaveAttribute('href', '/dashboard');
  });

  it('renders settings nav link', () => {
    render(<Header />);
    const link = screen.getByTestId('nav-settings');
    expect(link).toHaveTextContent('Settings');
    expect(link).toHaveAttribute('href', '/settings');
  });

  it('renders locale switcher', () => {
    render(<Header />);
    expect(screen.getByTestId('locale-switcher')).toBeInTheDocument();
  });

  it('renders github link', () => {
    render(<Header />);
    const link = screen.getByTestId('github-link');
    expect(link).toHaveTextContent('GitHub');
    expect(link).toHaveAttribute('target', '_blank');
  });

  // --- AI Status ---

  it('shows "AI: Preset Only" when no LLM key in localStorage', () => {
    render(<Header />);
    const status = screen.getByTestId('ai-status');
    expect(status).toHaveTextContent('AI: Preset Only');
  });

  it('shows "AI: Connected" when provider and key exist in localStorage', () => {
    localStorageMock['fatemap-llm-provider'] = 'deepseek';
    localStorageMock['fatemap-llm-apikey'] = 'sk-test';
    render(<Header />);
    const status = screen.getByTestId('ai-status');
    expect(status).toHaveTextContent('AI: Connected');
  });

  it('shows "AI: Preset Only" when only provider exists without key', () => {
    localStorageMock['fatemap-llm-provider'] = 'deepseek';
    render(<Header />);
    const status = screen.getByTestId('ai-status');
    expect(status).toHaveTextContent('AI: Preset Only');
  });

  // --- Current Page Highlighting ---

  it('highlights dashboard link when currentPage is dashboard', () => {
    render(<Header currentPage="dashboard" />);
    const link = screen.getByTestId('nav-dashboard');
    expect(link.className).toContain('text-[var(--color-foreground)]');
  });

  it('highlights settings link when currentPage is settings', () => {
    render(<Header currentPage="settings" />);
    const link = screen.getByTestId('nav-settings');
    expect(link.className).toContain('text-[var(--color-foreground)]');
  });

  it('dims non-current page links', () => {
    render(<Header currentPage="dashboard" />);
    const settings = screen.getByTestId('nav-settings');
    expect(settings.className).toContain('text-[var(--color-text-secondary)]');
  });

  it('dims both links when no currentPage', () => {
    render(<Header />);
    const dashboard = screen.getByTestId('nav-dashboard');
    const settings = screen.getByTestId('nav-settings');
    expect(dashboard.className).toContain('text-[var(--color-text-secondary)]');
    expect(settings.className).toContain('text-[var(--color-text-secondary)]');
  });
});
