import { defaultKeymap, history, historyKeymap } from "@codemirror/commands";
import { Compartment, EditorState } from "@codemirror/state";
import { EditorView, keymap, lineNumbers, placeholder } from "@codemirror/view";
import type { SchemaDocument } from "@jsonschema-editor/json-schema";
import { celAutocompletion } from "./cel-completions.js";
import {
  collectCelDataPathIndex,
  emptyCelDataPathIndex,
  type CelDataPathIndex,
} from "./cel-data-paths.js";
import { celLanguage, celSyntaxHighlighting } from "./cel-language.js";

export type CelExpressionEditorHandle = {
  setValue: (value: string) => void;
  getValue: () => string;
  setReadOnly: (readOnly: boolean) => void;
  setDataPathIndex: (index: CelDataPathIndex) => void;
  setSchemaDocument: (document: SchemaDocument | undefined) => void;
  focus: () => void;
  destroy: () => void;
};

export type CreateCelExpressionEditorOptions = {
  value?: string;
  readOnly?: boolean;
  placeholder?: string;
  /** Precomputed schema field index for `data…` autocomplete. */
  dataPathIndex?: CelDataPathIndex;
  /** Schema document used to derive field autocomplete (overrides dataPathIndex when set). */
  schemaDocument?: SchemaDocument;
  onChange?: (value: string) => void;
  onBlur?: () => void;
};

function readOnlyExtensions(readOnly: boolean) {
  return [EditorState.readOnly.of(readOnly), EditorView.editable.of(!readOnly)];
}

function resolveIndex(options: CreateCelExpressionEditorOptions): CelDataPathIndex {
  if (options.schemaDocument) {
    return collectCelDataPathIndex(options.schemaDocument);
  }
  return options.dataPathIndex ?? emptyCelDataPathIndex();
}

/** Mount an editable CEL expression editor with highlighting and autosuggest. */
export function createCelExpressionEditor(
  parent: HTMLElement,
  options: CreateCelExpressionEditorOptions = {},
): CelExpressionEditorHandle {
  const readOnlyCompartment = new Compartment();
  const completionCompartment = new Compartment();
  let dataPathIndex = resolveIndex(options);

  const updateListener = EditorView.updateListener.of((update) => {
    if (update.docChanged) {
      options.onChange?.(update.state.doc.toString());
    }
  });

  const view = new EditorView({
    parent,
    state: EditorState.create({
      doc: options.value ?? "",
      extensions: [
        lineNumbers(),
        history(),
        celLanguage,
        celSyntaxHighlighting(),
        completionCompartment.of(celAutocompletion(dataPathIndex)),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        placeholder(options.placeholder ?? "data.positionen.map(p, double(p.betrag)).sum()"),
        readOnlyCompartment.of(readOnlyExtensions(options.readOnly === true)),
        EditorView.lineWrapping,
        updateListener,
        EditorView.domEventHandlers({
          blur: () => {
            options.onBlur?.();
            return false;
          },
        }),
        EditorView.theme({
          "&": {
            fontSize: "0.85rem",
            border: "1px solid var(--jse-border, #cbd5e1)",
            borderRadius: "0.5rem",
            background: "var(--jse-surface, #fff)",
          },
          "&.cm-focused": {
            outline: "2px solid var(--jse-accent, #0f766e)",
            outlineOffset: "1px",
          },
          ".cm-scroller": {
            fontFamily:
              'ui-monospace, "Cascadia Code", Consolas, "Liberation Mono", monospace',
            minHeight: "5.5rem",
            maxHeight: "14rem",
          },
          ".cm-content": {
            padding: "0.5rem 0",
          },
          ".cm-gutters": {
            background: "var(--jse-muted-surface, #f8fafc)",
            borderRight: "1px solid var(--jse-border, #e2e8f0)",
            color: "#64748b",
          },
          ".cm-tooltip.cm-tooltip-autocomplete": {
            zIndex: "40",
          },
        }),
      ],
    }),
  });

  function applyDataPathIndex(next: CelDataPathIndex): void {
    dataPathIndex = next;
    view.dispatch({
      effects: completionCompartment.reconfigure(celAutocompletion(next)),
    });
  }

  return {
    getValue() {
      return view.state.doc.toString();
    },
    setValue(value: string) {
      const current = view.state.doc.toString();
      if (current === value) return;
      view.dispatch({
        changes: { from: 0, to: view.state.doc.length, insert: value },
      });
    },
    setReadOnly(next: boolean) {
      view.dispatch({
        effects: readOnlyCompartment.reconfigure(readOnlyExtensions(next)),
      });
    },
    setDataPathIndex(next: CelDataPathIndex) {
      applyDataPathIndex(next);
    },
    setSchemaDocument(document: SchemaDocument | undefined) {
      applyDataPathIndex(
        document ? collectCelDataPathIndex(document) : emptyCelDataPathIndex(),
      );
    },
    focus() {
      view.focus();
    },
    destroy() {
      view.destroy();
    },
  };
}
