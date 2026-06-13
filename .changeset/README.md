# Changesets

Add changes for the next release as a markdown file:

```bash
pnpm changeset
```

Update versions and generate the changelog:

```bash
pnpm version-packages
```

Publish locally (with `NPM_TOKEN`):

```bash
pnpm release
```

In CI, publishing runs automatically when a GitHub release is published.
