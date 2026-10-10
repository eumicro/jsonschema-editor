import { ObjectSchema } from "@jsonschema-editor/json-schema";
import {
  createRelationReferenceSchema,
  readRelationConfig,
  RELATION_REFERENCE_ATTRIBUTE,
  RELATION_SNAPSHOT_ATTRIBUTE,
} from "@jsonschema-editor/json-schema-extensions";
import { matchCustomAttribute, type JseVueExtension } from "@jsonschema-editor/vue";
import RelationFieldFormField from "./components/RelationFieldFormField.vue";

/** Entity reference / snapshot fields backed by a host RelationFieldProvider. */
export const relationExtension: JseVueExtension = {
  id: "jsonschema-editor-relation",
  formFields: [
    {
      id: "vue-ext-relation-reference",
      priority: 30,
      match: matchCustomAttribute(RELATION_REFERENCE_ATTRIBUTE),
      component: RelationFieldFormField,
    },
    {
      id: "vue-ext-relation-snapshot",
      priority: 30,
      match: matchCustomAttribute(RELATION_SNAPSHOT_ATTRIBUTE),
      component: RelationFieldFormField,
    },
  ],
  schemaTypes: [
    {
      id: "relation-reference",
      label: "relation-reference",
      create: () => createRelationReferenceSchema({ targets: [] }),
      match: (node) =>
        node instanceof ObjectSchema && readRelationConfig(node) !== undefined,
    },
  ],
};

export { RelationFieldFormField };
