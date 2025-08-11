# PR Checklist — Cleanup Phase 1

- [ ] CI: `npm run lint && npm run test:ci` green
- [ ] E2E (Cypress): `npm run preview &` then `npx cypress run --headless` green
- [ ] Manual smoke: login → dashboard → key flows OK
- [ ] i18n sanity: EN renders (no keys shown), 1–2 other locales load OK
- [ ] No secrets/PII in diffs
- [ ] `.cleanup_trash/` not committed (gitignored)

**Notes**
- Rollback: revert PR or restore from `.cleanup_trash/`.
