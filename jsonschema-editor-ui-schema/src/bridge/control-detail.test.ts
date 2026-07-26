import { describe, expect, it } from "vitest";
import { ObjectSchema, documentFromJSON } from "@jsonschema-editor/json-schema";
import { controlSupportsDetail, resolveControlDetailSchema } from "./control-detail.js";

describe("resolveControlDetailSchema", () => {
  it("resolves array item object schema", () => {
    const doc = documentFromJSON({
      type: "object",
      properties: {
        positionen: {
          type: "array",
          items: {
            type: "object",
            properties: {
              bezeichnung: { type: "string" },
              betrag: { type: "number" },
            },
          },
        },
      },
    });

    const detail = resolveControlDetailSchema(doc, "#/properties/positionen");
    expect(detail).toBeInstanceOf(ObjectSchema);
    expect(controlSupportsDetail(doc, "#/properties/positionen")).toBe(true);
    expect((detail as ObjectSchema).getProperty("betrag")).toBeTruthy();
  });

  it("resolves $ref object and array items via $defs", () => {
    const doc = documentFromJSON({
      type: "object",
      properties: {
        untersuchter: { $ref: "#/$defs/Untersuchter" },
        zeugen: {
          type: "array",
          items: { $ref: "#/$defs/Untersuchter" },
        },
        name: { type: "string" },
      },
      $defs: {
        Untersuchter: {
          type: "object",
          properties: {
            vorname: { type: "string" },
            nachname: { type: "string" },
          },
        },
      },
    });

    const objectDetail = resolveControlDetailSchema(doc, "#/properties/untersuchter");
    expect(objectDetail).toBeInstanceOf(ObjectSchema);
    expect((objectDetail as ObjectSchema).getProperty("vorname")).toBeTruthy();

    const arrayDetail = resolveControlDetailSchema(doc, "#/properties/zeugen");
    expect(arrayDetail).toBeInstanceOf(ObjectSchema);
    expect((arrayDetail as ObjectSchema).getProperty("nachname")).toBeTruthy();

    expect(controlSupportsDetail(doc, "#/properties/name")).toBe(false);
  });
});
