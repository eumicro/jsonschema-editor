import { describe, expect, it } from "vitest";
import { SchemaDocument } from "@jsonschema-editor/json-schema";
import { collectCelDataPathIndex } from "./cel-data-paths.js";

describe("collectCelDataPathIndex", () => {
  it("collects object and array item paths from the root schema", () => {
    const document = SchemaDocument.fromJSON({
      type: "object",
      properties: {
        gesamtsumme: { type: "number" },
        positionen: {
          type: "array",
          items: {
            type: "object",
            properties: {
              betrag: { type: "number" },
              menge: { type: "integer" },
            },
          },
        },
        kunde: {
          type: "object",
          properties: {
            name: { type: "string" },
          },
        },
      },
    });

    const index = collectCelDataPathIndex(document);

    expect(index.paths).toEqual(
      expect.arrayContaining(["data.gesamtsumme", "data.positionen", "data.kunde", "data.kunde.name"]),
    );
    expect(index.childrenOf.get("data")).toEqual(
      expect.arrayContaining(["gesamtsumme", "positionen", "kunde"]),
    );
    expect(index.childrenOf.get("data.kunde")).toEqual(["name"]);
    expect(index.arrayItemProps.get("data.positionen")).toEqual(["betrag", "menge"]);
    expect(index.itemRelativePaths).toEqual(["betrag", "menge"]);
  });

  it("resolves $ref definitions when walking paths", () => {
    const document = SchemaDocument.fromJSON({
      type: "object",
      properties: {
        person: { $ref: "#/$defs/Person" },
      },
      $defs: {
        Person: {
          type: "object",
          properties: {
            vorname: { type: "string" },
          },
        },
      },
    });

    const index = collectCelDataPathIndex(document);
    expect(index.paths).toEqual(
      expect.arrayContaining(["data.person", "data.person.vorname"]),
    );
    expect(index.childrenOf.get("data.person")).toEqual(["vorname"]);
  });
});
