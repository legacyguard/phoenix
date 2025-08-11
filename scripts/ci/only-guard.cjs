const fs=require('fs'), path=require('path');
const roots=['src','tests','cypress'];
const hits=[];
function walk(d){ for(const n of fs.readdirSync(d)){ const p=path.join(d,n);
  if (n==='node_modules'||n==='coverage'||n.startsWith('.cleanup_')) continue;
  const st=fs.statSync(p);
  if (st.isDirectory()) walk(p);
  else if (/\.(t|j)sx?$/.test(n)) {
    const s=fs.readFileSync(p,'utf8');
    if (/\b(?:it|test|describe)\.only\s*\(/.test(s)) hits.push(p);
  }
}}
for (const r of roots) if (fs.existsSync(r)) walk(r);
if (hits.length){ console.error('only-guard: found .only in tests:'); hits.slice(0,50).forEach(f=>console.error(' -',f)); process.exit(1); }
console.log('only-guard: OK');
