# @jsonschema-editor/json-schema-extensions

Format extensions for **email**, **url**, and **phone**, plus **`x-values-source`** (static lists and API-backed selects) on top of `@jsonschema-editor/json-schema`.

## Installation

```bash
npm install @jsonschema-editor/json-schema-extensions @jsonschema-editor/json-schema
```

Peer dependency: `@jsonschema-editor/json-schema`

## Load schemas with extensions

Custom attributes are ignored unless the extensions registry is used:

```ts
import { documentFromJSONWithExtensions } from "@jsonschema-editor/json-schema-extensions";

const doc = documentFromJSONWithExtensions({
  type: "object",
  properties: {
    email: { type: "string", format: "email" },
    manager: {
      type: "string",
      title: "Manager",
      "x-values-source": {
        kind: "fetch",
        url: "https://jsonplaceholder.typicode.com/users",
        valueField: "id",
        labelField: "name",
      },
    },
  },
});

doc.root.getProperty("manager")?.getCustomAttribute("x-values-source");
// { kind: "fetch", url: "...", valueField: "id", labelField: "name" }
```

Always pair this with `@jsonschema-editor/vue-extensions` in the UI so fetch/static selects render as dropdowns.

## Validators

```ts
import {
  validateEmail,
  validateUrl,
  validatePhone,
  validateFormatValue,
} from "@jsonschema-editor/json-schema-extensions";

validateEmail("user@example.com"); // true
validateUrl("https://example.com"); // true
validatePhone("+49 170 1234567"); // true (whitespace stripped)
validateFormatValue("phone", "+442079460123");
```

## JSON Schema fragments

```ts
import { createFormatSchemaFragment } from "@jsonschema-editor/json-schema-extensions";

createFormatSchemaFragment("email");
// { type: "string", format: "email", pattern: "...", "x-format-extension": "email", ... }
```

| Extension id | JSON Schema `format` | Notes |
| --- | --- | --- |
| `email` | `email` | Includes practical `pattern` |
| `url` | `uri` | HTTP(S) only via URL parser |
| `phone` | `phone` | Custom format + E.164-oriented `pattern` |

## OOP model integration

```ts
import {
  createExtensionsRegistry,
  createStringSchemaWithFormat,
  createStaticValuesSourceSchema,
  createFetchValuesSourceSchema,
} from "@jsonschema-editor/json-schema-extensions";
import { ObjectSchema } from "@jsonschema-editor/json-schema";

const registry = createExtensionsRegistry();
const person = new ObjectSchema();

person.setProperty("email", createStringSchemaWithFormat("email", registry), true);
person.setProperty(
  "role",
  createStaticValuesSourceSchema(["Admin", "User"], registry),
);
person.setProperty(
  "manager",
  createFetchValuesSourceSchema("https://api.example.com/users", {
    valueField: "id",
    labelField: "displayName",
  }, registry),
);
```

The custom attributes `x-format-extension` and `x-values-source` roundtrip when the same registry is used with `schemaFromJSON` / `documentFromJSONWithExtensions`.

## `x-values-source`

Two kinds are supported:

### Static list

```json
{
  "type": "string",
  "title": "Department",
  "enum": ["Sales", "Engineering", "Support"],
  "x-values-source": {
    "kind": "static",
    "values": ["Sales", "Engineering", "Support"]
  }
}
```

### Fetch from API

```json
{
  "type": "string",
  "title": "Manager",
  "x-values-source": {
    "kind": "fetch",
    "url": "https://jsonplaceholder.typicode.com/users",
    "valueField": "id",
    "labelField": "name"
  }
}
```

For nested responses, set `itemsPath` (dot notation, e.g. `"data.items"`).

```ts
import { readValuesSourceConfig, isFetchValuesSource } from "@jsonschema-editor/json-schema-extensions";

const config = readValuesSourceConfig(schemaNode);
if (config && isFetchValuesSource(config)) {
  console.log(config.url);
}
```

## AJV (runtime validation)

```ts
import Ajv from "ajv";
import { registerAjvFormats, compileFormatValidator } from "@jsonschema-editor/json-schema-extensions";

const ajv = await registerAjvFormats(new Ajv());
const validateEmailField = compileFormatValidator(ajv, "email");
validateEmailField("user@example.com"); // true
```

`registerAjvFormats` loads `ajv-formats` for `email`/`uri` and registers the custom `phone` format.

## Development

```bash
pnpm install
pnpm run build
pnpm test
```

## License

MIT
