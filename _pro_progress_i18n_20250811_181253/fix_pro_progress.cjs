const fs=require('fs'), path=require('path');
const argv=process.argv.slice(2);
const LOC=argv[argv.length-4], BASE=argv[argv.length-3], BDIR=argv[argv.length-2], OUT=argv[argv.length-1];
const splitAt = argv.indexOf(LOC);
const COMPS=argv.slice(0, splitAt-0-3); // všetko pred LOC
const TESTS=argv.slice(splitAt-0-3, argv.length-4); // nič, ale necháme pre konzistenciu

const nsAllow = new Set(['dashboard-main','common','onboarding','settings','notifications','emails','ui-elements']);

const humanize = (k) => {
  const s = k.split('.').slice(-2).join(' ').replace(/[-_.]/g,' ')
            .replace(/([a-z])([A-Z])/g,'$1 $2').trim();
  return s ? s[0].toUpperCase()+s.slice(1) : k;
};
const get=(obj,p)=>p.split('.').reduce((o,k)=> (o||{})[k], obj);
const set=(obj,p,v)=>{ const a=p.split('.'); let o=obj; for (let i=0;i<a.length-1;i++){ o[a[i]]??={}; o=o[a[i]]; } o[a.at(-1)]=v; };
const backup=(p)=>{ const b=path.join(BDIR,'files',p); fs.mkdirSync(path.dirname(b),{recursive:true}); if (fs.existsSync(p)) fs.copyFileSync(p,b); };
const write=(p,txt)=>{ fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,txt); };

function extractKeys(txt){
  const keys=new Set();
  const reCalls = [
    /[\s\(]t\s*\(\s*['"]([a-zA-Z0-9_-]+):([a-zA-Z0-9_.-]+)['"]\s*[\),]/g,
    /i18n(?:ext)?\.t\s*\(\s*['"]([a-zA-Z0-9_-]+):([a-zA-Z0-9_.-]+)['"]\s*[\),]/g,
    /i18nKey\s*=\s*['"]([a-zA-Z0-9_-]+):([a-zA-Z0-9_.-]+)['"]/g,
  ];
  for (const re of reCalls){ let m; while ((m=re.exec(txt))) if (nsAllow.has(m[1])) keys.add(`${m[1]}:${m[2]}`); }
  // TODO riadky s explicitnými kľúčmi
  const reTodo = /^\s*\/\/.*TODO.*?\b([a-z0-9_-]+):([a-z0-9_.-]+)\b/ig;
  let mt; while ((mt=reTodo.exec(txt))) if (nsAllow.has(mt[1])) keys.add(`${mt[1]}:${mt[2]}`);
  // bežné vzory bez dvojbodky → dashboard-main
  const reDash = /^\s*\/\/.*TODO.*?\b(dashboard-main\.[a-z0-9_.-]+)\b/igm;
  while ((mt=reDash.exec(txt))) keys.add(`dashboard-main:${mt[1].replace(/^dashboard-main\./,'')}`);
  return keys;
}

function cleanI18nTodos(txt){
  const lines = txt.split('\n');
  const out = lines.filter(l => !(/TODO/i.test(l) && /(i18n|translat|i18next|t\(|i18nKey|dashboard-main\.|common:|onboarding:|settings:|notifications:|emails:)/i.test(l)));
  return {removed: lines.length - out.length, txt: out.join('\n')};
}

const perNs = {};
const perFile = [];

for (const f of COMPS){
  if (!f || !fs.existsSync(f) || fs.statSync(f).isDirectory()) continue;
  const src = fs.readFileSync(f,'utf8');
  const keys = extractKeys(src);
  for (const k of keys){ const [ns,rest]=k.split(':'); (perNs[ns]??=new Set()).add(rest); }
  const {removed, txt} = cleanI18nTodos(src);
  if (removed>0){ backup(f); write(f, txt); }
  perFile.push({file:f, todoRemoved:removed, keyCount:keys.size});
}

const seeds=[];
for (const [ns, setKeys] of Object.entries(perNs)){
  const file = path.join(LOC, BASE, `${ns}.json`);
  let json={}; if (fs.existsSync(file)) try{ json=JSON.parse(fs.readFileSync(file,'utf8')); }catch{}
  let added=0;
  for (const rest of setKeys){
    if (get(json, rest) === undefined){ set(json, rest, humanize(rest)); added++; }
  }
  if (added>0){ backup(file); write(file, JSON.stringify(json,null,2)+'\n'); }
  seeds.push({ns,file,added});
}

const summary={ components: COMPS, perFile, namespaces:Object.fromEntries(Object.entries(perNs).map(([k,v])=>[k,[...v].length])), seeds };
fs.writeFileSync(path.join(OUT,'_summary.json'), JSON.stringify(summary,null,2));
console.log("== PROGRESS/DASH I18N SUMMARY ==");
console.log(JSON.stringify(summary,null,2));
