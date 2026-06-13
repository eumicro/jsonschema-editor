# jsonschema-editor-examples

Runnable example project for the **JSON Schema form editor** and fillable form.

## Prerequisites

From the **repository root** (monorepo):

```bash
pnpm install
pnpm run build
```

## Start

```bash
pnpm --filter jsonschema-editor-examples run dev
```

Opens http://localhost:5173 with:

- **Get started** — install steps and package overview (`#/get-started`)
- **Edit schema** — adjust schema and UI layout with live preview
- **Test form** — fill the form and inspect JSON output

**GitHub Pages:** After enabling Pages (*Settings → Pages → Build and deployment: GitHub Actions*), pushes to `main` publish the site at `https://<user>.github.io/jsonschema-editor/`. Local production preview:

```bash
VITE_BASE_PATH=/jsonschema-editor/ pnpm run build
pnpm run preview
```

The landing page shows **curated use-case scenarios** grouped by domain (occupational health, vehicle orders, applications, master data). Internal examples remain available for automated tests via the hidden example selector.

## Public scenarios

| Scenario | ID | Typical use |
| --- | --- | --- |
| G37 screen-work preventive exam | `occupational-health-g37` | Occupational health from intake to employer notification |
| Insurance claim | `insurance-claim` | Multi-step claim with damage type, witnesses, map, computed status |
| Freight order | `logistics-freight-order` | Pickup/delivery route, cargo lines, service oneOf, freight calculation |
| Building permit | `construction-project-application` | Plot/site maps, dual oneOf, trade packages, cost/CO₂ calculation |
| Vehicle order | `car-configurator` | Multi-step configuration with model, equipment, financing |
| Grant application | `computed-status-qa` | Application workflow with automatic processing status |
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

Writes `../docs/demo.gif` for the repository README (complete G37 stepper walkthrough).

## Dependencies

| Package | Role |
| --- | --- |
| `@jsonschema-editor/json-schema` | OOP JSON Schema model |
| `@jsonschema-editor/json-schema-extensions` | Format & values-source attributes |
| `@jsonschema-editor/ui-schema` | OOP UI Schema model |
| `@jsonschema-editor/vue` | Editor & form components |
| `@jsonschema-editor/vue-extensions` | Email/url/phone inputs & select fields |
