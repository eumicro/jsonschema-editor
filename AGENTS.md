# Agent notes — jsonschema-editor

Monorepo of `@jsonschema-editor/*` packages (JSON Schema model, UI Schema, Vue 3 and React 19 form editors + extensions) plus example/demo apps.

## Prerequisites

- Node.js ≥ 20
- pnpm `9.15.9` (see root `packageManager`; use Corepack)

## Common commands

```bash
pnpm install
pnpm run build
pnpm run typecheck
pnpm run test
pnpm run dev:site          # Vue + React demos on http://127.0.0.1:5173/
pnpm run test:e2e          # Playwright (Vue + React examples)
```

Published packages live under `jsonschema-editor-*`. Example apps (`jsonschema-editor-examples*`) are not published to npm.

## Cursor Cloud specific instructions

Cloud agents bootstrap via `.cursor/environment.json`: Corepack activates the pinned pnpm, then `pnpm install --frozen-lockfile` and `pnpm run build` so workspace packages have `dist/` ready.

The `dev:site` terminal starts the combined Vue + React demo on port 5173. Prefer that for manual UI checks.

Before opening a PR, run:

```bash
pnpm run build
pnpm run typecheck
pnpm run test
```

For E2E (when touching Vue/React examples or form UI):

```bash
pnpm exec playwright install --with-deps chromium
pnpm run test:e2e
```

Install Chromium once per environment if it is missing; do not put Playwright browser installs in the default `install` script (slow and rarely needed).

Related repo (not required for most package work): [eumicro/survey-json-editor](https://github.com/eumicro/survey-json-editor) — WordPress plugin that consumes these packages.
