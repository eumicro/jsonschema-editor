# Publishing

Checkliste für Maintainer vor dem ersten Release und für Folge-Releases.

## Einmalige Vorbereitung

1. GitHub-Repository `jsonschema-editor/jsonschema-editor` anlegen und dieses Monorepo pushen
2. npm-Organisation `@jsonschema-editor` anlegen unter https://www.npmjs.com/org/create
3. GitHub Secret `NPM_TOKEN` mit einem npm Automation-Token hinterlegen
4. Optional: npm [Trusted Publishing](https://docs.npmjs.com/trusted-publishers) mit GitHub verknüpfen

## Release-Ablauf

1. Änderungen committen und nach `main` mergen
2. Changeset anlegen: `pnpm changeset`
3. Versionen und Changelog aktualisieren: `pnpm version-packages`
4. Commit mit aktualisierten Versionen und CHANGELOG
5. GitHub Release mit Tag `vX.Y.Z` erstellen (z. B. `v0.1.0`)
6. Der Workflow `.github/workflows/publish.yml` publiziert automatisch auf npm

## Manuelles Publish (Fallback)

```bash
pnpm install
pnpm run build
pnpm run test
pnpm publish -r --access public
```

## Pakete

| Paket | Verzeichnis |
| --- | --- |
| `@jsonschema-editor/json-schema` | `jsonschema-editor-json-schema` |
| `@jsonschema-editor/ui-schema` | `jsonschema-editor-ui-schema` |
| `@jsonschema-editor/vue` | `jsonschema-editor-vue` |

Das Examples-Projekt ist `private` und wird nicht veröffentlicht.
