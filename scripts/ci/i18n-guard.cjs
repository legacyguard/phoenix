const fs=require('fs'), path=require('path');
const argv=new Set(process.argv.slice(2));
const STRICT=argv.has('--strict');
const WRITE=argv.has('--write-baseline');
const SRC_DIR='src';
const BASE_PATH=path.join('scripts','ci','i18n-guard-baseline.json');

function listFiles(dir){
  const out=[]; (function walk(d){
    for (const n of fs.readdirSync(d)){
      if (n==='node_modules'||n.startsWith('.cleanup_')||n==='coverage') continue;
      const p=path.join(d,n); const st=fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (/\.(t|j)sx?$/.test(n)) out.push(p);
    }
  })(dir); return out;
}

function scan(){
  const files=listFiles(SRC_DIR);
  const REs=[
    /(?:^|[^a-zA-Z0-9_])t\s*\(\s*['"]([^'"]+)['"]\s*[\),]/g,
    /i18n(?:ext)?\.t\s*\(\s*['"]([^'"]+)['"]\s*[\),]/g,
    /i18nKey\s*=\s*['"]([^'"]+)['"]/g,
  ];
  const offenders=[]; // {file,line,key}
  for (const f of files){
    const txt=fs.readFileSync(f,'utf8');
    for (const re of REs){
      re.lastIndex=0; let m;
      while ((m=re.exec(txt))){
        const key=m[1];
        if (!key.includes(':')){
          const line = txt.slice(0,m.index).split('\n').length;
          offenders.push({file:f, line, key});
        }
      }
    }
  }
  return offenders;
}

function toCounts(list){
  const m=new Map(); // file -> key -> count
  for (const {file,key} of list){
    if (!m.has(file)) m.set(file,new Map());
    const fm=m.get(file);
    fm.set(key, (fm.get(key)||0)+1);
  }
  return m;
}
function sumCounts(m){ let s=0; for (const fm of m.values()) for (const c of fm.values()) s+=c; return s; }

const curList = scan();
const cur = toCounts(curList);

if (WRITE){
  const obj={};
  for (const [file,fm] of cur.entries()){
    obj[file]={}; for (const [k,c] of fm.entries()) obj[file][k]=c;
  }
  fs.mkdirSync(path.dirname(BASE_PATH),{recursive:true});
  fs.writeFileSync(BASE_PATH, JSON.stringify(obj,null,2)+'\n');
  console.log(`i18n-guard: baseline written (${sumCounts(cur)} offenses) -> ${BASE_PATH}`);
  process.exit(0);
}

if (STRICT || !fs.existsSync(BASE_PATH)){
  // strict: fail ak čokoľvek existuje
  const total = sumCounts(cur);
  if (total>0){
    console.error(`i18n-guard STRICT: found ${total} un-namespaced keys`);
    for (const {file,line,key} of curList.slice(0,200)) console.error(`${file}:${line}  ${key}`);
    process.exit(1);
  }
  console.log('i18n-guard STRICT: OK');
  process.exit(0);
}

// baseline režim: fail len na nové porušenia
const baseRaw = JSON.parse(fs.readFileSync(BASE_PATH,'utf8'));
const base = new Map(Object.entries(baseRaw).map(([f,km])=>[f,new Map(Object.entries(km).map(([k,c])=>[k,Number(c)||0]))]));

let newCount=0, filesTouched=0;
const details=[];
for (const [file,fm] of cur.entries()){
  const bm = base.get(file) || new Map();
  for (const [k,c] of fm.entries()){
    const diff = c - (bm.get(k)||0);
    if (diff>0){ newCount+=diff; filesTouched++; details.push({file,key:k,delta:diff}); }
  }
}

const totalCur = sumCounts(cur);
const totalBase = sumCounts(base);

if (newCount>0){
  console.error(`i18n-guard BASELINE: total=${totalCur}  baseline=${totalBase}  NEW=${newCount}`);
  for (const d of details.slice(0,200)) console.error(`${d.file}  ${d.key}  +${d.delta}`);
  process.exit(1);
}
console.log(`i18n-guard BASELINE: OK (total=${totalCur}, baseline=${totalBase}, new=0)`);
