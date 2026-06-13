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

- **Form editor** — edit schema/UI schema with live preview
- **Fillable form** — same schema as a form with JSON output

## Built-in examples

| Example | ID | Demonstrates |
| --- | --- | --- |
| oneOf: Human / Machine | `person-one-of` | Inline `oneOf` branches, type switch in the form |
| $defs + oneOf | `person-with-defs` | `$ref` to `$defs`, format fields (email/url/phone), static & API selects |
| allOf + oneOf | `simple-composition` | Schema compositions |
| Car configurator | `car-configurator` | Nested `oneOf`/`anyOf`, Stepper + Categorization UI layout |

Example data lives in `src/examples/data/<id>/` (`schema.json`, `ui.schema.json`, `defaults.json`).

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

Playwright starts its own dev server in CI mode. Tests cover the editor, extensions, validation, `$defs`, and the car configurator Stepper layout.

## Record demo GIF

```bash
pnpm --filter jsonschema-editor-examples run dev   # separate terminal
pnpm --filter jsonschema-editor-examples run demo:gif
```

Writes `../docs/demo.gif` for the repository README.

## Dependencies

| Package | Role |
| --- | --- |
| `@jsonschema-editor/json-schema` | OOP JSON Schema model |
| `@jsonschema-editor/json-schema-extensions` | Format & values-source attributes |
| `@jsonschema-editor/ui-schema` | OOP UI Schema model |
| `@jsonschema-editor/vue` | Editor & form components |
| `@jsonschema-editor/vue-extensions` | Email/url/phone inputs & select fields |
