import { basicSetup } from "codemirror";
import { EditorState } from "@codemirror/state";
import { EditorView } from "@codemirror/view";
import { json } from "@codemirror/lang-json";
import { javascript } from "@codemirror/lang-javascript";
import { oneDark } from "@codemirror/theme-one-dark";

export type SiteCodeEditorLanguage = "json" | "javascript";

export type SiteCodeEditorHandle = {
  setValue: (value: string) => void;
  destroy: () => void;
};

function languageExtension(language: SiteCodeEditorLanguage) {
  return language === "json" ? json() : javascript({ typescript: true, jsx: true });
}

/** Mount a read-only CodeMirror editor into `parent` for JSON / embed snippets. */
export function createSiteCodeEditor(
  parent: HTMLElement,
  options: {
    value: string;
    language: SiteCodeEditorLanguage;
  },
): SiteCodeEditorHandle {
  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc: options.value,
      extensions: [
        basicSetup,
        oneDark,
        languageExtension(options.language),
        EditorState.readOnly.of(true),
        EditorView.editable.of(false),
        EditorView.theme({
          "&": {
            height: "100%",
            fontSize: "0.82rem",
            background: "transparent",
          },
          ".cm-scroller": {
            overflow: "auto",
            fontFamily:
              'ui-monospace, "Cascadia Code", Consolas, "Liberation Mono", monospace',
          },
          ".cm-content": {
            minHeight: "16rem",
            padding: "0.75rem 0",
          },
          ".cm-gutters": {
            background: "transparent",
            borderRight: "1px solid rgb(255 255 255 / 8%)",
          },
          "&.cm-focused": {
            outline: "none",
          },
        }),
        EditorView.lineWrapping,
      ],
    }),
  });

  return {
    setValue(value: string) {
      const current = view.state.doc.toString();
      if (current === value) return;
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      });
    },
    destroy() {
      view.destroy();
    },
  };
}
