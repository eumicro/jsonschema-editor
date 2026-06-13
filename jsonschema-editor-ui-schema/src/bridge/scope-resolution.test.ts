import { describe, expect, it } from "vitest";
import {
  documentFromJSON,
  ObjectSchema,
  StringSchema,
} from "@jsonschema-editor/json-schema";
import { resolveSchemaAtScope } from "./scope-resolution.js";

describe("resolveSchemaAtScope", () => {
  it("follows intermediate $ref when resolving nested property scopes", () => {
    const doc = documentFromJSON({
      type: "object",
      properties: {
        untersuchter: { $ref: "#/$defs/Untersuchter" },
      },
      $defs: {
        Untersuchter: {
          type: "object",
          properties: {
            nachname: { type: "string", title: "Nachname" },
          },
        },
      },
    });

    const resolveRef = (ref: string) => doc.resolveRef(ref);
    const field = resolveSchemaAtScope(
      doc.root,
      "#/properties/untersuchter/properties/nachname",
      resolveRef,
    );

    expect(field).toBeInstanceOf(StringSchema);
    expect(field?.title).toBe("Nachname");
  });

  it("resolves $ref property to definition object schema", () => {
    const doc = documentFromJSON({
      type: "object",
      properties: {
        untersuchter: { $ref: "#/$defs/Untersuchter" },
      },
      $defs: {
        Untersuchter: {
          type: "object",
          title: "Untersuchte Person",
          properties: {
            nachname: { type: "string", title: "Nachname" },
          },
        },
      },
    });

    const node = resolveSchemaAtScope(
      doc.root,
      "#/properties/untersuchter",
      (ref) => doc.resolveRef(ref),
    );

    expect(node).toBeInstanceOf(ObjectSchema);
    expect(node?.title).toBe("Untersuchte Person");
  });

  it("resolves nested properties through oneOf with $ref branches", () => {
    const doc = documentFromJSON({
      type: "object",
      properties: {
        programm: {
          oneOf: [
            { $ref: "#/$defs/ProgrammErst" },
            { $ref: "#/$defs/ProgrammNach" },
          ],
        },
      },
      $defs: {
        ProgrammErst: {
          type: "object",
          properties: {
            art: { type: "string", const: "erst" },
            siebtest: {
              type: "object",
              title: "Siebtest",
              properties: {
                ferne: { type: "object", title: "Sehschärfe Ferne" },
              },
            },
          },
        },
        ProgrammNach: {
          type: "object",
          properties: {
            art: { type: "string", const: "nach" },
            siebtest: { type: "object", properties: { ferne: { type: "object" } } },
          },
        },
      },
    });

    const resolveRef = (ref: string) => doc.resolveRef(ref);
    const siebtest = resolveSchemaAtScope(
      doc.root,
      "#/properties/programm/properties/siebtest",
      resolveRef,
    );
    expect(siebtest?.title).toBe("Siebtest");

    const ferne = resolveSchemaAtScope(
      doc.root,
      "#/properties/programm/properties/siebtest/properties/ferne",
      resolveRef,
    );
    expect(ferne?.title).toBe("Sehschärfe Ferne");
  });
});
