import type { ComponentType } from "react";
import { useUiFormTypeRegistry } from "../../../context/RegistriesContext.js";
import type { UiElementRendererProps } from "../../../types/form-field-props.js";
import { ControlUiElement } from "./ControlUiElement.js";

export function UiFormElementResolver(props: UiElementRendererProps) {
  const typeRegistry = useUiFormTypeRegistry();
  const Resolved =
    (typeRegistry.resolve(props.element) as ComponentType<UiElementRendererProps>) ??
    ControlUiElement;
  return <Resolved {...props} />;
}

export function UiElementRenderer(props: UiElementRendererProps) {
  return <UiFormElementResolver {...props} />;
}
