# Changelog

All notable changes to the npm packages are documented in this file.
The packages `@jsonschema-editor/json-schema`, `@jsonschema-editor/ui-schema`, and `@jsonschema-editor/vue` are versioned together.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased]

### Added

- `@jsonschema-editor/vue`: JSON Schema validation for `JsonSchemaForm` via AJV (`required`, length, numeric bounds, `pattern`, `format`, …)
- `@jsonschema-editor/vue`: Field-level error display with `validation` / `validationMode` props (`blur` default, `change` optional)
- `@jsonschema-editor/vue`: Public API `useFormValidation`, `useFieldValidation`, and `validateFormData` helpers

## [0.1.3] - 2026-06-13

### Changed

- README demo GIF extended to demonstrate runtime language switching in the form editor
- All repository and package documentation translated to English (README, CHANGELOG, PUBLISHING.md, SECURITY.md, package READMEs)
- npm package descriptions translated to English
- Example app catalog labels and descriptions translated to English

## [0.1.2] - 2026-06-13

### Added

- `@jsonschema-editor/vue`: Internationalization (i18n) with built-in German and English strings
- `@jsonschema-editor/vue`: `locale`, `fallbackLocale`, `messages`, and `translate` props on `JsonSchemaFormEditor` and `JsonSchemaForm`
- `@jsonschema-editor/vue`: Public API `useJseI18n`, `createVueI18nAdapter`, `deMessages`, `enMessages`, and typed message keys
- `@jsonschema-editor/vue`: Reactive runtime locale switching (provide/inject, no required `vue-i18n` peer)

### Changed

- `@jsonschema-editor/vue`: Architecture refactoring — composables for editor state, schema/UI attribute panels, form labels, and tree actions
- `@jsonschema-editor/vue`: UI defaults in `createUiElement` via i18n keys instead of hard-coded German strings
- `@jsonschema-editor/vue`: README extended with i18n documentation
- Example app: language switch dropdown (German/English) and localized app shell
- Repository README: demo GIF added

### Other

- CI workflow: typecheck step removed (typecheck still runs locally and in the Vue build)

## [0.1.1] - 2026-06-12

### Changed

- Publish workflow uses GitHub Environment `Dev` for `NPM_TOKEN`
- Repository metadata and documentation aligned with `eumicro/jsonschema-editor`

## [0.1.0] - 2026-06-12

### Added

- `@jsonschema-editor/json-schema`: Object-oriented JSON Schema data model
- `@jsonschema-editor/ui-schema`: Object-oriented UI Schema data model including bridge
- `@jsonschema-editor/vue`: Vue 3 form editor and fillable form

[Unreleased]: https://github.com/eumicro/jsonschema-editor/compare/0.1.3...HEAD
[0.1.3]: https://github.com/eumicro/jsonschema-editor/releases/tag/0.1.3
[0.1.2]: https://github.com/eumicro/jsonschema-editor/releases/tag/0.1.2
[0.1.1]: https://github.com/eumicro/jsonschema-editor/releases/tag/0.1.1
[0.1.0]: https://github.com/eumicro/jsonschema-editor/releases/tag/0.1.0
