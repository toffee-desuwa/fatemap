import { render, screen, fireEvent, act, waitFor } from '@testing-library/react';
import { ApiKeySettings } from '../ApiKeySettings';

// localStorage mock
const store: Record<string, string> = {};

beforeEach(() => {
  Object.keys(store).forEach((key) => delete store[key]);
  jest.spyOn(Storage.prototype, 'getItem').mockImplementation(
    (key: string) => store[key] ?? null,
  );
  jest.spyOn(Storage.prototype, 'setItem').mockImplementation(
    (key: string, value: string) => {
      store[key] = value;
    },
  );
  jest.spyOn(Storage.prototype, 'removeItem').mockImplementation(
    (key: string) => {
      delete store[key];
    },
  );
  jest.spyOn(window, 'dispatchEvent').mockImplementation(() => true);
  (global.fetch as jest.Mock) = jest.fn();
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('ApiKeySettings', () => {
  // --- Rendering ---

  it('renders the settings container', () => {
    render(<ApiKeySettings />);
    expect(screen.getByTestId('api-key-settings')).toBeInTheDocument();
  });

  it('renders title and description', () => {
    render(<ApiKeySettings />);
    expect(screen.getByText('API Key Settings')).toBeInTheDocument();
  });

  it('renders provider dropdown with all providers', () => {
    render(<ApiKeySettings />);
    const select = screen.getByTestId('provider-select') as HTMLSelectElement;
    expect(select).toBeInTheDocument();
    expect(select.options.length).toBe(4);
  });

  it('renders API key input as password type', () => {
    render(<ApiKeySettings />);
    const input = screen.getByTestId('apikey-input') as HTMLInputElement;
    expect(input.type).toBe('password');
  });

  it('renders save, test, and clear buttons', () => {
    render(<ApiKeySettings />);
    expect(screen.getByTestId('save-button')).toBeInTheDocument();
    expect(screen.getByTestId('test-button')).toBeInTheDocument();
    expect(screen.getByTestId('clear-button')).toBeInTheDocument();
  });

  it('renders provider info section', () => {
    render(<ApiKeySettings />);
    expect(screen.getByTestId('provider-info')).toBeInTheDocument();
  });

  // --- Loading from localStorage ---

  it('loads saved provider from localStorage', () => {
    store['fatemap-llm-provider'] = 'openai';
    render(<ApiKeySettings />);
    const select = screen.getByTestId('provider-select') as HTMLSelectElement;
    expect(select.value).toBe('openai');
  });

  it('loads saved API key from localStorage', () => {
    store['fatemap-llm-apikey'] = 'sk-saved-key';
    render(<ApiKeySettings />);
    const input = screen.getByTestId('apikey-input') as HTMLInputElement;
    expect(input.value).toBe('sk-saved-key');
  });

  it('defaults to first provider if saved provider is invalid', () => {
    store['fatemap-llm-provider'] = 'nonexistent';
    render(<ApiKeySettings />);
    const select = screen.getByTestId('provider-select') as HTMLSelectElement;
    expect(select.value).toBe('deepseek');
  });

  // --- Save ---

  it('saves provider and key to localStorage on save', () => {
    render(<ApiKeySettings />);
    const input = screen.getByTestId('apikey-input');
    const saveBtn = screen.getByTestId('save-button');
    fireEvent.change(input, { target: { value: 'sk-test-123' } });
    fireEvent.click(saveBtn);
    expect(store['fatemap-llm-provider']).toBe('deepseek');
    expect(store['fatemap-llm-apikey']).toBe('sk-test-123');
  });

  it('shows saved status message after save', () => {
    render(<ApiKeySettings />);
    fireEvent.change(screen.getByTestId('apikey-input'), {
      target: { value: 'sk-test' },
    });
    fireEvent.click(screen.getByTestId('save-button'));
    expect(screen.getByTestId('status-message')).toHaveTextContent(
      'Settings saved',
    );
  });

  it('dispatches storage event after save', () => {
    render(<ApiKeySettings />);
    fireEvent.change(screen.getByTestId('apikey-input'), {
      target: { value: 'sk-test' },
    });
    fireEvent.click(screen.getByTestId('save-button'));
    expect(window.dispatchEvent).toHaveBeenCalled();
  });

  it('disables save button when API key is empty', () => {
    render(<ApiKeySettings />);
    const saveBtn = screen.getByTestId('save-button') as HTMLButtonElement;
    expect(saveBtn.disabled).toBe(true);
  });

  // --- Clear ---

  it('clears localStorage on clear', () => {
    store['fatemap-llm-provider'] = 'openai';
    store['fatemap-llm-apikey'] = 'sk-test';
    render(<ApiKeySettings />);
    fireEvent.click(screen.getByTestId('clear-button'));
    expect(store['fatemap-llm-provider']).toBeUndefined();
    expect(store['fatemap-llm-apikey']).toBeUndefined();
  });

  it('resets form fields after clear', () => {
    store['fatemap-llm-provider'] = 'openai';
    store['fatemap-llm-apikey'] = 'sk-test';
    render(<ApiKeySettings />);
    fireEvent.click(screen.getByTestId('clear-button'));
    const select = screen.getByTestId('provider-select') as HTMLSelectElement;
    const input = screen.getByTestId('apikey-input') as HTMLInputElement;
    expect(select.value).toBe('deepseek');
    expect(input.value).toBe('');
  });

  it('shows cleared status message', () => {
    render(<ApiKeySettings />);
    fireEvent.click(screen.getByTestId('clear-button'));
    expect(screen.getByTestId('status-message')).toHaveTextContent(
      'Settings cleared',
    );
  });

  // --- Provider change ---

  it('updates provider selection', () => {
    render(<ApiKeySettings />);
    const select = screen.getByTestId('provider-select');
    fireEvent.change(select, { target: { value: 'anthropic' } });
    expect((select as HTMLSelectElement).value).toBe('anthropic');
  });

  it('updates provider info when selection changes', () => {
    render(<ApiKeySettings />);
    const info = screen.getByTestId('provider-info');
    expect(info).toHaveTextContent('deepseek-chat');
    fireEvent.change(screen.getByTestId('provider-select'), {
      target: { value: 'openai' },
    });
    expect(info).toHaveTextContent('gpt-4o-mini');
  });

  // --- Test button ---

  it('disables test button when no API key', () => {
    render(<ApiKeySettings />);
    const testBtn = screen.getByTestId('test-button') as HTMLButtonElement;
    expect(testBtn.disabled).toBe(true);
  });

  it('shows "Testing..." while test is running', async () => {
    (global.fetch as jest.Mock).mockReturnValue(
      new Promise(() => {}), // never resolves
    );
    render(<ApiKeySettings />);
    fireEvent.change(screen.getByTestId('apikey-input'), {
      target: { value: 'sk-test' },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('test-button'));
    });
    expect(screen.getByTestId('test-button')).toHaveTextContent('Testing...');
  });

  it('shows success status when test passes', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    render(<ApiKeySettings />);
    fireEvent.change(screen.getByTestId('apikey-input'), {
      target: { value: 'sk-test' },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('test-button'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('status-message')).toHaveTextContent(
        'Connection successful!',
      );
    });
  });

  it('shows failure status when test fails with HTTP error', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
      text: () => Promise.resolve('Invalid API key'),
    });
    render(<ApiKeySettings />);
    fireEvent.change(screen.getByTestId('apikey-input'), {
      target: { value: 'bad-key' },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('test-button'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('status-message')).toHaveTextContent(
        'Connection failed',
      );
    });
  });

  it('shows failure status when test throws network error', async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error('Network error'));
    render(<ApiKeySettings />);
    fireEvent.change(screen.getByTestId('apikey-input'), {
      target: { value: 'sk-test' },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('test-button'));
    });
    await waitFor(() => {
      expect(screen.getByTestId('status-message')).toHaveTextContent(
        'Network error',
      );
    });
  });

  it('sends correct request format for OpenAI provider', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    render(<ApiKeySettings />);
    fireEvent.change(screen.getByTestId('apikey-input'), {
      target: { value: 'sk-test' },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('test-button'));
    });
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    expect(fetchCall[0]).toContain('/chat/completions');
    const body = JSON.parse(fetchCall[1].body);
    expect(body.messages).toBeDefined();
    expect(body.max_tokens).toBe(16);
  });

  it('sends correct request format for Anthropic provider', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    });
    render(<ApiKeySettings />);
    fireEvent.change(screen.getByTestId('provider-select'), {
      target: { value: 'anthropic' },
    });
    fireEvent.change(screen.getByTestId('apikey-input'), {
      target: { value: 'sk-ant-test' },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('test-button'));
    });
    const fetchCall = (global.fetch as jest.Mock).mock.calls[0];
    expect(fetchCall[0]).toContain('/messages');
    const body = JSON.parse(fetchCall[1].body);
    expect(body.model).toContain('claude');
  });

  // --- HTTP error code branches ---

  it('shows forbidden error for 403 response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 403,
    });
    render(<ApiKeySettings />);
    fireEvent.change(screen.getByTestId('apikey-input'), {
      target: { value: 'sk-test' },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('test-button'));
    });
    await waitFor(() => {
      const msg = screen.getByTestId('status-message');
      expect(msg).toHaveTextContent('Access denied');
    });
  });

  it('shows rate limit error for 429 response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 429,
    });
    render(<ApiKeySettings />);
    fireEvent.change(screen.getByTestId('apikey-input'), {
      target: { value: 'sk-test' },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('test-button'));
    });
    await waitFor(() => {
      const msg = screen.getByTestId('status-message');
      expect(msg).toHaveTextContent('Rate limited');
    });
  });

  it('shows not found error for 404 response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 404,
    });
    render(<ApiKeySettings />);
    fireEvent.change(screen.getByTestId('apikey-input'), {
      target: { value: 'sk-test' },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('test-button'));
    });
    await waitFor(() => {
      const msg = screen.getByTestId('status-message');
      expect(msg).toHaveTextContent('Endpoint not found');
    });
  });

  it('shows server error for 500+ response', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 502,
    });
    render(<ApiKeySettings />);
    fireEvent.change(screen.getByTestId('apikey-input'), {
      target: { value: 'sk-test' },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('test-button'));
    });
    await waitFor(() => {
      const msg = screen.getByTestId('status-message');
      expect(msg).toHaveTextContent('Provider server error');
    });
  });

  it('shows generic HTTP error for other status codes', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      status: 418,
    });
    render(<ApiKeySettings />);
    fireEvent.change(screen.getByTestId('apikey-input'), {
      target: { value: 'sk-test' },
    });
    await act(async () => {
      fireEvent.click(screen.getByTestId('test-button'));
    });
    await waitFor(() => {
      const msg = screen.getByTestId('status-message');
      expect(msg).toHaveTextContent('Request failed (HTTP 418)');
    });
  });

  // --- Status resets ---

  it('resets status when provider changes', () => {
    render(<ApiKeySettings />);
    fireEvent.change(screen.getByTestId('apikey-input'), {
      target: { value: 'sk-test' },
    });
    fireEvent.click(screen.getByTestId('save-button'));
    expect(screen.getByTestId('status-message')).toBeInTheDocument();
    fireEvent.change(screen.getByTestId('provider-select'), {
      target: { value: 'openai' },
    });
    expect(screen.queryByTestId('status-message')).not.toBeInTheDocument();
  });

  it('resets status when API key changes', () => {
    render(<ApiKeySettings />);
    fireEvent.change(screen.getByTestId('apikey-input'), {
      target: { value: 'sk-test' },
    });
    fireEvent.click(screen.getByTestId('save-button'));
    expect(screen.getByTestId('status-message')).toBeInTheDocument();
    fireEvent.change(screen.getByTestId('apikey-input'), {
      target: { value: 'sk-changed' },
    });
    expect(screen.queryByTestId('status-message')).not.toBeInTheDocument();
  });
});
