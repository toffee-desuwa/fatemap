# FateMap — Design Spec

> "Simulate any hypothesis on a world map."
> 在地图上模拟任何假设的未来。

## 1. What Is FateMap

An AI-powered geopolitical prediction sandbox. Users input a "what if" scenario (news, policy, conflict, disaster), and FateMap visualizes the ripple effects across the globe on an interactive dark-mode world map — countries change color, cities light up, relationship lines pulse with impact propagation.

**One-line pitch:** "Input any event. Watch the world react."

### Target Audience
- Geopolitics enthusiasts / military hobbyists
- Investors analyzing macro risk
- Policy researchers / think tank analysts
- Developers who think the map looks cool (GitHub star motivation)
- General public on social media (viral short video potential)

### Differentiation from MiroFish
| | MiroFish | FateMap |
|---|---|---|
| Core | Multi-agent text dialogue | Geographic map visualization |
| Output | Text reports + chat sandbox | Animated world map + impact network |
| Interaction | Read agent conversations | Watch shockwaves spread on globe |
| Modality | Text-first | Visual-first |

## 2. Core User Flow

### Phase 1: Custom Input (核心体验)

```
User opens FateMap
  → Dark world map with glowing relationship network lines
  → Input box: "What if...?" / "如果...会怎样？"
  → User types: "Taiwan Strait military conflict"
  → [Loading: "Simulating..." with pulsing animation]
  → Phase A: Shockwave ripple expands from Taiwan (concentric circles, 2 seconds)
  → Phase B: Ripple fades, relationship network lines light up between affected countries
  → Affected countries change color (green → yellow → red by severity)
  → Key cities glow with impact markers
  → Right panel: Impact report (affected countries ranked by severity, reasons, confidence)
  → User can click any country/city for detail
```

### Phase 2: Hot Events Feed (新闻仪表盘)

```
Left sidebar: Live global events feed (curated hot topics)
  → Each event has: title, category icon, timestamp, severity badge
  → Click an event → same simulation visualization as Phase 1
  → Feed source: curated preset scenarios + (future) news API integration
```

## 3. Architecture

### Reuse from FreightSeer
- deck.gl + MapLibre GL dark map engine
- 3-layer glow PathLayer stack (relationship network lines)
- Pulsing ScatterplotLayer (city impact markers)
- SimulationPanel UI pattern (input → loading → results)
- Impact wave flash animation (F018)
- AnimatedNumber component
- i18n system (next-intl, en/zh)
- Landing page structure
- Header, LocaleSwitcher, AppShell layout pattern
- CSS theme (dark mode, CSS variables, MiSans font)

### New Components

#### Data Layer
- `src/lib/countries.ts` — 48 countries with coordinates, metadata
- `src/lib/cities.ts` — 84 key cities with coordinates, types
- `src/lib/relationships.ts` — 142 bilateral relationship edges
- `src/lib/scenarios.ts` — 28 pre-computed scenario results

#### Analysis Engine
- `src/lib/keyword-analyzer.ts` — Rule-based analysis for preset scenarios (instant)
- `src/lib/llm-analyzer.ts` — LLM-powered analysis for custom input (BYOK)
- `src/app/api/fate/simulate/route.ts` — POST endpoint, routes to keyword or LLM analyzer (separate from FreightSeer's `/api/simulate`)

#### Map Visualization
- `src/lib/impact-wave.ts` — Shockwave ripple animation (concentric circles expanding from epicenter)
- `src/lib/network-glow.ts` — Relationship network glow lines (adapted from glow-layers.ts)
- `src/lib/country-regions.ts` — GeoJSON country polygons for fill coloring
- `src/lib/city-markers.ts` — City impact markers (adapted from pulsing-ports.ts)

#### UI Components
- `src/components/map/FateMap.tsx` — Main interactive map (adapted from ShippingMap.tsx)
- `src/components/map/FateHeroMap.tsx` — Landing page hero map
- `src/components/simulation/ScenarioInput.tsx` — "What if" input with example buttons
- `src/components/simulation/ImpactReport.tsx` — Right panel impact results
- `src/components/feed/EventFeed.tsx` — Left sidebar hot events (Phase 2)
- `src/components/feed/EventCard.tsx` — Individual event card
- `src/components/settings/ApiKeySettings.tsx` — BYOK key configuration

#### Pages (all under `[locale]` prefix)
- `/[locale]/` — Landing page (hero map + features + CTA)
- `/[locale]/dashboard` — Main app (map + input + report)
- `/[locale]/settings` — API key configuration

## 4. Visual Design

### Two-Phase Impact Animation

**Phase A: Shockwave Ripple (0-2s)**
- Epicenter: bright red pulsing dot with glow
- 3-4 concentric circles expand outward from epicenter
- Circles: red → orange → yellow gradient, opacity fading with distance
- Speed: expands to ~5000km radius in 2 seconds (auto-scales to fill ~80% of viewport)
- Background: brief white flash at t=0 (33ms, reuse F018)

**Phase B: Network Reveal (2s-5s)**
- Ripple circles fade out (300ms)
- Relationship lines between affected countries fade in with glow
- Line color: red (critical) → orange (high) → yellow (medium) → dim blue (low)
- Line width: proportional to relationship strength
- Affected countries: polygon fill transitions to severity color (300ms ease)
- Affected cities: markers pulse in with staggered delay (100ms per city)
- Unaffected areas dim to 30% opacity

**Persistent State (after 5s)**
- Network lines stay glowing (with subtle pulse on critical lines)
- Country colors stay
- City markers stay pulsing
- User can interact: click country → right panel scrolls to that country's impact detail (severity, reason, impactPercent). Click city → tooltip popover showing city name, impact type, severity.

### Color Scheme (Impact Severity)
- Critical: `#FF3344` (bright red)
- High: `#FF8844` (orange)
- Medium: `#FFCC44` (yellow)
- Low: `#4488FF` (blue)
- Positive: `#44FF88` (green)
- Unaffected: `#334455` (dim)

### Map Style
- Base: CARTO dark-matter (same as FreightSeer)
- Country borders: subtle white lines at low zoom, hidden at high zoom
- Ocean: dark (#0a0a1a)
- Default state: dim relationship network visible (like a global nervous system)

## 5. Data Structures

### Country
```typescript
interface Country {
  id: string;           // ISO alpha-3: "USA", "CHN", "TWN"
  name: string;         // English
  nameCn: string;       // Chinese
  center: [number, number];  // [lng, lat] for label/marker
  capital: [number, number]; // [lng, lat]
  region: string;       // "East Asia", "Western Europe", etc.
}
```

### City
```typescript
interface City {
  id: string;           // "shanghai", "new-york"
  name: string;
  nameCn: string;
  coordinates: [number, number];
  countryId: string;    // ISO alpha-3
  type: "financial" | "port" | "tech" | "political" | "energy" | "manufacturing" | "logistics";
  importance: 1 | 2 | 3 | 4 | 5;
}
```

### Relationship
```typescript
interface Relationship {
  id: string;           // e.g. "USA-CHN-trade"
  from: string;         // Country ID
  to: string;           // Country ID
  type: "trade" | "military_alliance" | "energy_dependency" | "supply_chain" | "political" | "geographic_proximity";
  strength: 1 | 2 | 3 | 4 | 5;
}
```

### SimulationResult
```typescript
interface SimulationResult {
  event: string;
  timestamp: string;
  epicenter: {
    countryId: string;
    coordinates: [number, number];
  };
  countryImpacts: CountryImpact[];
  cityImpacts: CityImpact[];
  activatedRelationships: string[];  // relationship IDs
  summary: string;
  summaryZh: string;
}

interface CountryImpact {
  countryId: string;
  severity: "critical" | "high" | "medium" | "low";
  direction: "negative" | "positive" | "mixed";
  impactPercent: number;      // -50 to +50
  reason: string;
  reasonZh: string;
}

interface CityImpact {
  cityId: string;
  severity: "critical" | "high" | "medium" | "low";
  direction: "negative" | "positive" | "mixed";
  impactType: "trade_disruption" | "market_crash" | "military_threat" | "supply_shortage" | "refugee_crisis" | "energy_crisis" | "infrastructure_damage" | "opportunity" | "other";
}
```

### PresetScenario
```typescript
interface PresetScenario {
  id: string;                 // e.g. "taiwan-strait-crisis"
  name: string;               // Short title: "Taiwan Strait Military Crisis"
  nameCn: string;             // "台湾海峡军事危机"
  category: "military" | "economic" | "climate" | "health" | "political" | "trade" | "energy" | "technology";
  description: string;        // One-liner for feed card
  descriptionZh: string;
  eventText: string;          // Full "what if" prompt for matching: "What if China initiates a military blockade of Taiwan?"
  keywords: string[];         // Fuzzy match terms: ["taiwan", "strait", "blockade", "台湾", "海峡", "封锁"]
  result: SimulationResult;   // Pre-computed
}
```

## 6. AI Analysis

### Keyword Analyzer (Instant, No API)
- Matches input against preset scenario database
- Fuzzy matching: if input contains key terms of a preset, return that preset's result
- Supports both English and Chinese input
- Response time: <50ms

### LLM Analyzer (BYOK)
- User configures API key in settings (stored in localStorage)
- Supported providers: DeepSeek, Google Gemini, OpenAI, Anthropic
- System prompt instructs LLM to return structured JSON matching SimulationResult schema
- Includes world context (country list, relationship network) in prompt
- Response time: 3-15 seconds (masked by loading animation)
- Fallback: if LLM fails or no key configured, suggest closest preset scenario

### LLM Response Validation
- Extract JSON from response (strip markdown code fences, find first `{`)
- Validate with Zod schema matching `SimulationResult`
- Clamp `impactPercent` to [-50, +50] range
- Validate all `countryId` and `cityId` against known dataset; drop unknown IDs
- Partial success: if some countries are valid, render what we can
- Total failure: show "AI returned unexpected results. Showing closest preset instead." + suggest nearest preset

### Error States

| Condition | UI Response |
|---|---|
| No keyword match, no LLM key | "No preset found. Configure AI key for custom analysis." + top 3 nearest preset suggestions |
| LLM timeout (>15s) | Cancel with "Analysis timed out. Try a simpler scenario." |
| LLM returns invalid JSON | Fall back to nearest preset with notice |
| LLM returns partial valid data | Render valid portion, note incomplete results |
| Network error | "Connection failed. Check your network." |
| Empty input | Disable submit button; placeholder shows examples |

### API Key Settings
- Stored in browser localStorage (never sent to server)
- Settings page with provider dropdown + key input + test button
- Visual indicator in header: "AI: Connected" / "AI: Preset Only"

## 7. Landing Page

### Hero Section
- Full-screen dark map background (FateHeroMap, non-interactive)
- Auto-playing simulation: cycles through 3 preset scenarios every 10 seconds. Starts after map `onLoad` fires + 1s delay.
- Overlay text:
  - Logo: "FateMap"
  - Tagline: "Simulate any event. Watch the world react." / "模拟任何事件，看世界如何反应"
  - CTA: "Try It Now" → /dashboard
  - GitHub star badge

### Feature Cards (6)
1. Shockwave Visualization — See impact ripple across the globe in real-time
2. AI-Powered Analysis — Analyze any scenario with LLM intelligence
3. Global Network — 142 international relationship connections
4. Preset Scenarios — 28 pre-computed geopolitical simulations
5. Bilingual — Full English and Chinese support
6. Open Source — Free, transparent, community-driven

## 8. i18n

Reuse FreightSeer's next-intl setup. New message namespaces:
- `common` — shared UI strings
- `landing` — landing page copy
- `dashboard` — main app strings
- `simulation` — input/report strings
- `settings` — API key settings
- `scenarios` — preset scenario names/descriptions

## 9. Phase Breakdown

### Phase 1: Core Experience
- Landing page with hero map
- Dashboard: map + scenario input + impact report
- 28 preset scenarios (keyword analyzer)
- Shockwave ripple animation
- Network glow lines
- Country color fills
- City impact markers
- i18n (en/zh)
- Settings page (BYOK)
- LLM analyzer integration

### Phase 2: Hot Events Feed
- Left sidebar event feed
- Event cards with category icons
- Click-to-simulate from feed
- Curated event list (manually maintained)
- (Future: news API auto-population)

## 10. Data Scale

Compiled research data (to be converted to TypeScript modules):

### Countries: 48
All G20 + strategically important nations. 11 regions covered: North America, South America, Western Europe, Eastern Europe, East Asia, Southeast Asia, South Asia, Central Asia, Middle East, Africa, Oceania.

### Cities: 84
By type: Financial (19), Port (18), Political (15), Manufacturing (9), Tech (8), Energy (3), Logistics (3). Importance 1-5 scale. All coordinates in [lng, lat] for deck.gl.

### Relationships: 142
By type: Trade (29), Military Alliance (25), Energy Dependency (23), Supply Chain (21), Political (21), Geographic Proximity (23). Strength 1-5 scale. Directional for energy/supply chain, bidirectional for trade/political/military.

### Preset Scenarios: 28
By category: Military (5), Trade (3), Energy (3), Climate (4), Health (2), Political (5), Economic (2), Technology (4). Each includes epicenter coordinates, 5-15 affected countries with severity, 3-8 affected cities.

Full compiled data available in agent research outputs — to be converted to TypeScript data files during implementation.

## 11. GeoJSON Country Polygons

- **Source**: Natural Earth 110m Admin 0 countries (simplified, ~200KB gzipped)
- **File location**: `public/geo/countries-110m.json`
- **ID mapping**: Match via `properties.ISO_A3` to our `Country.id`
- **Disputed territories**: Taiwan (TWN) included — use Natural Earth "map units" dataset which includes TWN as separate feature. Kosovo included if present.
- **Loaded at runtime**: `fetch('/geo/countries-110m.json')` on dashboard mount, cached in state
- **deck.gl layer**: `GeoJsonLayer` with `getFillColor` driven by severity, `getLineColor` for borders

## 12. Responsive Design

### Desktop (≥1024px)
- 3-panel layout: left sidebar (event feed, Phase 2) + center map + right panel (input + report)
- Event feed sidebar: 240px fixed width
- Right panel: 360px fixed width

### Tablet (768-1023px)
- 2-panel: center map + right panel overlay
- Event feed hidden, accessible via hamburger menu
- Right panel slides in as overlay on map

### Mobile (<768px)
- Full-screen map
- Input box floating at top (compact mode)
- Impact report as bottom sheet (drag up to expand)
- Event feed as full-screen overlay via hamburger
- Landing page: stacked layout, hero map still visible but shorter (60vh)

### Touch
- deck.gl built-in touch pan/zoom/rotate
- Tap country = click; long-press for tooltip

## 13. Future Enhancements (not in current scope)
- **Shareable URLs**: Encode scenario ID in query params (`/dashboard?scenario=taiwan-strait-crisis`), generate OG preview image per scenario for social sharing
- **"Share to X" button**: Auto-generate screenshot of current map state with impact overlay
- **News API integration**: Auto-populate event feed from real news sources
- **Community scenarios**: Users submit custom presets

## 14. Tech Decisions

- **No new dependencies beyond FreightSeer** except: country GeoJSON data
- **Country polygons**: Use simplified GeoJSON (~500KB) for deck.gl GeoJsonLayer
- **No backend database**: All preset data in TypeScript files, all user config in localStorage
- **No auth**: Open access, no accounts
- **Deployment**: Vercel (same as FreightSeer), demo mode works without any API keys
- **LLM calls**: Client-side only (browser → LLM API directly), no proxy server needed
- **API key storage**: localStorage, never transmitted to our servers
- **New dependency**: Zod for LLM response validation
- **Phase 1 scope**: 28 preset scenarios + keyword matching + LLM BYOK + full two-phase animation + i18n + landing page + settings
- **Phase 2 scope**: Event feed sidebar + curated event list + click-to-simulate
