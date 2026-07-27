# @jsonschema-editor/react

JSON Schema fillable form for **React** (scaffold / MVP).

**Live demo:** [jsonschema-editor.cloudapplication.net](https://jsonschema-editor.cloudapplication.net/)

## Installation

```bash
npm install @jsonschema-editor/react react react-dom

# With format fields (email, url, phone)
npm install @jsonschema-editor/react-extensions @jsonschema-editor/json-schema-extensions
```

Peer dependencies: `react`, `react-dom`

## Quick start

```tsx
import { useState } from "react";
import { JsonSchemaForm } from "@jsonschema-editor/react";
import { documentFromJSONWithExtensions } from "@jsonschema-editor/json-schema-extensions";
import { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import { registerDefaultReactExtensions } from "@jsonschema-editor/react-extensions";
import "@jsonschema-editor/react/style.css";

registerDefaultReactExtensions();

const schemaJson = {
  type: "object",
  properties: {
    name: { type: "string", title: "Name" },
    email: { type: "string", format: "email", title: "Email" },
  },
  required: ["name", "email"],
};

const schema = documentFromJSONWithExtensions(schemaJson);
const uiSchema = UiSchema.generateForSchema(schema.root);

export function ContactForm() {
  const [data, setData] = useState({ name: "", email: "" });

  return (
    <JsonSchemaForm
      schema={schema}
      uiSchema={uiSchema}
      data={data}
      onDataChange={setData}
      validationMode="blur"
      onSubmit={({ valid }) => valid && console.log("Saved", data)}
    />
  );
}
```

## Status

Parity with `@jsonschema-editor/vue` for core form + visual editor:

- `JsonSchemaForm` — fillable form with validation
- `JsonSchemaFormEditor` — schema/UI structure editor (tree, layout drag & drop, attribute panels)
- All extensions via `@jsonschema-editor/react-extensions` (format, values-source, computed, file, geometry)

Playwright E2E: `pnpm --filter jsonschema-editor-examples-react run test:e2e`

## Development

```bash
pnpm install
pnpm run build
pnpm run typecheck
```

## License

MIT — see [LICENSE](../LICENSE) in the repository root.
