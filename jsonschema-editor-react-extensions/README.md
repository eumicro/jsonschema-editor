# @jsonschema-editor/react-extensions

React form field renderers for JSON Schema extensions: format fields (`email`, `uri`, `phone`), **`x-values-source`** selects, **`x-computed`** CEL fields, **`x-file`** uploads, and **`x-geometry`** map editing (Leaflet + Geoman).

Works with `@jsonschema-editor/json-schema-extensions` on the schema side and registers custom controls via the `@jsonschema-editor/react` extension API.

## Installation

```bash
npm install @jsonschema-editor/react-extensions @jsonschema-editor/react @jsonschema-editor/json-schema-extensions react react-dom
```

Peer dependencies: `@jsonschema-editor/react`, `@jsonschema-editor/json-schema-extensions`, `react@^18 || ^19`, `react-dom@^18 || ^19`.

Bundled dependencies: `leaflet`, `@geoman-io/leaflet-geoman-free` (map geometry).

## Register at app startup

```tsx
import { registerDefaultReactExtensions } from "@jsonschema-editor/react-extensions";
import "@jsonschema-editor/react/style.css";

registerDefaultReactExtensions();
```

For file upload fields, wrap your form tree with a storage provider:

```tsx
import {
  FileFieldProvider,
  createInMemoryFileFieldProvider,
} from "@jsonschema-editor/react-extensions";

const fileProvider = createInMemoryFileFieldProvider();

export function App() {
  return (
    <FileFieldProvider provider={fileProvider}>
      <JsonSchemaForm ... />
    </FileFieldProvider>
  );
}
```

Replace `createInMemoryFileFieldProvider()` with your own `FileFieldProvider` implementation (S3, API, IndexedDB, …).

## What gets registered

| Extension | Schema match | Form control |
| --- | --- | --- |
| `email` | `format: "email"` | `<input type="email">` |
| `url` | `format: "uri"` | URL input with link preview |
| `phone` | `format: "phone"` | `<input type="tel">` |
| `select-list` | `x-values-source.kind: "static"` | `<select>` from fixed values |
| `select-api` | `x-values-source.kind: "fetch"` | `<select>` loaded via `fetch()` |
| `computed-*` | `x-computed` | Read-only field driven by CEL over `data` |
| `file` / `file-list` | `x-file` | Upload with thumbnails and gallery |
| `geometry-collection` | `x-geometry` | GeoJSON GeometryCollection on a map |

In the schema editor, these appear as **+ email**, **+ select-list**, **+ computed-number**, **+ file**, **+ geometry-collection**, and similar entries when adding new fields.

## Schema examples

### Format fields

```json
{
  "email": { "type": "string", "format": "email", "title": "Email" },
  "website": { "type": "string", "format": "uri", "title": "Website" },
  "phone": { "type": "string", "format": "phone", "title": "Phone" }
}
```

### Static select

```json
{
  "department": {
    "type": "string",
    "title": "Department",
    "x-values-source": {
      "kind": "static",
      "values": ["Sales", "Engineering", "Support"]
    }
  }
}
```

### Computed field

```json
{
  "total": {
    "type": "number",
    "title": "Total",
    "x-computed": {
      "expression": "data.items.map(i, double(i.amount)).sum()"
    }
  }
}
```

### File upload

```json
{
  "photo": {
    "type": "object",
    "title": "Photo",
    "x-file": { "accept": ["image/*"] }
  }
}
```

### Geometry collection

```json
{
  "location": {
    "type": "object",
    "title": "Location",
    "x-geometry": {
      "point": true,
      "line": true,
      "polygon": true,
      "minObjects": 0,
      "maxObjects": 5
    }
  }
}
```

Load schemas with `documentFromJSONWithExtensions()` so custom attributes roundtrip correctly.

## Custom extensions

Use matchers from `@jsonschema-editor/react`:

```tsx
import { StringSchema } from "@jsonschema-editor/json-schema";
import {
  registerReactExtension,
  matchCustomAttribute,
  type JseReactExtension,
} from "@jsonschema-editor/react";

const myExtension: JseReactExtension = {
  id: "my-app-fields",
  formFields: [
    {
      id: "price-input",
      priority: 30,
      match: (schema, ctx) =>
        schema.kind === "number" && ctx.propertyName === "price",
      component: MyPriceInput,
    },
    {
      id: "tags-input",
      priority: 25,
      match: matchCustomAttribute("x-tags"),
      component: TagsInput,
    },
  ],
  schemaTypes: [
    {
      id: "tags",
      label: "tags",
      create: () => {
        const s = new StringSchema();
        s.setCustomAttribute("x-tags", true);
        return s;
      },
      match: (node) => node.getCustomAttribute("x-tags") === true,
    },
  ],
};

registerReactExtension(myExtension);
```

See the extension modules in this package for reference implementations.

## License

MIT — see [LICENSE](../LICENSE) in the repository root.
