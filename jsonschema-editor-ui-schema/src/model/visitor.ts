import type { Control } from "./control.js";
import type { Category, Categorization } from "./categorization.js";
import type { Group, HorizontalLayout, VerticalLayout } from "./layouts.js";
import type { Label } from "./label.js";
import type { Step, Stepper } from "./stepper.js";

export interface UiElementVisitor<T> {
  visitControl(node: Control): T;
  visitVerticalLayout(node: VerticalLayout): T;
  visitHorizontalLayout(node: HorizontalLayout): T;
  visitGroup(node: Group): T;
  visitLabel(node: Label): T;
  visitCategorization(node: Categorization): T;
  visitCategory(node: Category): T;
  visitStepper(node: Stepper): T;
  visitStep(node: Step): T;
}
