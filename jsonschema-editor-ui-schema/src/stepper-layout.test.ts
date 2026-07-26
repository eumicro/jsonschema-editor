import { describe, expect, it } from "vitest";
import {
  abbreviateStepLabel,
  resolveStepIndicatorLabel,
} from "./stepper-layout.js";

describe("stepper layout", () => {
  it("abbreviates long labels", () => {
    expect(abbreviateStepLabel("Kontaktdaten")).toBe("Kon…");
    expect(abbreviateStepLabel("Ort", 3)).toBe("Ort");
  });

  it("resolves indicator labels by display mode", () => {
    expect(resolveStepIndicatorLabel("full", "Adresse", false)).toBe("Adresse");
    expect(resolveStepIndicatorLabel("compact", "Adresse", false)).toBe("Adr…");
    expect(resolveStepIndicatorLabel("minimal", "Adresse", false)).toBeUndefined();
    expect(resolveStepIndicatorLabel("minimal", "Adresse", true)).toBe("Adresse");
  });
});
