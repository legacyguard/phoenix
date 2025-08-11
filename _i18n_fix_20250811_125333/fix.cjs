const fs=require('fs'), path=require('path');
const [LOC, BASE, ADIR, OUT]=process.argv.slice(2);

const readJSON=(p)=>JSON.parse(fs.readFileSync(p,'utf8'));
const writeJSON=(p,obj)=>fs.writeFileSync(p, JSON.stringify(obj, null, 2) + '\n');
const ensureDir=(p)=>fs.mkdirSync(path.dirname(p), {recursive:true});
const exists=(p)=>{ try{ fs.accessSync(p); return true; } catch{ return false; } };

const locales = fs.readdirSync(LOC).filter(d=>fs.statSync(path.join(LOC,d)).isDirectory());
const missingByLocale = readJSON(path.join(ADIR,'missing_by_locale.json'));
const unusedInBase     = readJSON(path.join(ADIR,'unused_in_base.json')).unused || [];
let placeholderMismatch=[]; try{ placeholderMismatch = readJSON(path.join(ADIR,'placeholder_mismatch.json')); } catch{}

function getNsFile(locale, ns){
  return path.join(LOC, locale, `${ns}.json`);
}
function get(obj, pathStr){
  return pathStr.split('.').reduce((o,k)=>o && o[k]!=null ? o[k] : undefined, obj);
}
function set(obj, pathStr, val){
  const keys = pathStr.split('.');
  let cur=obj;
  for (let i=0;i<keys.length-1;i++){
    const k=keys[i]; if (typeof cur[k] !== 'object' || cur[k]==null || Array.isArray(cur[k])) cur[k]={};
    cur=cur[k];
  }
  cur[keys[keys.length-1]] = val;
}
function del(obj, pathStr){
  const keys = pathStr.split('.');
  const stack = [];
  let cur=obj;
  for (let i=0;i<keys.length-1;i++){
    const k=keys[i];
    if (typeof cur[k] !== 'object' || cur[k]==null) return false;
    stack.push([cur,k]); cur=cur[k];
  }
  const leaf=keys[keys.length-1];
  if (!(leaf in cur)) return false;
  delete cur[leaf];
  // prune empty objects up the chain
  for (let i=stack.length-1;i>=0;i--){
    const [parent,k]=stack[i];
    if (parent && typeof parent[k]==='object' && parent[k] && !Array.isArray(parent[k]) && Object.keys(parent[k]).length===0){
      delete parent[k];
    } else break;
  }
  return true;
}
function placeholders(str){
  const set=new Set();
  if (typeof str==='string'){
    for (const m of str.matchAll(/\{\{\s*([^{}\s]+)\s*\}\}/g)) set.add(m[1]);
  }
  return set;
}

const summary = {
  base: BASE,
  locales,
  added:{}, deleted:{}, placeholdersAligned:[], filesTouched:new Set(),
};

function addMissing(){
  for (const loc of locales){
    const missing = missingByLocale[loc] || [];
    let addCount=0;
    for (const full of missing){
      const [ns, rest] = full.split(':');
      const f = getNsFile(loc, ns);
      if (!exists(f)) continue;
      const json = readJSON(f);
      // ak už existuje, preskoč
      if (get(json, rest) !== undefined) continue;
      const placeholder = (loc===BASE)
        ? `[MISSING] ${ns}:${rest}`
        : `[TODO-TRANSLATE] ${ns}:${rest}`;
      set(json, rest, placeholder);
      ensureDir(f); writeJSON(f, json);
      summary.filesTouched.add(f);
      addCount++;
    }
    summary.added[loc]=addCount;
  }
}

function deleteUnused(){
  // mažeme podľa zoznamu z BASE vo VŠETKÝCH lokalizáciách
  const perLocDel = {};
  for (const loc of locales) perLocDel[loc]=0;
  for (const full of unusedInBase){
    const [ns, rest] = full.split(':');
    for (const loc of locales){
      const f=getNsFile(loc, ns);
      if (!exists(f)) continue;
      const json=readJSON(f);
      const ok = del(json, rest);
      if (ok){
        ensureDir(f); writeJSON(f, json);
        summary.filesTouched.add(f);
        perLocDel[loc]++;
      }
    }
  }
  summary.deleted = perLocDel;
}

function alignPlaceholders(){
  for (const m of placeholderMismatch){
    const [ns,rest] = m.key.split(':');
    const baseLoc = m.base || BASE;
    const fbase = getNsFile(baseLoc, ns);
    if (!exists(fbase)) continue;
    const jb = readJSON(fbase);
    const baseVal = get(jb, rest);
    const basePH = new Set(m.basePlaceholders||[]);
    for (const loc of (m.locale? [m.locale] : locales)){
      if (loc===baseLoc) continue;
      const f = getNsFile(loc, ns);
      if (!exists(f)) continue;
      const j = readJSON(f);
      let val = get(j, rest);
      if (typeof val !== 'string') continue;
      const curPH = placeholders(val);
      let changed=false;
      for (const p of basePH){
        if (!curPH.has(p)){
          val = `${val} {{${p}}}`; changed=true;
        }
      }
      if (changed){
        set(j, rest, val);
        ensureDir(f); writeJSON(f, j);
        summary.filesTouched.add(f);
        summary.placeholdersAligned.push({locale:loc, key:m.key});
      }
    }
  }
}

addMissing();
deleteUnused();
alignPlaceholders();

// persist summary
const sumOut = {
  base: summary.base,
  locales: summary.locales,
  added: summary.added,
  deleted: summary.deleted,
  placeholdersAligned: summary.placeholdersAligned.length,
  filesTouched: [...summary.filesTouched].length
};
fs.writeFileSync(path.join(OUT,'_summary.json'), JSON.stringify(sumOut,null,2));
console.log("== I18N FIX SUMMARY ==");
console.log(JSON.stringify(sumOut, null, 2));
