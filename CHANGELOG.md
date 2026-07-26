# Changelog



All notable changes to the npm packages are documented in this file.

The packages `@jsonschema-editor/json-schema`, `@jsonschema-editor/ui-schema`, `@jsonschema-editor/vue`, and `@jsonschema-editor/react` (including `-extensions`) are versioned together.



The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).



## [Unreleased]



## [0.1.13] - 2026-07-26



### Added

- Built-in editor locales: French, Italian, Polish, Ukrainian, Russian, Chinese, Japanese (`fr`, `it`, `pl`, `uk`, `ru`, `zh`, `ja`)
- `@jsonschema-editor/json-schema-extensions` / Vue & React extensions: `x-rating`, `x-progress-bar`, `date-today`, CEL expression editor helpers, computed sync
- Example site: shared Vue/React host, multilingual get-started, low-code hero messaging, scrollable form-data panel, additional scenario i18n

## [0.1.12] - 2026-07-26



### Added

- `@jsonschema-editor/vue` / `@jsonschema-editor/react`: UI layout palette with drag-and-drop chips (insert under selected layout parent; incompatible kinds grayed out)
- `@jsonschema-editor/vue` / `@jsonschema-editor/react`: control scope suggestions from the JSON Schema (unused scopes only) with a warning when a scope is reused
- `@jsonschema-editor/vue` / `@jsonschema-editor/react`: editable Category and Step labels in the UI attributes panel
- Example apps: Playwright coverage for palette drag-and-drop and Stepper chip filtering



## [0.1.11] - 2026-07-12



### Fixed

- `@jsonschema-editor/vue`: form buttons (`.jse-form`) use the same styles as editor buttons, with `color: inherit` — text stays visible when host apps apply global `button` resets
- `@jsonschema-editor/vue-extensions`: geometry action buttons use shared `jse-btn` class; file-field upload button sets explicit text color



## [0.1.10] - 2026-07-12



### Fixed

- `@jsonschema-editor/vue-extensions`: exports **`./style.css`** — Vite bundles extension CSS as `dist/style.css` (aligned with `@jsonschema-editor/vue`); file-field thumbnails and gallery layout work when apps import the stylesheet instead of duplicating CSS



## [0.1.9] - 2026-06-20



### Added

- `@jsonschema-editor/react` — React 19 form editor and fillable form (`JsonSchemaForm`, `JsonSchemaFormEditor`, registries, i18n, validation)
- `@jsonschema-editor/react`: **`OneOfFormField`** — oneOf/anyOf variant switching in forms (parity with Vue)
- `@jsonschema-editor/react-extensions` — React extensions matching `@jsonschema-editor/vue-extensions`: format fields, values-source, x-computed, x-file, x-geometry (Leaflet/Geoman)
- Example app: **`jsonschema-editor-examples-react`** — React demo on port **5174** (form, schema editor, JSON; reuses Vue scenario data)
- Example app: Playwright E2E for React examples (**64 tests**, parity with Vue)
- CI: `pnpm run test:e2e` runs Vue and React example suites



### Changed

- Example app (React): `JsonSchemaFormEditor` remounts on scenario change (`key={activeExampleId}`)



### Fixed

- `@jsonschema-editor/react`: layout editor child wrappers use **`Fragment`** instead of `<span display:contents>` (Playwright `:scope >` selectors; parity with Vue)
- `@jsonschema-editor/react-extensions`: geometry map **`min-height`** CSS so Leaflet maps are visible in the browser
- `@jsonschema-editor/react-extensions`: multi-file upload batch no longer drops files when selecting several files at once



## [0.1.8] - 2026-06-14



### Added

- `@jsonschema-editor/json-schema-extensions`: **`x-file`** — single and multiple file upload fields (`FileDescriptor`, `FileFieldProvider`, `createSingleFileSchema` / `createMultipleFileSchema`, accept/maxSize/maxFiles validation)
- `@jsonschema-editor/vue-extensions`: **`FileFieldFormField`**, **`FileGalleryDialog`**, **`FileAttributeControl`**; in-memory demo provider with **`seed()`** for preloaded demo files; schema types **`file`** / **`file-list`**
- `@jsonschema-editor/vue`: **`phone`** format registered in form validation AJV (via json-schema-extensions)
- Example app: **`#/imprint`** page (Impressum & Datenschutz, DE/EN)
- Example app: custom domain **[jsonschema-editor.cloudapplication.net](https://jsonschema-editor.cloudapplication.net/)** (`public/CNAME`, Pages base path `/`)
- Example app: public scenario **`insurance-claim`** (Schadensmeldung) — Stepper, oneOf (Kfz/Hausrat/Haftpflicht), Zeugenliste, Schadenort-Karte, **`schadenfotos`** file array with demo image, x-computed Bearbeitungsstand
- Example app: public scenario **`logistics-freight-order`** (Speditionsauftrag) — 7-step workflow, dual map, cargo list, oneOf service level, triple x-computed
- Example app: public scenario **`construction-project-application`** (Bauprojekt-Anmeldung) — 9-step permit workflow, triple map, dual oneOf, quadruple x-computed
- Example app: **`#/get-started`** subpage with install steps and architecture overview
- Example app: internal **`file-qa`** scenario; E2E tests for file upload and Schadensmeldung attachments



### Changed

- Example app: curated **practice scenario gallery** (public use cases by category); internal examples hidden from sidebar but kept for E2E
- Example app: **workshop layout** — sidebar navigation, hero intro, underline tabs (Form / Editor / JSON), live form data panel
- Example app: deployable to **GitHub Pages** via `.github/workflows/pages.yml`



### Fixed

- `@jsonschema-editor/vue-extensions`: file upload no longer drops selected files when clearing the native input (copy `FileList` before reset)
- `@jsonschema-editor/json-schema-extensions`: MIME type inference from file extension when the browser reports `application/octet-stream` (`resolveUploadMimeType`, `matchesFileAccept`)
- `@jsonschema-editor/vue-extensions`: geometry map no longer clears default `GeometryCollection` values during map initialization



## [0.1.7] - 2026-06-13



### Added



- `@jsonschema-editor/json-schema-extensions`: **`x-computed`** — CEL expressions over root form data (`data` binding); helpers `sum()` / `list.sum()`; `evaluateComputedExpression`, `readComputedConfig`, schema factories for computed types

- `@jsonschema-editor/vue-extensions`: **`ComputedFormField`** and **`ComputedAttributeControl`**; computed schema types (number, string, boolean, integer)

- `@jsonschema-editor/json-schema`: **dynamic array model** — `supportsDynamicItems()`, `resolveItemSchema()`, `createDefaultItemValue()`, `canAddItem()` / `canRemoveItem()`; scope helpers (`buildArrayItemScope`, …); **`data-instance`** (`getValueAtPath`, `setValueAtPath`, `createEmptyDataForSchema`, …)

- `@jsonschema-editor/vue`: **`ArrayFormField`** — add/remove list entries with `minItems` / `maxItems`; **`useFormData`** provide/inject for reliable nested form writes

- `@jsonschema-editor/ui-schema`: array index resolution in `resolveSchemaAtScope`

- Example app: **`array-list-qa`**, **`computed-cost-qa`**, **`computed-status-qa`**; G37 field **`vorsorgeStatus`** (computed)

- Example app: E2E tests for array lists and computed fields (cost sum, status workflow)



### Fixed



- `@jsonschema-editor/json-schema`: `setValueAtPath` no longer fails on Vue reactive form data (`structuredClone` fallback via JSON clone)

- `@jsonschema-editor/vue`: Stepper and Categorization panels render the correct fields when switching steps/tabs (stable Vue keys via scope)

- `@jsonschema-editor/vue-extensions`: computed fields re-evaluate when form data changes through the injected root ref

- `@jsonschema-editor/vue`: `NumberFormField` stores numeric values as `number`, not string



## [0.1.6] - 2026-06-13



### Added



- `@jsonschema-editor/json-schema`: **`AttributeDefinition.scope: "field"`** — universal custom attributes shown on every field type in the schema editor

- `@jsonschema-editor/json-schema`: `JsonSchemaAttributeRegistry.listFieldScoped()`

- `@jsonschema-editor/json-schema-extensions`: field flags **`x-read-only`** and **`x-hidden`** (`registerFieldFlagAttributes`, `isFieldReadOnly`, `isFieldHidden`)

- `@jsonschema-editor/vue`: field-scoped attributes in the attribute panel; form honors `x-read-only` (disabled) and `x-hidden` (not rendered, data preserved)

- `@jsonschema-editor/vue`: bulk actions on object nodes — apply or clear field flags on the subtree (`applyFieldAttributeToDescendants`)

- Example app: **`field-extensions-qa`** and E2E tests for read-only, hidden, and bulk apply



## [0.1.5] - 2026-06-13



### Added



- `@jsonschema-editor/json-schema-extensions`: **`x-geometry`** extension for OGC GeoJSON `GeometryCollection` fields — configurable point, line, and polygon types; `minObjects`/`maxObjects` range or `exactObjects`; optional `styleUrl` (default OpenStreetMap); validation helpers

- `@jsonschema-editor/json-schema-extensions`: schema type **`geometry-collection`** in the extensions registry

- `@jsonschema-editor/vue-extensions`: **`GeometryCollectionFormField`** — Leaflet map with Geoman (draw, edit, delete); action buttons for allowed geometry types; count hints and minimum-object enforcement

- `@jsonschema-editor/vue-extensions`: **`GeometryAttributeControl`** in the schema editor for editing `x-geometry` (type checkboxes, count mode, style URL)

- `@jsonschema-editor/vue-extensions`: dependencies `leaflet` and `@geoman-io/leaflet-geoman-free`

- `@jsonschema-editor/json-schema`: `listCustomAttributeNames()` and custom-attribute display in the schema attributes panel

- `@jsonschema-editor/vue`: i18n keys for `x-geometry` attribute label (de/en)

- `@jsonschema-editor/ui-schema`: improved scope resolution for nested object properties in generated forms

- Example app: **`occupational-health-g37`** (DGUV G37 screen-work exam with stepper, categorization, map field) and **`geometry-qa`** (all type/count combinations)

- Example app: E2E tests for geometry requirements, configurations, and G37 workflow



### Fixed



- `@jsonschema-editor/vue-extensions`: geometry map sync no longer fails on Vue reactive objects (`structuredClone` replaced with JSON clone for GeoJSON data)

- `@jsonschema-editor/vue-extensions`: minimum geometry count blocks removal and shows a field-level error message

- `@jsonschema-editor/vue`: unused variable in `ObjectFormField` (build fix)



## [0.1.4] - 2026-06-13



### Added



- `@jsonschema-editor/json-schema-extensions`: format extensions (`email`, `url`, `phone`), `x-values-source`, and AJV helpers

- `@jsonschema-editor/vue-extensions`: form renderers for format fields and external value sources (`select-list`, `select-api`)

- `@jsonschema-editor/vue`: JSON Schema validation for `JsonSchemaForm` via AJV (`required`, length, numeric bounds, `pattern`, `format`, …)

- `@jsonschema-editor/vue`: field-level error display with `validation` / `validationMode` props (`blur` default, `change` optional)

- `@jsonschema-editor/vue`: public API `useFormValidation`, `useFieldValidation`, and `validateFormData` helpers

- `@jsonschema-editor/vue`: schema type extension registry and merged extension types in the schema editor UI

- `@jsonschema-editor/vue`: UI schema sync when adding schema fields (preserves Stepper, Categorization, and other custom layouts)

- Example app: extension types in schema editor, `person-with-defs` values-source demo, E2E tests for extensions, validation, and car configurator



### Fixed



- `@jsonschema-editor/vue`: production build rendered empty forms when UI registries were tree-shaken (explicit `registerDefaultControls()`)

- `@jsonschema-editor/vue`: adding schema fields no longer replaces custom UI layouts with a flat auto-generated layout

- `@jsonschema-editor/vue`: nested `oneOf` fields bind data to the correct scope

- `@jsonschema-editor/vue`: Stepper and Categorization use `elementKind` instead of fragile `instanceof` checks



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



[Unreleased]: https://github.com/eumicro/jsonschema-editor/compare/v0.1.11...HEAD

[0.1.11]: https://github.com/eumicro/jsonschema-editor/releases/tag/v0.1.11

[0.1.10]: https://github.com/eumicro/jsonschema-editor/releases/tag/v0.1.10

[0.1.9]: https://github.com/eumicro/jsonschema-editor/releases/tag/v0.1.9

[0.1.8]: https://github.com/eumicro/jsonschema-editor/releases/tag/v0.1.8

[0.1.7]: https://github.com/eumicro/jsonschema-editor/releases/tag/0.1.7

[0.1.6]: https://github.com/eumicro/jsonschema-editor/releases/tag/0.1.6

[0.1.5]: https://github.com/eumicro/jsonschema-editor/releases/tag/0.1.5

[0.1.4]: https://github.com/eumicro/jsonschema-editor/releases/tag/0.1.4

[0.1.3]: https://github.com/eumicro/jsonschema-editor/releases/tag/0.1.3

[0.1.2]: https://github.com/eumicro/jsonschema-editor/releases/tag/0.1.2

[0.1.1]: https://github.com/eumicro/jsonschema-editor/releases/tag/0.1.1

[0.1.0]: https://github.com/eumicro/jsonschema-editor/releases/tag/0.1.0


