# JSON Schema Editor

Drei **eigenständige Projekte** – JSON Schema und UI Schema sind bewusst getrennt:

| Projekt | Paket | Verantwortung |
| --- | --- | --- |
| [jsonschema-editor-json-schema](./jsonschema-editor-json-schema) | `@jsonschema-editor/json-schema` | Objektorientiertes **JSON-Schema**-Modell |
| [jsonschema-editor-ui-schema](./jsonschema-editor-ui-schema) | `@jsonschema-editor/ui-schema` | Objektorientiertes **UI-Schema**-Modell |
| [jsonschema-editor-vue](./jsonschema-editor-vue) | `@jsonschema-editor/vue` | Vue Form-Editor & Formular |
| [jsonschema-editor-examples](./jsonschema-editor-examples) | – | Lauffähiges Editor-Beispiel |

## Architektur

```
json-schema          ui-schema              vue
(OOP SchemaNode)     (OOP UiElement)        (Komponenten)
      │                    │                    │
      └──────── bridge ────┘                    │
           (optional)                           │
                └───────────────────────────────┘
```

- **Kein gemeinsames Core-Paket** mehr – jedes Modell ist eigenständig.
- Die **Bridge** (`@jsonschema-editor/ui-schema/bridge`) verbindet beide Welten optional:
  - `UiSchemaGenerator.generateForSchema()`
  - `FormDefinition.fromJSON()` für kombinierte Dokumente
  - `resolveSchemaAtScope()` delegiert an `SchemaNode.resolveAtScope()`

## Schnellstart

```bash
cd jsonschema-editor-json-schema && npm install && npm run build
cd ../jsonschema-editor-ui-schema && npm install && npm run build
cd ../jsonschema-editor-examples && npm install && npm run dev
```

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
