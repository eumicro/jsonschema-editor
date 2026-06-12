# JSON Schema Editor

[![CI](https://github.com/eumicro/jsonschema-editor/actions/workflows/ci.yml/badge.svg)](https://github.com/eumicro/jsonschema-editor/actions/workflows/ci.yml)

![Demo: Schema bearbeiten, UI anpassen, Formular testen](./docs/demo.gif)

Drei **eigenständige npm-Pakete** – JSON Schema und UI Schema sind bewusst getrennt:

| Projekt | Paket | Verantwortung |
| --- | --- | --- |
| [jsonschema-editor-json-schema](./jsonschema-editor-json-schema) | `@jsonschema-editor/json-schema` | Objektorientiertes **JSON-Schema**-Modell |
| [jsonschema-editor-ui-schema](./jsonschema-editor-ui-schema) | `@jsonschema-editor/ui-schema` | Objektorientiertes **UI-Schema**-Modell |
| [jsonschema-editor-vue](./jsonschema-editor-vue) | `@jsonschema-editor/vue` | Vue Form-Editor & Formular |
| [jsonschema-editor-examples](./jsonschema-editor-examples) | – | Lokales Editor-Beispiel (nicht auf npm) |

## Installation (npm)

```bash
# Nur JSON Schema
npm install @jsonschema-editor/json-schema

# UI Schema (Bridge optional mit JSON Schema)
npm install @jsonschema-editor/ui-schema

# Vue 3 Form-Editor (installiert json-schema + ui-schema transitiv)
npm install @jsonschema-editor/vue vue
```

Mit pnpm/yarn analog. **Node.js ≥ 20** wird vorausgesetzt.

### Vue-Integration

```ts
import { createApp } from "vue";
import { install } from "@jsonschema-editor/vue";
import "@jsonschema-editor/vue/style.css";

const app = createApp(App);
install(app);
app.mount("#app");
```

## Architektur

```
json-schema          ui-schema              vue
(OOP SchemaNode)     (OOP UiElement)        (Komponenten)
      │                    │                    │
      └──────── bridge ────┘                    │
           (optional)                           │
                └───────────────────────────────┘
```

- **Kein gemeinsames Core-Paket** – jedes Modell ist eigenständig.
- Die **Bridge** (`@jsonschema-editor/ui-schema/bridge`) verbindet beide Welten optional:
  - `UiSchemaGenerator.generateForSchema()`
  - `FormDefinition.fromJSON()` für kombinierte Dokumente
  - `resolveSchemaAtScope()` delegiert an `SchemaNode.resolveAtScope()`

## Entwicklung (Monorepo)

Voraussetzungen: Node.js ≥ 20, [pnpm](https://pnpm.io/) ≥ 9.

```bash
pnpm install
pnpm run build
pnpm run test
pnpm --filter jsonschema-editor-examples run dev
```

Weitere Details: [PUBLISHING.md](./PUBLISHING.md), [CHANGELOG.md](./CHANGELOG.md), [SECURITY.md](./SECURITY.md).

## JSON Schema (isoliert)

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

## UI Schema (isoliert)

```ts
import { Control, VerticalLayout, UiSchemaFactory } from "@jsonschema-editor/ui-schema";

const factory = new UiSchemaFactory();
const layout = factory.createVerticalLayout([
  factory.createControl("#/properties/name", "Name"),
]);
```

## Bridge (beide zusammen)

```ts
import { ObjectSchema, StringSchema } from "@jsonschema-editor/json-schema";
import { UiSchema } from "@jsonschema-editor/ui-schema/bridge";

const schema = new ObjectSchema();
schema.setProperty("title", new StringSchema(), true);
const ui = UiSchema.generateForSchema(schema);
```

## Lizenz

[MIT](./LICENSE)
