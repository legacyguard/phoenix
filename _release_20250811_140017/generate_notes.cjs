const fs=require('fs'), path=require('path');
const [OUT, I18N_DIR, NS_DIR] = process.argv.slice(2);
function num(p, def=0){ try { return JSON.parse(fs.readFileSync(p,'utf8')); } catch { return def; } }

const i18n = I18N_DIR ? num(path.join(I18N_DIR,'_summary.json'), {}) : {};
const ns   = NS_DIR   ? num(path.join(NS_DIR,'_summary.json'), {})   : {};
const commits = fs.existsSync(path.join(OUT,'commits.txt')) ? fs.readFileSync(path.join(OUT,'commits.txt'),'utf8') : '';

const notes = [
  '# Cleanup Phase 1',
  '',
  '## Summary',
  `- Removed backup/script cruft, lint/CI stabilized.`,
  `- i18n: removed ${i18n?.deleted ? Object.values(i18n.deleted).reduce((a,b)=>a+b,0) : 'N/A'} keys; added ${i18n?.added ? Object.values(i18n.added).reduce((a,b)=>a+b,0) : 'N/A'} missing.`,
  `- Namespacing fixes: ${ns?.totalReplacements || ns?.replacements || 'N/A'} replacements across ${ns?.filesChanged || ns?.filesProcessed || 'N/A'} files.`,
  '',
  '## Security (npm audit)',
  (fs.existsSync(path.join(OUT,'audit_summary.txt')) ? fs.readFileSync(path.join(OUT,'audit_summary.txt'),'utf8') : 'No audit data.'),
  '',
  '## Commits',
  commits || '(no commits found)'
].join('\n');

fs.writeFileSync(path.join(OUT,'RELEASE_NOTES_CLEANUP_PHASE1.md'), notes);
console.log('Release notes generated');
