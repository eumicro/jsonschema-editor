import { describe, expect, it } from "vitest";
import Ajv from "ajv";
import { ObjectSchema, schemaFromJSON } from "@jsonschema-editor/json-schema";
import {
  compileFormatValidator,
  createExtensionsRegistry,
  createFormatSchemaFragment,
  createGeometryCollectionSchema,
  createStaticValuesSourceSchema,
  createStringSchemaWithFormat,
  documentFromJSONWithExtensions,
  emailExtension,
  getFormatExtension,
  getFormatExtensionByFormat,
  phoneExtension,
  readValuesSourceConfig,
  readGeometryConfig,
  registerAjvFormats,
  schemaFromJSONWithExtensions,
  urlExtension,
  validateEmail,
  validateFormatValue,
  validateGeometryCollection,
  validatePhone,
  validateUrl,
} from "./index.js";

describe("format validators", () => {
  it.each([
    ["email", validateEmail, ["user@example.com", "a.b+c@sub.example.co.uk"], ["", "not-an-email", "@missing.local"]],
    ["url", validateUrl, ["https://example.com/path", "http://localhost:8080"], ["", "ftp://example.com", "not-a-url"]],
    [
      "phone",
      validatePhone,
      ["+491701234567", "+1 555 123 4567", "+442079460123"],
      ["", "123", "+0123456", "abc"],
    ],
  ] as const)("validates %s", (_name, validate, validSamples, invalidSamples) => {
    for (const sample of validSamples) {
      expect(validate(sample)).toBe(true);
    }
    for (const sample of invalidSamples) {
      expect(validate(sample)).toBe(false);
    }
  });
});

describe("JsonSchemaFormatExtension", () => {
  it("exposes email, url, and phone extensions", () => {
    expect(getFormatExtension("email")).toBe(emailExtension);
    expect(getFormatExtension("url")).toBe(urlExtension);
    expect(getFormatExtension("phone")).toBe(phoneExtension);
    expect(getFormatExtensionByFormat("uri")).toBe(urlExtension);
  });

  it("creates schema fragments with format keywords", () => {
    expect(createFormatSchemaFragment("email")).toMatchObject({
      type: "string",
      format: "email",
      "x-format-extension": "email",
    });
    expect(createFormatSchemaFragment("url")).toMatchObject({ format: "uri" });
    expect(createFormatSchemaFragment("phone")).toMatchObject({ format: "phone" });
  });
});

describe("StringSchema integration", () => {
  const registry = createExtensionsRegistry();

  it("applies format extension to StringSchema", () => {
    const schema = createStringSchemaWithFormat("email", registry);
    expect(schema.format).toBe("email");
    expect(schema.pattern).toBe(emailExtension.pattern);
    expect(schema.getCustomAttribute("x-format-extension")).toBe("email");
  });

  it("roundtrips x-format-extension through schemaFromJSON", () => {
    const root = new ObjectSchema();
    root.setProperty("contact", createStringSchemaWithFormat("phone", registry), true);

    const restored = schemaFromJSON(root.toJSON(), registry);
    expect(restored).toBeInstanceOf(ObjectSchema);
    const contact = (restored as ObjectSchema).getProperty("contact");
    expect(contact?.getCustomAttribute("x-format-extension")).toBe("phone");
    expect(schemaFromJSONWithExtensions(root.toJSON()).toJSON()).toEqual(root.toJSON());
  });
});

describe("ValuesSourceExtension", () => {
  const registry = createExtensionsRegistry();

  it("creates static values source schema", () => {
    const schema = createStaticValuesSourceSchema(["A", "B"], registry);
    expect(schema.enumValues).toEqual(["A", "B"]);
    expect(schema.getCustomAttribute("x-values-source")).toEqual({
      kind: "static",
      values: ["A", "B"],
    });
  });

  it("roundtrips x-values-source through documentFromJSONWithExtensions", () => {
    const json = {
      type: "object",
      properties: {
        role: {
          type: "string",
          enum: ["Admin", "User"],
          "x-values-source": { kind: "static", values: ["Admin", "User"] },
        },
      },
    };
    const document = documentFromJSONWithExtensions(json, registry);
    const role = document.root.getProperty("role");
    expect(readValuesSourceConfig(role!)).toEqual({
      kind: "static",
      values: ["Admin", "User"],
    });
  });
});

describe("GeometryExtension", () => {
  const registry = createExtensionsRegistry();

  it("creates geometry collection schema with x-geometry config", () => {
    const schema = createGeometryCollectionSchema(
      { polygon: true, point: false, line: false, maxObjects: 1 },
      registry,
    );
    expect(schema.getCustomAttribute("x-geometry")).toEqual({
      styleUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
      point: false,
      line: false,
      polygon: true,
      minObjects: 0,
      maxObjects: 1,
    });
  });

  it("roundtrips x-geometry through documentFromJSONWithExtensions", () => {
    const json = {
      type: "object",
      properties: {
        site: {
          type: "object",
          title: "Site",
          "x-geometry": {
            styleUrl: "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",
            polygon: true,
            maxObjects: 2,
          },
        },
      },
    };
    const document = documentFromJSONWithExtensions(json, registry);
    const site = document.root.getProperty("site");
    expect(readGeometryConfig(site!)).toMatchObject({ polygon: true, maxObjects: 2 });
  });

  it("validates geometry collections against allowed types and counts", () => {
    const config = { point: false, line: false, polygon: true, maxObjects: 1 };
    expect(
      validateGeometryCollection(
        {
          type: "GeometryCollection",
          geometries: [{ type: "Polygon", coordinates: [[[0, 0], [1, 0], [1, 1], [0, 0]]] }],
        },
        config,
      ),
    ).toBe(true);
    expect(
      validateGeometryCollection(
        {
          type: "GeometryCollection",
          geometries: [{ type: "Point", coordinates: [0, 0] }],
        },
        config,
      ),
    ).toBe(false);
    expect(
      validateGeometryCollection(
        { type: "GeometryCollection", geometries: [] },
        { polygon: true, minObjects: 1, maxObjects: 2 },
      ),
    ).toBe(false);
    expect(
      validateGeometryCollection(
        {
          type: "GeometryCollection",
          geometries: [
            { type: "Point", coordinates: [0, 0] },
            { type: "Point", coordinates: [1, 1] },
          ],
        },
        { point: true, exactObjects: 2 },
      ),
    ).toBe(true);
  });
});

describe("AJV integration", () => {
  it("validates format fragments with registerAjvFormats", async () => {
    const ajv = await registerAjvFormats(new Ajv({ allErrors: true, strict: false }));

    for (const id of ["email", "url", "phone"] as const) {
      const validate = compileFormatValidator(ajv, id);
      expect(validate.errors).toBeNull();
    }

    expect(compileFormatValidator(ajv, "email")("user@example.com")).toBe(true);
    expect(compileFormatValidator(ajv, "email")("invalid")).toBe(false);
    expect(compileFormatValidator(ajv, "url")("https://example.com")).toBe(true);
    expect(compileFormatValidator(ajv, "phone")("+491701234567")).toBe(true);
    expect(validateFormatValue("phone", "123")).toBe(false);
  });
});
