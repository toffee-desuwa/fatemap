import type { PresetScenario } from './types';
import { SCENARIOS } from './scenarios';

/**
 * Score a scenario against user input by counting keyword matches.
 * Handles both space-separated tokens (English) and substring matching (Chinese).
 */
function scoreScenario(input: string, scenario: PresetScenario): number {
  const lower = input.toLowerCase();
  let score = 0;

  for (const keyword of scenario.keywords) {
    if (lower.includes(keyword.toLowerCase())) {
      score++;
    }
  }

  return score;
}

/**
 * Match user input to the best preset scenario.
 * Returns null if no scenario has ≥2 keyword matches.
 */
export function matchScenario(input: string): PresetScenario | null {
  if (!input.trim()) return null;

  let bestScore = 0;
  let bestScenario: PresetScenario | null = null;

  for (const scenario of SCENARIOS) {
    const score = scoreScenario(input, scenario);
    if (score > bestScore) {
      bestScore = score;
      bestScenario = scenario;
    }
  }

  return bestScore >= 2 ? bestScenario : null;
}

/**
 * Find the closest matching scenarios, sorted by keyword overlap descending.
 * Only returns scenarios with ≥2 keyword matches.
 */
export function findClosestScenarios(
  input: string,
  limit?: number,
): PresetScenario[] {
  if (!input.trim()) return [];

  const scored = SCENARIOS.map((scenario) => ({
    scenario,
    score: scoreScenario(input, scenario),
  }))
    .filter((s) => s.score >= 2)
    .sort((a, b) => b.score - a.score);

  const results = limit ? scored.slice(0, limit) : scored;
  return results.map((s) => s.scenario);
}
