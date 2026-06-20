import {
  registerReactExtension,
  globalSchemaAttributeControlRegistry,
} from "@jsonschema-editor/react";
import { GEOMETRY_ATTRIBUTE, COMPUTED_ATTRIBUTE, FILE_ATTRIBUTE } from "@jsonschema-editor/json-schema-extensions";
import { formatFieldsExtension } from "./format-fields-extension.js";
import { geometryExtension } from "./geometry-extension.js";
import { valuesSourceExtension } from "./values-source-extension.js";
import { computedExtension } from "./computed-extension.js";
import { fileExtension } from "./file-extension.js";
import { GeometryAttributeControl } from "./components/GeometryAttributeControl.js";
import { ComputedAttributeControl } from "./components/ComputedAttributeControl.js";
import { FileAttributeControl } from "./components/FileAttributeControl.js";
import "./file-field.css";
import "./geometry-field.css";

export function registerDefaultReactExtensions(): void {
  globalSchemaAttributeControlRegistry.registerName(
    GEOMETRY_ATTRIBUTE,
    GeometryAttributeControl,
    50,
    "react-ext-geometry-attr",
  );
  globalSchemaAttributeControlRegistry.registerName(
    COMPUTED_ATTRIBUTE,
    ComputedAttributeControl,
    50,
    "react-ext-computed-attr",
  );
  globalSchemaAttributeControlRegistry.registerName(
    FILE_ATTRIBUTE,
    FileAttributeControl,
    50,
    "react-ext-file-attr",
  );
  registerReactExtension(formatFieldsExtension);
  registerReactExtension(valuesSourceExtension);
  registerReactExtension(geometryExtension);
  registerReactExtension(computedExtension);
  registerReactExtension(fileExtension);
}

export { formatFieldsExtension, ExtendedFormatFormField } from "./format-fields-extension.js";
export { valuesSourceExtension, ValuesSourceFormField } from "./values-source-extension.js";
export { geometryExtension, GeometryCollectionFormField } from "./geometry-extension.js";
export { computedExtension, ComputedFormField } from "./computed-extension.js";
export { fileExtension, FileFieldFormField } from "./file-extension.js";
export {
  FileFieldProvider,
  useFileFieldProvider,
  FILE_FIELD_PROVIDER_KEY,
} from "./file-field-provider.js";
export { createInMemoryFileFieldProvider } from "./in-memory-file-field-provider.js";
export type { InMemoryFileFieldProvider } from "./in-memory-file-field-provider.js";
