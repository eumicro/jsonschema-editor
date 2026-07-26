import { useMemo } from "react";
import type { SchemaDocument, SchemaNode } from "@jsonschema-editor/json-schema";
import type { UiElement } from "@jsonschema-editor/ui-schema";
import {
  useSchemaAttributeControlRegistry,
  useUiAttributeControlRegistry,
} from "../../../context/RegistriesContext.js";
import { StringAttributeControl } from "./StringAttributeControl.js";

export interface AttributeControlResolverProps {
  node: SchemaNode | UiElement;
  attributeName: string;
  label: string;
  readonly?: boolean;
  mode: "schema" | "ui";
  modelValue?: unknown;
  onModelValueChange?: (value: unknown) => void;
  document?: SchemaDocument;
}

export function AttributeControlResolver({
  node,
  attributeName,
  label,
  readonly,
  mode,
  modelValue,
  onModelValueChange,
  document,
}: AttributeControlResolverProps) {
  const schemaRegistry = useSchemaAttributeControlRegistry();
  const uiRegistry = useUiAttributeControlRegistry();

  const Resolved = useMemo(() => {
    const context = {
      node,
      attributeName,
      label,
      value: modelValue,
      readonly,
    };

    if (mode === "schema") {
      return schemaRegistry.resolve(context as never) ?? StringAttributeControl;
    }

    return uiRegistry.resolve(context as never) ?? StringAttributeControl;
  }, [attributeName, label, mode, modelValue, node, readonly, schemaRegistry, uiRegistry]);

  return (
    <Resolved
      label={label}
      readonly={readonly}
      modelValue={modelValue}
      onModelValueChange={onModelValueChange}
      document={document}
    />
  );
}
