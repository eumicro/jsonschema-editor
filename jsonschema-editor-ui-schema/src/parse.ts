import type { UiSchemaAttributeRegistry } from "./attribute-registry.js";
import type { UiSchemaObject } from "./types.js";
import { UiSchemaFactory, defaultUiSchemaFactory } from "./model/factory.js";
import type { UiElement } from "./model/node.js";

export function uiSchemaFromJSON(
  json: UiSchemaObject,
  registry?: UiSchemaAttributeRegistry,
): UiElement {
  return new UiSchemaFactory(registry).fromJSON(json);
}

export { defaultUiSchemaFactory };
