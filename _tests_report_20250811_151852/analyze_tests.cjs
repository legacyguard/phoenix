const fs=require('fs'); const [u,e,ss,ff]=process.argv.slice(2);
function read(p){ try{ return JSON.parse(fs.readFileSync(p,'utf8')); }catch{ return {}; } }
const uj=read(u), ej=read(e);

let unit = {total:0,failed:0,failedTests:[]};
if (uj && uj.testResults) {
  unit.total = (uj.numTotalTests ?? 0);
  unit.failed = (uj.numFailedTests ?? 0);
  for (const tr of uj.testResults) {
    for (const a of tr.assertionResults||[]) {
      if (a.status==='failed') unit.failedTests.push({file: tr.name, title: (a.ancestorTitles||[]).concat([a.title]).join(' › ')});
    }
  }
} else if (uj && uj.testResults == null && Array.isArray(uj)) {
  // vitest JSON array
  unit.total = uj.length;
  unit.failed = uj.filter(x=>x.result?.state==='fail').length;
  unit.failedTests = uj.filter(x=>x.result?.state==='fail').map(x=>({file:x.projectName||x.name||'', title:(x.result?.error?.name||x.result?.error?.message||'fail')}));
}

let e2e = {total:0,failed:0,failedTests:[]};
if (ej?.suites || ej?.config) { // playwright json has suites/config
  function walk(s){ if (!s) return;
    if (s.tests) for (const t of s.tests) {
      const st = t.results?.[0]?.status || t.outcome || t.status;
      if (st==='failed') e2e.failedTests.push({file: t.location?.file||'', title: t.title});
      e2e.total++;
      if (st==='failed') e2e.failed++;
    }
    if (s.suites) for (const c of s.suites) walk(c);
  }
  if (ej.suites) for (const s of ej.suites) walk(s);
} else if (Array.isArray(ej?.runs)) { // cypress basic json
  for (const r of ej.runs) {
    for (const t of (r.tests||[])) {
      const failed = (t.displayError || (t.attempts||[]).some(a => (a.state||'')==='failed'));
      e2e.total++;
      if (failed) { e2e.failed++; e2e.failedTests.push({file:r.spec?.relative||'', title:t.title?.join(' ')||''}); }
    }
  }
}

const top = [];
for (const it of (unit.failedTests||[]).slice(0,20)) top.push(`[UNIT] ${it.file} :: ${it.title}`);
for (const it of (e2e.failedTests||[]).slice(0,20)) top.push(`[E2E]  ${it.file} :: ${it.title}`);

const summary = [
  `Unit total: ${unit.total}`,
  `Unit failed: ${unit.failed}`,
  `E2E total: ${e2e.total}`,
  `E2E failed: ${e2e.failed}`,
].join('\n');

fs.writeFileSync(ss, summary+'\n');
fs.writeFileSync(ff, top.join('\n')+'\n');
console.log(summary);
