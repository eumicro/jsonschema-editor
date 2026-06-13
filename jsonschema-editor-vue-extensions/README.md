# @jsonschema-editor/vue-extensions

Vue form field renderers for extended JSON Schema formats (`email`, `uri`, `phone`) and **`x-values-source`** selects (static lists and API-backed dropdowns).

Works with `@jsonschema-editor/json-schema-extensions` on the schema side and registers custom controls via `@jsonschema-editor/vue` extension API.

## Installation

```bash
npm install @jsonschema-editor/vue-extensions @jsonschema-editor/vue @jsonschema-editor/json-schema-extensions vue
```

Peer dependencies: `@jsonschema-editor/vue`, `@jsonschema-editor/json-schema-extensions`, `vue@^3.5`.

## Register at app startup

```ts
import { createApp } from "vue";
import { install } from "@jsonschema-editor/vue";
import { registerDefaultVueExtensions } from "@jsonschema-editor/vue-extensions";
import { documentFromJSONWithExtensions } from "@jsonschema-editor/json-schema-extensions";
import "@jsonschema-editor/vue/style.css";

registerDefaultVueExtensions();

const app = createApp(App);
install(app);
app.mount("#app");
```

Or pass extensions to `install()` / form components:

```ts
import { install } from "@jsonschema-editor/vue";
import { formatFieldsExtension, valuesSourceExtension } from "@jsonschema-editor/vue-extensions";

install(app, { extensions: [formatFieldsExtension, valuesSourceExtension] });
```

```vue
<JsonSchemaFormEditor
  :extensions="[formatFieldsExtension, valuesSourceExtension]"
  ...
/>
```

## What gets registered

| Extension | Schema match | Form control |
| --- | --- | --- |
| `email` | `format: "email"` | `<input type="email">` with validation hint |
| `url` | `format: "uri"` | URL input |
| `phone` | `format: "phone"` | Tel input |
| `select-list` | `x-values-source.kind: "static"` | `<select>` from fixed values |
| `select-api` | `x-values-source.kind: "fetch"` | `<select>` loaded via `fetch()` |

In the schema editor, these appear as **+ email**, **+ url**, **+ phone**, **+ select-list**, and **+ select-api** when adding new fields.

## Schema examples

### Format fields

```json
{
  "type": "object",
  "properties": {
    "email": { "type": "string", "format": "email", "title": "Email" },
    "website": { "type": "string", "format": "uri", "title": "Website" },
    "phone": { "type": "string", "format": "phone", "title": "Phone" }
  }
}
```

Load with `documentFromJSONWithExtensions()` so attributes roundtrip correctly.

### Static select

```json
{
  "department": {
    "type": "string",
    "title": "Department",
    "x-values-source": {
      "kind": "static",
      "values": ["Sales", "Engineering", "Support"]
    }
  }
}
```

### API-backed select

```json
{
  "manager": {
    "type": "string",
    "title": "Manager",
    "x-values-source": {
      "kind": "fetch",
      "url": "https://jsonplaceholder.typicode.com/users",
      "valueField": "id",
      "labelField": "name"
    }
  }
}
```

The fetch control loads options on mount and shows an error hint if the request fails.

## Full minimal example

```vue
<script setup lang="ts">
import { ref } from "vue";
import { JsonSchemaForm } from "@jsonschema-editor/vue";
import { documentFromJSONWithExtensions } from "@jsonschema-editor/json-schema-extensions";
import { UiSchema } from "@jsonschema-editor/ui-schema/bridge";

const schema = documentFromJSONWithExtensions({
  type: "object",
  properties: {
    email: { type: "string", format: "email", title: "Email" },
    manager: {
      type: "string",
      title: "Manager",
      "x-values-source": {
        kind: "fetch",
        url: "https://jsonplaceholder.typicode.com/users",
        valueField: "id",
        labelField: "name",
      },
    },
  },
});

const uiSchema = UiSchema.generateForSchema(schema.root);
const data = ref({});
</script>

<template>
  <JsonSchemaForm :schema="schema" :ui-schema="uiSchema" v-model="data" />
</template>
```

## Custom extensions

Use matchers from `@jsonschema-editor/vue`:

```ts
import { StringSchema } from "@jsonschema-editor/json-schema";
import {
  registerVueExtension,
  matchCustomAttribute,
  type JseVueExtension,
} from "@jsonschema-editor/vue";

const myExtension: JseVueExtension = {
  id: "my-app-fields",
  formFields: [
    {
      id: "price-input",
      priority: 30,
      match: (schema, ctx) =>
        schema.kind === "number" && ctx.propertyName === "price",
      component: MyPriceInput,
    },
    {
      id: "tags-input",
      priority: 25,
      match: matchCustomAttribute("x-tags"),
      component: TagsInput,
    },
  ],
  schemaTypes: [
    {
      id: "tags",
      label: "tags",
      create: () => {
        const s = new StringSchema();
        s.setCustomAttribute("x-tags", true);
        return s;
      },
      match: (node) => node.getCustomAttribute("x-tags") === true,
    },
  ],
};

registerVueExtension(myExtension);
```

See `formatFieldsExtension` and `valuesSourceExtension` in this package for reference implementations.

## License

MIT — see [LICENSE](../LICENSE) in the repository root.
