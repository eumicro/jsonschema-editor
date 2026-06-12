# Publishing

Checkliste für Maintainer vor dem ersten Release und für Folge-Releases.

## Einmalige Vorbereitung

1. GitHub-Repository `eumicro/jsonschema-editor` anlegen und dieses Monorepo pushen
2. npm-Organisation `@jsonschema-editor` anlegen (Scope ist derzeit **frei**)

   **Voraussetzung – lokal einloggen:**

   ```bash
   npm login --auth-type=web
   npm whoami
   ```

   **Organisation (nur über die Website):**

   1. https://www.npmjs.com/org/create öffnen
   2. Name: `jsonschema-editor`
   3. Plan: **Unlimited public packages** (kostenlos)
   4. **Create** klicken

   **Verifizieren:**

   ```bash
   npm org ls jsonschema-editor
   ```

   Im Repo liegt `.npmrc` mit `access=public` für scoped Packages.
3. GitHub Secret `NPM_TOKEN` in der **Environment „Dev“** hinterlegen

   Repository → **Settings** → **Environments** → **Dev** → **Environment secrets** → `NPM_TOKEN`

   Der Publish-Workflow (`.github/workflows/publish.yml`) nutzt `environment: Dev`.
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
