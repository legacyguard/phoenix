const fs=require('fs'), path=require('path');
const allow = new Set((process.env.CONSOLE_ALLOW||'error,warn').split(',').map(s=>s.trim()));
const roots=['src']; const bad=[];
function walk(d){ for(const n of fs.readdirSync(d)){ const p=path.join(d,n);
  if (n==='node_modules'||n==='coverage'||n.startsWith('.cleanup_')) continue;
  const st=fs.statSync(p);
  if (st.isDirectory()) walk(d);
  else if (/\.(t|j)sx?$/.test(n)) {
    const s=fs.readFileSync(p,'utf8'); const lines=s.split('\n');
    lines.forEach((ln,i)=>{
      const m=ln.match(/\bconsole\.(\w+)\s*\(/);
      if (m && !allow.has(m[1])) bad.push(`${p}:${i+1} console.${m[1]}`);
      if (/\bdebugger;?/.test(ln)) bad.push(`${p}:${i+1} debugger`);
    });
  }
}}
for (const r of roots) if (fs.existsSync(r)) walk(r);
if (bad.length){ console.error('console-guard: disallowed console/debugger:'); bad.slice(0,200).forEach(x=>console.error(' -',x)); process.exit(1); }
console.log('console-guard: OK (allowed:', [...allow].join(','),')');
