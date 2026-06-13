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
import insuranceClaimDefaults from "./data/insurance-claim/defaults.json";
import insuranceClaimMeta from "./data/insurance-claim/meta.json";
import insuranceClaimSchema from "./data/insurance-claim/schema.json";
import insuranceClaimUi from "./data/insurance-claim/ui.schema.json";
import logisticsFreightOrderDefaults from "./data/logistics-freight-order/defaults.json";
import logisticsFreightOrderMeta from "./data/logistics-freight-order/meta.json";
import logisticsFreightOrderSchema from "./data/logistics-freight-order/schema.json";
import logisticsFreightOrderUi from "./data/logistics-freight-order/ui.schema.json";
import constructionProjectApplicationDefaults from "./data/construction-project-application/defaults.json";
import constructionProjectApplicationMeta from "./data/construction-project-application/meta.json";
import constructionProjectApplicationSchema from "./data/construction-project-application/schema.json";
import constructionProjectApplicationUi from "./data/construction-project-application/ui.schema.json";

export type ExampleId =
  | "person-one-of"
  | "person-with-defs"
  | "simple-composition"
  | "car-configurator"
  | "occupational-health-g37"
  | "insurance-claim"
  | "logistics-freight-order"
  | "construction-project-application"
  | "geometry-qa"
  | "field-extensions-qa"
  | "computed-cost-qa"
  | "computed-status-qa"
  | "array-list-qa";

export type ExampleVisibility = "public" | "internal";

export type ExampleCategory =
  | "Gesundheit & Arbeitsschutz"
  | "Versicherung & Service"
  | "Logistik & Transport"
  | "Vertrieb & Konfiguration"
  | "Anträge & Prozesse"
  | "Stammdaten"
  | "Standort & Planung";

interface ExampleMetaSource {
  label: string;
  tagline: string;
  description: string;
  category: ExampleCategory;
  visibility: ExampleVisibility;
}

export interface ExampleManifest {
  id: ExampleId;
  label: string;
  tagline: string;
  description: string;
  category: ExampleCategory;
  visibility: ExampleVisibility;
  schema: JsonSchemaObject;
  uiSchema: UiSchemaObject;
  defaults: Record<string, unknown>;
}

/** Display order of categories in the example gallery. */
export const exampleCategoryOrder: ExampleCategory[] = [
  "Gesundheit & Arbeitsschutz",
  "Versicherung & Service",
  "Logistik & Transport",
  "Vertrieb & Konfiguration",
  "Anträge & Prozesse",
  "Stammdaten",
];

function manifest(
  id: ExampleId,
  meta: ExampleMetaSource,
  schema: JsonSchemaObject,
  uiSchema: UiSchemaObject,
  defaults: Record<string, unknown>,
): ExampleManifest {
  return {
    id,
    label: meta.label,
    tagline: meta.tagline,
    description: meta.description,
    category: meta.category,
    visibility: meta.visibility,
    schema,
    uiSchema,
    defaults,
  };
}

export const exampleManifests: ExampleManifest[] = [
  manifest(
    "occupational-health-g37",
    occupationalHealthG37Meta as ExampleMetaSource,
    occupationalHealthG37Schema as unknown as JsonSchemaObject,
    occupationalHealthG37Ui as unknown as UiSchemaObject,
    occupationalHealthG37Defaults,
  ),
  manifest(
    "insurance-claim",
    insuranceClaimMeta as ExampleMetaSource,
    insuranceClaimSchema as unknown as JsonSchemaObject,
    insuranceClaimUi as unknown as UiSchemaObject,
    insuranceClaimDefaults,
  ),
  manifest(
    "logistics-freight-order",
    logisticsFreightOrderMeta as ExampleMetaSource,
    logisticsFreightOrderSchema as unknown as JsonSchemaObject,
    logisticsFreightOrderUi as unknown as UiSchemaObject,
    logisticsFreightOrderDefaults,
  ),
  manifest(
    "construction-project-application",
    constructionProjectApplicationMeta as ExampleMetaSource,
    constructionProjectApplicationSchema as unknown as JsonSchemaObject,
    constructionProjectApplicationUi as unknown as UiSchemaObject,
    constructionProjectApplicationDefaults,
  ),
  manifest(
    "car-configurator",
    carConfiguratorMeta as ExampleMetaSource,
    carConfiguratorSchema as unknown as JsonSchemaObject,
    carConfiguratorUi as unknown as UiSchemaObject,
    carConfiguratorDefaults,
  ),
  manifest(
    "computed-status-qa",
    computedStatusQaMeta as ExampleMetaSource,
    computedStatusQaSchema as unknown as JsonSchemaObject,
    computedStatusQaUi as unknown as UiSchemaObject,
    computedStatusQaDefaults,
  ),
  manifest(
    "computed-cost-qa",
    computedCostQaMeta as ExampleMetaSource,
    computedCostQaSchema as unknown as JsonSchemaObject,
    computedCostQaUi as unknown as UiSchemaObject,
    computedCostQaDefaults,
  ),
  manifest(
    "person-with-defs",
    personWithDefsMeta as ExampleMetaSource,
    personWithDefsSchema as unknown as JsonSchemaObject,
    personWithDefsUi as unknown as UiSchemaObject,
    personWithDefsDefaults,
  ),
  manifest(
    "field-extensions-qa",
    fieldExtensionsQaMeta as ExampleMetaSource,
    fieldExtensionsQaSchema as unknown as JsonSchemaObject,
    fieldExtensionsQaUi as unknown as UiSchemaObject,
    fieldExtensionsQaDefaults,
  ),
  manifest(
    "person-one-of",
    personOneOfMeta as ExampleMetaSource,
    personOneOfSchema as unknown as JsonSchemaObject,
    personOneOfUi as unknown as UiSchemaObject,
    personOneOfDefaults,
  ),
  manifest(
    "simple-composition",
    simpleCompositionMeta as ExampleMetaSource,
    simpleCompositionSchema as unknown as JsonSchemaObject,
    simpleCompositionUi as unknown as UiSchemaObject,
    simpleCompositionDefaults,
  ),
  manifest(
    "array-list-qa",
    arrayListQaMeta as ExampleMetaSource,
    arrayListQaSchema as unknown as JsonSchemaObject,
    arrayListQaUi as unknown as UiSchemaObject,
    arrayListQaDefaults,
  ),
  manifest(
    "geometry-qa",
    geometryQaMeta as ExampleMetaSource,
    geometryQaSchema as unknown as JsonSchemaObject,
    geometryQaUi as unknown as UiSchemaObject,
    geometryQaDefaults,
  ),
];

export const exampleCatalog: Record<ExampleId, ExampleManifest> = Object.fromEntries(
  exampleManifests.map((entry) => [entry.id, entry]),
) as Record<ExampleId, ExampleManifest>;

export const publicExampleManifests: ExampleManifest[] = exampleManifests.filter(
  (entry) => entry.visibility === "public",
);

export const examplesByCategory: Record<ExampleCategory, ExampleManifest[]> =
  exampleCategoryOrder.reduce(
    (acc, category) => {
      acc[category] = publicExampleManifests.filter((entry) => entry.category === category);
      return acc;
    },
    {} as Record<ExampleCategory, ExampleManifest[]>,
  );

export const defaultExampleId: ExampleId = "occupational-health-g37";
