# Data source

Geography JSON comes from the
[thailand-geography-data/thailand-geography-json](https://github.com/thailand-geography-data/thailand-geography-json)
dependency in `package.json` (MIT). Data is bundled into `dist/` at build time.

```json
"thailand-geography-json": "github:thailand-geography-data/thailand-geography-json#<commit-sha>"
```

## Update

```bash
pnpm check-upstream   # compare pinned SHA to upstream main
pnpm update-data      # bump dependency, test, and build
```

A weekly GitHub Action (`.github/workflows/check-upstream.yml`) runs the same check and opens an issue when upstream advances.
