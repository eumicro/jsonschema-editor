import { registerVueExtension } from "@jsonschema-editor/vue";
import { formatFieldsExtension } from "./format-fields-extension.js";
import { valuesSourceExtension } from "./values-source-extension.js";

export function registerDefaultVueExtensions(): void {
  registerVueExtension(formatFieldsExtension);
  registerVueExtension(valuesSourceExtension);
}

export { formatFieldsExtension, ExtendedFormatFormField } from "./format-fields-extension.js";
export { valuesSourceExtension, ValuesSourceFormField } from "./values-source-extension.js";

