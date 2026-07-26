# jsonschema-editor-examples

Runnable example project for the **JSON Schema form editor** and fillable form.

## Prerequisites

From the **repository root** (monorepo):

```bash
pnpm install
pnpm run build
```

## Start (unified Vue + React site)

From the **repository root**:

```bash
pnpm run dev:site
```

Opens http://127.0.0.1:5173 as **one site** for both stacks. Switch via the topbar **Vue | React** control (same origin, History URLs):

- `/en/examples/vue/occupational-health-g37` — Vue stack
- `/en/examples/react/field-extensions-qa` — React stack
- `/en/get-started/vue` — install steps and package overview (React: `/en/get-started/react`)
- `/en/imprint` — legal notice

Isolated Vue-only Vite (without React entry) remains available via `pnpm --filter jsonschema-editor-examples run dev`.

**GitHub Pages:** Pushes to `main` build Vue + React into one site (`pnpm run build:site`) at [jsonschema-editor.cloudapplication.net](https://jsonschema-editor.cloudapplication.net/). Assemble emits [`sitemap.xml`](https://jsonschema-editor.cloudapplication.net/sitemap.xml) + `robots.txt` (Vue URLs only; React pages canonicalize to Vue), then prerenders those URLs for crawlers. Local production site:

```bash
pnpm run build:site
npx --yes serve site
```

The landing page shows **curated use-case scenarios** grouped by domain (occupational health, vehicle orders, applications, master data). Internal examples remain available for automated tests via the hidden example selector.

## Public scenarios

| Scenario | ID | Typical use |
| --- | --- | --- |
| G37 screen precaution | `occupational-health-g37` | Occupational health from intake to employer notification |
| Damage report | `insurance-claim` | Multi-step claim with damage type, witnesses, map, computed status |
| Shipping order | `logistics-freight-order` | Pickup/delivery route, cargo lines, service oneOf, freight calculation |
| Construction project registration | `construction-project-application` | Plot/site maps, dual oneOf, trade packages, cost/CO₂ calculation |
| Vehicle order | `car-configurator` | Multi-step configuration with model, equipment, financing |
| Funding application | `computed-status-qa` | Application workflow with automatic processing status |
| Cost estimate | `computed-cost-qa` | Line items with automatic total |
| Contact person | `person-with-defs` | Person or asset with email, phone, selects |
| Customer contact | `field-extensions-qa` | CRM contact with read-only system fields |

Example data lives in `src/examples/data/<id>/` (`schema.json`, `ui.schema.json`, `defaults.json`, `meta.json`).

### Loading pattern (important)

Examples use `documentFromJSONWithExtensions()` so `x-values-source` and `x-format-extension` attributes are preserved:

```ts
import { documentFromJSONWithExtensions } from "@jsonschema-editor/json-schema-extensions";
import { UiSchema } from "@jsonschema-editor/ui-schema/bridge";

const schema = documentFromJSONWithExtensions(manifest.schema);
const uiSchema = UiSchema.fromJSON(manifest.uiSchema);
```

Plain `documentFromJSON()` silently drops unregistered custom attributes — API-backed selects would render as plain text inputs.

Extensions are registered in `src/main.ts`:

```ts
import { registerDefaultVueExtensions } from "@jsonschema-editor/vue-extensions";
registerDefaultVueExtensions();
```

## E2E tests

```bash
pnpm --filter jsonschema-editor-examples run test:e2e
```

Playwright starts its own dev server in CI mode. Tests cover the editor, extensions, validation, geometry, computed fields, and curated scenarios.

## Record demo GIF

```bash
pnpm --filter jsonschema-editor-examples run dev   # separate terminal
pnpm --filter jsonschema-editor-examples run demo:gif
```

Writes `../docs/demo.gif` for the repository README (Schadensmeldung + Förderantrag).

## Dependencies

| Package | Role |
| --- | --- |
| `@jsonschema-editor/json-schema` | OOP JSON Schema model |
| `@jsonschema-editor/json-schema-extensions` | Format & values-source attributes |
| `@jsonschema-editor/ui-schema` | OOP UI Schema model |
| `@jsonschema-editor/vue` | Editor & form components |
| `@jsonschema-editor/vue-extensions` | Email/url/phone inputs & select fields |
