import { describe, expect, it } from "vitest";
import {
  buildArrayItemScope,
  buildPropertyScope,
  parseScope,
  scopeToPath,
} from "./scope.js";

describe("scope", () => {
  it("parses property and array item segments", () => {
    expect(parseScope("#/properties/name")).toEqual(["name"]);
    expect(scopeToPath("#/properties/positionen/items/0/properties/betrag")).toEqual([
      "positionen",
      "0",
      "betrag",
    ]);
  });

  it("builds nested scopes", () => {
    expect(buildPropertyScope("#/properties/invoice", "positionen")).toBe(
      "#/properties/invoice/properties/positionen",
    );
    expect(buildArrayItemScope("#/properties/positionen", 2)).toBe(
      "#/properties/positionen/items/2",
    );
  });
});
