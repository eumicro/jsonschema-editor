import { describe, expect, it } from "vitest";
import { composeScope } from "./compose-scope.js";

describe("composeScope", () => {
  it("keeps base when relative is root", () => {
    expect(composeScope("#/properties/positionen/items/0", "#")).toBe(
      "#/properties/positionen/items/0",
    );
  });

  it("appends relative property scope under array item base", () => {
    expect(composeScope("#/properties/positionen/items/0", "#/properties/betrag")).toBe(
      "#/properties/positionen/items/0/properties/betrag",
    );
  });

  it("appends relative property under object base", () => {
    expect(composeScope("#/properties/untersuchter", "#/properties/vorname")).toBe(
      "#/properties/untersuchter/properties/vorname",
    );
  });

  it("handles root base", () => {
    expect(composeScope("#", "#/properties/name")).toBe("#/properties/name");
  });
});
