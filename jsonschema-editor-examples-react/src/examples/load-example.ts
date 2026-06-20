import { documentFromJSONWithExtensions } from "@jsonschema-editor/json-schema-extensions";
import { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import type { ExampleManifest } from "./catalog.js";

export function loadExampleFromJson(manifest: ExampleManifest) {
  return {
    schema: documentFromJSONWithExtensions(manifest.schema),
    uiSchema: UiSchema.fromJSON(manifest.uiSchema),
    defaults: structuredClone(manifest.defaults),
  };
}
