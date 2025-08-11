const fs=require('fs'), path=require('path');
const args=new Set(process.argv.slice(2));
const WRITE=args.has('--write-baseline');
const STRICT=args.has('--strict');
const ROOTS=['src']; // rozšír ak chceš
const ALLOW=new Set((process.env.CONSOLE_ALLOW||'error,warn').split(',').map(s=>s.trim()));
const BASE=path.join('scripts','ci','console-baseline.json');

function list(){ const out=[];
  function walk(d){ for(const n of fs.readdirSync(d)){ const p=path.join(d,n);
    if (n==='node_modules'||n==='coverage'||n.startsWith('.cleanup_')) continue;
    const st=fs.statSync(p);
    if (st.isDirectory()) walk(p);
    else if (/\.(t|j)sx?$/.test(n)) out.push(p);
  }}
  for (const r of ROOTS) if (fs.existsSync(r)) walk(r);
  return out;
}
function scan(){
  const bad=[];
  for (const f of list()){
    const s=fs.readFileSync(f,'utf8').split('\n');
    s.forEach((ln,i)=>{
      const m=ln.match(/\bconsole\.(\w+)\s*\(/);
      if (m && !ALLOW.has(m[1])) bad.push({file:f,line:i+1,kind:`console.${m[1]}`});
      if (/\bdebugger;?/.test(ln)) bad.push({file:f,line:i+1,kind:'debugger'});
    });
  }
  return bad;
}
function toMap(list){
  const m=new Map();
  for (const {file,kind} of list){
    const k = `${file}::${kind}`;
    m.set(k, (m.get(k)||0)+1);
  }
  return m;
}

const curList = scan();
const cur = toMap(curList);

if (WRITE || !fs.existsSync(BASE)){
  const obj={}; for (const [k,c] of cur.entries()) obj[k]=c;
  fs.mkdirSync(path.dirname(BASE),{recursive:true});
  fs.writeFileSync(BASE, JSON.stringify(obj,null,2));
  console.log(`console-guard: baseline written (${curList.length} hits)`);
  process.exit(0);
}

if (STRICT){
  if (curList.length){ 
    console.error('console-guard STRICT: violations:', curList.length);
    curList.slice(0,200).forEach(v=>console.error(`${v.file}:${v.line} ${v.kind}`));
    process.exit(1);
  }
  console.log('console-guard STRICT: OK');
  process.exit(0);
}

// baseline režim – fail len na NOVÉ výskyty
const base = new Map(Object.entries(JSON.parse(fs.readFileSync(BASE,'utf8'))));
let newCnt=0; const details=[];
for (const [k,c] of cur.entries()){
  const diff = c - (base.get(k)||0);
  if (diff>0){ newCnt+=diff; details.push({k,delta:diff}); }
}
if (newCnt>0){
  console.error(`console-guard BASELINE: NEW=${newCnt}`);
  details.slice(0,200).forEach(d=>console.error(`${d.k} +${d.delta}`));
  process.exit(1);
}
console.log(`console-guard BASELINE: OK (new=0, total=${curList.length})`);
