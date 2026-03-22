# Contributing to FateMap

Thanks for your interest in contributing! Here's how to get started.

## Development Setup

```bash
git clone https://github.com/toffee-desuwa/fatemap.git
cd fatemap
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Commands

| Command | Description |
|---------|-------------|
| `npm run dev` | Start dev server |
| `npm test` | Run tests |
| `npm run lint` | Lint code |
| `npm run build` | Production build |

## How to Contribute

1. **Fork** the repo and create a branch from `main`
2. **Write tests** for any new functionality
3. **Run `npm test` and `npm run lint`** — both must pass
4. **Submit a PR** with a clear description

## Code Style

- TypeScript strict mode — no `any` types
- React functional components with hooks
- Tailwind CSS for styling
- next-intl for i18n (add keys to both `messages/en.json` and `messages/zh.json`)

## Adding Scenarios

Preset scenarios live in `src/lib/scenarios.ts`. Each scenario needs:
- English + Chinese name and description
- Category tag
- Country/city impacts with severity levels
- Keywords for matching

## Adding Countries/Cities

- Countries: `src/lib/countries.ts` (48 entries)
- Cities: `src/lib/cities.ts` (84 entries)
- Relationships: `src/lib/relationships.ts` (142 entries)

Cross-references must stay consistent — every city's `countryId` must exist in countries, every relationship's country IDs must exist.

## Reporting Issues

Use the [issue templates](https://github.com/toffee-desuwa/fatemap/issues/new/choose) for bug reports and feature requests.

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
