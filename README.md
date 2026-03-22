---
title: FateMap
emoji: 🌍
colorFrom: red
colorTo: gray
sdk: docker
pinned: false
---

# 🌍 FateMap

[![MIT License](https://img.shields.io/badge/License-MIT-red.svg)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-15-black.svg)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue.svg)](https://www.typescriptlang.org/)
[![Deploy with Vercel](https://img.shields.io/badge/Deploy-Vercel-black.svg)](https://vercel.com)

**Input any event. Watch the world react.**

AI-powered geopolitical simulation on a world map.

**[Live Demo](https://fatemap.vercel.app)** | [中文版](./README.zh-CN.md)

---

## What is FateMap?

FateMap is an interactive sandbox where you type a "what if" scenario — like *"What if the Strait of Hormuz is blockaded?"* — and watch the predicted global impact ripple across a world map in real time. Countries light up, cities pulse, trade routes glow, and shockwaves expand from the epicenter.

**28 preset scenarios work instantly — no API key required.** Bring your own LLM key (DeepSeek, Gemini, OpenAI, Anthropic) for custom scenarios.

## Features

- **Shockwave Visualization** — concentric ripples expand from the epicenter, country fills show severity, city markers pulse, relationship network lines glow
- **28 Preset Scenarios** — military, trade, energy, climate, health, political, economic, technology — all work offline
- **BYOK LLM** — bring your own API key for unlimited custom "what if" queries (DeepSeek, Gemini, OpenAI, Anthropic)
- **Bilingual** — full English + Chinese UI and scenario data
- **Event Feed** — browse and filter scenarios by category, search by keyword
- **Responsive** — desktop 3-column, tablet 2-column, mobile fullscreen map with overlays

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 + React 19 + TypeScript |
| Map | deck.gl (WebGL) + MapLibre GL |
| Styling | Tailwind CSS v4 |
| i18n | next-intl |
| AI | Client-side BYOK (no server proxy) |
| Validation | Zod |

## Quick Start

```bash
# Clone
git clone https://github.com/your-username/fatemap.git
cd fatemap

# Install
npm install

# Dev
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Click "Try It Now" to enter the dashboard.

### Optional: BYOK LLM

Go to **Settings** → pick a provider → paste your API key → **Test** → **Save**.

Custom scenarios now use your LLM. Preset scenarios always work without a key.

## Architecture

```
Browser
├── Landing Page (auto-cycling hero map)
├── Dashboard
│   ├── Event Feed (left) — 28 preset scenarios, 8 category filters, search
│   ├── FateMap (center) — deck.gl WebGL map with 4 layer systems
│   │   ├── Country Fill (GeoJsonLayer) — severity-colored polygons
│   │   ├── Network Glow (PathLayer ×3) — relationship line glow stack
│   │   ├── City Markers (ScatterplotLayer ×2) — pulsing halo + dot
│   │   └── Shockwave Rings (ScatterplotLayer ×4) — expanding ripples
│   └── Impact Report (right) — ranked country/city impacts
└── Settings — BYOK API key configuration

Simulation Flow:
  User input → Keyword Analyzer (preset match)
             → LLM Analyzer (BYOK fallback)
             → Zod Validation
             → Animation Phases: idle → ripple (2s) → network (3s) → persistent
```

## Data

| Type | Count |
|------|-------|
| Countries | 48 |
| Cities | 84 |
| Relationships | 142 |
| Preset Scenarios | 28 |

## Commands

```bash
npm run dev      # Development server
npm run build    # Production build
npm run lint     # ESLint
npm test         # Jest (472+ tests)
```

## Project Structure

```
fatemap/
├── src/
│   ├── app/              # Next.js app router
│   │   └── [locale]/     # i18n routing (en, zh)
│   ├── components/
│   │   ├── layout/       # AppShell, Header, LocaleSwitcher
│   │   ├── map/          # FateMap, FateHeroMap
│   │   ├── simulation/   # ScenarioInput, ImpactReport
│   │   ├── feed/         # EventFeed, EventCard
│   │   ├── settings/     # ApiKeySettings
│   │   └── charts/       # AnimatedNumber
│   ├── hooks/            # useSimulation
│   └── lib/              # Data, analyzers, visualization layers
├── messages/             # en.json, zh.json
└── public/geo/           # GeoJSON data
```

## License

MIT
