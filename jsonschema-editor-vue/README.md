# @jsonschema-editor/vue

JSON-Schema-Form-Editor und ausfüllbares Formular für **Vue 3**.

## Installation

```bash
npm install @jsonschema-editor/vue vue
```

Peer Dependency: `vue@^3.5.0`

Die Pakete `@jsonschema-editor/json-schema` und `@jsonschema-editor/ui-schema` werden als Abhängigkeiten mitinstalliert.

## Styles

```ts
import "@jsonschema-editor/vue/style.css";
```

## Schnellstart

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

## Exporte

- `JsonSchemaForm` – ausfüllbares Formular
- `JsonSchemaFormEditor` – visueller Schema-/UI-Editor
- `ControlField`, `UiElementRenderer` – Bausteine für eigene Layouts
- Composables und Registries für Erweiterungen
- Re-Exporte aus `@jsonschema-editor/json-schema` (`SchemaDocument`, `documentFromJSON`, …)

## Entwicklung

```bash
pnpm install
pnpm run build
pnpm run typecheck
```

## Lizenz

MIT – siehe [LICENSE](../LICENSE) im Repository-Root.
