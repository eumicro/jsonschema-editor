# @jsonschema-editor/json-schema-extensions

Format extensions for **email**, **url**, and **phone** on top of `@jsonschema-editor/json-schema`.

## Installation

```bash
npm install @jsonschema-editor/json-schema-extensions @jsonschema-editor/json-schema
```

Peer dependency: `@jsonschema-editor/json-schema`

## Usage

### Validators

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

### JSON Schema fragments

```ts
import { createFormatSchemaFragment } from "@jsonschema-editor/json-schema-extensions";

createFormatSchemaFragment("email");
// { type: "string", format: "email", pattern: "...", x-format-extension: "email", ... }
```

| Extension id | JSON Schema `format` | Notes |
| --- | --- | --- |
| `email` | `email` | Includes practical `pattern` |
| `url` | `uri` | HTTP(S) only via URL parser |
| `phone` | `phone` | Custom format + E.164-oriented `pattern` |

### OOP model integration

```ts
import {
  createExtensionsRegistry,
  createStringSchemaWithFormat,
  ObjectSchema,
} from "@jsonschema-editor/json-schema-extensions";
import { ObjectSchema as ObjectSchemaBase } from "@jsonschema-editor/json-schema";

const registry = createExtensionsRegistry();
const person = new ObjectSchemaBase();
person.setProperty("email", createStringSchemaWithFormat("email", registry), true);
```

The custom attribute `x-format-extension` roundtrips when the same registry is used with `schemaFromJSON`.

### AJV (runtime validation)

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
