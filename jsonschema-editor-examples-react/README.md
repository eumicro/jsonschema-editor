# jsonschema-editor-examples-react

Runnable **React** example for `@jsonschema-editor/react` and `@jsonschema-editor/react-extensions`.

Reuses scenario data from [jsonschema-editor-examples](../jsonschema-editor-examples) (JSON Schema, UI Schema, defaults).

## Prerequisites

From the **repository root**:

```bash
pnpm install
pnpm --filter @jsonschema-editor/json-schema --filter @jsonschema-editor/json-schema-extensions --filter @jsonschema-editor/ui-schema run build
pnpm --filter @jsonschema-editor/react --filter @jsonschema-editor/react-extensions run build
```

## Start

```bash
pnpm --filter jsonschema-editor-examples-react run dev
```

Opens http://localhost:5174 with:

- **Get started** — React install steps (`#/get-started`)
- **Examples** — curated scenarios with form, **schema editor**, and JSON output
- **Imprint** — legal notice stub

Default scenario: **Kundenkontakt** (`field-extensions-qa`) — email/url/phone format fields.

## E2E tests

From the repository root (after `pnpm install` and building packages):

```bash
pnpm --filter jsonschema-editor-examples-react run test:e2e
```

Or run all demo E2E suites (Vue + React):

```bash
pnpm run test:e2e
```

## Compared to the Vue examples

| Feature | Vue examples | React examples |
| --- | --- | --- |
| Port | 5173 | 5174 |
| Schema editor tab | yes | yes |
| All extensions | yes | yes |
| Playwright E2E | yes | yes |

## Dependencies

| Package | Role |
| --- | --- |
| `@jsonschema-editor/react` | Fillable form |
| `@jsonschema-editor/react-extensions` | Email/url/phone inputs |
| `@jsonschema-editor/json-schema-extensions` | Load schemas with custom attributes |
| `@jsonschema-editor/ui-schema` | UI Schema model + bridge |

Scenario JSON files live in `../jsonschema-editor-examples/src/examples/data/` — not duplicated.

## License

MIT — see [LICENSE](../LICENSE) in the repository root.
