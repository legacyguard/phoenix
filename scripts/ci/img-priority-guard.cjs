const fs=require('fs'), path=require('path');
let bad=[];
function walk(d){
  for (const n of fs.readdirSync(d)){
    const p=path.join(d,n);
    if (n==='node_modules'||n==='coverage'||n.startsWith('.cleanup_')) continue;
    const st=fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.(t|j)sx$/.test(n)){
      const s=fs.readFileSync(p,'utf8');
      const cnt=(s.match(/<Optimized(Image|Picture)\b[^>]*\bpriority\b/gi)||[]).length;
      if (cnt>1 && !/img-priority-guard:\s*allow/im.test(s)) bad.push({file:p,cnt});
    }
  }
}
if (fs.existsSync('src')) walk('src');
if (bad.length){ console.error('img-priority-guard: files with >1 priority', bad); process.exit(1); }
console.log('img-priority-guard: OK');
