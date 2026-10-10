import {
  registerReactExtension,
  globalSchemaAttributeControlRegistry,
} from "@jsonschema-editor/react";
import {
  GEOMETRY_ATTRIBUTE,
  COMPUTED_ATTRIBUTE,
  FILE_ATTRIBUTE,
  PROGRESS_BAR_ATTRIBUTE,
  RATING_ATTRIBUTE,
  SWITCH_ATTRIBUTE,
} from "@jsonschema-editor/json-schema-extensions";
import { formatFieldsExtension } from "./format-fields-extension.js";
import { geometryExtension } from "./geometry-extension.js";
import { valuesSourceExtension } from "./values-source-extension.js";
import { computedExtension } from "./computed-extension.js";
import { fileExtension } from "./file-extension.js";
import { progressBarExtension } from "./progress-bar-extension.js";
import { ratingExtension } from "./rating-extension.js";
import { switchExtension } from "./switch-extension.js";
import { GeometryAttributeControl } from "./components/GeometryAttributeControl.js";
import { ComputedAttributeControl } from "./components/ComputedAttributeControl.js";
import { FileAttributeControl } from "./components/FileAttributeControl.js";
import { ProgressBarAttributeControl } from "./components/ProgressBarAttributeControl.js";
import { RatingAttributeControl } from "./components/RatingAttributeControl.js";
import { SwitchAttributeControl } from "./components/SwitchAttributeControl.js";
import "./file-field.css";
import "./geometry-field.css";
import "./date-today-field.css";
import "./progress-bar-field.css";
import "./rating-field.css";
import "./switch-field.css";

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
  globalSchemaAttributeControlRegistry.registerName(
    PROGRESS_BAR_ATTRIBUTE,
    ProgressBarAttributeControl,
    50,
    "react-ext-progress-bar-attr",
  );
  globalSchemaAttributeControlRegistry.registerName(
    RATING_ATTRIBUTE,
    RatingAttributeControl,
    50,
    "react-ext-rating-attr",
  );
  globalSchemaAttributeControlRegistry.registerName(
    SWITCH_ATTRIBUTE,
    SwitchAttributeControl,
    50,
    "react-ext-switch-attr",
  );
  registerReactExtension(formatFieldsExtension);
  registerReactExtension(valuesSourceExtension);
  registerReactExtension(geometryExtension);
  registerReactExtension(computedExtension);
  registerReactExtension(fileExtension);
  registerReactExtension(progressBarExtension);
  registerReactExtension(ratingExtension);
  registerReactExtension(switchExtension);
}

export { formatFieldsExtension, ExtendedFormatFormField, DateTodayFormField } from "./format-fields-extension.js";
export { valuesSourceExtension, ValuesSourceFormField } from "./values-source-extension.js";
export { geometryExtension, GeometryCollectionFormField } from "./geometry-extension.js";
export { computedExtension, ComputedFormField } from "./computed-extension.js";
export { fileExtension, FileFieldFormField } from "./file-extension.js";
export { progressBarExtension, ProgressBarFormField } from "./progress-bar-extension.js";
export { ProgressBarAttributeControl } from "./components/ProgressBarAttributeControl.js";
export { ratingExtension, RatingFormField } from "./rating-extension.js";
export { RatingAttributeControl } from "./components/RatingAttributeControl.js";
export { switchExtension, SwitchFormField } from "./switch-extension.js";
export { SwitchAttributeControl } from "./components/SwitchAttributeControl.js";
export {
  FileFieldProvider,
  useFileFieldProvider,
  FILE_FIELD_PROVIDER_KEY,
} from "./file-field-provider.js";
export { createInMemoryFileFieldProvider } from "./in-memory-file-field-provider.js";
export type { InMemoryFileFieldProvider } from "./in-memory-file-field-provider.js";
