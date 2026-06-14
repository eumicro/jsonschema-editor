import { registerVueExtension, globalSchemaAttributeControlRegistry } from "@jsonschema-editor/vue";
import { formatFieldsExtension } from "./format-fields-extension.js";
import { geometryExtension } from "./geometry-extension.js";
import { valuesSourceExtension } from "./values-source-extension.js";
import { computedExtension } from "./computed-extension.js";
import { fileExtension } from "./file-extension.js";
import GeometryAttributeControl from "./components/GeometryAttributeControl.vue";
import ComputedAttributeControl from "./components/ComputedAttributeControl.vue";
import FileAttributeControl from "./components/FileAttributeControl.vue";
import { GEOMETRY_ATTRIBUTE, COMPUTED_ATTRIBUTE, FILE_ATTRIBUTE } from "@jsonschema-editor/json-schema-extensions";
import "./file-field.css";

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
  globalSchemaAttributeControlRegistry.registerName(
    FILE_ATTRIBUTE,
    FileAttributeControl,
    50,
    "vue-ext-file-attr",
  );
  registerVueExtension(formatFieldsExtension);
  registerVueExtension(valuesSourceExtension);
  registerVueExtension(geometryExtension);
  registerVueExtension(computedExtension);
  registerVueExtension(fileExtension);
}

export { formatFieldsExtension, ExtendedFormatFormField } from "./format-fields-extension.js";
export { valuesSourceExtension, ValuesSourceFormField } from "./values-source-extension.js";
export { geometryExtension, GeometryCollectionFormField } from "./geometry-extension.js";
export { computedExtension, ComputedFormField } from "./computed-extension.js";
export { fileExtension, FileFieldFormField } from "./file-extension.js";
export {
  provideFileFieldProvider,
  useFileFieldProvider,
  FILE_FIELD_PROVIDER_KEY,
} from "./file-field-provider.js";
export { createInMemoryFileFieldProvider } from "./in-memory-file-field-provider.js";
export type { InMemoryFileFieldProvider } from "./in-memory-file-field-provider.js";

