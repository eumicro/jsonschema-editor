export interface AttributeControlProps {
  label: string;
  readonly?: boolean;
  modelValue?: unknown;
  onModelValueChange?: (value: unknown) => void;
}
