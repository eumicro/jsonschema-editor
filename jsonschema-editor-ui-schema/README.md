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
  factory.createControl("#/properties/email", "Email"),
]);
```

## Load from JSON

```ts
import { UiSchemaFactory } from "@jsonschema-editor/ui-schema";

const factory = new UiSchemaFactory();
const ui = factory.fromJSON({
  type: "VerticalLayout",
  elements: [
    { type: "Control", scope: "#/properties/name", label: "Name" },
    { type: "Control", scope: "#/properties/email", label: "Email" },
  ],
});
```

## Layout types: Stepper and Categorization

Multi-step wizards and tabbed forms are first-class layout elements:

```json
{
  "type": "Stepper",
  "elements": [
    {
      "type": "Step",
      "label": "Vehicle",
      "elements": [
        {
          "type": "Categorization",
          "elements": [
            {
              "type": "Category",
              "label": "Model",
              "elements": [
                { "type": "Control", "scope": "#/properties/model", "label": "Model line" }
              ]
            },
            {
              "type": "Category",
              "label": "Engine",
              "elements": [
                { "type": "Control", "scope": "#/properties/engine", "label": "Engine" }
              ]
            }
          ]
        }
      ]
    },
    {
      "type": "Step",
      "label": "Options",
      "elements": [
        { "type": "Control", "scope": "#/properties/extras", "label": "Extras" }
      ]
    }
  ]
}
```

See the full car configurator UI in `jsonschema-editor-examples/src/examples/data/car-configurator/ui.schema.json`.

## Bridge (with JSON Schema)

Generate a default layout from a schema, then customize:

```ts
import { ObjectSchema, StringSchema } from "@jsonschema-editor/json-schema";
import { UiSchema, FormDefinition } from "@jsonschema-editor/ui-schema/bridge";

const schema = new ObjectSchema();
schema.setProperty("name", new StringSchema(), true);
schema.setProperty("email", new StringSchema());

// Auto-generate VerticalLayout with one Control per property
const ui = UiSchema.generateForSchema(schema);

// Or combine both documents
const doc = FormDefinition.fromJSON(schema.toJSON(), ui.toJSON());
doc.schema.root; // SchemaNode
doc.uiSchema.root; // UiElement
```

## Resolve schema at a control scope

The bridge delegates to the JSON Schema model:

```ts
import { documentFromJSON } from "@jsonschema-editor/json-schema";
import { resolveSchemaAtScope } from "@jsonschema-editor/ui-schema/bridge";

const doc = documentFromJSON({
  type: "object",
  properties: {
    address: {
      type: "object",
      properties: { city: { type: "string" } },
    },
  },
});

const citySchema = resolveSchemaAtScope(doc.root, "#/properties/address/properties/city");
citySchema?.kind; // "string"
```

With `$ref` / `$defs`, pass a resolver:

```ts
resolveSchemaAtScope(doc.root, "#/properties/name", (ref) => doc.resolveRef(ref));
```

## Scopes

Controls bind to JSON Schema paths using JSON Pointer–style scopes:

| Scope | Meaning |
| --- | --- |
| `#/properties/name` | Root object property |
| `#/properties/address/properties/city` | Nested property |
| `#/items` | Array item schema |
| `#/oneOf/0/properties/title` | Branch in a composition |

## No JSON Schema in the core

The `src/model/` folder does **not** import from `@jsonschema-editor/json-schema`.
Coupling lives exclusively in `src/bridge/`.
