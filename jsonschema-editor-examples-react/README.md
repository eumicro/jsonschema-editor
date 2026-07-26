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

## Start (unified Vue + React site)

From the **repository root**:

```bash
pnpm run dev:site
```

Opens http://127.0.0.1:5173 as **one site**. Switch stacks via the topbar **Vue | React** control:

- `/en/examples/react/field-extensions-qa` — React stack (default scenario)
- `/en/examples/vue/...` — Vue stack
- `/en/get-started` — install steps
- `/en/imprint` — legal notice

Isolated React-only Vite remains available via `pnpm --filter jsonschema-editor-examples-react run dev` (port 5174).

Production deploy ships Vue + React together (`pnpm run build:site` from the repo root).

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
| Unified site path | `/…/examples/vue/…` | `/…/examples/react/…` |
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
