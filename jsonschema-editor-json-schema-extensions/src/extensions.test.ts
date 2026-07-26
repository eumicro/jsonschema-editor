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
  isFieldReadOnly,
  isFieldHidden,
  evaluateComputedExpression,
  readComputedConfig,
  createSingleFileSchema,
  createMultipleFileSchema,
  readFileConfig,
  validateFileDescriptor,
  validateFileFieldValue,
  matchesFileAccept,
  resolveUploadMimeType,
  dateTodayExtension,
  validateDateToday,
  createProgressBarSchema,
  createRatingSchema,
  DEFAULT_PROGRESS_BAR_COLOR_HIGH,
  DEFAULT_PROGRESS_BAR_COLOR_LOW,
  DEFAULT_PROGRESS_BAR_COLOR_MID,
  mixHexColors,
  progressBarFillColor,
  progressBarRatio,
  progressBarTrackBackground,
  readProgressBarConfig,
  readRatingConfig,
  ratingLevels,
  RATING_SYMBOL_CHARS,
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
  it("exposes email, url, phone, and date-today extensions", () => {
    expect(getFormatExtension("email")).toBe(emailExtension);
    expect(getFormatExtension("url")).toBe(urlExtension);
    expect(getFormatExtension("phone")).toBe(phoneExtension);
    expect(getFormatExtension("date-today")).toBe(dateTodayExtension);
    expect(getFormatExtensionByFormat("uri")).toBe(urlExtension);
    expect(getFormatExtensionByFormat("date-today")).toBe(dateTodayExtension);
  });

  it("creates schema fragments with format keywords", () => {
    expect(createFormatSchemaFragment("email")).toMatchObject({
      type: "string",
      format: "email",
      "x-format-extension": "email",
    });
    expect(createFormatSchemaFragment("url")).toMatchObject({ format: "uri" });
    expect(createFormatSchemaFragment("phone")).toMatchObject({ format: "phone" });
    expect(createFormatSchemaFragment("date-today")).toMatchObject({
      format: "date-today",
      "x-format-extension": "date-today",
    });
    expect(createFormatSchemaFragment("date-today").pattern).toBeUndefined();
  });

  it("date-today never fails validation", () => {
    expect(validateDateToday(undefined)).toBe(true);
    expect(validateDateToday("")).toBe(true);
    expect(validateDateToday("not-a-date")).toBe(true);
    expect(validateDateToday("2026-07-26")).toBe(true);
  });
});

describe("progress-bar extension", () => {
  it("creates number schema with x-progress-bar and 0–10 range", () => {
    const schema = createProgressBarSchema({ minimum: 0, maximum: 10, step: 0.1 });
    expect(schema.minimum).toBe(0);
    expect(schema.maximum).toBe(10);
    expect(readProgressBarConfig(schema)).toEqual({ step: 0.1, colorMode: "gradient" });
  });

  it("interpolates gradient colors by value", () => {
    expect(progressBarRatio(0, 0, 10)).toBe(0);
    expect(progressBarRatio(5, 0, 10)).toBe(0.5);
    expect(progressBarRatio(10, 0, 10)).toBe(1);

    const gradient = {
      min: 0,
      max: 10,
      colorMode: "gradient" as const,
      color: "#2563eb",
      colorLow: DEFAULT_PROGRESS_BAR_COLOR_LOW,
      colorMid: DEFAULT_PROGRESS_BAR_COLOR_MID,
      colorHigh: DEFAULT_PROGRESS_BAR_COLOR_HIGH,
    };
    expect(progressBarFillColor(0, gradient)).toBe(DEFAULT_PROGRESS_BAR_COLOR_LOW);
    expect(progressBarFillColor(5, gradient)).toBe(DEFAULT_PROGRESS_BAR_COLOR_MID);
    expect(progressBarFillColor(10, gradient)).toBe(DEFAULT_PROGRESS_BAR_COLOR_HIGH);
    expect(progressBarTrackBackground(gradient)).toContain(DEFAULT_PROGRESS_BAR_COLOR_LOW);

    const solid = { ...gradient, colorMode: "solid" as const, color: "#2563eb" };
    expect(progressBarFillColor(7, solid)).toBe("#2563eb");
    expect(mixHexColors("#000000", "#ffffff", 0.5)).toBe("#808080");
  });
});

describe("rating extension", () => {
  it("stores freely chosen palette glyphs on x-rating", () => {
    const schema = createRatingSchema({
      minimum: 0,
      maximum: 5,
      symbol: "♥",
      colorMode: "solid",
      color: "#e11d48",
    });
    expect(schema.minimum).toBe(0);
    expect(schema.maximum).toBe(5);
    expect(readRatingConfig(schema)).toEqual({
      step: 1,
      symbol: "♥",
      colorMode: "solid",
      color: "#e11d48",
    });
  });

  it("resolves legacy preset ids to glyphs", () => {
    expect(RATING_SYMBOL_CHARS.heart).toBe("♥");
    const schema = createRatingSchema({ symbol: "heart" });
    expect(readRatingConfig(schema)?.symbol).toBe("♥");
  });

  it("builds discrete levels from min/max/step", () => {
    expect(ratingLevels({ min: 0, max: 5, step: 1 })).toEqual([1, 2, 3, 4, 5]);
    expect(ratingLevels({ min: 1, max: 5, step: 1 })).toEqual([1, 2, 3, 4, 5]);
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

describe("Computed extensions", () => {
  it("evaluates sum expression over form data", () => {
    const data = {
      positionen: [
        { betrag: 10 },
        { betrag: 25.5 },
        { betrag: 4.5 },
      ],
    };
    const result = evaluateComputedExpression(
      "data.positionen.map(p, double(p.betrag)).sum()",
      data,
    );
    expect(result).toEqual({ ok: true, value: 40 });
  });

  it("evaluates workflow status expression", () => {
    const result = evaluateComputedExpression(
      `!has(data.antragskopf.antragsdatum) || data.antragskopf.antragsdatum == '' ? 'NEU' :
        (!has(data.auftragsdaten.adresse) || data.auftragsdaten.adresse == '') ? 'ANTRAG_ANGELEGT' :
        (!has(data.durchfuehrung.datum) || data.durchfuehrung.datum == '') ? 'BEREIT_ZUR_DURCHFUEHRUNG' :
        (!data.abrechnung.beglichen) ? 'DURCHGEFUEHRT' : 'ERLEDIGT'`,
      {
        antragskopf: { antragsdatum: "2026-01-01" },
        auftragsdaten: { adresse: "Berlin" },
        durchfuehrung: { datum: "" },
        abrechnung: { beglichen: false },
      },
    );
    expect(result).toEqual({ ok: true, value: "BEREIT_ZUR_DURCHFUEHRUNG" });
  });

  it("roundtrips x-computed through documentFromJSONWithExtensions", () => {
    const registry = createExtensionsRegistry();
    const doc = documentFromJSONWithExtensions(
      {
        type: "object",
        properties: {
          total: {
            type: "number",
            "x-computed": { expression: "double(data.a) + double(data.b)" },
          },
        },
      },
      registry,
    );
    const total = doc.root.getProperty("total");
    expect(readComputedConfig(total)?.expression).toBe("double(data.a) + double(data.b)");
  });
});

describe("FileExtension", () => {
  const registry = createExtensionsRegistry();

  it("creates single and multiple file schemas with x-file config", () => {
    const single = createSingleFileSchema({ accept: ["image/*"] }, registry);
    expect(single.getCustomAttribute("x-file")).toMatchObject({
      multiple: false,
      accept: ["image/*"],
    });

    const multiple = createMultipleFileSchema({ maxFiles: 3 }, registry);
    expect(multiple.getCustomAttribute("x-file")).toMatchObject({
      multiple: true,
      maxFiles: 3,
    });
  });

  it("roundtrips x-file through documentFromJSONWithExtensions", () => {
    const doc = documentFromJSONWithExtensions(
      {
        type: "object",
        properties: {
          photo: {
            type: "object",
            "x-file": { multiple: false, accept: ["image/png"] },
            properties: {
              id: { type: "string" },
              name: { type: "string" },
              mimeType: { type: "string" },
              size: { type: "integer" },
            },
          },
        },
      },
      registry,
    );
    const photo = doc.root.getProperty("photo");
    expect(readFileConfig(photo!)).toMatchObject({ accept: ["image/png"] });
  });

  it("validates file descriptors and field values", () => {
    const descriptor = {
      id: "abc",
      name: "photo.png",
      mimeType: "image/png",
      size: 1200,
    };
    expect(validateFileDescriptor(descriptor)).toBe(true);
    expect(validateFileFieldValue(descriptor, { multiple: false })).toBe(true);
    expect(validateFileFieldValue([descriptor], { multiple: true, maxFiles: 2 })).toBe(true);
    expect(matchesFileAccept(descriptor, ["image/*"])).toBe(true);
    expect(matchesFileAccept(descriptor, ["application/pdf"])).toBe(false);
    expect(
      matchesFileAccept(
        { name: "photo.png", mimeType: "application/octet-stream" },
        ["image/*"],
      ),
    ).toBe(true);
    expect(resolveUploadMimeType("photo.png", "")).toBe("image/png");
  });
});

describe("Field flag extensions", () => {
  const registry = createExtensionsRegistry();

  it("registers x-read-only and x-hidden as field-scoped attributes", () => {
    expect(registry.isRegistered("x-read-only")).toBe(true);
    expect(registry.isRegistered("x-hidden")).toBe(true);
    expect(registry.listFieldScoped().map((def) => def.name)).toEqual(
      expect.arrayContaining(["x-read-only", "x-hidden"]),
    );
  });

  it("roundtrips field flags through documentFromJSONWithExtensions", () => {
    const doc = documentFromJSONWithExtensions(
      {
        type: "object",
        properties: {
          visible: { type: "string" },
          locked: { type: "string", "x-read-only": true },
          secret: { type: "string", "x-hidden": true },
        },
      },
      registry,
    );
    const locked = doc.root.getProperty("locked");
    const secret = doc.root.getProperty("secret");
    expect(isFieldReadOnly(locked)).toBe(true);
    expect(isFieldHidden(secret)).toBe(true);
    expect(isFieldReadOnly(doc.root.getProperty("visible"))).toBe(false);
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
