const fs=require('fs'), path=require('path');
const [COMP, TEST, LOC, BASE, BDIR, OUT] = process.argv.slice(2);

const nsAllow = new Set(['onboarding','dashboard-main','common']); // preferované namespaces

const humanize = (k) => {
  const s = k.split('.').slice(-2).join(' ').replace(/[-_.]/g,' ')
            .replace(/([a-z])([A-Z])/g,'$1 $2').trim();
  return s ? s[0].toUpperCase()+s.slice(1) : k;
};
const get=(obj,p)=>p.split('.').reduce((o,k)=> (o||{})[k], obj);
const set=(obj,p,v)=>{ const a=p.split('.'); let o=obj; for (let i=0;i<a.length-1;i++){ o[a[i]]??={}; o=o[a[i]]; } o[a.at(-1)]=v; };

function backup(p){ const b=path.join(BDIR,'files',p); fs.mkdirSync(path.dirname(b),{recursive:true}); if (fs.existsSync(p)) fs.copyFileSync(p,b); }
function write(p,txt){ fs.mkdirSync(path.dirname(p),{recursive:true}); fs.writeFileSync(p,txt); }

const txt = fs.readFileSync(COMP,'utf8');
const keys = new Set();

// vyťaž i18n kľúče v súbore (t('ns:key'), i18nKey="ns:key")
const reCalls = [
  /[\s\(]t\s*\(\s*['"]([a-zA-Z0-9_-]+):([a-zA-Z0-9_.-]+)['"]\s*[\),]/g,
  /i18n(?:ext)?\.t\s*\(\s*['"]([a-zA-Z0-9_-]+):([a-zA-Z0-9_.-]+)['"]\s*[\),]/g,
  /i18nKey\s*=\s*['"]([a-zA-Z0-9_-]+):([a-zA-Z0-9_.-]+)['"]/g,
];
for (const re of reCalls){
  let m; while ((m=re.exec(txt))) {
    const ns=m[1], rest=m[2];
    if (nsAllow.has(ns)) keys.add(`${ns}:${rest}`);
  }
}

// ak sú v TODO spomenuté kľúče bez namespacu typu respectful.landing.*, predpokladáme onboarding:
const reTodo = /^\s*\/\/.*(TODO).*?([a-z0-9_.-]*respectful\.landing\.[a-z0-9_.-]+)/gim;
let mt; while ((mt = reTodo.exec(txt))) {
  const rest = mt[2].replace(/^onboarding[:.]/,'').replace(/^respectful\./,'respectful.');
  keys.add(`onboarding:${rest}`);
}

const perNs = {};
for (const full of keys){
  const [ns,rest] = full.split(':');
  perNs[ns] ??= new Set();
  perNs[ns].add(rest);
}

// seed EN preklady do príslušných ns súborov
const seeds = [];
for (const [ns,setKeys] of Object.entries(perNs)){
  const file = path.join(LOC, BASE, `${ns}.json`);
  let json={}; if (fs.existsSync(file)) try{ json = JSON.parse(fs.readFileSync(file,'utf8')); }catch{}
  let added=0;
  for (const rest of setKeys){
    if (get(json, rest) === undefined) {
      set(json, rest, humanize(rest));
      added++;
    }
  }
  if (added>0){ backup(file); write(file, JSON.stringify(json,null,2)+'\n'); }
  seeds.push({ns, file, added});
}

// odstráň len i18n TODO riadky z komponentu (necháme ostatné TODO)
const lines = txt.split('\n');
const filtered = lines.filter(l => !(/TODO/i.test(l) && /(i18n|translat|i18next|t\(|i18nKey|respectful\.landing)/i.test(l)));
if (filtered.join('\n') !== txt){ backup(COMP); write(COMP, filtered.join('\n')); }

const summary = {
  file: COMP,
  totalKeys: keys.size,
  namespaces: Object.fromEntries(Object.entries(perNs).map(([k,v])=>[k,[...v].length])),
  seeds,
  todoRemoved: lines.length - filtered.length,
  testFile: TEST || null,
};
write(path.join(OUT,'_summary.json'), JSON.stringify(summary,null,2));
console.log("== RESPECTFUL I18N SUMMARY ==");
console.log(JSON.stringify(summary,null,2));
