# @jsonschema-editor/json-schema

Eigenständiges, **streng objektorientiertes** JSON-Schema-Datenmodell.

## Prinzipien

- **Vererbung**: `SchemaNode` → `LeafSchema` / `CompositeSchema` → konkrete Typen
- **Kapselung**: `SchemaMetadata`, `CustomAttributeCollection`, `PropertyCollection`
- **Polymorphie**: `accept(visitor)`, `deepClone()`, `resolveAtScope()`, `createDefaultValue()`
- **Fabrik**: `SchemaFactory.fromJSON()` / `createObject()` …
- **Template Method**: `toJSON()` ruft `writeTypeDefinition()` auf

## Installation

```bash
npm install
npm run build
npm test
```

## Custom Attributes

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

## Kein UI-Schema

Dieses Paket kennt **kein** UI-Schema. Siehe `@jsonschema-editor/ui-schema`.
