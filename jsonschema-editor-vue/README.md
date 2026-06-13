# @jsonschema-editor/vue

JSON Schema form editor and fillable form for **Vue 3**.

## Installation

```bash
npm install @jsonschema-editor/vue vue
```

Peer dependency: `vue@^3.5.0`

The packages `@jsonschema-editor/json-schema` and `@jsonschema-editor/ui-schema` are installed as dependencies.

## Styles

```ts
import "@jsonschema-editor/vue/style.css";
```

## Quick start

```ts
import { createApp } from "vue";
import { install, JsonSchemaFormEditor } from "@jsonschema-editor/vue";
import "@jsonschema-editor/vue/style.css";

const app = createApp({ components: { JsonSchemaFormEditor } });
install(app);
app.mount("#app");
```

```vue
<template>
  <JsonSchemaFormEditor
    :schema="schemaJson"
    :ui-schema="uiSchemaJson"
    v-model="data"
  />
</template>
```

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

## Development

```bash
pnpm install
pnpm run build
pnpm run typecheck
```

## License

MIT — see [LICENSE](../LICENSE) in the repository root.
