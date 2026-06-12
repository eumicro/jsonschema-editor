# Changesets

Änderungen für das nächste Release hier als Markdown-Datei anlegen:

```bash
pnpm changeset
```

Versionen aktualisieren und Changelog generieren:

```bash
pnpm version-packages
```

Veröffentlichen (lokal, mit `NPM_TOKEN`):

```bash
pnpm release
```

In CI wird bei GitHub Release automatisch publiziert.
