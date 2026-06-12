import { describe, expect, it } from "vitest";
import type { JsonSchemaObject } from "@jsonschema-editor/json-schema";
import { ObjectSchema } from "@jsonschema-editor/json-schema";
import { FormDefinition } from "./form-definition.js";

describe("FormDefinition", () => {
  it("preserves $defs when loading combined document", () => {
    const json: JsonSchemaObject = {
      type: "object",
      properties: {
        item: { $ref: "#/$defs/Item" },
      },
      $defs: {
        Item: {
          type: "object",
          properties: { label: { type: "string" } },
        },
      },
    };

    const form = FormDefinition.fromJSON(json);
    expect(form.schema.listDefNames()).toEqual(["Item"]);
    expect(form.schema.getDef("Item")).toBeInstanceOf(ObjectSchema);
    expect(form.toJSON().schema.$defs?.Item).toBeDefined();
  });
});
