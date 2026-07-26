import { useEffect, useRef } from "react";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import {
  createCelExpressionEditor,
  type CelExpressionEditorHandle,
} from "@jsonschema-editor/json-schema-extensions/cel-editor";

export interface CelExpressionEditorProps {
  value: string;
  disabled?: boolean;
  placeholder?: string;
  document?: SchemaDocument;
  onChange?: (value: string) => void;
  onBlur?: () => void;
}

export function CelExpressionEditor({
  value,
  disabled,
  placeholder,
  document,
  onChange,
  onBlur,
}: CelExpressionEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<CelExpressionEditorHandle | null>(null);
  const onChangeRef = useRef(onChange);
  const onBlurRef = useRef(onBlur);
  onChangeRef.current = onChange;
  onBlurRef.current = onBlur;

  useEffect(() => {
    if (!hostRef.current) return;
    editorRef.current = createCelExpressionEditor(hostRef.current, {
      value,
      readOnly: disabled === true,
      placeholder,
      schemaDocument: document,
      onChange: (next) => onChangeRef.current?.(next),
      onBlur: () => onBlurRef.current?.(),
    });
    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
    // Mount once; value/disabled/document synced below.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional
  }, []);

  useEffect(() => {
    editorRef.current?.setValue(value);
  }, [value]);

  useEffect(() => {
    editorRef.current?.setReadOnly(disabled === true);
  }, [disabled]);

  useEffect(() => {
    editorRef.current?.setSchemaDocument(document);
  }, [document]);

  return <div ref={hostRef} className="jse-cel-expression-editor" />;
}
