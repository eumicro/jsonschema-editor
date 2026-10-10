import { registerVueExtension, globalSchemaAttributeControlRegistry } from "@jsonschema-editor/vue";
import { formatFieldsExtension } from "./format-fields-extension.js";
import { geometryExtension } from "./geometry-extension.js";
import { valuesSourceExtension } from "./values-source-extension.js";
import { computedExtension } from "./computed-extension.js";
import { fileExtension } from "./file-extension.js";
import { progressBarExtension } from "./progress-bar-extension.js";
import { ratingExtension } from "./rating-extension.js";
import { switchExtension } from "./switch-extension.js";
import GeometryAttributeControl from "./components/GeometryAttributeControl.vue";
import ComputedAttributeControl from "./components/ComputedAttributeControl.vue";
import FileAttributeControl from "./components/FileAttributeControl.vue";
import ProgressBarAttributeControl from "./components/ProgressBarAttributeControl.vue";
import RatingAttributeControl from "./components/RatingAttributeControl.vue";
import SwitchAttributeControl from "./components/SwitchAttributeControl.vue";
import {
  GEOMETRY_ATTRIBUTE,
  COMPUTED_ATTRIBUTE,
  FILE_ATTRIBUTE,
  PROGRESS_BAR_ATTRIBUTE,
  RATING_ATTRIBUTE,
  SWITCH_ATTRIBUTE,
} from "@jsonschema-editor/json-schema-extensions";
import "./file-field.css";
import "./date-today-field.css";
import "./progress-bar-field.css";
import "./rating-field.css";

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
  globalSchemaAttributeControlRegistry.registerName(
    PROGRESS_BAR_ATTRIBUTE,
    ProgressBarAttributeControl,
    50,
    "vue-ext-progress-bar-attr",
  );
  globalSchemaAttributeControlRegistry.registerName(
    RATING_ATTRIBUTE,
    RatingAttributeControl,
    50,
    "vue-ext-rating-attr",
  );
  globalSchemaAttributeControlRegistry.registerName(
    SWITCH_ATTRIBUTE,
    SwitchAttributeControl,
    50,
    "vue-ext-switch-attr",
  );
  registerVueExtension(formatFieldsExtension);
  registerVueExtension(valuesSourceExtension);
  registerVueExtension(geometryExtension);
  registerVueExtension(computedExtension);
  registerVueExtension(fileExtension);
  registerVueExtension(progressBarExtension);
  registerVueExtension(ratingExtension);
  registerVueExtension(switchExtension);
}

export { formatFieldsExtension, ExtendedFormatFormField, DateTodayFormField } from "./format-fields-extension.js";
export { valuesSourceExtension, ValuesSourceFormField } from "./values-source-extension.js";
export { geometryExtension, GeometryCollectionFormField } from "./geometry-extension.js";
export { computedExtension, ComputedFormField } from "./computed-extension.js";
export { fileExtension, FileFieldFormField } from "./file-extension.js";
export { progressBarExtension, ProgressBarFormField } from "./progress-bar-extension.js";
export { default as ProgressBarAttributeControl } from "./components/ProgressBarAttributeControl.vue";
export { ratingExtension, RatingFormField } from "./rating-extension.js";
export { default as RatingAttributeControl } from "./components/RatingAttributeControl.vue";
export { switchExtension, SwitchFormField } from "./switch-extension.js";
export { default as SwitchAttributeControl } from "./components/SwitchAttributeControl.vue";
export {
  provideFileFieldProvider,
  useFileFieldProvider,
  FILE_FIELD_PROVIDER_KEY,
} from "./file-field-provider.js";
export { createInMemoryFileFieldProvider } from "./in-memory-file-field-provider.js";
export type { InMemoryFileFieldProvider } from "./in-memory-file-field-provider.js";

