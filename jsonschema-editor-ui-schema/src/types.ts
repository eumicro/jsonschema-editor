export type UiElementKind =
  | "Control"
  | "VerticalLayout"
  | "HorizontalLayout"
  | "Group"
  | "Label"
  | "Categorization"
  | "Category"
  | "Stepper"
  | "Step";

/** Alias für Abwärtskompatibilität – identisch mit {@link UiElementKind}. */
export type UiElementType = UiElementKind;

export interface UiSchemaObject {
  type: UiElementKind;
  scope?: string;
  label?: string;
  text?: string;
  i18n?: string;
  elements?: UiSchemaObject[];
  options?: Record<string, unknown>;
  rule?: {
    effect: "SHOW" | "HIDE" | "ENABLE" | "DISABLE";
    condition: {
      scope: string;
      schema: Record<string, unknown>;
    };
  };
  [key: string]: unknown;
}

export interface UiAttributeDefinition<T = unknown> {
  name: string;
  defaultValue?: T;
  serialize?: (value: T) => unknown;
  deserialize?: (raw: unknown) => T;
}
