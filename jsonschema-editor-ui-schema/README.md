# @jsonschema-editor/ui-schema

Standalone, **strictly object-oriented** UI schema data model (JSON Forms compatible).

## Principles

- **Inheritance**: `UiElement` → `UiLayout` / `Control` / `Label`
- **Encapsulation**: `UiCustomAttributeCollection`, dedicated `UiSchemaAttributeRegistry`
- **Polymorphism**: `accept(visitor)`, `deepClone()`
- **Factory**: `UiSchemaFactory`

## Installation

```bash
npm install @jsonschema-editor/ui-schema
```

Optional for the bridge:

```bash
npm install @jsonschema-editor/json-schema
```

Development in the monorepo:

```bash
pnpm install
pnpm run build
```

## Standalone (without JSON Schema)

```ts
import { UiSchemaFactory } from "@jsonschema-editor/ui-schema";

const factory = new UiSchemaFactory();
const ui = factory.createVerticalLayout([
  factory.createControl("#/properties/name", "Name"),
]);
```

## Bridge (with JSON Schema)

```ts
import { ObjectSchema, StringSchema } from "@jsonschema-editor/json-schema";
import { UiSchema, FormDefinition } from "@jsonschema-editor/ui-schema/bridge";

const schema = new ObjectSchema();
schema.setProperty("name", new StringSchema(), true);

const ui = UiSchema.generateForSchema(schema);
const doc = FormDefinition.fromJSON(schema.toJSON(), ui.toJSON());
```

## No JSON Schema in the core

The `src/model/` folder does **not** import from `@jsonschema-editor/json-schema`.
Coupling lives exclusively in `src/bridge/`.
