import { ArraySchema, ObjectSchema } from "@jsonschema-editor/json-schema";
import {
  createMultipleFileSchema,
  createSingleFileSchema,
  FILE_ATTRIBUTE,
  readFileConfig,
} from "@jsonschema-editor/json-schema-extensions";
import { matchCustomAttribute, type JseVueExtension } from "@jsonschema-editor/vue";
import FileFieldFormField from "./components/FileFieldFormField.vue";

/** File upload field with pluggable storage via FileFieldProvider. */
export const fileExtension: JseVueExtension = {
  id: "jsonschema-editor-file",
  formFields: [
    {
      id: "vue-ext-file",
      priority: 32,
      match: matchCustomAttribute(FILE_ATTRIBUTE),
      component: FileFieldFormField,
    },
  ],
  schemaTypes: [
    {
      id: "file",
      label: "file",
      create: () => createSingleFileSchema({ accept: ["image/*"] }),
      match: (node) =>
        node instanceof ObjectSchema &&
        readFileConfig(node) !== undefined &&
        !normalizeMultiple(node),
    },
    {
      id: "file-list",
      label: "file-list",
      create: () => createMultipleFileSchema({ accept: ["image/*"], maxFiles: 10 }),
      match: (node) =>
        (node instanceof ArraySchema && readFileConfig(node) !== undefined) ||
        (node instanceof ObjectSchema &&
          readFileConfig(node) !== undefined &&
          normalizeMultiple(node)),
    },
  ],
};

function normalizeMultiple(node: ObjectSchema): boolean {
  return readFileConfig(node)?.multiple === true;
}

export { FileFieldFormField };
