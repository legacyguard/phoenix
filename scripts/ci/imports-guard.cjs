const fs=require('fs'), path=require('path');

const ROOTS=['src']; // rozšír podľa potreby
const hits=[];

const RULES=[
  {
    name:'date-fns root',
    re:/^\s*import\s+[\s\{\*\w,]+from\s+['"]date-fns['"]\s*;?/m,
    msg:"Nepoužívaj 'date-fns' root. Použi per-function: date-fns/<fn>."
  },
  {
    name:'date-fns locale index',
    re:/^\s*import\s+\{[^}]+\}\s+from\s+['"]date-fns\/locale['"]\s*;?/m,
    msg:"Nepoužívaj 'date-fns/locale' index. Použi date-fns/locale/<xx-YY>."
  },
  {
    name:'lodash default',
    re:/^\s*import\s+[_\w]+\s+from\s+['"]lodash['"]\s*;?|require\(\s*['"]lodash['"]\s*\)/m,
    msg:"Nepoužívaj default/CJS lodash. Použi per-method: lodash/<fn>."
  },
  {
    name:'lucide namespace',
    re:/^\s*import\s+\*\s+as\s+\w+\s+from\s+['"]lucide-react['"]\s*;?/m,
    msg:"Nepoužívaj namespace import z lucide-react. Použi named imports."
  }
];

function walk(dir){
  for (const n of fs.readdirSync(dir)){
    const p=path.join(dir,n);
    if (n==='node_modules'||n==='coverage'||n.startsWith('.cleanup_')) continue;
    const st=fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.(t|j)sx?$/.test(n)){
      const s=fs.readFileSync(p,'utf8');
      RULES.forEach(r=>{
        if (r.re.test(s)){
          hits.push({file:p, rule:r.name, msg:r.msg});
        }
      });
    }
  }
}
for (const r of ROOTS) if (fs.existsSync(r)) walk(r);

if (hits.length){
  console.error(`imports-guard: ${hits.length} porušení`);
  for (const h of hits.slice(0,200)){
    console.error(` - ${h.file}  [${h.rule}]  ${h.msg}`);
  }
  process.exit(1);
}
console.log('imports-guard: OK');
