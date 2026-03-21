import { z } from 'zod';
import { COUNTRIES } from './countries';
import { CITIES } from './cities';
import type { SimulationResult } from './types';

const countryIds = new Set(COUNTRIES.map((c) => c.id));
const cityIds = new Set(CITIES.map((c) => c.id));

const severitySchema = z.enum(['critical', 'high', 'medium', 'low']);
const directionSchema = z.enum(['negative', 'positive', 'mixed']);

const countryImpactSchema = z.object({
  countryId: z.string(),
  severity: severitySchema,
  direction: directionSchema,
  impactPercent: z.coerce.number(),
  reason: z.string(),
  reasonZh: z.string().default(''),
});

const cityImpactSchema = z.object({
  cityId: z.string(),
  severity: severitySchema,
  direction: directionSchema,
  impactType: z.enum([
    'trade_disruption',
    'market_crash',
    'military_threat',
    'supply_shortage',
    'refugee_crisis',
    'energy_crisis',
    'infrastructure_damage',
    'opportunity',
    'other',
  ]),
});

const simulationResultSchema = z.object({
  event: z.string(),
  timestamp: z.string(),
  epicenter: z.object({
    countryId: z.string(),
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  countryImpacts: z.array(countryImpactSchema),
  cityImpacts: z.array(cityImpactSchema),
  activatedRelationships: z.array(z.string()).default([]),
  summary: z.string(),
  summaryZh: z.string().default(''),
});

/**
 * Strip markdown code fences wrapping JSON.
 * Handles ```json ... ``` and ``` ... ```
 */
function stripCodeFences(raw: string): string {
  const trimmed = raw.trim();
  const match = trimmed.match(/^```(?:json)?\s*\n?([\s\S]*?)\n?\s*```$/);
  return match ? match[1].trim() : trimmed;
}

/**
 * Parse and validate an LLM-returned SimulationResult JSON string.
 * Strips markdown fences, validates with Zod, filters unknown IDs, clamps ranges.
 */
export function parseSimulationResponse(raw: string): {
  result: SimulationResult | null;
  warnings: string[];
} {
  const warnings: string[] = [];

  if (!raw || !raw.trim()) {
    warnings.push('Empty response');
    return { result: null, warnings };
  }

  const cleaned = stripCodeFences(raw);

  let parsed: unknown;
  try {
    parsed = JSON.parse(cleaned);
  } catch {
    warnings.push('Invalid JSON: could not parse response');
    return { result: null, warnings };
  }

  // Pre-filter activatedRelationships to only strings before Zod validation
  if (
    parsed &&
    typeof parsed === 'object' &&
    'activatedRelationships' in parsed
  ) {
    const obj = parsed as Record<string, unknown>;
    if (Array.isArray(obj.activatedRelationships)) {
      obj.activatedRelationships = obj.activatedRelationships.filter(
        (r): r is string => typeof r === 'string',
      );
    }
  }

  const zodResult = simulationResultSchema.safeParse(parsed);

  if (!zodResult.success) {
    const issues = zodResult.error.issues.map(
      (i) => `${i.path.join('.')}: ${i.message}`,
    );
    warnings.push(...issues);
    return { result: null, warnings };
  }

  const data = zodResult.data;

  // Validate epicenter countryId
  if (!countryIds.has(data.epicenter.countryId)) {
    warnings.push(
      `Unknown epicenter countryId: ${data.epicenter.countryId}`,
    );
  }

  // Filter unknown countryIds
  const validCountryImpacts = data.countryImpacts.filter((ci) => {
    if (!countryIds.has(ci.countryId)) {
      warnings.push(`Dropped unknown countryId: ${ci.countryId}`);
      return false;
    }
    return true;
  });

  // Filter unknown cityIds
  const validCityImpacts = data.cityImpacts.filter((ci) => {
    if (!cityIds.has(ci.cityId)) {
      warnings.push(`Dropped unknown cityId: ${ci.cityId}`);
      return false;
    }
    return true;
  });

  // Clamp impactPercent to [-50, 50]
  const clampedCountryImpacts = validCountryImpacts.map((ci) => {
    let { impactPercent } = ci;
    if (impactPercent > 50 || impactPercent < -50) {
      warnings.push(
        `impactPercent ${impactPercent} for ${ci.countryId} clamped to [-50, 50]`,
      );
      impactPercent = Math.max(-50, Math.min(50, impactPercent));
    }
    return { ...ci, impactPercent };
  });

  const result: SimulationResult = {
    event: data.event,
    timestamp: data.timestamp,
    epicenter: data.epicenter as SimulationResult['epicenter'],
    countryImpacts: clampedCountryImpacts as SimulationResult['countryImpacts'],
    cityImpacts: validCityImpacts as SimulationResult['cityImpacts'],
    activatedRelationships: data.activatedRelationships,
    summary: data.summary,
    summaryZh: data.summaryZh,
  };

  return { result, warnings };
}
