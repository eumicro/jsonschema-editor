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

## Load a schema from JSON

```ts
import { documentFromJSON, schemaFromJSON } from "@jsonschema-editor/json-schema";

const doc = documentFromJSON({
  type: "object",
  properties: {
    name: { type: "string", title: "Name" },
    age: { type: "integer", minimum: 0 },
  },
  required: ["name"],
});

doc.root.kind; // "object"
doc.root.toJSON(); // roundtrip
```

Use `schemaFromJSON()` when you only need the root node without `$defs` handling.

## Build a schema programmatically

```ts
import {
  ObjectSchema,
  StringSchema,
  IntegerSchema,
  CompositionSchema,
} from "@jsonschema-editor/json-schema";

const contact = new ObjectSchema();
contact.title = "Contact";
contact.setProperty("name", new StringSchema(), true);
contact.setProperty("age", new IntegerSchema());

const email = new StringSchema();
email.format = "email";
email.title = "Email";
contact.setProperty("email", email);
```

## `$defs` and `$ref`

```ts
import {
  documentFromJSON,
  buildDefRef,
  RefSchema,
} from "@jsonschema-editor/json-schema";

const doc = documentFromJSON({
  oneOf: [{ $ref: "#/$defs/Person" }, { $ref: "#/$defs/Company" }],
  $defs: {
    Person: {
      type: "object",
      properties: { name: { type: "string" } },
      required: ["name"],
    },
    Company: {
      type: "object",
      properties: { legalName: { type: "string" } },
      required: ["legalName"],
    },
  },
});

doc.getDef("Person"); // ObjectSchema
doc.resolveRef(buildDefRef("Person")); // same node

// Resolve a field path through oneOf / $ref
doc.root.resolveAtScope("#/properties/name"); // undefined at root (oneOf)
```

## Resolve data paths (`resolveAtScope`)

```ts
const person = documentFromJSON({
  type: "object",
  properties: {
    address: {
      type: "object",
      properties: { city: { type: "string" } },
    },
  },
});

const citySchema = person.root.resolveAtScope("#/properties/address/properties/city");
citySchema?.kind; // "string"
```

## Custom attributes

Custom keys like `x-priority` are only loaded when registered on a `JsonSchemaAttributeRegistry`:

```ts
import {
  JsonSchemaAttributeRegistry,
  StringSchema,
  schemaFromJSON,
} from "@jsonschema-editor/json-schema";

const registry = new JsonSchemaAttributeRegistry();
registry.register({ name: "x-priority", defaultValue: "normal" });

const field = schemaFromJSON(
  { type: "string", "x-priority": "high" },
  registry,
);
field.getCustomAttribute("x-priority"); // "high"
```

For built-in extension attributes (`x-format-extension`, `x-values-source`), use `@jsonschema-editor/json-schema-extensions` and `documentFromJSONWithExtensions()`.

## Default values for forms

```ts
import { documentFromJSON } from "@jsonschema-editor/json-schema";

const doc = documentFromJSON({
  type: "object",
  properties: {
    active: { type: "boolean", default: true },
    tags: { type: "array", items: { type: "string" }, default: [] },
  },
});

doc.root.createDefaultValue();
// { active: true, tags: [] }
```

## No UI schema

This package does **not** know about UI schemas. See `@jsonschema-editor/ui-schema`.
