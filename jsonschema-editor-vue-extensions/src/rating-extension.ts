import { NumberSchema } from "@jsonschema-editor/json-schema";
import {
  createRatingSchema,
  RATING_ATTRIBUTE,
  readRatingConfig,
} from "@jsonschema-editor/json-schema-extensions";
import { matchCustomAttribute, type JseVueExtension } from "@jsonschema-editor/vue";
import RatingFormField from "./components/RatingFormField.vue";

/** Numeric rating field rendered as selectable colored symbols. */
export const ratingExtension: JseVueExtension = {
  id: "jsonschema-editor-rating",
  formFields: [
    {
      id: "vue-ext-rating",
      priority: 29,
      match: matchCustomAttribute(RATING_ATTRIBUTE),
      component: RatingFormField,
    },
  ],
  schemaTypes: [
    {
      id: "rating",
      label: "rating",
      matchPriority: 20,
      create: () =>
        createRatingSchema({
          title: "Bewertung",
          minimum: 0,
          maximum: 5,
          step: 1,
          symbol: "★",
        }),
      match: (node) => node instanceof NumberSchema && readRatingConfig(node) !== undefined,
    },
  ],
};

export { RatingFormField };
