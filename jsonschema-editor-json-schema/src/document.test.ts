import { describe, expect, it } from "vitest";
import type { JsonSchemaObject } from "./types.js";
import {
  BooleanSchema,
  CompositionSchema,
  ObjectSchema,
  RefSchema,
  SchemaDocument,
  StringSchema,
  buildDefRef,
  documentFromJSON,
  parseDefRef,
  schemaFromJSON,
} from "./index.js";

describe("SchemaDocument", () => {
  it("roundtrips $defs", () => {
    const doc = new SchemaDocument(new ObjectSchema());
    doc.root.title = "Root";

    const address = new ObjectSchema();
    address.title = "Adresse";
    address.setProperty("street", new StringSchema(), true);
    doc.setDef("Address", address);

    const person = new ObjectSchema();
    person.setProperty("name", new StringSchema(), true);
    person.setProperty("address", new RefSchema(buildDefRef("Address")), true);
    doc.setDef("Person", person);

    const root = doc.root as ObjectSchema;
    root.setProperty("contact", new RefSchema(buildDefRef("Person")), true);

    const json = doc.toJSON();
    expect(json.$defs?.Address).toBeDefined();
    expect(json.$defs?.Person).toBeDefined();

    const restored = documentFromJSON(json);
    expect(restored.listDefNames()).toEqual(["Address", "Person"]);
    expect(restored.resolveRef(buildDefRef("Person"))?.title).toBeUndefined();
    expect((restored.root as ObjectSchema).getProperty("contact")).toBeInstanceOf(RefSchema);
  });

  it("parses legacy definitions key", () => {
    const json: JsonSchemaObject = {
      type: "object",
      properties: { id: { type: "string" } },
      definitions: {
        Item: { type: "object", properties: { label: { type: "string" } } },
      },
    };

    const doc = documentFromJSON(json);
    expect(doc.defsKey).toBe("definitions");
    expect(doc.getDef("Item")).toBeInstanceOf(ObjectSchema);
  });

  it("resolves ref chains", () => {
    const doc = new SchemaDocument(new ObjectSchema());
    const inner = new StringSchema();
    inner.title = "Name";
    doc.setDef("NameField", inner);
    doc.setDef("Alias", new RefSchema(buildDefRef("NameField")));

    const resolved = doc.resolveNode(new RefSchema(buildDefRef("Alias")));
    expect(resolved.title).toBe("Name");
  });

  it("parseDefRef handles encoded names", () => {
    expect(parseDefRef("#/$defs/Person")?.name).toBe("Person");
    expect(parseDefRef("#/definitions/MyType")?.defsKey).toBe("definitions");
  });
});

describe("SchemaNode with refs", () => {
  it("still parses $ref nodes via schemaFromJSON", () => {
    const node = schemaFromJSON({ $ref: "#/$defs/Person" });
    expect(node).toBeInstanceOf(RefSchema);
    expect((node as RefSchema).ref).toBe("#/$defs/Person");
  });

  it("parses oneOf with refs when loading full document", () => {
    const json: JsonSchemaObject = {
      oneOf: [{ $ref: "#/$defs/A" }, { $ref: "#/$defs/B" }],
      $defs: {
        A: { type: "object", properties: { a: { type: "string" } } },
        B: { type: "object", properties: { b: { type: "string" } } },
      },
    };

    const doc = documentFromJSON(json);
    const root = doc.root as CompositionSchema;
    expect(root.oneOf[0]).toBeInstanceOf(RefSchema);
    expect(doc.resolveRef("#/$defs/A")).toBeInstanceOf(ObjectSchema);
  });
});
