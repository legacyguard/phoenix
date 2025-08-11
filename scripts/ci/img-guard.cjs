const fs=require('fs'), path=require('path');
const args=new Set(process.argv.slice(2));
const WRITE=args.has('--write-baseline');
const STRICT=args.has('--strict');
const BASE='scripts/ci/img-guard-baseline.json';

function scan(){
  const rows=[];
  function walk(d){
    for (const n of fs.readdirSync(d)){
      const p=path.join(d,n);
      if (n==='node_modules'||n==='coverage'||n.startsWith('.cleanup_')) continue;
      const st=fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (/\.(t|j)sx$/.test(n)){
        const s=fs.readFileSync(p,'utf8');
        const re=/<img\b([^>]*)>/gi; let m;
        while ((m=re.exec(s))){
          const attrs=m[1];
          const noLoading = !/\bloading\s*=/.test(attrs);
          const noWH = !/\bwidth\s*=/.test(attrs) || !/\bheight\s*=/.test(attrs);
          const line = s.slice(0,m.index).split('\n').length;
          rows.push({file:p,line,noLoading,noWH});
        }
      }
    }
  }
  if (fs.existsSync('src')) walk('src');
  return rows;
}

const rows=scan();
if (WRITE || !fs.existsSync(BASE)){
  const baseline={}; for (const r of rows){
    const k=`${r.file}:${r.line}`;
    baseline[k]={noLoading:r.noLoading, noWH:r.noWH};
  }
  fs.mkdirSync(path.dirname(BASE),{recursive:true});
  fs.writeFileSync(BASE, JSON.stringify(baseline,null,2));
  console.log('img-guard: baseline written', Object.keys(baseline).length);
  process.exit(0);
}

const base=JSON.parse(fs.readFileSync(BASE,'utf8'));
const newIssues=[];
for (const r of rows){
  const k=`${r.file}:${r.line}`;
  if (!base[k]){
    if (r.noLoading || r.noWH) newIssues.push({k, noLoading:r.noLoading, noWH:r.noWH});
  } else {
    // ak sa zhoršilo (nový problém)
    if ((r.noLoading && !base[k].noLoading) || (r.noWH && !base[k].noWH)){
      newIssues.push({k, noLoading:r.noLoading, noWH:r.noWH});
    }
  }
}

if (STRICT){
  const strictAll = rows.filter(r=> r.noLoading || r.noWH);
  if (strictAll.length){
    console.error('img-guard STRICT: violations=', strictAll.length);
    strictAll.slice(0,200).forEach(v=>console.error(v.k||`${v.file}:${v.line}`, v));
    process.exit(1);
  }
  console.log('img-guard STRICT: OK');
  process.exit(0);
}

if (newIssues.length){
  console.error('img-guard BASELINE: NEW issues=', newIssues.length);
  newIssues.slice(0,200).forEach(v=>console.error(v.k, v));
  process.exit(1);
}
console.log('img-guard BASELINE: OK (new=0)');
