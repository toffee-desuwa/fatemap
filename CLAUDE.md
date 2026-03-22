# FateMap

AI Geopolitical Prediction Sandbox — "Input any event. Watch the world react."

## What This Project Does

A web app showing a world map where users input geopolitical "what if" scenarios (e.g., "What if the Strait of Hormuz is blockaded?") and see AI-predicted global impact visualized as shockwave animations, country fills, city markers, and relationship network glow lines. Supports 28 preset scenarios with instant results, plus BYOK LLM for custom input.

## Tech Stack

- **Frontend**: Next.js 15 + React 19 + TypeScript
- **Map**: deck.gl (WebGL) + MapLibre GL (free, no API key)
- **Styling**: Tailwind CSS v4
- **i18n**: next-intl (English + Chinese)
- **AI**: BYOK LLM (DeepSeek, Gemini, OpenAI, Anthropic) — client-side calls, no proxy
- **Validation**: Zod for LLM response validation
- **Data**: 48 countries, 84 cities, 142 relationships, 28 preset scenarios (all static TypeScript)

## Project Structure

```
fatemap/
├── src/
│   ├── app/              # Next.js app router pages
│   │   └── [locale]/     # i18n locale routing
│   │       ├── dashboard/ # Main simulation dashboard
│   │       └── settings/  # BYOK API key config
│   ├── components/
│   │   ├── layout/       # AppShell, Header, LocaleSwitcher
│   │   ├── map/          # FateMap, FateHeroMap
│   │   ├── simulation/   # ScenarioInput, ImpactReport
│   │   ├── feed/         # EventFeed, EventCard (Phase 2)
│   │   ├── settings/     # ApiKeySettings
│   │   └── charts/       # AnimatedNumber
│   ├── hooks/            # useSimulation
│   ├── lib/              # Data, analyzers, visualization layers
│   │   ├── types.ts      # All shared interfaces
│   │   ├── countries.ts  # 48 countries
│   │   ├── cities.ts     # 84 cities
│   │   ├── relationships.ts  # 142 relationships
│   │   ├── scenarios.ts  # 28 preset scenarios
│   │   ├── keyword-analyzer.ts  # Preset matching
│   │   ├── llm-analyzer.ts     # BYOK LLM integration
│   │   ├── impact-wave.ts      # Shockwave animation
│   │   ├── network-glow.ts     # Relationship glow lines
│   │   ├── country-regions.ts  # Country fill layer
│   │   └── city-markers.ts     # City impact markers
│   ├── i18n/             # next-intl routing/request config
│   └── middleware.ts
├── messages/             # en.json, zh.json
├── public/geo/           # countries-110m.json (GeoJSON)
├── docs/superpowers/     # Specs and plans
├── features.json         # Feature tracking (harness - DO NOT DELETE)
├── progress.txt          # Session progress log (harness - DO NOT DELETE)
└── init.sh               # Environment init script (harness - DO NOT DELETE)
```

## Commands

```bash
# Install dependencies
npm install

# Dev server
npm run dev

# Tests
npm test

# Lint
npm run lint

# Build
npm run build
```

## Harness Files (DO NOT DELETE OR MODIFY STRUCTURE)

- `features.json` - Tracks all features and their completion status. Agent must update status after completing each feature. NEVER remove entries.
- `progress.txt` - Append-only log of what each session accomplished. Write a summary at the end of each session.
- `init.sh` - Run at the start of each session to verify environment.

## Session Protocol

Each Ralph loop is a FRESH session. At the start of every session:
1. Run `bash init.sh` to verify environment
2. Read `progress.txt` to understand what previous sessions did
3. Read `features.json` to find the highest-priority incomplete feature
4. Work on ONE feature per session
5. Commit with descriptive message
6. Update `features.json` status
7. Append to `progress.txt` what you accomplished

## Key Design Decisions

- **No API route for simulation**: LLM calls are client-side only (browser → LLM API directly). Spec section 14 overrides section 3's API route mention.
- **File naming**: `country-regions.ts` (matches spec), not `country-fill.ts`
- **Animation phases**: idle → ripple (0-2s) → network (2-5s) → persistent
- **BYOK approach**: Users bring their own API keys. No server-side secrets needed.
- **Preset-first**: 28 scenarios work without any API key. LLM is optional enhancement.

## Important References

- **Design spec**: `docs/superpowers/specs/2026-03-21-fatemap-design.md`
- **Implementation plan**: `docs/superpowers/plans/2026-03-21-fatemap-implementation.md`
- **FreightSeer (source project)**: `D:/toffee_code_in_Cursor/freightseer/` — copy reusable components from here
