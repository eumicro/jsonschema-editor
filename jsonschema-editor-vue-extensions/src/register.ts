import { registerVueExtension, globalSchemaAttributeControlRegistry } from "@jsonschema-editor/vue";
import { formatFieldsExtension } from "./format-fields-extension.js";
import { geometryExtension } from "./geometry-extension.js";
import { valuesSourceExtension } from "./values-source-extension.js";
import { computedExtension } from "./computed-extension.js";
import GeometryAttributeControl from "./components/GeometryAttributeControl.vue";
import ComputedAttributeControl from "./components/ComputedAttributeControl.vue";
import { GEOMETRY_ATTRIBUTE, COMPUTED_ATTRIBUTE } from "@jsonschema-editor/json-schema-extensions";

export function registerDefaultVueExtensions(): void {
  globalSchemaAttributeControlRegistry.registerName(
    GEOMETRY_ATTRIBUTE,
    GeometryAttributeControl,
    50,
    "vue-ext-geometry-attr",
  );
  globalSchemaAttributeControlRegistry.registerName(
    COMPUTED_ATTRIBUTE,
    ComputedAttributeControl,
    50,
    "vue-ext-computed-attr",
  );
  registerVueExtension(formatFieldsExtension);
  registerVueExtension(valuesSourceExtension);
  registerVueExtension(geometryExtension);
  registerVueExtension(computedExtension);
}

export { formatFieldsExtension, ExtendedFormatFormField } from "./format-fields-extension.js";
export { valuesSourceExtension, ValuesSourceFormField } from "./values-source-extension.js";
export { geometryExtension, GeometryCollectionFormField } from "./geometry-extension.js";
export { computedExtension, ComputedFormField } from "./computed-extension.js";

