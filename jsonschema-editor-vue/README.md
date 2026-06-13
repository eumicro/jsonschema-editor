# @jsonschema-editor/vue

JSON Schema form editor and fillable form for **Vue 3**.

## Installation

```bash
npm install @jsonschema-editor/vue vue

# Recommended with format fields and value-source selects
npm install @jsonschema-editor/json-schema-extensions @jsonschema-editor/vue-extensions
```

Peer dependency: `vue@^3.5.0`

The packages `@jsonschema-editor/json-schema` and `@jsonschema-editor/ui-schema` are installed as dependencies.

## Styles

```ts
import "@jsonschema-editor/vue/style.css";
```

## Quick start

Components expect **OOP model objects** (`SchemaDocument`, `UiSchema`), not raw JSON. Load schemas with the extensions registry when using custom attributes:

```ts
// main.ts
import { createApp } from "vue";
import { install } from "@jsonschema-editor/vue";
import { registerDefaultVueExtensions } from "@jsonschema-editor/vue-extensions";
import App from "./App.vue";
import "@jsonschema-editor/vue/style.css";

registerDefaultVueExtensions();

const app = createApp(App);
install(app);
app.mount("#app");
```

```vue
<!-- ContactForm.vue -->
<script setup lang="ts">
import { ref } from "vue";
import { JsonSchemaFormEditor } from "@jsonschema-editor/vue";
import { documentFromJSONWithExtensions } from "@jsonschema-editor/json-schema-extensions";
import { UiSchema } from "@jsonschema-editor/ui-schema/bridge";

const schemaJson = {
  type: "object",
  properties: {
    name: { type: "string", title: "Name" },
    email: { type: "string", format: "email", title: "Email" },
  },
  required: ["name"],
};

const schema = ref(documentFromJSONWithExtensions(schemaJson));
const uiSchema = ref(UiSchema.generateForSchema(schema.value.root));
const data = ref({ name: "", email: "" });
</script>

<template>
  <JsonSchemaFormEditor
    v-model="data"
    :schema="schema"
    :ui-schema="uiSchema"
    @update:schema="schema = $event"
    @update:ui-schema="uiSchema = $event"
  />
</template>
```

Switch to `JsonSchemaForm` for a read-only fillable form with validation instead of the visual editor.

## Fillable form with validation

```vue
<script setup lang="ts">
import { ref } from "vue";
import { JsonSchemaForm } from "@jsonschema-editor/vue";

const formRef = ref<InstanceType<typeof JsonSchemaForm>>();

function onSubmit({ valid }: { valid: boolean }) {
  if (!valid) return;
  // submit data.value
}

async function validateNow() {
  const valid = formRef.value?.validate() ?? false;
  console.log("Valid:", valid);
}
</script>

<template>
  <JsonSchemaForm
    ref="formRef"
    :schema="schema"
    :ui-schema="uiSchema"
    v-model="data"
    validation
    validation-mode="blur"
    @submit="onSubmit"
  />
  <button type="button" @click="validateNow">Validate</button>
</template>
```

| Prop | Default | Description |
| --- | --- | --- |
| `validation` | `true` | Enable AJV-based field validation |
| `validationMode` | `"blur"` | `"blur"` or `"change"` |
| `extensions` | – | Per-component `JseVueExtension[]` (alternative to global registration) |
| `readonly` | `false` | Disable all inputs |

Validation uses `ajv` + `ajv-formats` internally. Custom `phone` format validation is handled when `@jsonschema-editor/json-schema-extensions` is present.

## Exports

- `JsonSchemaForm` — fillable form
- `JsonSchemaFormEditor` — visual schema/UI editor
- `ControlField`, `UiElementRenderer` — building blocks for custom layouts
- Composables and registries for extensions
- Re-exports from `@jsonschema-editor/json-schema` (`SchemaDocument`, `documentFromJSON`, …)

## Internationalization (i18n)

The library includes built-in strings for **German** (`de`, default) and **English** (`en`). There is **no** required peer dependency on `vue-i18n` — translations use provide/inject.

### Override locale and messages

```vue
<JsonSchemaFormEditor
  :schema="schema"
  :ui-schema="uiSchema"
  v-model="data"
  locale="en"
  fallback-locale="de"
  :messages="{ en: { 'editor.tabs.schema.label': 'Custom schema tab' } }"
/>
```

The same props are available on `JsonSchemaForm`: `locale`, `fallbackLocale`, `messages`, `translate`.

### Integration with vue-i18n

```ts
import { createI18n } from "vue-i18n";
import { createVueI18nAdapter } from "@jsonschema-editor/vue";

const i18n = createI18n({ /* … */ });

<JsonSchemaFormEditor
  :translate="createVueI18nAdapter(i18n.global)"
/>
```

Host keys may use the `jse.` prefix (e.g. `jse.editor.tabs.schema.label`) or match the package keys exactly.

### Form labels from the UI schema

Each control in the UI schema can set an i18n key (`element.i18n`). Labels are resolved in this order:

1. explicit `label` on the control
2. `i18n` key → `t(key)` from the editor/form context
3. `title` from the JSON Schema
4. scope as fallback
5. `form.fallbackLabel`

### API for custom extensions

```ts
import { useJseI18n, deMessages, enMessages, type JseMessageKey } from "@jsonschema-editor/vue";

const { t, locale } = useJseI18n();
```

`useJseI18n()` works inside `JsonSchemaForm` / `JsonSchemaFormEditor` and their child components. Message keys are typed in `deMessages` / `enMessages` (`JseMessageKey`).

## Extensions (custom form renderers)

Register Vue components for schema fields via `registerVueExtension()` or the `extensions` prop:

```ts
import {
  registerVueExtension,
  matchStringFormat,
  matchCustomAttribute,
  matchPropertyName,
  type JseVueExtension,
} from "@jsonschema-editor/vue";

const ratingExtension: JseVueExtension = {
  id: "star-rating",
  formFields: [
    {
      id: "rating-field",
      priority: 30,
      match: matchPropertyName("rating"),
      component: StarRatingField,
    },
  ],
};

registerVueExtension(ratingExtension);
```

Matchers receive the schema node and a `FormFieldMatchContext` (`scope`, `propertyName`, `label`, `fieldSchema`, …). Higher `priority` wins.

Built-in renderers for `email`, `uri`, `phone`, and `x-values-source` are in `@jsonschema-editor/vue-extensions`:

```ts
import { registerDefaultVueExtensions } from "@jsonschema-editor/vue-extensions";
registerDefaultVueExtensions();
```

## Development

```bash
pnpm install
pnpm run build
pnpm run typecheck
```

## License

MIT — see [LICENSE](../LICENSE) in the repository root.
