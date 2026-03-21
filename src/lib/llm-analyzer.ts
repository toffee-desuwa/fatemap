import { COUNTRIES } from './countries';
import { RELATIONSHIPS } from './relationships';
import { parseSimulationResponse } from './llm-schema';
import type { LlmProvider, SimulationResult } from './types';

/**
 * Build the system prompt with world context for LLM geopolitical analysis.
 */
export function buildSystemPrompt(): string {
  const countryList = COUNTRIES.map(
    (c) => `${c.id} (${c.name}, ${c.region})`,
  ).join(', ');

  const relationshipSummary = RELATIONSHIPS.map(
    (r) => `${r.from}-${r.to} (${r.type}, strength ${r.strength})`,
  ).join(', ');

  return `You are a geopolitical analyst. Given a "what if" scenario, predict global impacts.

WORLD CONTEXT:
Countries: ${countryList}
Relationships: ${relationshipSummary}

Return a single JSON object matching this SimulationResult schema:
{
  "event": "string - the scenario description",
  "timestamp": "string - ISO 8601 timestamp",
  "epicenter": { "countryId": "string - ISO alpha-3", "coordinates": [lng, lat] },
  "countryImpacts": [{ "countryId": "string", "severity": "critical|high|medium|low", "direction": "negative|positive|mixed", "impactPercent": -50 to 50, "reason": "string", "reasonZh": "string (Chinese)" }],
  "cityImpacts": [{ "cityId": "string (kebab-case)", "severity": "critical|high|medium|low", "direction": "negative|positive|mixed", "impactType": "trade_disruption|market_crash|military_threat|supply_shortage|refugee_crisis|energy_crisis|infrastructure_damage|opportunity|other" }],
  "activatedRelationships": ["string - relationship IDs like USA-CHN-trade"],
  "summary": "string - English summary",
  "summaryZh": "string - Chinese summary"
}

Rules:
- Use ONLY country IDs from the provided list
- impactPercent must be between -50 and 50
- Include 5-15 country impacts and 3-8 city impacts
- Return ONLY the JSON object, no other text`;
}

/**
 * Extract the LLM's text content from a provider-specific response body.
 */
function extractContent(
  format: 'openai' | 'anthropic',
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  body: any,
): string {
  if (format === 'anthropic') {
    return body?.content?.[0]?.text ?? '';
  }
  return body?.choices?.[0]?.message?.content ?? '';
}

/**
 * Build the fetch URL and request body for the given provider format.
 */
function buildRequest(
  input: string,
  provider: LlmProvider,
  systemPrompt: string,
): { url: string; body: string } {
  if (provider.format === 'anthropic') {
    return {
      url: `${provider.baseUrl}/messages`,
      body: JSON.stringify({
        model: provider.model,
        max_tokens: 4096,
        system: systemPrompt,
        messages: [{ role: 'user', content: input }],
      }),
    };
  }

  // OpenAI-compatible format (DeepSeek, Gemini, OpenAI)
  return {
    url: `${provider.baseUrl}/chat/completions`,
    body: JSON.stringify({
      model: provider.model,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: input },
      ],
      temperature: 0.3,
      max_tokens: 4096,
    }),
  };
}

/**
 * Analyze a geopolitical scenario using a BYOK LLM provider.
 * Returns the validated SimulationResult or null with an error message.
 */
export async function analyzeWithLlm(
  input: string,
  provider: LlmProvider,
  apiKey: string,
  signal?: AbortSignal,
): Promise<{ result: SimulationResult | null; error?: string }> {
  const systemPrompt = buildSystemPrompt();
  const { url, body } = buildRequest(input, provider, systemPrompt);

  let response: Response;
  try {
    response = await fetch(url, {
      method: 'POST',
      headers: provider.buildHeaders(apiKey),
      body,
      signal,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    return { result: null, error: `Request failed: ${message}` };
  }

  if (!response.ok) {
    return {
      result: null,
      error: `API error: ${response.status} ${response.statusText}`,
    };
  }

  const json = await response.json();
  const rawContent = extractContent(provider.format, json);

  if (!rawContent) {
    return { result: null, error: 'Empty response from LLM' };
  }

  const { result, warnings } = parseSimulationResponse(rawContent);

  if (!result) {
    return {
      result: null,
      error: `Invalid LLM response: ${warnings.join('; ')}`,
    };
  }

  return { result };
}
