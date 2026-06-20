import type { FormFieldProps } from "../../../types/form-field-props.js";
import { SchemaFormFieldResolver } from "./SchemaFormFieldResolver.js";

export function ControlField(props: FormFieldProps) {
  return <SchemaFormFieldResolver {...props} />;
}
