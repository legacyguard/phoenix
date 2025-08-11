const fs=require('fs'), path=require('path');
const [comp, testf, LOC, BASE, BDIR, OUT] = process.argv.slice(2);

function backup(p){ 
  const b=path.join(BDIR,'files',p); 
  fs.mkdirSync(path.dirname(b),{recursive:true}); 
  fs.copyFileSync(p,b); 
}
function ensureDir(p){ fs.mkdirSync(path.dirname(p),{recursive:true}); }
function read(p){ return fs.readFileSync(p,'utf8'); }
function write(p,s){ ensureDir(p); fs.writeFileSync(p,s); }

function namespacify(txt){
  let changes=0, keys=new Set();
  
  // t('assets.zone.xxx') -> t('assets:zone.xxx')
  txt = txt.replace(/(\bt\s*\(\s*['"])assets\.zone\.([a-zA-Z0-9_.-]+)(['"]\s*\))/g,
    (_m,p,rest,suf,q)=>{ changes++; keys.add(`assets:zone.${suf}`); return `${p}assets:zone.${suf}${q}`; });
  
  // i18n.t('assets.zone.xxx') / i18next.t(...)
  txt = txt.replace(/((?:i18n(?:ext)?\.t)\s*\(\s*['"])assets\.zone\.([a-zA-Z0-9_.-]+)(['"]\s*\))/g,
    (_m,p,rest,suf,q)=>{ changes++; keys.add(`assets:zone.${suf}`); return `${p}assets:zone.${suf}${q}`; });
  
  // <Trans i18nKey="assets.zone.xxx">
  txt = txt.replace(/(i18nKey\s*=\s*['"])assets\.zone\.([a-zA-Z0-9_.-]+)(['"])/g,
    (_m,p,rest,suf,q)=>{ changes++; keys.add(`assets:zone.${suf}`); return `${p}assets:zone.${suf}${q}`; });
  
  return {txt, changes, keys:[...keys]};
}

function ensureEnAssets(keys){
  const file = path.join(LOC, BASE, 'assets.json');
  let json={};
  if (fs.existsSync(file)) { 
    try{ json=JSON.parse(fs.readFileSync(file,'utf8')); }catch{} 
  }
  
  const set=(obj,path,val)=>{
    const a=path.split('.'); 
    let o=obj; 
    for (let i=0;i<a.length-1;i++){
      o[a[i]] ??= {}; 
      o=o[a[i]]; 
    } 
    o[a.at(-1)]=val; 
  };
  
  const get=(obj,path)=> path.split('.').reduce((o,k)=> (o||{})[k], obj);

  let added=0;
  for (const full of keys){
    const [ns, rest] = full.split(':'); // ns = 'assets'
    if (!rest.startsWith('zone.')) continue; // len upload zóna
    const sub = rest; // e.g. 'zone.dragAndDrop'
    if (get(json, sub) !== undefined) continue;

    // heuristický text z kľúča (Readable English)
    const label = sub.split('.').slice(1).join(' ').replace(/([a-z])([A-Z])/g,'$1 $2').replace(/\./g,' ').replace(/-/g,' ');
    const nice = label.charAt(0).toUpperCase()+label.slice(1);
    set(json, sub, nice);
    added++;
  }
  
  if (added>0){ 
    write(file, JSON.stringify(json,null,2)+'\n'); 
  }
  return {file, added};
}

const summary = { componentChanged:0, testChanged:0, keys:[], assetsAdded:0, assetsFile:'' };

// Oprav komponent
{
  const before = read(comp);
  const r = namespacify(before);
  if (r.changes>0){
    backup(comp); 
    write(comp, r.txt); 
    summary.componentChanged=r.changes; 
    summary.keys.push(...r.keys); 
  }
}

// Oprav test súbor
if (testf && fs.existsSync(testf)){
  const before = read(testf);
  const r = namespacify(before);
  if (r.changes>0){
    backup(testf); 
    write(testf, r.txt); 
    summary.testChanged=r.changes; 
    summary.keys.push(...r.keys); 
  }
}

summary.keys = [...new Set(summary.keys)];
const ea = ensureEnAssets(summary.keys);
summary.assetsAdded = ea.added; 
summary.assetsFile = ea.file;

write(path.join(OUT,'_summary.json'), JSON.stringify(summary,null,2));
console.log("== SMARTUPLOAD I18N SUMMARY ==");
console.log(JSON.stringify(summary,null,2));
