import { NumberSchema } from "@jsonschema-editor/json-schema";
import {
  createProgressBarSchema,
  PROGRESS_BAR_ATTRIBUTE,
  readProgressBarConfig,
} from "@jsonschema-editor/json-schema-extensions";
import { matchCustomAttribute, type JseVueExtension } from "@jsonschema-editor/vue";
import ProgressBarFormField from "./components/ProgressBarFormField.vue";

/** Numeric satisfaction / score field rendered as a colored progress bar. */
export const progressBarExtension: JseVueExtension = {
  id: "jsonschema-editor-progress-bar",
  formFields: [
    {
      id: "vue-ext-progress-bar",
      priority: 28,
      match: matchCustomAttribute(PROGRESS_BAR_ATTRIBUTE),
      component: ProgressBarFormField,
    },
  ],
  schemaTypes: [
    {
      id: "progress-bar",
      label: "progress-bar",
      matchPriority: 20,
      create: () =>
        createProgressBarSchema({
          title: "Zufriedenheit",
          minimum: 0,
          maximum: 10,
          step: 0.1,
        }),
      match: (node) => node instanceof NumberSchema && readProgressBarConfig(node) !== undefined,
    },
  ],
};

export { ProgressBarFormField };
