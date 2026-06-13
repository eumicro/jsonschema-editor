# Changelog

Alle wesentlichen Änderungen an den npm-Paketen werden in dieser Datei dokumentiert.
Die Pakete `@jsonschema-editor/json-schema`, `@jsonschema-editor/ui-schema` und `@jsonschema-editor/vue` werden gemeinsam versioniert.

Das Format basiert auf [Keep a Changelog](https://keepachangelog.com/de/1.1.0/).

## [Unveröffentlicht]

## [0.1.2] - 2026-06-13

### Hinzugefügt

- `@jsonschema-editor/vue`: Internationalisierung (i18n) mit eingebauten Texten für Deutsch und Englisch
- `@jsonschema-editor/vue`: Props `locale`, `fallbackLocale`, `messages` und `translate` auf `JsonSchemaFormEditor` und `JsonSchemaForm`
- `@jsonschema-editor/vue`: Public API `useJseI18n`, `createVueI18nAdapter`, `deMessages`, `enMessages` und typisierte Message-Keys
- `@jsonschema-editor/vue`: Reaktiver Locale-Wechsel zur Laufzeit (Provide/Inject, ohne Pflicht-Peer `vue-i18n`)

### Geändert

- `@jsonschema-editor/vue`: Architektur-Refactoring – Composables für Editor-State, Schema-/UI-Attribut-Panels, Formular-Labels und Baum-Aktionen
- `@jsonschema-editor/vue`: UI-Defaults in `createUiElement` über i18n-Keys statt fester deutscher Strings
- `@jsonschema-editor/vue`: README um i18n-Dokumentation ergänzt
- Beispielanwendung: Sprachwechsel-Dropdown (Deutsch/English) und lokalisierte App-Hülle
- Repository-README: Demo-GIF ergänzt

### Sonstiges

- CI-Workflow: Typecheck-Schritt entfernt (Typecheck weiterhin lokal und im Vue-Build)

## [0.1.1] - 2026-06-12

### Geändert

- Publish-Workflow nutzt GitHub Environment `Dev` für `NPM_TOKEN`
- Repository-Metadaten und Dokumentation auf `eumicro/jsonschema-editor` ausgerichtet

## [0.1.0] - 2026-06-12

### Hinzugefügt

- `@jsonschema-editor/json-schema`: Objektorientiertes JSON-Schema-Datenmodell
- `@jsonschema-editor/ui-schema`: Objektorientiertes UI-Schema-Datenmodell inkl. Bridge
- `@jsonschema-editor/vue`: Vue-3-Form-Editor und ausfüllbares Formular

[Unveröffentlicht]: https://github.com/eumicro/jsonschema-editor/compare/0.1.2...HEAD
[0.1.2]: https://github.com/eumicro/jsonschema-editor/releases/tag/0.1.2
[0.1.1]: https://github.com/eumicro/jsonschema-editor/releases/tag/0.1.1
[0.1.0]: https://github.com/eumicro/jsonschema-editor/releases/tag/0.1.0
