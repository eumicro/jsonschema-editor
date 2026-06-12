import { describe, expect, it } from "vitest";
import type { UiSchemaObject } from "./types.js";
import {
  Categorization,
  Control,
  Group,
  HorizontalLayout,
  Label,
  Stepper,
  UiRule,
  VerticalLayout,
  uiSchemaFromJSON,
} from "./index.js";

describe("UiRule", () => {
  it("roundtrips rule on Control", () => {
    const json: UiSchemaObject = {
      type: "Control",
      scope: "#/properties/active",
      label: "Aktiv",
      rule: {
        effect: "SHOW",
        condition: {
          scope: "#/properties/enabled",
          schema: { const: true },
        },
      },
    };

    const control = uiSchemaFromJSON(json);
    expect(control).toBeInstanceOf(Control);
    expect(control.rule?.effect).toBe("SHOW");
    expect(control.toJSON()).toEqual(json);
  });
});

describe("UiLayout child API", () => {
  it("supports structural child manipulation", () => {
    const layout = new VerticalLayout();
    const first = new Label("A");
    const second = new Label("B");
    layout.addChild(first);
    layout.addChild(second);

    layout.setChild(0, new Label("C"));
    expect((layout.getChild(0) as Label).text).toBe("C");

    layout.removeChild(1);
    expect(layout.elements).toHaveLength(1);

    layout.insertChild(0, new Label("Start"));
    expect((layout.getChild(0) as Label).text).toBe("Start");

    layout.moveChild(0, 1);
    expect((layout.getChild(1) as Label).text).toBe("Start");
  });
});

describe("UiSchema roundtrip", () => {
  it("roundtrips nested VerticalLayout with Group", () => {
    const json: UiSchemaObject = {
      type: "VerticalLayout",
      elements: [
        {
          type: "Group",
          label: "Person",
          options: { collapsible: true },
          elements: [
            {
              type: "Control",
              scope: "#/properties/name",
              label: "Name",
            },
          ],
        },
      ],
    };

    const restored = uiSchemaFromJSON(json);
    expect(restored.toJSON()).toEqual(json);
  });

  it("roundtrips HorizontalLayout with rule and options", () => {
    const json: UiSchemaObject = {
      type: "HorizontalLayout",
      options: { fit: true },
      rule: {
        effect: "HIDE",
        condition: {
          scope: "#",
          schema: { type: "boolean" },
        },
      },
      elements: [{ type: "Label", text: "Hinweis" }],
    };

    const layout = uiSchemaFromJSON(json);
    expect(layout).toBeInstanceOf(HorizontalLayout);
    expect(layout.rule?.effect).toBe("HIDE");
    expect(layout.options).toEqual({ fit: true });
    expect(layout.toJSON()).toEqual(json);
  });

  it("clones preserve rule and children", () => {
    const control = new Control("#/properties/x", "X");
    control.rule = new UiRule("DISABLE", "#", { const: false });
    control.setOption("readonly", true);

    const copy = control.clone() as Control;
    expect(copy.rule?.effect).toBe("DISABLE");
    expect(copy.options).toEqual({ readonly: true });
  });

  it("throws for unknown type without recognizable shape", () => {
    expect(() =>
      uiSchemaFromJSON({ type: "UnknownWidget" } as unknown as UiSchemaObject),
    ).toThrow("Unbekannter UI-Schema-Typ");
  });

  it("roundtrips i18n key on Control", () => {
    const json: UiSchemaObject = {
      type: "Control",
      scope: "#/properties/name",
      label: "Name",
      i18n: "person.name",
    };

    const control = uiSchemaFromJSON(json);
    expect(control.i18n).toBe("person.name");
    expect(control.toJSON()).toEqual(json);
  });
});

describe("UiLayout structure validation", () => {
  it("rejects non-Category children in Categorization", () => {
    const categorization = new Categorization();
    expect(() => categorization.addChild(new Label("x"))).toThrow(
      "Categorization darf nur Category-Elemente enthalten",
    );
  });

  it("rejects non-Step children in Stepper", () => {
    const stepper = new Stepper();
    expect(() => stepper.addChild(new Group("x"))).toThrow(
      "Stepper darf nur Step-Elemente enthalten",
    );
  });

  it("roundtrips valid Categorization with Categories", () => {
    const json: UiSchemaObject = {
      type: "Categorization",
      elements: [
        {
          type: "Category",
          label: "Allgemein",
          elements: [{ type: "Control", scope: "#/properties/name", label: "Name" }],
        },
      ],
    };

    const node = uiSchemaFromJSON(json);
    expect(node).toBeInstanceOf(Categorization);
    expect(node.toJSON()).toEqual(json);
  });

  it("roundtrips valid Stepper with Steps", () => {
    const json: UiSchemaObject = {
      type: "Stepper",
      elements: [
        {
          type: "Step",
          label: "Schritt 1",
          elements: [{ type: "Label", text: "Intro" }],
        },
      ],
    };

    const node = uiSchemaFromJSON(json);
    expect(node).toBeInstanceOf(Stepper);
    expect(node.toJSON()).toEqual(json);
  });

  it("falls back to VerticalLayout when elements are present", () => {
    const json = {
      type: "CustomLayout",
      elements: [{ type: "Label", text: "ok" }],
    } as unknown as UiSchemaObject;

    const node = uiSchemaFromJSON(json);
    expect(node).toBeInstanceOf(VerticalLayout);
    expect(node.toJSON().elements).toHaveLength(1);
  });
});
