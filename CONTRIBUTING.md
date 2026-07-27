# Contributing

Thanks for your interest in improving JSON Schema Editor.

## Development setup

Requirements: **Node.js ≥ 20**, **pnpm** (see root `packageManager`).

```bash
pnpm install
pnpm run build
pnpm run typecheck
pnpm run test
```

Example sites (local):

```bash
pnpm run dev:site
# or per package:
pnpm --filter jsonschema-editor-examples run dev
pnpm --filter jsonschema-editor-examples-react run dev
```

## Pull requests

1. Fork the repo and create a branch from `main`.
2. Keep changes focused; follow existing patterns (Vue **and** React when the concern is shared; keep locales consistent where UI copy is involved).
3. Run `pnpm run build`, `pnpm run typecheck`, and `pnpm run test` before opening a PR.
4. Use a clear conventional-style summary (`feat`, `fix`, `docs`, `chore`, …).
5. Open a PR against `main` and describe **why** the change is needed.

## Packages

Published packages live under `jsonschema-editor-*` (json-schema, ui-schema, vue, react, and extensions). Example apps are not published to npm.

## Issues

Bug reports and feature ideas are welcome via [GitHub Issues](https://github.com/eumicro/jsonschema-editor/issues). Please include a minimal schema/repro when reporting form or editor bugs.

## License

By contributing, you agree that your contributions will be licensed under the MIT License of this repository.
