# jsonschema-editor-examples-site

Unified local site for the Vue and React example apps on **one origin**.

URL stack segment selects the entry:

- `/…/examples/vue/…` → Vue examples app
- `/…/examples/react/…` → React examples app

## Start

From the repository root (after `pnpm install` and package builds as needed):

```bash
pnpm run dev:site
```

Production assemble remains `pnpm run build:site` → `site/`.
