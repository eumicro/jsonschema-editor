import { useId } from "react";

export interface JseSuggestionOption {
  value: string;
  label?: string;
}

export interface JseSuggestionInputProps {
  modelValue?: string;
  onModelValueChange: (value: string) => void;
  suggestions?: readonly JseSuggestionOption[];
  disabled?: boolean;
  placeholder?: string;
  listId?: string;
  className?: string;
}

export function JseSuggestionInput({
  modelValue = "",
  onModelValueChange,
  suggestions = [],
  disabled,
  placeholder,
  listId,
  className,
}: JseSuggestionInputProps) {
  const generatedId = useId();
  const datalistId = listId ?? `jse-suggestions-${generatedId}`;

  return (
    <div className={["jse-suggestion-input", className].filter(Boolean).join(" ")}>
      <input
        className="jse-input jse-suggestion-input__field"
        type="text"
        role="combobox"
        aria-autocomplete="list"
        aria-expanded={suggestions.length > 0}
        list={datalistId}
        value={modelValue}
        disabled={disabled}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => onModelValueChange(event.target.value)}
      />
      <datalist id={datalistId}>
        {suggestions.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label ?? option.value}
          </option>
        ))}
      </datalist>
    </div>
  );
}
