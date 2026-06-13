import type { JsonSchemaObject } from "@jsonschema-editor/json-schema";
import type { UiSchemaObject } from "@jsonschema-editor/ui-schema";

import carConfiguratorDefaults from "./data/car-configurator/defaults.json";
import carConfiguratorMeta from "./data/car-configurator/meta.json";
import carConfiguratorSchema from "./data/car-configurator/schema.json";
import carConfiguratorUi from "./data/car-configurator/ui.schema.json";
import occupationalHealthG37Defaults from "./data/occupational-health-g37/defaults.json";
import occupationalHealthG37Meta from "./data/occupational-health-g37/meta.json";
import occupationalHealthG37Schema from "./data/occupational-health-g37/schema.json";
import occupationalHealthG37Ui from "./data/occupational-health-g37/ui.schema.json";
import personOneOfDefaults from "./data/person-one-of/defaults.json";
import personOneOfMeta from "./data/person-one-of/meta.json";
import personOneOfSchema from "./data/person-one-of/schema.json";
import personOneOfUi from "./data/person-one-of/ui.schema.json";
import personWithDefsDefaults from "./data/person-with-defs/defaults.json";
import personWithDefsMeta from "./data/person-with-defs/meta.json";
import personWithDefsSchema from "./data/person-with-defs/schema.json";
import personWithDefsUi from "./data/person-with-defs/ui.schema.json";
import simpleCompositionDefaults from "./data/simple-composition/defaults.json";
import simpleCompositionMeta from "./data/simple-composition/meta.json";
import simpleCompositionSchema from "./data/simple-composition/schema.json";
import simpleCompositionUi from "./data/simple-composition/ui.schema.json";
import computedCostQaDefaults from "./data/computed-cost-qa/defaults.json";
import computedCostQaMeta from "./data/computed-cost-qa/meta.json";
import computedCostQaSchema from "./data/computed-cost-qa/schema.json";
import computedCostQaUi from "./data/computed-cost-qa/ui.schema.json";
import computedStatusQaDefaults from "./data/computed-status-qa/defaults.json";
import computedStatusQaMeta from "./data/computed-status-qa/meta.json";
import computedStatusQaSchema from "./data/computed-status-qa/schema.json";
import computedStatusQaUi from "./data/computed-status-qa/ui.schema.json";
import arrayListQaDefaults from "./data/array-list-qa/defaults.json";
import arrayListQaMeta from "./data/array-list-qa/meta.json";
import arrayListQaSchema from "./data/array-list-qa/schema.json";
import arrayListQaUi from "./data/array-list-qa/ui.schema.json";
import fieldExtensionsQaDefaults from "./data/field-extensions-qa/defaults.json";
import fieldExtensionsQaMeta from "./data/field-extensions-qa/meta.json";
import fieldExtensionsQaSchema from "./data/field-extensions-qa/schema.json";
import fieldExtensionsQaUi from "./data/field-extensions-qa/ui.schema.json";
import geometryQaDefaults from "./data/geometry-qa/defaults.json";
import geometryQaMeta from "./data/geometry-qa/meta.json";
import geometryQaSchema from "./data/geometry-qa/schema.json";
import geometryQaUi from "./data/geometry-qa/ui.schema.json";

export type ExampleId =
  | "person-one-of"
  | "person-with-defs"
  | "simple-composition"
  | "car-configurator"
  | "occupational-health-g37"
  | "geometry-qa"
  | "field-extensions-qa"
  | "computed-cost-qa"
  | "computed-status-qa"
  | "array-list-qa";

export interface ExampleManifest {
  id: ExampleId;
  label: string;
  description: string;
  schema: JsonSchemaObject;
  uiSchema: UiSchemaObject;
  defaults: Record<string, unknown>;
}

export const exampleManifests: ExampleManifest[] = [
  {
    id: "person-one-of",
    label: personOneOfMeta.label,
    description: personOneOfMeta.description,
    schema: personOneOfSchema as unknown as JsonSchemaObject,
    uiSchema: personOneOfUi as unknown as UiSchemaObject,
    defaults: personOneOfDefaults,
  },
  {
    id: "person-with-defs",
    label: personWithDefsMeta.label,
    description: personWithDefsMeta.description,
    schema: personWithDefsSchema as unknown as JsonSchemaObject,
    uiSchema: personWithDefsUi as unknown as UiSchemaObject,
    defaults: personWithDefsDefaults,
  },
  {
    id: "simple-composition",
    label: simpleCompositionMeta.label,
    description: simpleCompositionMeta.description,
    schema: simpleCompositionSchema as unknown as JsonSchemaObject,
    uiSchema: simpleCompositionUi as unknown as UiSchemaObject,
    defaults: simpleCompositionDefaults,
  },
  {
    id: "car-configurator",
    label: carConfiguratorMeta.label,
    description: carConfiguratorMeta.description,
    schema: carConfiguratorSchema as unknown as JsonSchemaObject,
    uiSchema: carConfiguratorUi as unknown as UiSchemaObject,
    defaults: carConfiguratorDefaults,
  },
  {
    id: "occupational-health-g37",
    label: occupationalHealthG37Meta.label,
    description: occupationalHealthG37Meta.description,
    schema: occupationalHealthG37Schema as unknown as JsonSchemaObject,
    uiSchema: occupationalHealthG37Ui as unknown as UiSchemaObject,
    defaults: occupationalHealthG37Defaults,
  },
  {
    id: "geometry-qa",
    label: geometryQaMeta.label,
    description: geometryQaMeta.description,
    schema: geometryQaSchema as unknown as JsonSchemaObject,
    uiSchema: geometryQaUi as unknown as UiSchemaObject,
    defaults: geometryQaDefaults,
  },
  {
    id: "field-extensions-qa",
    label: fieldExtensionsQaMeta.label,
    description: fieldExtensionsQaMeta.description,
    schema: fieldExtensionsQaSchema as unknown as JsonSchemaObject,
    uiSchema: fieldExtensionsQaUi as unknown as UiSchemaObject,
    defaults: fieldExtensionsQaDefaults,
  },
  {
    id: "computed-cost-qa",
    label: computedCostQaMeta.label,
    description: computedCostQaMeta.description,
    schema: computedCostQaSchema as unknown as JsonSchemaObject,
    uiSchema: computedCostQaUi as unknown as UiSchemaObject,
    defaults: computedCostQaDefaults,
  },
  {
    id: "computed-status-qa",
    label: computedStatusQaMeta.label,
    description: computedStatusQaMeta.description,
    schema: computedStatusQaSchema as unknown as JsonSchemaObject,
    uiSchema: computedStatusQaUi as unknown as UiSchemaObject,
    defaults: computedStatusQaDefaults,
  },
  {
    id: "array-list-qa",
    label: arrayListQaMeta.label,
    description: arrayListQaMeta.description,
    schema: arrayListQaSchema as unknown as JsonSchemaObject,
    uiSchema: arrayListQaUi as unknown as UiSchemaObject,
    defaults: arrayListQaDefaults,
  },
];

export const exampleCatalog: Record<ExampleId, ExampleManifest> = Object.fromEntries(
  exampleManifests.map((manifest) => [manifest.id, manifest]),
) as Record<ExampleId, ExampleManifest>;

export const defaultExampleId: ExampleId = "car-configurator";
