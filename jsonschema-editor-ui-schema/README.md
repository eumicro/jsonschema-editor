# @jsonschema-editor/ui-schema

Eigenständiges, **streng objektorientiertes** UI-Schema-Datenmodell (JSON Forms-kompatibel).

## Prinzipien

- **Vererbung**: `UiElement` → `UiLayout` / `Control` / `Label`
- **Kapselung**: `UiCustomAttributeCollection`, eigene `UiSchemaAttributeRegistry`
- **Polymorphie**: `accept(visitor)`, `deepClone()`
- **Fabrik**: `UiSchemaFactory`

## Installation

```bash
npm install @jsonschema-editor/ui-schema
```

Optional für die Bridge:

```bash
npm install @jsonschema-editor/json-schema
```

Entwicklung im Monorepo:

```bash
pnpm install
pnpm run build
```

## Isoliert (ohne JSON Schema)

```ts
import { UiSchemaFactory } from "@jsonschema-editor/ui-schema";

const factory = new UiSchemaFactory();
const ui = factory.createVerticalLayout([
  factory.createControl("#/properties/name", "Name"),
]);
```

## Bridge (mit JSON Schema)

```ts
import { ObjectSchema, StringSchema } from "@jsonschema-editor/json-schema";
import { UiSchema, FormDefinition } from "@jsonschema-editor/ui-schema/bridge";

const schema = new ObjectSchema();
schema.setProperty("name", new StringSchema(), true);

const ui = UiSchema.generateForSchema(schema);
const doc = FormDefinition.fromJSON(schema.toJSON(), ui.toJSON());
```

## Kein JSON-Schema im Kern

Der Ordner `src/model/` importiert **nicht** aus `@jsonschema-editor/json-schema`.
Die Kopplung liegt ausschließlich in `src/bridge/`.
