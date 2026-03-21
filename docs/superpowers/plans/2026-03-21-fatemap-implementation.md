# FateMap Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build FateMap — an AI geopolitical prediction sandbox that visualizes "what if" scenarios as shockwave animations on a world map.

**Architecture:** Next.js 15 + deck.gl map with GeoJsonLayer (country fills), PathLayer (relationship network), ScatterplotLayer (city markers + shockwave rings). Keyword analyzer for 28 preset scenarios, BYOK LLM for custom input. Two-phase animation: ripple → network reveal. LLM calls are client-side only (browser → LLM API directly, no server proxy). The spec mentions `src/app/api/fate/simulate/route.ts` but section 14 explicitly says "no proxy server needed" — we follow section 14 and skip the API route.

**Tech Stack:** Next.js 15, React 19, TypeScript, deck.gl, MapLibre GL, Tailwind CSS v4, next-intl, Zod

**Spec:** `docs/superpowers/specs/2026-03-21-fatemap-design.md` (in freightseer repo, copy over in Task 1)

**Source data:** Agent research outputs from brainstorming session. If research data files are not accessible, the implementing engineer should generate plausible data matching the TypeScript types — use the test contracts as the source of truth for data shape. The spec defines exact counts: 48 countries, 84 cities, 142 relationships, 28 scenarios.

---

## File Structure

```
fatemap/
├── public/
│   └── geo/
│       └── countries-110m.json          # Natural Earth GeoJSON
├── messages/
│   ├── en.json                          # English i18n messages
│   └── zh.json                          # Chinese i18n messages
├── src/
│   ├── app/
│   │   ├── globals.css                  # CSS variables, fonts, theme
│   │   ├── layout.tsx                   # Root layout
│   │   └── [locale]/
│   │       ├── layout.tsx               # Locale layout with next-intl
│   │       ├── page.tsx                 # Landing page
│   │       ├── dashboard/
│   │       │   ├── layout.tsx           # Dashboard layout
│   │       │   └── page.tsx             # Dashboard page
│   │       └── settings/
│   │           └── page.tsx             # API key settings
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppShell.tsx             # Main app container (map + panels)
│   │   │   ├── Header.tsx               # Top nav bar
│   │   │   └── LocaleSwitcher.tsx       # EN/ZH toggle
│   │   ├── map/
│   │   │   ├── FateMap.tsx              # Main interactive map
│   │   │   ├── FateHeroMap.tsx          # Landing page hero map
│   │   │   └── FateHeroMapLoader.tsx    # Dynamic import wrapper
│   │   ├── simulation/
│   │   │   ├── ScenarioInput.tsx        # "What if" input box + examples
│   │   │   └── ImpactReport.tsx         # Right panel results
│   │   ├── feed/
│   │   │   ├── EventFeed.tsx            # Left sidebar feed (Phase 2)
│   │   │   └── EventCard.tsx            # Individual event card
│   │   ├── settings/
│   │   │   └── ApiKeySettings.tsx       # BYOK configuration
│   │   └── charts/
│   │       └── AnimatedNumber.tsx       # Reused from FreightSeer
│   ├── hooks/
│   │   └── useSimulation.ts             # Simulation state management
│   ├── lib/
│   │   ├── countries.ts                 # 48 countries data
│   │   ├── cities.ts                    # 84 cities data
│   │   ├── relationships.ts             # 142 relationships data
│   │   ├── scenarios.ts                 # 28 preset scenarios
│   │   ├── types.ts                     # Shared type definitions
│   │   ├── colors.ts                    # Impact severity color palette
│   │   ├── keyword-analyzer.ts          # Preset matching engine
│   │   ├── llm-analyzer.ts             # BYOK LLM integration
│   │   ├── llm-providers.ts            # Provider configs (DeepSeek, Gemini, etc.)
│   │   ├── llm-schema.ts              # Zod validation schema
│   │   ├── impact-wave.ts             # Shockwave ripple animation state
│   │   ├── network-glow.ts            # Relationship line glow layers
│   │   ├── country-regions.ts          # GeoJSON country polygon fills
│   │   └── city-markers.ts            # City impact marker layers
│   ├── i18n/
│   │   ├── routing.ts
│   │   ├── request.ts
│   │   └── navigation.ts
│   └── middleware.ts
├── docs/
│   └── superpowers/
│       ├── specs/
│       │   └── 2026-03-21-fatemap-design.md
│       └── plans/
│           └── 2026-03-21-fatemap-implementation.md
├── package.json
├── tsconfig.json
├── next.config.ts
├── postcss.config.mjs
├── eslint.config.mjs
├── jest.config.ts
├── jest.setup.ts
├── .gitignore
└── README.md
```

---

## Task 1: Project Scaffold

**Goal:** Initialize the FateMap repo with all config, dependencies, and infrastructure copied from FreightSeer.

**Files:**
- Create: `D:/toffee_code_in_Cursor/fatemap/` (all config files)
- Source: `D:/toffee_code_in_Cursor/freightseer/` (copy infrastructure)

- [ ] **Step 1: Copy config files from FreightSeer**

```bash
cd D:/toffee_code_in_Cursor/fatemap
# Copy all config files
cp ../freightseer/tsconfig.json .
cp ../freightseer/next.config.ts .
cp ../freightseer/postcss.config.mjs .
cp ../freightseer/eslint.config.mjs .
cp ../freightseer/jest.config.ts .
cp ../freightseer/jest.setup.ts .
cp ../freightseer/.gitignore .
cp ../freightseer/next-env.d.ts .
cp ../freightseer/package.json .
```

- [ ] **Step 2: Update package.json**

Change `name` to `"fatemap"`, `description` to `"AI Geopolitical Prediction Sandbox"`. Remove FreightSeer-specific scripts if any. Add `zod` to dependencies.

Run: `npm install`

- [ ] **Step 3: Copy i18n infrastructure**

```bash
mkdir -p src/i18n src/__mocks__ messages
cp ../freightseer/src/i18n/routing.ts src/i18n/
cp ../freightseer/src/i18n/request.ts src/i18n/
cp ../freightseer/src/i18n/navigation.ts src/i18n/
cp ../freightseer/src/middleware.ts src/
cp ../freightseer/src/__mocks__/next-intl.tsx src/__mocks__/
cp ../freightseer/src/__mocks__/next-intl-navigation.tsx src/__mocks__/
cp ../freightseer/src/__mocks__/next-intl-routing.ts src/__mocks__/
cp ../freightseer/src/__mocks__/next-intl-server.ts src/__mocks__/
```

- [ ] **Step 4: Copy reusable components**

```bash
mkdir -p src/components/charts src/components/layout src/components/map
cp ../freightseer/src/components/charts/AnimatedNumber.tsx src/components/charts/
cp ../freightseer/src/components/layout/LocaleSwitcher.tsx src/components/layout/
cp ../freightseer/src/components/map/HeroMapLoader.tsx src/components/map/
```

Rename `HeroMapLoader.tsx` to `FateHeroMapLoader.tsx` and update the dynamic import path inside to point to `./FateHeroMap`.

- [ ] **Step 5: Copy and adapt globals.css**

```bash
mkdir -p src/app
cp ../freightseer/src/app/globals.css src/app/
```

Update CSS variables for FateMap branding (keep dark theme, MiSans font, adjust primary color).

- [ ] **Step 6: Create minimal app structure**

Create `src/app/layout.tsx`, `src/app/[locale]/layout.tsx`, `src/app/[locale]/page.tsx` — minimal versions that render "FateMap" text to verify the app boots.

- [ ] **Step 7: Git init and first commit**

```bash
cd D:/toffee_code_in_Cursor/fatemap
git init
git add -A
git commit -m "feat: project scaffold — Next.js 15 + deck.gl + i18n infra from FreightSeer"
```

- [ ] **Step 8: Verify app boots**

```bash
npm run dev
```

Visit `http://localhost:3000` — should show "FateMap" text.

---

## Task 2: Type Definitions & Color Palette

**Goal:** Define all shared types and the impact severity color scheme.

**Files:**
- Create: `src/lib/types.ts`
- Create: `src/lib/colors.ts`

- [ ] **Step 1: Write types.ts**

All interfaces from spec section 5, plus `LlmProvider`. Export everything:

```typescript
export interface Country {
  id: string;           // ISO alpha-3: "USA", "CHN", "TWN"
  name: string;
  nameCn: string;
  center: [number, number];  // [lng, lat]
  capital: [number, number];
  region: string;       // "East Asia", "Western Europe", etc.
}

export interface City {
  id: string;
  name: string;
  nameCn: string;
  coordinates: [number, number];
  countryId: string;
  type: "financial" | "port" | "tech" | "political" | "energy" | "manufacturing" | "logistics";
  importance: 1 | 2 | 3 | 4 | 5;
}

export interface Relationship {
  id: string;           // e.g. "USA-CHN-trade"
  from: string;
  to: string;
  type: "trade" | "military_alliance" | "energy_dependency" | "supply_chain" | "political" | "geographic_proximity";
  strength: 1 | 2 | 3 | 4 | 5;
}

export interface CountryImpact {
  countryId: string;
  severity: "critical" | "high" | "medium" | "low";
  direction: "negative" | "positive" | "mixed";
  impactPercent: number;      // -50 to +50
  reason: string;
  reasonZh: string;
}

export interface CityImpact {
  cityId: string;
  severity: "critical" | "high" | "medium" | "low";
  direction: "negative" | "positive" | "mixed";
  impactType: "trade_disruption" | "market_crash" | "military_threat" | "supply_shortage" | "refugee_crisis" | "energy_crisis" | "infrastructure_damage" | "opportunity" | "other";
}

export interface SimulationResult {
  event: string;
  timestamp: string;
  epicenter: {
    countryId: string;
    coordinates: [number, number];
  };
  countryImpacts: CountryImpact[];
  cityImpacts: CityImpact[];
  activatedRelationships: string[];
  summary: string;
  summaryZh: string;
}

export interface PresetScenario {
  id: string;
  name: string;
  nameCn: string;
  category: "military" | "economic" | "climate" | "health" | "political" | "trade" | "energy" | "technology";
  description: string;
  descriptionZh: string;
  eventText: string;
  keywords: string[];
  result: SimulationResult;
}

export interface LlmProvider {
  id: string;
  name: string;
  baseUrl: string;
  model: string;
  buildHeaders: (apiKey: string) => Record<string, string>;
}

export type AnimationPhase = 'idle' | 'ripple' | 'network' | 'persistent';
```

- [ ] **Step 2: Write colors.ts**

```typescript
export const SEVERITY_COLORS = {
  critical: [255, 51, 68] as [number, number, number],    // #FF3344
  high: [255, 136, 68] as [number, number, number],       // #FF8844
  medium: [255, 204, 68] as [number, number, number],     // #FFCC44
  low: [68, 136, 255] as [number, number, number],        // #4488FF
  positive: [68, 255, 136] as [number, number, number],   // #44FF88
  unaffected: [51, 68, 85] as [number, number, number],   // #334455 (not a severity level — used for default/dim state of non-impacted countries and idle network lines)
};
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/types.ts src/lib/colors.ts
git commit -m "feat: add type definitions and severity color palette"
```

---

## Task 3: Data Layer — Countries & Cities

**Goal:** Create the 48-country and 84-city datasets as TypeScript modules.

**Files:**
- Create: `src/lib/countries.ts`
- Create: `src/lib/cities.ts`
- Test: `src/lib/__tests__/countries.test.ts`
- Test: `src/lib/__tests__/cities.test.ts`

- [ ] **Step 1: Write failing test for countries**

Test: all 48 countries have valid ISO alpha-3 IDs, unique IDs, valid coordinates (lng -180..180, lat -90..90), non-empty names.

- [ ] **Step 2: Run test — verify FAIL**

- [ ] **Step 3: Write countries.ts**

Convert the agent research data (48 countries with id, name, nameCn, center, capital, region) into a typed array. Source data is in the brainstorming session agent output.

- [ ] **Step 4: Run test — verify PASS**

- [ ] **Step 5: Write failing test for cities**

Test: all 84 cities have valid IDs, valid countryId referencing a real country, valid coordinates, valid type enum, importance 1-5.

- [ ] **Step 6: Run test — verify FAIL**

- [ ] **Step 7: Write cities.ts**

Convert the agent research data (84 cities). Source data in brainstorming session agent output.

- [ ] **Step 8: Run test — verify PASS**

- [ ] **Step 9: Commit**

```bash
git commit -m "feat: add countries (48) and cities (84) data layers"
```

---

## Task 4: Data Layer — Relationships

**Goal:** Create the 142-relationship network dataset.

**Files:**
- Create: `src/lib/relationships.ts`
- Test: `src/lib/__tests__/relationships.test.ts`

- [ ] **Step 1: Write failing test**

Test: all relationships have unique IDs matching `{from}-{to}-{type}` pattern, valid from/to referencing real countries, valid type enum, strength 1-5. Verify 142 total.

- [ ] **Step 2: Run test — verify FAIL**

- [ ] **Step 3: Write relationships.ts**

Convert the 142 relationships from agent research. Auto-generate IDs as `${from}-${to}-${type}`.

- [ ] **Step 4: Run test — verify PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add relationship network (142 bilateral connections)"
```

---

## Task 5: Data Layer — Preset Scenarios

**Goal:** Create the 28 pre-computed scenario results.

**Files:**
- Create: `src/lib/scenarios.ts`
- Test: `src/lib/__tests__/scenarios.test.ts`

- [ ] **Step 1: Write failing test**

Test: 28 scenarios, unique IDs, valid categories, all referenced countryIds and cityIds exist in countries/cities datasets, epicenter coordinates valid, keywords array non-empty.

- [ ] **Step 2: Run test — verify FAIL**

- [ ] **Step 3: Write scenarios.ts**

Convert 28 scenarios from agent research. For each scenario, create the full `PresetScenario` object with pre-computed `SimulationResult`. Generate `activatedRelationships` by finding matching relationship IDs from the relationships dataset based on affected countries.

- [ ] **Step 4: Run test — verify PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add 28 preset geopolitical scenarios"
```

---

## Task 6: Keyword Analyzer

**Goal:** Build the rule-based scenario matching engine.

**Files:**
- Create: `src/lib/keyword-analyzer.ts`
- Test: `src/lib/__tests__/keyword-analyzer.test.ts`

- [ ] **Step 1: Write failing tests**

Tests:
- Exact match: "Taiwan Strait military conflict" → returns taiwan-strait-crisis scenario
- Chinese match: "台湾海峡军事冲突" → returns taiwan-strait-crisis
- Partial match: "Suez Canal blocked" → returns suez-canal-closure
- No match: "random gibberish xyz" → returns null
- Best match: "China tariff war trade" → returns the tariff scenario (highest keyword overlap)
- Case insensitive: "TAIWAN strait" matches

- [ ] **Step 2: Run tests — verify FAIL**

- [ ] **Step 3: Implement keyword-analyzer.ts**

```typescript
export function matchScenario(input: string): PresetScenario | null
export function findClosestScenarios(input: string, limit?: number): PresetScenario[]
```

Algorithm: lowercase input, split into tokens, count keyword overlap per scenario, return highest-scoring scenario above threshold (≥2 keyword matches). `findClosestScenarios` returns top N sorted by score.

- [ ] **Step 4: Run tests — verify PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add keyword analyzer for preset scenario matching"
```

---

## Task 7: Zod Schema & LLM Response Validation

**Goal:** Create Zod schema for validating LLM-returned SimulationResult JSON.

**Files:**
- Create: `src/lib/llm-schema.ts`
- Test: `src/lib/__tests__/llm-schema.test.ts`

- [ ] **Step 1: Write failing tests**

Tests:
- Valid complete JSON → passes validation
- JSON wrapped in markdown code fences → extracted and validated
- Unknown countryId → dropped from result
- impactPercent > 50 → clamped to 50
- Missing required fields → validation error
- Partial valid data → returns valid portion + warnings

- [ ] **Step 2: Run tests — verify FAIL**

- [ ] **Step 3: Implement llm-schema.ts**

```typescript
export function parseSimulationResponse(raw: string): { result: SimulationResult | null; warnings: string[] }
```

Uses Zod `.safeParse()`. Strips markdown fences. Validates countryId/cityId against known datasets. Clamps ranges.

- [ ] **Step 4: Run tests — verify PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add Zod validation for LLM simulation responses"
```

---

## Task 8: LLM Analyzer & Provider Config

**Goal:** Build the BYOK LLM integration with multi-provider support.

**Files:**
- Create: `src/lib/llm-providers.ts`
- Create: `src/lib/llm-analyzer.ts`
- Test: `src/lib/__tests__/llm-analyzer.test.ts`

- [ ] **Step 1: Write llm-providers.ts**

Define provider configs: DeepSeek, Google Gemini, OpenAI, Anthropic. Each has: id, name, baseUrl, model, headers builder.

- [ ] **Step 2: Write failing tests for llm-analyzer**

Tests (mock fetch):
- Constructs correct system prompt with world context
- Sends user input as user message
- Passes response through Zod validation
- Returns null + error on timeout (AbortController)
- Returns null + error on network failure

- [ ] **Step 3: Run tests — verify FAIL**

- [ ] **Step 4: Implement llm-analyzer.ts**

```typescript
export async function analyzeWithLlm(
  input: string,
  provider: LlmProvider,
  apiKey: string,
  signal?: AbortSignal
): Promise<{ result: SimulationResult | null; error?: string }>
```

Builds system prompt with country list and relationship context. Calls provider API. Parses response with `parseSimulationResponse`.

- [ ] **Step 5: Run tests — verify PASS**

- [ ] **Step 6: Commit**

```bash
git commit -m "feat: add BYOK LLM analyzer with multi-provider support"
```

---

## Task 9: Simulation Hook

**Goal:** React hook managing simulation state (keyword match → LLM fallback → error handling).

**Files:**
- Create: `src/hooks/useSimulation.ts`
- Test: `src/hooks/__tests__/useSimulation.test.ts`

- [ ] **Step 1: Write failing tests for useSimulation**

Tests (use `@testing-library/react` `renderHook`):
- Keyword match: simulate("Taiwan Strait conflict") → returns result instantly, loading stays false
- No match, no key: simulate("random xyz") → returns null, suggestions populated with 3 presets
- Animation phases: after simulate(), phases transition idle → ripple (0-2s) → network (2-5s) → persistent
- Clear: calling clear() resets result, error, suggestions, and animationPhase to idle
- Error state: when LLM fails, error is set and suggestions shown

- [ ] **Step 2: Run tests — verify FAIL**

- [ ] **Step 3: Implement useSimulation.ts**

```typescript
export function useSimulation(): {
  simulate: (input: string) => Promise<void>;
  result: SimulationResult | null;
  loading: boolean;
  error: string | null;
  suggestions: PresetScenario[];
  clear: () => void;
  animationPhase: 'idle' | 'ripple' | 'network' | 'persistent';
}
```

Flow:
1. Try `matchScenario(input)` — if match, return instantly
2. If no match and LLM key configured, call `analyzeWithLlm()`
3. If no match and no key, return `findClosestScenarios(input, 3)` as suggestions
4. Manage `animationPhase` timing: idle → ripple (0-2s) → network (2-5s) → persistent

- [ ] **Step 4: Run tests — verify PASS**

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add useSimulation hook with keyword→LLM fallback"
```

---

## Task 10: Network Glow Lines (Relationship Visualization)

**Goal:** Render the 142 relationships as glowing PathLayer lines on the map.

**Files:**
- Create: `src/lib/network-glow.ts`

- [ ] **Step 1: Implement network-glow.ts**

Adapted from FreightSeer's `glow-layers.ts`. Creates 3-layer PathLayer stack for relationship network.

```typescript
export function createNetworkGlowLayers(options: {
  relationships: Relationship[];
  countries: Country[];
  activatedIds: string[];
  animationPhase: 'idle' | 'ripple' | 'network' | 'persistent';
  pulseTime?: number;
}): PathLayer[]
```

States:
- `idle`: all lines dim (#334455, opacity 0.1)
- `network`/`persistent`: activated lines glow with severity color, non-activated dim
- Lines drawn as straight paths from `country.center` to `country.center`

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add network glow lines for relationship visualization"
```

---

## Task 11: Country Fill Layer

**Goal:** Render country polygons with severity-based colors using GeoJsonLayer.

**Files:**
- Create: `src/lib/country-regions.ts`
- Create: `public/geo/countries-110m.json` (download Natural Earth data)

- [ ] **Step 1: Download and prepare GeoJSON**

Use Natural Earth 110m "Admin 0 - Map Units" (includes Taiwan as separate feature). Place in `public/geo/countries-110m.json`.

Download source: `https://cdn.jsdelivr.net/npm/world-atlas@2/countries-110m.json` (TopoJSON format — convert to GeoJSON using `topojson-client`), or get GeoJSON directly from `https://raw.githubusercontent.com/datasets/geo-countries/master/data/countries.geojson` and simplify. Match features via `properties.ISO_A3`.

- [ ] **Step 2: Implement country-regions.ts**

```typescript
export function createCountryFillLayer(options: {
  geojson: FeatureCollection;
  countryImpacts: CountryImpact[];
  animationPhase: 'idle' | 'ripple' | 'network' | 'persistent';
}): GeoJsonLayer
```

Maps `feature.properties.ISO_A3` to `CountryImpact.countryId`. Returns `GeoJsonLayer` with `getFillColor` driven by severity. Unaffected countries: transparent. When `animationPhase` is `idle`, all transparent.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add GeoJSON country fill layer with severity colors"
```

---

## Task 12: City Impact Markers

**Goal:** Render affected cities as pulsing ScatterplotLayer markers.

**Files:**
- Create: `src/lib/city-markers.ts`

- [ ] **Step 1: Implement city-markers.ts**

Adapted from FreightSeer's `pulsing-ports.ts`. Two-layer ScatterplotLayer: outer pulsing halo + inner dot.

```typescript
export function createCityMarkerLayers(options: {
  cities: City[];
  cityImpacts: CityImpact[];
  animationTime: number;
  animationPhase: 'idle' | 'ripple' | 'network' | 'persistent';
}): ScatterplotLayer[]
```

Only renders markers for impacted cities during `network`/`persistent` phase. Staggered fade-in (100ms per city).

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add pulsing city impact markers"
```

---

## Task 13: Shockwave Ripple Animation

**Goal:** Render the expanding concentric circles from the epicenter.

**Files:**
- Create: `src/lib/impact-wave.ts`

- [ ] **Step 1: Implement impact-wave.ts**

```typescript
export function createShockwaveLayers(options: {
  epicenter: [number, number];
  animationTime: number; // 0-2 seconds
  animationPhase: 'idle' | 'ripple' | 'network' | 'persistent';
}): ScatterplotLayer[]
```

Creates 3-4 ScatterplotLayer instances, each representing one expanding ring. Rings expand from epicenter outward. Uses `getRadius` driven by `animationTime`. Color gradient: red → orange → yellow with decreasing opacity.

During `ripple` phase only. Fades out at transition to `network` phase.

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add shockwave ripple animation layers"
```

---

## Task 14: FateMap Component (Main Interactive Map)

**Goal:** The core map component wiring all layers together.

**Files:**
- Create: `src/components/map/FateMap.tsx`

- [ ] **Step 1: Implement FateMap.tsx**

deck.gl + MapLibre GL map combining:
- Country fill layer (GeoJsonLayer)
- Network glow layers (PathLayer x3)
- City marker layers (ScatterplotLayer x2)
- Shockwave ripple layers (ScatterplotLayer x4)

Props:
```typescript
interface FateMapProps {
  simulationResult: SimulationResult | null;
  animationPhase: 'idle' | 'ripple' | 'network' | 'persistent';
  onCountryClick?: (countryId: string) => void;
  onCityClick?: (cityId: string) => void;
}
```

Uses `requestAnimationFrame` for animation timing. Fetches GeoJSON on mount. Initial view: world centered, zoom ~1.5.

Click interactions:
- Country click: `onCountryClick` prop → right panel scrolls to that country's detail
- City click: show tooltip popover with city name, impact type, severity (use deck.gl `getTooltip` or a positioned absolute div based on `pickInfo`)

- [ ] **Step 2: Verify map renders with empty state**

Run dev server. Map should show dark base map with dim network lines (idle state).

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add FateMap component with all visualization layers"
```

---

## Task 15: ScenarioInput Component

**Goal:** "What if..." input box with preset example buttons.

**Files:**
- Create: `src/components/simulation/ScenarioInput.tsx`

- [ ] **Step 1: Implement ScenarioInput.tsx**

```typescript
interface ScenarioInputProps {
  onSimulate: (input: string) => void;
  loading: boolean;
  suggestions?: PresetScenario[];
}
```

Features:
- Textarea with placeholder "What if...?" / "如果...会怎样？"
- 6 example buttons (pick from preset scenarios): click fills textarea + auto-submits
- Submit button (disabled when empty or loading)
- Loading state: pulsing "Simulating..." text
- Suggestion chips: when no match found, show 3 closest presets as clickable chips
- 1000 char max

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add ScenarioInput with example buttons and suggestions"
```

---

## Task 16: ImpactReport Component

**Goal:** Right panel showing simulation results ranked by severity.

**Files:**
- Create: `src/components/simulation/ImpactReport.tsx`

- [ ] **Step 1: Implement ImpactReport.tsx**

```typescript
interface ImpactReportProps {
  result: SimulationResult;
  selectedCountryId?: string;
  onCountryClick?: (countryId: string) => void;
}
```

Features:
- Event summary at top
- Country impacts ranked by severity (critical first)
- Each row: country flag emoji + name + severity badge + impactPercent (AnimatedNumber) + reason
- Staggered cascade animation (100ms per row, adapted from FreightSeer SimulationPanel)
- City impacts section below countries
- Scroll to selected country when `selectedCountryId` changes
- Clear button

- [ ] **Step 2: Commit**

```bash
git commit -m "feat: add ImpactReport panel with cascading animation"
```

---

## Task 17: AppShell & Header

**Goal:** Main layout container wiring map + input + report together.

**Files:**
- Create: `src/components/layout/AppShell.tsx`
- Create: `src/components/layout/Header.tsx`

- [ ] **Step 1: Implement Header.tsx**

FateMap branding. Nav items: Dashboard, Settings. LocaleSwitcher. AI status indicator ("AI: Connected" / "AI: Preset Only"). GitHub link.

- [ ] **Step 2: Implement AppShell.tsx**

Grid layout: `grid-cols-[1fr_360px]` (map + right panel). Right panel contains ScenarioInput at top, ImpactReport below (when result exists).

State management:
- Wire `useSimulation` hook
- Pass `simulationResult` and `animationPhase` to FateMap
- Pass result to ImpactReport
- Handle country click: map → report scroll
- Handle simulation flash (33ms white flash at t=0): add a full-screen absolute overlay div, set `background: white`, opacity 0→1→0 over 33ms using CSS `@keyframes`. Trigger on `animationPhase` transition from `idle` to `ripple`.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add AppShell and Header with map+panel layout"
```

---

## Task 18: Dashboard Page & Layout

**Goal:** Wire everything into the dashboard route.

**Files:**
- Create: `src/app/[locale]/dashboard/layout.tsx`
- Create: `src/app/[locale]/dashboard/page.tsx`

- [ ] **Step 1: Implement dashboard layout and page**

Dashboard layout wraps AppShell. Page imports and renders the layout. Dynamic imports for map components (no SSR for deck.gl).

- [ ] **Step 2: Test end-to-end**

1. Visit `/en/dashboard`
2. See dark map with dim network lines
3. Click example button → see shockwave animation → countries light up → report appears
4. Type custom text → keyword match works

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: wire dashboard page with full simulation flow"
```

---

## Task 19: i18n Messages

**Goal:** Create English and Chinese message files.

**Files:**
- Create: `messages/en.json`
- Create: `messages/zh.json`

- [ ] **Step 1: Write en.json**

Namespaces: common, landing, dashboard, simulation, settings, scenarios. All UI strings in English.

- [ ] **Step 2: Write zh.json**

Chinese translations for all keys.

- [ ] **Step 3: Update all components to use `useTranslations()`**

Replace hardcoded strings in Header, ScenarioInput, ImpactReport, AppShell with i18n message keys.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add i18n messages (en/zh) and wire translations"
```

---

## Task 20: Settings Page (BYOK)

**Goal:** API key configuration page.

**Files:**
- Create: `src/app/[locale]/settings/page.tsx`
- Create: `src/components/settings/ApiKeySettings.tsx`

- [ ] **Step 1: Implement ApiKeySettings.tsx**

Provider dropdown (DeepSeek, Gemini, OpenAI, Anthropic). API key input (password field). Test button (sends a simple test prompt, shows success/fail). Save to localStorage.

- [ ] **Step 2: Implement settings page**

Simple page wrapping ApiKeySettings with Header.

- [ ] **Step 3: Wire LLM status to Header**

Read localStorage on mount. Show "AI: Connected" (green dot) or "AI: Preset Only" (gray dot).

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: add BYOK settings page with multi-provider support"
```

---

## Task 21: Landing Page

**Goal:** Marketing-grade landing page with hero map.

**Files:**
- Create: `src/components/map/FateHeroMap.tsx`
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Implement FateHeroMap.tsx**

Non-interactive map (controller disabled). Auto-plays 3 preset scenarios cycling every 10 seconds. Starts after `onLoad` + 1s delay. Uses same layer stack as FateMap but simplified (no click handlers, no right panel).

- [ ] **Step 2: Implement landing page**

Structure:
- Hero: full-screen FateHeroMap background + gradient overlay + logo + tagline + CTA
- Feature cards: 6 cards in 3-col grid
- Tech section: deck.gl, AI, open source badges
- CTA: "Try It Now" → /dashboard
- Footer

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add landing page with animated hero map"
```

---

## Task 22: OG Image & Meta Tags

**Goal:** Social preview image and meta tags for sharing.

**Files:**
- Create: `src/app/opengraph-image.tsx`
- Modify: `src/app/[locale]/layout.tsx` (metadata)

- [ ] **Step 1: Create OG image**

Next.js OG image generation. Dark background, "FateMap" logo, tagline, world map silhouette.

- [ ] **Step 2: Update metadata**

Title: "FateMap — Simulate Any Event, Watch the World React". Description, OG tags, Twitter card.

- [ ] **Step 3: Commit**

```bash
git commit -m "feat: add OG social preview image and meta tags"
```

---

## Task 23: Phase 2 — Event Feed

**Goal:** Left sidebar with hot events feed.

**Files:**
- Create: `src/components/feed/EventFeed.tsx`
- Create: `src/components/feed/EventCard.tsx`
- Modify: `src/components/layout/AppShell.tsx` (add left sidebar)

- [ ] **Step 1: Implement EventCard.tsx**

```typescript
interface EventCardProps {
  scenario: PresetScenario;
  onClick: () => void;
  active?: boolean;
}
```

Shows: category icon, name, description, severity badge. Click → triggers simulation.

- [ ] **Step 2: Implement EventFeed.tsx**

Scrollable list of EventCards. Category filter tabs at top (All / Military / Economic / Climate / etc.). Search input for filtering.

- [ ] **Step 3: Update AppShell**

Add left sidebar: `grid-cols-[240px_1fr_360px]`. Show/hide feed based on screen width. Mobile: hamburger toggle.

- [ ] **Step 4: Test end-to-end**

Click event card → map animates → report shows.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add event feed sidebar with category filters (Phase 2)"
```

---

## Task 24: Responsive Design

**Goal:** Make dashboard and landing page work on tablet and mobile.

**Files:**
- Modify: `src/components/layout/AppShell.tsx`
- Modify: `src/components/simulation/ImpactReport.tsx`
- Modify: `src/app/[locale]/page.tsx`

- [ ] **Step 1: Desktop → Tablet**

Hide event feed sidebar at `<1024px`. Right panel becomes overlay on map.

- [ ] **Step 2: Tablet → Mobile**

At `<768px`: full-screen map, floating input at top, bottom sheet for report. Landing page hero 60vh.

- [ ] **Step 3: Touch interactions**

deck.gl has built-in touch pan/zoom/rotate. Ensure:
- Tap country = same as click (triggers `onCountryClick`)
- Tap city = shows tooltip popover
- No long-press needed for touch — tap is sufficient for mobile UX

- [ ] **Step 4: Test at multiple breakpoints**

Verify 1440px, 1024px, 768px, 375px.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat: add responsive design for tablet and mobile"
```

---

## Task 25: README & Final Polish

**Goal:** Golden-structure README for GitHub.

**Files:**
- Create: `README.md`
- Create: `README.zh-CN.md`

- [ ] **Step 1: Write README.md**

Structure: logo + one-line hook + badges + GIF placeholder + What/Why/Demo/Quick Start/Architecture/Contributing. English primary.

One-liner: "Input any event. Watch the world react. AI-powered geopolitical simulation on a world map."

- [ ] **Step 2: Write README.zh-CN.md**

Chinese version.

- [ ] **Step 3: Final build check**

```bash
npm run build
npm run lint
npm test
```

- [ ] **Step 4: Commit**

```bash
git commit -m "docs: add README with golden open-source structure"
```

---

## Task 26: Vercel Deployment

**Goal:** Deploy to Vercel with demo mode.

**Files:**
- Create: `vercel.json`

- [ ] **Step 1: Configure vercel.json**

Redirect `/` to `/en` (landing page, NOT `/en/dashboard` — the landing page IS the entry point with hero map and CTA to dashboard). Set env vars.

- [ ] **Step 2: Deploy**

```bash
vercel --prod
```

- [ ] **Step 3: Verify live demo**

All preset scenarios work. Map animates. No errors in console.

- [ ] **Step 4: Commit**

```bash
git commit -m "feat: Vercel deployment with demo mode"
```
