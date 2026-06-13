import { documentFromJSONWithExtensions } from "@jsonschema-editor/json-schema-extensions";
import { UiSchema } from "@jsonschema-editor/ui-schema/bridge";
import type { ExampleManifest } from "./catalog";

/** Lädt ein Beispiel aus dem JSON-Schema-/UI-Schema-Paar (Proof of Concept). */
export function loadExampleFromJson(manifest: ExampleManifest) {
  return {
    schema: documentFromJSONWithExtensions(manifest.schema),
    uiSchema: UiSchema.fromJSON(manifest.uiSchema),
    defaults: structuredClone(manifest.defaults),
  };
}
