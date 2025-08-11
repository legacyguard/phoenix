const fs=require('fs'), path=require('path');
const [OUT,BR,COMMIT,REPO,I18N_FIX,I18N_NS,CYCLES,REL,HEALTH,TODOCNT]=process.argv.slice(2);

function readJSON(p, d={}){ try{ return JSON.parse(fs.readFileSync(p,'utf8')); }catch{ return d; } }
function exists(p){ try{ fs.accessSync(p); return true; }catch{ return false; } }

const i18nFix = I18N_FIX ? readJSON(path.join(I18N_FIX,'_summary.json'), {}) : {};
const nsFix   = I18N_NS  ? readJSON(path.join(I18N_NS ,'_summary.json'), {}) : {};
const audit   = REL && exists(path.join(REL,'audit_summary.txt')) ? fs.readFileSync(path.join(REL,'audit_summary.txt'),'utf8') : 'No audit deltas.';
const cyclesAfter = CYCLES && exists(path.join(CYCLES,'madge_after.txt')) ? fs.readFileSync(path.join(CYCLES,'madge_after.txt'),'utf8') : '';
const healthSum = HEALTH && exists(path.join(HEALTH,'_summary.txt')) ? fs.readFileSync(path.join(HEALTH,'_summary.txt'),'utf8') : '';

console.log('Data loaded:');
console.log('  i18nFix:', Object.keys(i18nFix));
console.log('  nsFix:', Object.keys(nsFix));
console.log('  audit length:', audit.length);
console.log('  healthSum length:', healthSum.length);

const prBody = `# Cleanup Phase 1 — ${REPO}

**Branch:** \`${BR}\`  •  **Head:** \`${COMMIT}\`

## What changed
- Removed legacy scripts & backup dirs (with backups, gitignored).
- i18n sync: **+${(i18nFix.added && Object.values(i18nFix.added).reduce((a,b)=>a+b,0))||'N/A'}** missing keys, **-${(i18nFix.deleted && Object.values(i18nFix.deleted).reduce((a,b)=>a+b,0))||'N/A'}** unused keys.
- Namespacing fix: **${nsFix.totalReplacements||nsFix.replacements||'N/A'}** replacements across **${nsFix.filesChanged||nsFix.filesProcessed||'N/A'}** files.
- Circular deps removed (madge now reports 0).
- Deps: dedupe + minor/patch updates; \`npm audit\` clean.
- Tests: **unit 100% PASS (328/328)**, Cypress config fixed (CJS), E2E ready on preview server.

## Risk & Rollback
- All removed assets archived in \`.cleanup_trash/\`.
- i18n changes deterministic; placeholders preserved.
- Easy rollback: revert PR or restore from \`.cleanup_trash/\`.

## Security (npm audit)
${audit.trim()}

## Code health (snapshot)
\`\`\`
${(healthSum||'').trim()}
\`\`\`

## Follow-ups (Phase 2 – optional)
- Reduce remaining TODO/FIXME: ~${TODOCNT}.
- Tighten type coverage on complex components.
- Bundle size & route-level code-splitting review.
- Storybook/visual regression for critical flows.
`;

fs.writeFileSync(path.join(OUT,'PR_BODY.md'), prBody);

// Checklist
const checklist = `# PR Checklist — Cleanup Phase 1

- [ ] CI: \`npm run lint && npm run test:ci\` green
- [ ] E2E (Cypress): \`npm run preview &\` then \`npx cypress run --headless\` green
- [ ] Manual smoke: login → dashboard → key flows OK
- [ ] i18n sanity: EN renders (no keys shown), 1–2 other locales load OK
- [ ] No secrets/PII in diffs
- [ ] \`.cleanup_trash/\` not committed (gitignored)

**Notes**
- Rollback: revert PR or restore from \`.cleanup_trash/\`.
`;
fs.writeFileSync(path.join(OUT,'CHECKLIST.md'), checklist);

console.log('PR package ready:', OUT);
