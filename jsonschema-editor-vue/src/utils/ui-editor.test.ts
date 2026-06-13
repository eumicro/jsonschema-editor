import { describe, expect, it } from "vitest";
import { Control, Group, Step, Stepper, VerticalLayout } from "@jsonschema-editor/ui-schema";
import { canMoveUiElementTo, getUiElementAt, moveUiElementTo } from "./ui-editor.js";

describe("moveUiElementTo", () => {
  it("moves a control into a vertical layout at index 6 (G37 paths)", () => {
    const stepper = new Stepper();
    const step = new Step("Aufnahme");
    const outer = new VerticalLayout();
    outer.addChild(new Control("#/aktenzeichen", "Aktenzeichen"));
    outer.addChild(new Control("#/vorsorgeStatus", "Vorsorge-Status"));
    outer.addChild(new Control("#/untersuchungsdatum", "Untersuchungsdatum"));
    const group = new Group("Untersuchte Person");
    group.addChild(new Control("#/personalnummer", "personalnummer"));
    group.addChild(new Control("#/nachname", "nachname"));
    group.addChild(new Control("#/vorname", "vorname"));
    group.addChild(new Control("#/geburtsdatum", "geburtsdatum"));
    group.addChild(new Control("#/geschlecht", "geschlecht"));
    group.addChild(new Control("#/versichertennummer", "versichertennummer"));
    group.addChild(new VerticalLayout());
    outer.addChild(group);
    step.addChild(outer);
    stepper.addChild(step);

    const from = [0, 0, 3, 1];
    const toParent = [0, 0, 3, 6];

    expect(canMoveUiElementTo(stepper, from, toParent, 0)).toBe(true);

    const next = moveUiElementTo(stepper, from, toParent, 0);
    const layoutPath = [0, 0, 3, 5];
    expect(getUiElementAt(next, layoutPath).elements).toHaveLength(1);
    expect(getUiElementAt(next, [...layoutPath, 0])).toMatchObject({ scope: "#/nachname" });
  });
});
