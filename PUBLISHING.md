# Publishing

Checklist for maintainers before the first release and for subsequent releases.

## One-time setup

1. Create the GitHub repository `eumicro/jsonschema-editor` and push this monorepo
2. Create the npm organization `@jsonschema-editor` (the scope is currently **available**)

   **Prerequisite — log in locally:**

   ```bash
   npm login --auth-type=web
   npm whoami
   ```

   **Organization (website only):**

   1. Open https://www.npmjs.com/org/create
   2. Name: `jsonschema-editor`
   3. Plan: **Unlimited public packages** (free)
   4. Click **Create**

   **Verify:**

   ```bash
   npm org ls jsonschema-editor
   ```

   The repo includes `.npmrc` with `access=public` for scoped packages.
3. Add the GitHub secret `NPM_TOKEN` in the **Dev** environment

   Repository → **Settings** → **Environments** → **Dev** → **Environment secrets** → `NPM_TOKEN`

   The publish workflow (`.github/workflows/publish.yml`) uses `environment: Dev`.
4. Optional: link npm [Trusted Publishing](https://docs.npmjs.com/trusted-publishers) with GitHub

## Release process

1. Commit changes and merge to `main`
2. Add a changeset: `pnpm changeset`
3. Update versions and changelog: `pnpm version-packages`
4. Commit with updated versions and CHANGELOG
5. Create a GitHub release with tag `vX.Y.Z` (e.g. `v0.1.0`)
6. The workflow `.github/workflows/publish.yml` publishes to npm automatically

## Manual publish (fallback)

```bash
pnpm install
pnpm run build
pnpm run test
pnpm publish -r --access public
```

## Packages

| Package | Directory |
| --- | --- |
| `@jsonschema-editor/json-schema` | `jsonschema-editor-json-schema` |
| `@jsonschema-editor/json-schema-extensions` | `jsonschema-editor-json-schema-extensions` |
| `@jsonschema-editor/ui-schema` | `jsonschema-editor-ui-schema` |
| `@jsonschema-editor/vue` | `jsonschema-editor-vue` |
| `@jsonschema-editor/vue-extensions` | `jsonschema-editor-vue-extensions` |

The examples project is `private` and is not published.
