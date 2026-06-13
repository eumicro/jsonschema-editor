# @jsonschema-editor/vue-extensions

Vue form field renderers for extended JSON Schema string formats (`email`, `uri`, `phone`).

Works with `@jsonschema-editor/json-schema-extensions` on the schema side and registers custom controls via `@jsonschema-editor/vue` extension API.

## Installation

```bash
npm install @jsonschema-editor/vue-extensions @jsonschema-editor/vue vue
```

Peer dependencies: `@jsonschema-editor/vue`, `@jsonschema-editor/json-schema-extensions`, `vue@^3.5`.

## Register at app startup

```ts
import { registerDefaultVueExtensions } from "@jsonschema-editor/vue-extensions";

registerDefaultVueExtensions();
```

Or pass extensions to `install()` / form components:

```ts
import { install } from "@jsonschema-editor/vue";
import { formatFieldsExtension } from "@jsonschema-editor/vue-extensions";

install(app, { extensions: [formatFieldsExtension] });
```

```vue
<JsonSchemaFormEditor
  :extensions="[formatFieldsExtension]"
  ...
/>
```

## Custom extensions

Use matchers from `@jsonschema-editor/vue`:

```ts
import {
  registerVueExtension,
  matchStringFormat,
  matchPropertyName,
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
  ],
};

registerVueExtension(myExtension);
```

## License

MIT — see [LICENSE](../LICENSE) in the repository root.
