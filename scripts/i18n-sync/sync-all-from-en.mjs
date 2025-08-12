#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const root = '/Users/luborfedak/Documents/Github/phoenix/src/i18n/locales';

function listLangs(){
  return fs.readdirSync(root).filter(f => fs.statSync(path.join(root,f)).isDirectory());
}
function listJson(dir){
  return fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort();
}
function readJsonSafe(p){
  try { const t = fs.readFileSync(p,'utf8'); return { ok:true, text:t, data: JSON.parse(t) }; } catch(e){ return { ok:false, error:String(e) }; }
}
function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true}); }
function timestamp(){ const d = new Date(); const pad = n=> String(n).padStart(2,'0'); return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`; }

function reconcile(enVal, langVal){
  const et = Object.prototype.toString.call(enVal);
  const lt = Object.prototype.toString.call(langVal);

  if(et === '[object String]'){
    // If lang has a string and it's non-empty and not identical to English, keep it; else set to empty string
    if(lt === '[object String]'){
      const en = enVal.trim();
      const lv = langVal.trim();
      if(lv && lv !== en) return langVal; // keep translation
    }
    return '';
  }
  if(et === '[object Number]' || et === '[object Boolean]' || enVal === null){
    // Preserve lang if same type; else copy EN to keep shape
    if(et === lt) return langVal;
    return enVal;
  }
  if(et === '[object Array]'){
    const out = [];
    const lArr = Array.isArray(langVal) ? langVal : [];
    for(let i=0;i<enVal.length;i++) out.push(reconcile(enVal[i], lArr[i]));
    return out;
  }
  if(et === '[object Object]'){
    const result = {};
    const lObj = (lt === '[object Object]') ? langVal : {};
    for(const k of Object.keys(enVal)){
      result[k] = reconcile(enVal[k], lObj[k]);
    }
    return result;
  }
  return enVal;
}

function syncLang(lang){
  if(lang === 'en') return { lang, skipped:true, reason:'source' };
  const enDir = path.join(root, 'en');
  const langDir = path.join(root, lang);
  ensureDir(langDir);
  const enFiles = listJson(enDir);
  const backupDir = path.join(langDir, `.backup-${timestamp()}`);
  ensureDir(backupDir);
  const actions = [];

  for(const file of enFiles){
    const enPath = path.join(enDir, file);
    const langPath = path.join(langDir, file);
    const enRes = readJsonSafe(enPath);
    if(!enRes.ok){ actions.push({ file, error:'en_parse_failed', detail: enRes.error }); continue; }

    const langRes = readJsonSafe(langPath);
    const langData = langRes.ok ? langRes.data : undefined;

    const newData = reconcile(enRes.data, langData);
    const newText = JSON.stringify(newData, null, 2) + '\n';

    let changed = true;
    if(fs.existsSync(langPath)){
      const curr = fs.readFileSync(langPath, 'utf8');
      if(curr === newText) changed = false;
      else fs.writeFileSync(path.join(backupDir, file), curr, 'utf8');
    }
    if(changed){ fs.writeFileSync(langPath, newText, 'utf8'); actions.push({ file, action: fs.existsSync(path.join(backupDir,file))? 'updated_with_backup':'created' }); }
    else actions.push({ file, action:'unchanged' });
  }

  // Delete extra files in lang that don't exist in en? We will not delete, just report.
  const extra = listJson(langDir).filter(f => !listJson(path.join(root,'en')).includes(f) && !f.startsWith('.backup-'));
  return { lang, actions, extraFiles: extra };
}

function verifyLang(lang){
  const enDir = path.join(root, 'en');
  const langDir = path.join(root, lang);
  const report = { lang, files: [], missingFiles: [], suspicious: [] };
  const enFiles = listJson(enDir);
  for(const file of enFiles){
    const enP = path.join(enDir, file);
    const langP = path.join(langDir, file);
    const en = readJsonSafe(enP);
    const lg = readJsonSafe(langP);
    if(!lg.ok){ report.missingFiles.push(file); continue; }

    function walk(enNode, lgNode, pathSegs=[]){
      const et = Object.prototype.toString.call(enNode);
      const lt = Object.prototype.toString.call(lgNode);
      if(et !== lt){ report.suspicious.push({ path: pathSegs.join('.'), type:'type_mismatch' }); return; }
      if(et === '[object Object]'){
        for(const k of Object.keys(enNode)) walk(enNode[k], lgNode[k], [...pathSegs, k]);
      } else if(et === '[object Array]'){
        for(let i=0;i<enNode.length;i++) walk(enNode[i], lgNode[i], [...pathSegs, i]);
      } else if(et === '[object String]'){
        const v = lgNode;
        if(v === undefined){ report.suspicious.push({ path: pathSegs.join('.'), type:'missing' }); }
        else if(v === enNode){ report.suspicious.push({ path: pathSegs.join('.'), type:'english_leak' }); }
      }
    }

    walk(en.data, lg.data, []);
    report.files.push(file);
  }
  return report;
}

function main(){
  const langs = listLangs();
  const syncResults = [];
  for(const lang of langs){ syncResults.push(syncLang(lang)); }
  const verifyResults = [];
  for(const lang of langs){ if(lang==='en') continue; verifyResults.push(verifyLang(lang)); }
  console.log(JSON.stringify({ ok:true, syncResults, verifyResults }, null, 2));
}

main();
