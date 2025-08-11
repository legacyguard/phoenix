const fs=require('fs'), path=require('path');
const args = process.argv.slice(2);
const LOC = args[args.length-3];
const BASE = args[args.length-2];
const BDIR = args[args.length-1-1];
const OUT  = args[args.length-1];
const FILES = args.slice(0,-4);

function backup(p){ 
  const b=path.join(BDIR,'files',p); 
  fs.mkdirSync(path.dirname(b),{recursive:true}); 
  if (fs.existsSync(p)) fs.copyFileSync(p,b); 
}
function ensureDir(p){ fs.mkdirSync(path.dirname(p),{recursive:true}); }
function read(p){ return fs.readFileSync(p,'utf8'); }
function write(p,s){ ensureDir(p); fs.writeFileSync(p,s); }

const usedKeys = new Set();
const changeStats = [];

function namespacify(txt){
  let changes=0;
  
  // settings.foo.bar -> settings:foo.bar
  txt = txt.replace(/(\bt\s*\(\s*['"])settings\.([a-zA-Z0-9_.-]+)(['"]\s*\))/g,
    (m,p,rest,suf)=>{ 
      usedKeys.add(`settings:${suf}`); 
      changes++; 
      return `${p}settings:${suf}${suf}`.replace(`${suf}${suf}`,`${suf}`); 
    });
  txt = txt.replace(/((?:i18n(?:ext)?\.t)\s*\(\s*['"])settings\.([a-zA-Z0-9_.-]+)(['"]\s*\))/g,
    (m,p,rest,suf)=>{ 
      usedKeys.add(`settings:${suf}`); 
      changes++; 
      return `${p}settings:${suf}${suf}`.replace(`${suf}${suf}`,`${suf}`); 
    });
  txt = txt.replace(/(i18nKey\s*=\s*['"])settings\.([a-zA-Z0-9_.-]+)(['"])/g,
    (m,p,rest,suf)=>{ 
      usedKeys.add(`settings:${suf}`); 
      changes++; 
      return `${p}settings:${suf}${suf}`.replace(`${suf}${suf}`,`${suf}`); 
    });

  // notifications.foo.bar -> notifications:foo.bar
  txt = txt.replace(/(\bt\s*\(\s*['"])notifications\.([a-zA-Z0-9_.-]+)(['"]\s*\))/g,
    (m,p,rest,suf)=>{ 
      usedKeys.add(`notifications:${suf}`); 
      changes++; 
      return `${p}notifications:${suf}${suf}`.replace(`${suf}${suf}`,`${suf}`); 
    });
  txt = txt.replace(/((?:i18n(?:ext)?\.t)\s*\(\s*['"])notifications\.([a-zA-Z0-9_.-]+)(['"]\s*\))/g,
    (m,p,rest,suf)=>{ 
      usedKeys.add(`notifications:${suf}`); 
      changes++; 
      return `${p}notifications:${suf}${suf}`.replace(`${suf}${suf}`,`${suf}`); 
    });
  txt = txt.replace(/(i18nKey\s*=\s*['"])notifications\.([a-zA-Z0-9_.-]+)(['"])/g,
    (m,p,rest,suf)=>{ 
      usedKeys.add(`notifications:${suf}`); 
      changes++; 
      return `${p}notifications:${suf}${suf}`.replace(`${suf}${suf}`,`${suf}`); 
    });

  return {txt, changes};
}

console.log("A) Upravujem komponenty/testy...");
// A) uprav komponenty/testy – doplň namespace
for (const f of FILES){
  if (!f) continue;
  let txt=''; 
  try{ txt=read(f); } catch{ continue; }
  const before = txt;
  const r = namespacify(txt);
  if (r.changes>0){
    backup(f); 
    write(f, r.txt);
    changeStats.push({file:f, changes:r.changes});
    console.log(`  ✓ ${f}: ${r.changes} changes`);
  }
}

// B) seed en preklady pre zrejmé kľúče
function get(obj, pathStr){ 
  return pathStr.split('.').reduce((o,k)=> (o||{})[k], obj); 
}
function set(obj, pathStr, val){
  const keys=pathStr.split('.'); 
  let cur=obj;
  for (let i=0;i<keys.length-1;i++){ 
    const k=keys[i]; 
    cur[k]??={}; 
    cur=cur[k]; 
  }
  cur[keys.at(-1)] = val;
}
function seed(ns, obj){
  const file = path.join(LOC, BASE, `${ns}.json`);
  let json={}; 
  if (fs.existsSync(file)) try{ 
    json = JSON.parse(fs.readFileSync(file,'utf8')); 
  }catch{}
  let added=0;
  for (const [k,v] of Object.entries(obj)){
    if (get(json,k) === undefined){ 
      set(json,k,v); 
      added++; 
    }
  }
  if (added>0){
    ensureDir(file); 
    fs.writeFileSync(file, JSON.stringify(json,null,2)+'\n'); 
  }
  return {file, added};
}

console.log("B) Seedujem en preklady...");
// C) konkrétne copy, aby testy prešli
const settingsSeeds = {
  // očakávané v testoch PrivacyControlPanel
  "actions.save": "Save Privacy Settings",
  "title": "Privacy Settings",
  "description": "Manage your privacy preferences",
};

const notificationsSeeds = {
  // očakávané v testoch Email Notifications (heuristika)
  "email.enable": "Enable email notifications",
  "email.disable": "Disable email notifications",
  "email.test": "Send test email",
  "frequency.daily": "Daily summary",
  "frequency.weekly": "Weekly summary",
  "frequency.monthly": "Monthly summary",
  "saved": "Notification settings saved",
  "title": "Email notifications",
  "description": "Choose how often we email you",
};

const seeded = [];
if ([...usedKeys].some(k=>k.startsWith('settings:'))) {
  const r = seed('settings', settingsSeeds); 
  seeded.push({...r, ns:'settings'});
  console.log(`  ✓ settings.json: ${r.added} keys added`);
}
if ([...usedKeys].some(k=>k.startsWith('notifications:'))) {
  const r = seed('notifications', notificationsSeeds); 
  seeded.push({...r, ns:'notifications'});
  console.log(`  ✓ notifications.json: ${r.added} keys added`);
}

// D) výstup
const summary = {
  filesTouched: changeStats.length,
  totalKeyRefs: [...usedKeys].length,
  usedKeys: [...usedKeys].sort(),
  seeds: seeded,
  changes: changeStats,
};
write(path.join(OUT,'_summary.json'), JSON.stringify(summary, null, 2));
console.log("== PRIVACY+NOTIF I18N SUMMARY ==");
console.log(JSON.stringify(summary,null,2));
