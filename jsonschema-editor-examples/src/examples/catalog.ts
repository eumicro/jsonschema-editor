import type { JsonSchemaObject } from "@jsonschema-editor/json-schema";
import type { UiSchemaObject } from "@jsonschema-editor/ui-schema";

import carConfiguratorDefaults from "./data/car-configurator/defaults.json";
import carConfiguratorMeta from "./data/car-configurator/meta.json";
import carConfiguratorSchema from "./data/car-configurator/schema.json";
import carConfiguratorUi from "./data/car-configurator/ui.schema.json";
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

export type ExampleId =
  | "person-one-of"
  | "person-with-defs"
  | "simple-composition"
  | "car-configurator";

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
];

export const exampleCatalog: Record<ExampleId, ExampleManifest> = Object.fromEntries(
  exampleManifests.map((manifest) => [manifest.id, manifest]),
) as Record<ExampleId, ExampleManifest>;

export const defaultExampleId: ExampleId = "car-configurator";
