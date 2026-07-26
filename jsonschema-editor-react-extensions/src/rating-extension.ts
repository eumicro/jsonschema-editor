import { NumberSchema } from "@jsonschema-editor/json-schema";
import {
  createRatingSchema,
  RATING_ATTRIBUTE,
  readRatingConfig,
} from "@jsonschema-editor/json-schema-extensions";
import { matchCustomAttribute, type JseReactExtension } from "@jsonschema-editor/react";
import { RatingFormField } from "./components/RatingFormField.js";

/** Numeric rating field rendered as selectable colored symbols. */
export const ratingExtension: JseReactExtension = {
  id: "jsonschema-editor-rating",
  formFields: [
    {
      id: "react-ext-rating",
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
