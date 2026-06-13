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

## Internationalisierung (i18n)

Die Bibliothek bringt eingebaute Texte für **Deutsch** (`de`, Standard) und **Englisch** (`en`) mit. Es gibt **keine** Pflicht-Peer-Dependency auf `vue-i18n` – Übersetzungen laufen über Provide/Inject.

### Locale und Messages überschreiben

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

Gleiche Props stehen auf `JsonSchemaForm` zur Verfügung: `locale`, `fallbackLocale`, `messages`, `translate`.

### Integration mit vue-i18n

```ts
import { createI18n } from "vue-i18n";
import { createVueI18nAdapter } from "@jsonschema-editor/vue";

const i18n = createI18n({ /* … */ });

<JsonSchemaFormEditor
  :translate="createVueI18nAdapter(i18n.global)"
/>
```

Host-Keys können unter dem Präfix `jse.` liegen (z. B. `jse.editor.tabs.schema.label`) oder identisch zu den Paket-Keys sein.

### Formular-Labels aus dem UI-Schema

Im UI-Schema kann pro Control ein i18n-Key gesetzt werden (`element.i18n`). Die Auflösung erfolgt in dieser Reihenfolge:

1. explizites `label` am Control
2. `i18n`-Key → `t(key)` aus dem Editor-/Form-Kontext
3. `title` aus dem JSON Schema
4. Scope als Fallback
5. `form.fallbackLabel`

### API für eigene Erweiterungen

```ts
import { useJseI18n, deMessages, enMessages, type JseMessageKey } from "@jsonschema-editor/vue";

const { t, locale } = useJseI18n();
```

`useJseI18n()` funktioniert innerhalb von `JsonSchemaForm` / `JsonSchemaFormEditor` und deren Kindkomponenten. Message-Keys sind in `deMessages` / `enMessages` typisiert (`JseMessageKey`).

## Entwicklung

```bash
pnpm install
pnpm run build
pnpm run typecheck
```

## Lizenz

MIT – siehe [LICENSE](../LICENSE) im Repository-Root.
