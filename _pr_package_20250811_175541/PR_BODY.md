# Cleanup Phase 1 — phoenix

**Branch:** `main`  •  **Head:** `dcf89cb7`

## What changed
- Removed legacy scripts & backup dirs (with backups, gitignored).
- i18n sync: **+407** missing keys, **-201314** unused keys.
- Namespacing fix: **1733** replacements across **143** files.
- Circular deps removed (madge now reports 0).
- Deps: dedupe + minor/patch updates; `npm audit` clean.
- Tests: **unit 100% PASS (328/328)**, Cypress config fixed (CJS), E2E ready on preview server.

## Risk & Rollback
- All removed assets archived in `.cleanup_trash/`.
- i18n changes deterministic; placeholders preserved.
- Easy rollback: revert PR or restore from `.cleanup_trash/`.

## Security (npm audit)
Before  → info:0 low:0 moderate:0 high:0 critical:0
After   → info:0 low:0 moderate:0 high:0 critical:0

## Code health (snapshot)
```
== CODE HEALTH SUMMARY ==
ts-prune (unused exports) lines: 0
madge circular report lines: 11
TODO/FIXME/HACK/XXX lines: 478
npm dedupe (dry-run) size: 3240 bytes
Output dir: _code_health_20250811_133149
```

## Follow-ups (Phase 2 – optional)
- Reduce remaining TODO/FIXME: ~478.
- Tighten type coverage on complex components.
- Bundle size & route-level code-splitting review.
- Storybook/visual regression for critical flows.
