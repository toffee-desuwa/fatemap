# FateMap — Session Context & Handoff

> This document provides all context needed for a new Claude Code session to continue FateMap development using Ralph.

## What Is FateMap

AI geopolitical prediction sandbox. User inputs "What if..." scenarios, sees shockwave animation on world map showing predicted global impact. Built for GitHub Trending virality.

- **Tagline**: "Input any event. Watch the world react."
- **Positioning**: Visual-first prediction (vs MiroFish which is text-based multi-agent dialogue)
- **Strategy**: Open source → GitHub Trending → investor attention (BaiFu path: BettaFish → MiroFish)

## Project State

- **Directory**: `D:\toffee_code_in_Cursor\fatemap`
- **Git**: Initialized, initial commit done
- **Dependencies**: `npm install` already run, node_modules present
- **Config files**: Copied from FreightSeer (tsconfig, eslint, jest, postcss, next.config, package.json adapted)
- **No code yet**: Only infrastructure — actual features start with F001

## How To Develop

1. Run `bash init.sh` at session start
2. Read `progress.txt` for what's been done
3. Read `features.json` — find highest-priority `"backlog"` feature
4. Read the implementation plan: `docs/superpowers/plans/2026-03-21-fatemap-implementation.md`
5. Each feature maps to a Task in the plan (F001 = Task 1, F002 = Task 2, etc.)
6. Follow TDD: write failing test → implement → test passes → commit
7. Update `features.json` status to `"done"` after completing feature
8. Append session summary to `progress.txt`

## Key Files

| File | Purpose |
|------|---------|
| `CLAUDE.md` | Project overview, tech stack, session protocol |
| `features.json` | 26 features (F001-F026), tracks status |
| `progress.txt` | Append-only session log |
| `init.sh` | Environment verification script |
| `docs/superpowers/specs/2026-03-21-fatemap-design.md` | Complete design spec |
| `docs/superpowers/plans/2026-03-21-fatemap-implementation.md` | 26-task implementation plan with code patterns |

## Feature Dependency Chain

```
F001 (scaffold)
├── F002 (types + colors)
│   ├── F003 (countries/cities) ─┐
│   ├── F004 (relationships) ────┤
│   │   └── F010 (network glow) ─┐
│   ├── F005 (scenarios) ────────┤
│   │   ├── F006 (keyword) ──────┤
│   │   └── F023 (event feed) ───┤
│   ├── F007 (zod schema) ───────┤
│   │   └── F008 (llm analyzer) ─┤
│   ├── F011 (country fill) ─────┤
│   ├── F012 (city markers) ─────┤
│   ├── F013 (shockwave) ────────┤
│   └── F015 (input) + F016 (report)
│       └── F009 (sim hook) ─────┤
│           └── F014 (FateMap) ──┤
│               ├── F017 (AppShell) ──┤
│               │   ├── F018 (dashboard)
│               │   ├── F019 (i18n)
│               │   └── F023 (event feed)
│               └── F021 (landing)
├── F020 (settings) ← F008
├── F022 (OG image) ← F018
├── F024 (responsive) ← F018, F023
├── F025 (README) ← F024
└── F026 (deploy) ← F025
```

## FreightSeer Source Components

These should be copied/adapted from `D:\toffee_code_in_Cursor\freightseer\`:

| FreightSeer File | FateMap Target | What to copy |
|------------------|----------------|--------------|
| `src/components/charts/AnimatedNumber.tsx` | Same path | Animated counter component |
| `src/components/layout/LocaleSwitcher.tsx` | Same path | EN/ZH toggle |
| `src/components/map/HeroMapLoader.tsx` | `FateHeroMapLoader.tsx` | Dynamic import wrapper (update import path) |
| `src/i18n/*` | Same path | i18n routing infrastructure |
| `src/middleware.ts` | Same path | next-intl middleware |
| `src/__mocks__/*` | Same path | Jest mocks for next-intl |
| `src/app/globals.css` | Same path | Base styles (update branding) |
| Glow layer patterns from `glow-layers.ts` | `network-glow.ts` | 3-layer PathLayer glow technique |
| Pulsing dots from `pulsing-ports.ts` | `city-markers.ts` | ScatterplotLayer pulse animation |

## Data Requirements

The implementation plan references "agent research data" for countries, cities, relationships, and scenarios. If these research output files are not accessible, generate plausible data matching the TypeScript types:
- 48 countries (major geopolitical actors, ISO alpha-3 IDs)
- 84 cities (financial, port, tech, political, energy hubs)
- 142 relationships (trade, military alliance, energy dependency, supply chain, political, geographic proximity)
- 28 scenarios (military, economic, climate, health, political, trade, energy, technology categories)

Use the test contracts in the plan as the source of truth for data shape.

## User Preferences

- 不要总结、不要废话 — terse responses, no trailing summaries
- 不要提MVP — build both phases, just in order
- 不要提token消耗 — never mention cost, just use tools
- 不确定就搜 — when unsure, web search instead of guessing
- Ralph纪律 — fresh session, read harness files, one feature per loop
