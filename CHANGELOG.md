# Changelog



All notable changes to the npm packages are documented in this file.

The packages `@jsonschema-editor/json-schema`, `@jsonschema-editor/ui-schema`, and `@jsonschema-editor/vue` are versioned together.



The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).



## [Unreleased]



### Changed

- Example app: curated **practice scenario gallery** (9 public use cases by category); internal examples hidden from browsing but kept for E2E; practice-oriented labels and schema titles throughout
- Example app: **workshop layout** inspired by declarative form tools — sidebar scenario navigation, hero intro, underline tabs (Form / Editor / JSON), split view with live form data panel
- Example app: **Get started** subpage (`#/get-started`) with install steps, architecture overview, and link back to scenarios
- Example app: deployable to **GitHub Pages** via `.github/workflows/pages.yml` (live demo at [jsonschema-editor.cloudapplication.net](https://jsonschema-editor.cloudapplication.net/))

### Added

- Example app: public scenario **`insurance-claim`** (Schadensmeldung) for Versicherung & Service — Stepper, oneOf (Kfz/Hausrat/Haftpflicht), Zeugenliste, Schadenort-Karte, x-computed Bearbeitungsstand
- Example app: public scenario **`logistics-freight-order`** (Speditionsauftrag) for Logistik & Transport — 7-step workflow, dual map (pickup/delivery), cargo list, oneOf service level, categorization, triple x-computed (weight/volume/freight)
- Example app: public scenario **`construction-project-application`** (Bauprojekt-Anmeldung) for Anträge & Prozesse — 9-step permit workflow, triple map (plot polygon, site access point, traffic line), dual oneOf (project type + usage), trade and neighbor lists, quadruple x-computed plus status

### Fixed

- `@jsonschema-editor/vue-extensions`: geometry map no longer clears default `GeometryCollection` values during map initialization (race between value watcher, Geoman sync, and layer reload)



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



[Unreleased]: https://github.com/eumicro/jsonschema-editor/compare/0.1.6...HEAD

[0.1.6]: https://github.com/eumicro/jsonschema-editor/releases/tag/0.1.6

[0.1.5]: https://github.com/eumicro/jsonschema-editor/releases/tag/0.1.5

[0.1.4]: https://github.com/eumicro/jsonschema-editor/releases/tag/0.1.4

[0.1.3]: https://github.com/eumicro/jsonschema-editor/releases/tag/0.1.3

[0.1.2]: https://github.com/eumicro/jsonschema-editor/releases/tag/0.1.2

[0.1.1]: https://github.com/eumicro/jsonschema-editor/releases/tag/0.1.1

[0.1.0]: https://github.com/eumicro/jsonschema-editor/releases/tag/0.1.0


