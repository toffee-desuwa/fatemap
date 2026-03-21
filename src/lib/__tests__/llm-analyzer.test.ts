import { analyzeWithLlm, buildSystemPrompt } from '../llm-analyzer';
import type { LlmProvider } from '../types';

// ── Mock provider helpers ──────────────────────────────────────

const openaiProvider: LlmProvider = {
  id: 'test-openai',
  name: 'Test OpenAI',
  baseUrl: 'https://api.example.com/v1',
  model: 'test-model',
  format: 'openai',
  buildHeaders: (key: string) => ({
    'Content-Type': 'application/json',
    Authorization: `Bearer ${key}`,
  }),
};

const anthropicProvider: LlmProvider = {
  id: 'test-anthropic',
  name: 'Test Anthropic',
  baseUrl: 'https://api.example.com/v1',
  model: 'test-claude',
  format: 'anthropic',
  buildHeaders: (key: string) => ({
    'Content-Type': 'application/json',
    'x-api-key': key,
    'anthropic-version': '2023-06-01',
  }),
};

const validLlmJson = JSON.stringify({
  event: 'Test event',
  timestamp: '2026-03-21T00:00:00Z',
  epicenter: { countryId: 'USA', coordinates: [-98.58, 39.83] },
  countryImpacts: [
    {
      countryId: 'USA',
      severity: 'high',
      direction: 'negative',
      impactPercent: -20,
      reason: 'Direct impact',
      reasonZh: '直接影响',
    },
  ],
  cityImpacts: [
    {
      cityId: 'new-york',
      severity: 'high',
      direction: 'negative',
      impactType: 'market_crash',
    },
  ],
  activatedRelationships: ['USA-CHN-trade'],
  summary: 'Test summary',
  summaryZh: '测试摘要',
});

// ── Tests ──────────────────────────────────────────────────────

const originalFetch = global.fetch;

afterEach(() => {
  global.fetch = originalFetch;
});

describe('buildSystemPrompt', () => {
  it('includes country list and relationship context', () => {
    const prompt = buildSystemPrompt();
    expect(prompt).toContain('USA');
    expect(prompt).toContain('CHN');
    expect(prompt).toContain('trade');
    expect(prompt).toContain('SimulationResult');
    expect(prompt).toContain('JSON');
  });
});

describe('analyzeWithLlm', () => {
  it('sends correct request to OpenAI-format provider', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: validLlmJson } }],
      }),
    });

    await analyzeWithLlm('test input', openaiProvider, 'sk-test');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/chat/completions',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer sk-test',
        }),
      }),
    );

    const body = JSON.parse(
      (global.fetch as jest.Mock).mock.calls[0][1].body,
    );
    expect(body.model).toBe('test-model');
    expect(body.messages).toHaveLength(2);
    expect(body.messages[0].role).toBe('system');
    expect(body.messages[1].role).toBe('user');
    expect(body.messages[1].content).toBe('test input');
  });

  it('sends correct request to Anthropic-format provider', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ type: 'text', text: validLlmJson }],
      }),
    });

    await analyzeWithLlm('test input', anthropicProvider, 'sk-ant-test');

    expect(global.fetch).toHaveBeenCalledWith(
      'https://api.example.com/v1/messages',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          'x-api-key': 'sk-ant-test',
        }),
      }),
    );

    const body = JSON.parse(
      (global.fetch as jest.Mock).mock.calls[0][1].body,
    );
    expect(body.model).toBe('test-claude');
    expect(body.system).toBeDefined();
    expect(body.messages).toHaveLength(1);
    expect(body.messages[0].role).toBe('user');
  });

  it('parses valid response through Zod validation', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: validLlmJson } }],
      }),
    });

    const { result, error } = await analyzeWithLlm(
      'test input',
      openaiProvider,
      'sk-test',
    );

    expect(error).toBeUndefined();
    expect(result).not.toBeNull();
    expect(result!.event).toBe('Test event');
    expect(result!.epicenter.countryId).toBe('USA');
    expect(result!.countryImpacts).toHaveLength(1);
  });

  it('returns null + error on network failure', async () => {
    global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

    const { result, error } = await analyzeWithLlm(
      'test input',
      openaiProvider,
      'sk-test',
    );

    expect(result).toBeNull();
    expect(error).toContain('Network error');
  });

  it('returns null + error on timeout via AbortSignal', async () => {
    const controller = new AbortController();
    controller.abort();

    global.fetch = jest.fn().mockRejectedValue(controller.signal.reason);

    const { result, error } = await analyzeWithLlm(
      'test input',
      openaiProvider,
      'sk-test',
      controller.signal,
    );

    expect(result).toBeNull();
    expect(error).toBeDefined();
  });

  it('returns null + error on non-OK HTTP response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 401,
      statusText: 'Unauthorized',
    });

    const { result, error } = await analyzeWithLlm(
      'test input',
      openaiProvider,
      'sk-test',
    );

    expect(result).toBeNull();
    expect(error).toContain('401');
  });

  it('returns null + error when LLM returns invalid JSON', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [{ message: { content: 'not valid json at all' } }],
      }),
    });

    const { result, error } = await analyzeWithLlm(
      'test input',
      openaiProvider,
      'sk-test',
    );

    expect(result).toBeNull();
    expect(error).toBeDefined();
  });

  it('handles markdown-fenced JSON response', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        choices: [
          { message: { content: '```json\n' + validLlmJson + '\n```' } },
        ],
      }),
    });

    const { result, error } = await analyzeWithLlm(
      'test input',
      openaiProvider,
      'sk-test',
    );

    expect(error).toBeUndefined();
    expect(result).not.toBeNull();
    expect(result!.event).toBe('Test event');
  });

  it('extracts text from Anthropic response format', async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        content: [{ type: 'text', text: validLlmJson }],
      }),
    });

    const { result, error } = await analyzeWithLlm(
      'test input',
      anthropicProvider,
      'sk-ant-test',
    );

    expect(error).toBeUndefined();
    expect(result).not.toBeNull();
    expect(result!.event).toBe('Test event');
  });
});
