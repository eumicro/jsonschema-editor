import type { UiSchemaAttributeRegistry } from "../attribute-registry.js";
import { globalUiSchemaAttributeRegistry } from "../attribute-registry.js";
import type { UiSchemaObject } from "../types.js";
import { Category, Categorization } from "./categorization.js";
import { Control } from "./control.js";
import { Group, HorizontalLayout, VerticalLayout } from "./layouts.js";
import { Label } from "./label.js";
import type { UiElement } from "./node.js";
import { Step, Stepper } from "./stepper.js";

export class UiSchemaFactory {
  constructor(
    public readonly attributeRegistry: UiSchemaAttributeRegistry = globalUiSchemaAttributeRegistry,
  ) {}

  fromJSON(json: UiSchemaObject): UiElement {
    switch (json.type) {
      case "Control":
        return Control.fromJSON(json, this);
      case "VerticalLayout":
        return VerticalLayout.fromJSON(json, this);
      case "HorizontalLayout":
        return HorizontalLayout.fromJSON(json, this);
      case "Group":
        return Group.fromJSON(json, this);
      case "Label":
        return Label.fromJSON(json, this);
      case "Categorization":
        return Categorization.fromJSON(json, this);
      case "Category":
        return Category.fromJSON(json, this);
      case "Stepper":
        return Stepper.fromJSON(json, this);
      case "Step":
        return Step.fromJSON(json, this);
      default:
        if (json.elements?.length) {
          return VerticalLayout.fromJSON(json, this);
        }
        if (json.scope !== undefined) {
          return Control.fromJSON(json, this);
        }
        throw new Error(`Unbekannter UI-Schema-Typ: ${String(json.type)}`);
    }
  }

  createControl(scope: string, label?: string): Control {
    return new Control(scope, label, this.attributeRegistry);
  }

  createVerticalLayout(elements: UiElement[] = []): VerticalLayout {
    const layout = new VerticalLayout(this.attributeRegistry);
    for (const element of elements) {
      layout.addChild(element);
    }
    return layout;
  }

  createHorizontalLayout(elements: UiElement[] = []): HorizontalLayout {
    const layout = new HorizontalLayout(this.attributeRegistry);
    for (const element of elements) {
      layout.addChild(element);
    }
    return layout;
  }

  createGroup(label: string | undefined, elements: UiElement[] = []): Group {
    const group = new Group(label, this.attributeRegistry);
    for (const element of elements) {
      group.addChild(element);
    }
    return group;
  }

  createLabel(text: string): Label {
    return new Label(text, this.attributeRegistry);
  }

  createCategorization(elements: UiElement[] = []): Categorization {
    const node = new Categorization(this.attributeRegistry);
    for (const element of elements) {
      node.addChild(element);
    }
    return node;
  }

  createCategory(label: string | undefined, elements: UiElement[] = []): Category {
    const node = new Category(label, this.attributeRegistry);
    for (const element of elements) {
      node.addChild(element);
    }
    return node;
  }

  createStepper(elements: UiElement[] = []): Stepper {
    const node = new Stepper(this.attributeRegistry);
    for (const element of elements) {
      node.addChild(element);
    }
    return node;
  }

  createStep(label: string | undefined, elements: UiElement[] = []): Step {
    const node = new Step(label, this.attributeRegistry);
    for (const element of elements) {
      node.addChild(element);
    }
    return node;
  }
}

export const defaultUiSchemaFactory = new UiSchemaFactory();
