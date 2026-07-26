import { useEffect, useRef } from "react";
import {
  createSiteCodeEditor,
  type SiteCodeEditorHandle,
  type SiteCodeEditorLanguage,
} from "../../../../../jsonschema-editor-examples/src/site/code-editor/createSiteCodeEditor.js";

interface SiteCodeEditorProps {
  value: string;
  language: SiteCodeEditorLanguage;
  ariaLabel?: string;
}

export function SiteCodeEditor({ value, language, ariaLabel }: SiteCodeEditorProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<SiteCodeEditorHandle | null>(null);

  useEffect(() => {
    if (!hostRef.current) return;
    editorRef.current?.destroy();
    editorRef.current = createSiteCodeEditor(hostRef.current, { value, language });
    return () => {
      editorRef.current?.destroy();
      editorRef.current = null;
    };
    // Remount when language changes; value updates via the effect below.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional remount on language
  }, [language]);

  useEffect(() => {
    editorRef.current?.setValue(value);
  }, [value]);

  return (
    <div
      ref={hostRef}
      className="app__site-code-editor"
      role="region"
      aria-label={ariaLabel}
    />
  );
}
