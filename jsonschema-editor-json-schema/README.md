# @jsonschema-editor/json-schema

Standalone, **strictly object-oriented** JSON Schema data model.

## Principles

- **Inheritance**: `SchemaNode` → `LeafSchema` / `CompositeSchema` → concrete types
- **Encapsulation**: `SchemaMetadata`, `CustomAttributeCollection`, `PropertyCollection`
- **Polymorphism**: `accept(visitor)`, `deepClone()`, `resolveAtScope()`, `createDefaultValue()`
- **Factory**: `SchemaFactory.fromJSON()` / `createObject()` …
- **Template method**: `toJSON()` calls `writeTypeDefinition()`

## Installation

```bash
npm install @jsonschema-editor/json-schema
```

Development in the monorepo:

```bash
pnpm install
pnpm run build
pnpm test
```

## Custom attributes

```ts
import {
  JsonSchemaAttributeRegistry,
  StringSchema,
  schemaFromJSON,
} from "@jsonschema-editor/json-schema";

const registry = new JsonSchemaAttributeRegistry();
registry.register({ name: "x-priority", defaultValue: "normal" });

const field = new StringSchema(registry);
field.setCustomAttribute("x-priority", "high");
```

## No UI schema

This package does **not** know about UI schemas. See `@jsonschema-editor/ui-schema`.
