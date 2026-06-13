# JSON Schema Editor

[![CI](https://github.com/eumicro/jsonschema-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/eumicro/jsonschema-editor/actions/workflows/ci.yml)

![Demo: i18n, edit schema, customize UI, test form](./docs/demo.gif)

Three **standalone npm packages** — JSON Schema and UI Schema are intentionally separate:

| Project | Package | Responsibility |
| --- | --- | --- |
| [jsonschema-editor-json-schema](./jsonschema-editor-json-schema) | `@jsonschema-editor/json-schema` | Object-oriented **JSON Schema** model |
| [jsonschema-editor-json-schema-extensions](./jsonschema-editor-json-schema-extensions) | `@jsonschema-editor/json-schema-extensions` | Format extensions (**email**, **url**, **phone**) |
| [jsonschema-editor-ui-schema](./jsonschema-editor-ui-schema) | `@jsonschema-editor/ui-schema` | Object-oriented **UI Schema** model |
| [jsonschema-editor-vue](./jsonschema-editor-vue) | `@jsonschema-editor/vue` | Vue form editor & form |
| [jsonschema-editor-vue-extensions](./jsonschema-editor-vue-extensions) | `@jsonschema-editor/vue-extensions` | Custom form renderers (email, url, phone) |
| [jsonschema-editor-examples](./jsonschema-editor-examples) | – | Local editor example (not published to npm) |

## Installation (npm)

```bash
# JSON Schema only
npm install @jsonschema-editor/json-schema

# UI Schema (bridge optional with JSON Schema)
npm install @jsonschema-editor/ui-schema

# Vue 3 form editor (installs json-schema + ui-schema transitively)
npm install @jsonschema-editor/vue vue
```

Same with pnpm/yarn. **Node.js ≥ 20** is required.

### Vue integration

```ts
import { createApp } from "vue";
import { install } from "@jsonschema-editor/vue";
import "@jsonschema-editor/vue/style.css";

const app = createApp(App);
install(app);
app.mount("#app");
```

## Architecture

```
json-schema          ui-schema              vue
(OOP SchemaNode)     (OOP UiElement)        (components)
      │                    │                    │
      └──────── bridge ────┘                    │
           (optional)                           │
                └───────────────────────────────┘
```

- **No shared core package** — each model is standalone.
- The **bridge** (`@jsonschema-editor/ui-schema/bridge`) optionally connects both worlds:
  - `UiSchemaGenerator.generateForSchema()`
  - `FormDefinition.fromJSON()` for combined documents
  - `resolveSchemaAtScope()` delegates to `SchemaNode.resolveAtScope()`

## Development (monorepo)

Prerequisites: Node.js ≥ 20, [pnpm](https://pnpm.io/) ≥ 9.

```bash
pnpm install
pnpm run build
pnpm run test
pnpm --filter jsonschema-editor-examples run dev
```

More details: [PUBLISHING.md](./PUBLISHING.md), [CHANGELOG.md](./CHANGELOG.md), [SECURITY.md](./SECURITY.md).

## JSON Schema (standalone)

```ts
import {
  ObjectSchema,
  StringSchema,
  SchemaFactory,
  schemaFromJSON,
} from "@jsonschema-editor/json-schema";

const person = new ObjectSchema();
person.setProperty("name", new StringSchema(), true);
```

## UI Schema (standalone)

```ts
import { Control, VerticalLayout, UiSchemaFactory } from "@jsonschema-editor/ui-schema";

const factory = new UiSchemaFactory();
const layout = factory.createVerticalLayout([
  factory.createControl("#/properties/name", "Name"),
]);
```

## Bridge (both together)

```ts
import { ObjectSchema, StringSchema } from "@jsonschema-editor/json-schema";
import { UiSchema } from "@jsonschema-editor/ui-schema/bridge";

const schema = new ObjectSchema();
schema.setProperty("title", new StringSchema(), true);
const ui = UiSchema.generateForSchema(schema);
```

## License

[MIT](./LICENSE)
