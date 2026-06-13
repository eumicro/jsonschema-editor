import { registerVueExtension, globalSchemaAttributeControlRegistry } from "@jsonschema-editor/vue";
import { formatFieldsExtension } from "./format-fields-extension.js";
import { geometryExtension } from "./geometry-extension.js";
import { valuesSourceExtension } from "./values-source-extension.js";
import GeometryAttributeControl from "./components/GeometryAttributeControl.vue";
import { GEOMETRY_ATTRIBUTE } from "@jsonschema-editor/json-schema-extensions";

export function registerDefaultVueExtensions(): void {
  globalSchemaAttributeControlRegistry.registerName(
    GEOMETRY_ATTRIBUTE,
    GeometryAttributeControl,
    50,
    "vue-ext-geometry-attr",
  );
  registerVueExtension(formatFieldsExtension);
  registerVueExtension(valuesSourceExtension);
  registerVueExtension(geometryExtension);
}

export { formatFieldsExtension, ExtendedFormatFormField } from "./format-fields-extension.js";
export { valuesSourceExtension, ValuesSourceFormField } from "./values-source-extension.js";
export { geometryExtension, GeometryCollectionFormField } from "./geometry-extension.js";

