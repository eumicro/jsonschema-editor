import { describe, expect, it } from "vitest";
import {
  deriveUiI18nPrefix,
  resolveUiI18nString,
  slugifySchemaTitle,
  uiI18nMessageKey,
} from "./i18n-label.js";

describe("resolveUiI18nString", () => {
  it("builds JSON Forms message keys", () => {
    expect(uiI18nMessageKey("contact.name", "label")).toBe("contact.name.label");
    expect(uiI18nMessageKey("intro", "text")).toBe("intro.text");
    expect(uiI18nMessageKey("contact.email", "description")).toBe(
      "contact.email.description",
    );
  });

  it("resolves description translations", () => {
    const lookup = (key: string) =>
      key === "contact.email.description" ? "Read-only CRM email" : undefined;
    expect(
      resolveUiI18nString(
        {
          i18n: "contact.email",
          defaultMessage: "From CRM",
          suffix: "description",
        },
        lookup,
      ),
    ).toBe("Read-only CRM email");
  });

  it("prefers translated i18n.label over defaultMessage", () => {
    const lookup = (key: string) =>
      key === "contact.name.label" ? "Name (DE)" : undefined;
    expect(
      resolveUiI18nString(
        { i18n: "contact.name", defaultMessage: "Name", suffix: "label" },
        lookup,
      ),
    ).toBe("Name (DE)");
  });

  it("falls back to defaultMessage when translation missing", () => {
    expect(
      resolveUiI18nString(
        { i18n: "contact.name", defaultMessage: "Name", suffix: "label" },
        () => undefined,
      ),
    ).toBe("Name");
  });

  it("uses defaultMessage as key when no i18n prefix (JSON Forms group rule)", () => {
    const lookup = (key: string) => (key === "labelAddress" ? "Adresse" : undefined);
    expect(
      resolveUiI18nString({ defaultMessage: "labelAddress", suffix: "label" }, lookup),
    ).toBe("Adresse");
  });
});

describe("slugifySchemaTitle", () => {
  it("slugifies titles with diacritics and spaces", () => {
    expect(slugifySchemaTitle("Kundenkontakt")).toBe("kundenkontakt");
    expect(slugifySchemaTitle("G37 Bildschirm-Vorsorge")).toBe("g37-bildschirm-vorsorge");
  });

  it("falls back for empty titles", () => {
    expect(slugifySchemaTitle(undefined)).toBe("schema");
    expect(slugifySchemaTitle("   ")).toBe("schema");
  });
});

describe("deriveUiI18nPrefix", () => {
  it("uses scope path for controls", () => {
    expect(
      deriveUiI18nPrefix(
        "kundenkontakt",
        { elementKind: "Control", scope: "#/properties/address/properties/city" },
        [0, 5],
      ),
    ).toBe("kundenkontakt.address.city");
  });

  it("uses ui path for non-controls", () => {
    expect(
      deriveUiI18nPrefix("kundenkontakt", { elementKind: "Category" }, [0]),
    ).toBe("kundenkontakt.ui.0");
  });

  it("uses ui.root for empty path without scope", () => {
    expect(deriveUiI18nPrefix("schema", { elementKind: "VerticalLayout" }, [])).toBe(
      "schema.ui.root",
    );
  });
});
