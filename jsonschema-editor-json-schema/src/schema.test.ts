import { describe, expect, it } from "vitest";
import type { JsonSchemaObject } from "./types.js";
import {
  ArraySchema,
  BooleanSchema,
  CompositionSchema,
  JsonSchemaAttributeRegistry,
  ObjectSchema,
  NumberSchema,
  StringSchema,
  UntypedSchema,
  schemaFromJSON,
} from "./index.js";

describe("JsonSchemaAttributeRegistry", () => {
  it("roundtrips custom attributes", () => {
    const registry = new JsonSchemaAttributeRegistry();
    registry.register({
      name: "x-priority",
      defaultValue: "normal",
    });

    const original = new StringSchema(registry);
    original.title = "Name";
    original.setCustomAttribute("x-priority", "high");

    const restored = schemaFromJSON(original.toJSON(), registry);
    expect(restored.getCustomAttribute("x-priority")).toBe("high");
  });
});

describe("SchemaNode", () => {
  it("roundtrips object schema", () => {
    const original = new ObjectSchema();
    original.title = "Person";
    original.setProperty("name", new StringSchema(), true);
    original.setProperty("active", new BooleanSchema());

    const restored = schemaFromJSON(original.toJSON());
    expect(restored.kind).toBe("object");
    expect(restored.toJSON()).toEqual(original.toJSON());
  });

  it("supports composition branch manipulation", () => {
    const comp = new CompositionSchema();
    const first = new ObjectSchema();
    first.title = "A";
    const second = new ObjectSchema();
    second.title = "B";
    comp.addBranch("oneOf", first);
    comp.addBranch("oneOf", second);

    comp.removeBranch("oneOf", 0);
    expect(comp.oneOf).toHaveLength(1);
    expect(comp.oneOf[0].title).toBe("B");

    const replacement = new StringSchema();
    replacement.title = "C";
    comp.setBranch("oneOf", 0, replacement);
    expect(comp.oneOf[0].title).toBe("C");
  });

  it("roundtrips prefixItems tuple", () => {
    const json: JsonSchemaObject = {
      type: "array",
      prefixItems: [{ type: "string" }, { type: "integer" }],
    };

    const node = schemaFromJSON(json);
    expect(node).toBeInstanceOf(ArraySchema);
    const array = node as ArraySchema;
    expect(array.itemsMode).toBe("tuple");
    expect(array.prefixItems).toHaveLength(2);
    expect(node.toJSON()).toEqual(json);
  });

  it("roundtrips legacy items tuple array", () => {
    const json: JsonSchemaObject = {
      type: "array",
      items: [{ type: "boolean" }, { type: "null" }],
    };

    const node = schemaFromJSON(json);
    const array = node as ArraySchema;
    expect(array.tupleKeyword).toBe("items");
    expect(node.toJSON()).toEqual(json);
  });

  it("parses mixed composition operators", () => {
    const json: JsonSchemaObject = {
      allOf: [{ type: "object", properties: { a: { type: "string" } } }],
      oneOf: [{ type: "object", properties: { b: { type: "number" } } }],
    };

    const node = schemaFromJSON(json);
    expect(node).toBeInstanceOf(CompositionSchema);
    const comp = node as CompositionSchema;
    expect(comp.activeOperators).toEqual(["allOf", "oneOf"]);
    expect(comp.allOf).toHaveLength(1);
    expect(comp.oneOf).toHaveLength(1);
    expect(node.toJSON()).toEqual(json);
  });

  it("parses composition schema", () => {
    const json: JsonSchemaObject = {
      oneOf: [
        { type: "object", properties: { kind: { type: "string", const: "a" } } },
        { type: "object", properties: { kind: { type: "string", const: "b" } } },
      ],
    };

    const node = schemaFromJSON(json);
    expect(node).toBeInstanceOf(CompositionSchema);
    expect((node as CompositionSchema).compositionType).toBe("oneOf");
    expect((node as CompositionSchema).branches).toHaveLength(2);
  });

  it("roundtrips nullable type array", () => {
    const json: JsonSchemaObject = {
      type: ["string", "null"],
      title: "Optional Name",
    };

    const node = schemaFromJSON(json);
    expect(node).toBeInstanceOf(StringSchema);
    expect(node.toJSON()).toEqual(json);
  });

  it("parses schema without type as untyped", () => {
    const json: JsonSchemaObject = {
      title: "Anything",
      description: "Accepts any instance",
    };

    const node = schemaFromJSON(json);
    expect(node).toBeInstanceOf(UntypedSchema);
    expect(node.toJSON()).toEqual(json);
  });

  it("resolves property scope polymorphically", () => {
    const root = new ObjectSchema();
    const name = new StringSchema();
    name.title = "Name";
    root.setProperty("name", name, true);

    const resolved = root.resolveAtScope("#/properties/name");
    expect(resolved?.title).toBe("Name");
  });

  it("supports homogeneous array model operations", () => {
    const position = new ObjectSchema();
    position.setProperty("bezeichnung", new StringSchema());
    position.setProperty("betrag", new NumberSchema());

    const list = new ArraySchema();
    list.setItems(position);
    list.minItems = 1;
    list.maxItems = 5;

    expect(list.supportsDynamicItems()).toBe(true);
    expect(list.canAddItem(0)).toBe(true);
    expect(list.canRemoveItem(0)).toBe(false);
    expect(list.canAddItem(5)).toBe(false);
    expect(list.createDefaultItemValue()).toEqual({ bezeichnung: "", betrag: 0 });
    expect(list.createDefaultValue()).toHaveLength(1);
    expect(list.resolvePath(["0"])?.nodeKind).toBe("object");
    expect(list.resolvePath(["0", "betrag"])?.nodeKind).toBe("number");
    expect(list.resolveAtScope("#/items/0/properties/betrag")?.nodeKind).toBe("number");
  });

  it("roundtrips homogeneous array schema", () => {
    const json: JsonSchemaObject = {
      type: "array",
      minItems: 1,
      items: {
        type: "object",
        properties: {
          bezeichnung: { type: "string" },
          betrag: { type: "number" },
        },
      },
    };

    const node = schemaFromJSON(json);
    expect(node).toBeInstanceOf(ArraySchema);
    const array = node as ArraySchema;
    expect(array.itemsMode).toBe("homogeneous");
    expect(array.minItems).toBe(1);
    expect(node.toJSON()).toEqual(json);
  });

  it("roundtrips if/then/else on object schemas", () => {
    const json = {
      type: "object",
      properties: {
        sehhilfeVorhanden: { type: "boolean" },
        sehhilfeArt: { type: "string", enum: ["Brille", "Kontaktlinsen"] },
      },
      if: {
        properties: { sehhilfeVorhanden: { const: true } },
        required: ["sehhilfeVorhanden"],
      },
      then: {
        required: ["sehhilfeArt"],
      },
    };

    const restored = schemaFromJSON(json) as ObjectSchema;
    expect(restored.toJSON()).toMatchObject({
      if: json.if,
      then: json.then,
    });
  });
});
