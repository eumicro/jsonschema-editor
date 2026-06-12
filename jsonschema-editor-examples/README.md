# jsonschema-editor-examples

Lauffähiges Beispielprojekt für den **JSON-Schema Form-Editor** und das ausfüllbare Formular.

## Voraussetzungen

Zuerst die Abhängigkeiten bauen:

```bash
cd ../jsonschema-editor-json-schema && npm install && npm run build
cd ../jsonschema-editor-ui-schema && npm install && npm run build
```

## Starten

```bash
npm install
npm run dev
```

Öffnet http://localhost:5173 mit:

- **Form-Editor** – Schema/UI-Schema bearbeiten und Live-Vorschau
- **Ausfüllbares Formular** – gleiches Schema als Formular mit JSON-Ausgabe

## Beispiel

`src/examples/simple-composition.ts` – Person mit `allOf` (Basis) + `oneOf` (natürliche/juristische Person).

## Abhängigkeiten

| Paket | Rolle |
| --- | --- |
| `@jsonschema-editor/json-schema` | OOP JSON-Schema-Modell |
| `@jsonschema-editor/ui-schema` | OOP UI-Schema-Modell |
| `@jsonschema-editor/vue` | Editor- & Formular-Komponenten |
