const fs=require('fs');
const [b,a,o]=process.argv.slice(2);
function count(obj){ try{ const d=JSON.parse(fs.readFileSync(obj,'utf8')); return d.metadata?.vulnerabilities || d.vulnerabilities || {}; }catch{ return {}; } }
function flat(v){ const k=['info','low','moderate','high','critical']; const r={}; for(const x of k) r[x]=v?.[x]||0; return r; }
const before=flat(count(b)), after=flat(count(a));
const lines=[
  `Before  → info:${before.info} low:${before.low} moderate:${before.moderate} high:${before.high} critical:${before.critical}`,
  `After   → info:${after.info} low:${after.low} moderate:${after.moderate} high:${after.high} critical:${after.critical}`,
];
fs.writeFileSync(o, lines.join('\n')+'\n');
console.log(lines.join('\n'));
