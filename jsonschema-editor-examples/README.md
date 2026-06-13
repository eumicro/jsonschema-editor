# jsonschema-editor-examples

Runnable example project for the **JSON Schema form editor** and fillable form.

## Prerequisites

Build the dependencies first:

```bash
cd ../jsonschema-editor-json-schema && npm install && npm run build
cd ../jsonschema-editor-ui-schema && npm install && npm run build
```

## Start

```bash
npm install
npm run dev
```

Opens http://localhost:5173 with:

- **Form editor** — edit schema/UI schema with live preview
- **Fillable form** — same schema as a form with JSON output

## Examples

Built-in scenarios are loaded from `src/examples/data/` (e.g. person with `$defs`, car configurator, compositions).

## Record demo GIF

```bash
pnpm run dev   # in a separate terminal
pnpm run demo:gif
```

Writes `../docs/demo.gif` for the repository README.

## Dependencies

| Package | Role |
| --- | --- |
| `@jsonschema-editor/json-schema` | OOP JSON Schema model |
| `@jsonschema-editor/ui-schema` | OOP UI Schema model |
| `@jsonschema-editor/vue` | Editor & form components |
