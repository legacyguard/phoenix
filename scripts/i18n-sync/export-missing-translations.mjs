#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const localesRoot = '/Users/luborfedak/Documents/Github/phoenix/src/i18n/locales';
const outRoot = '/Users/luborfedak/Documents/Github/phoenix/scripts/i18n-sync/output';

function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true}); }
function listLangs(){ return fs.readdirSync(localesRoot).filter(f => fs.statSync(path.join(localesRoot,f)).isDirectory()); }
function listJson(dir){ return fs.readdirSync(dir).filter(f => f.endsWith('.json')).sort(); }
function readJson(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }

function collectMissing(enNode, langNode, basePath, out){
  const et = Object.prototype.toString.call(enNode);
  const lt = Object.prototype.toString.call(langNode);
  if(et !== lt){
    // Type mismatch: treat entire branch as missing
    out.push(basePath);
    return;
  }
  if(et === '[object Object]'){
    for(const k of Object.keys(enNode)){
      collectMissing(enNode[k], langNode ? langNode[k] : undefined, basePath ? `${basePath}.${k}` : k, out);
    }
  } else if(et === '[object Array]'){
    const len = enNode.length;
    for(let i=0;i<len;i++){
      collectMissing(enNode[i], (langNode||[])[i], `${basePath}[${i}]`, out);
    }
  } else if(et === '[object String]'){
    const v = langNode;
    if(typeof v !== 'string' || v.trim() === ''){
      out.push(basePath);
    }
  }
}

function main(){
  ensureDir(outRoot);
  const langs = listLangs();
  const enDir = path.join(localesRoot, 'en');
  const enFiles = listJson(enDir);
  const summary = {};

  for(const lang of langs){
    if(lang === 'en') continue;
    const langDir = path.join(localesRoot, lang);
    const perLang = {};
    let count = 0;
    for(const file of enFiles){
      const enPath = path.join(enDir, file);
      const langPath = path.join(langDir, file);
      if(!fs.existsSync(langPath)){
        perLang[file] = ['<entire file missing>'];
        continue;
      }
      const enData = readJson(enPath);
      const langData = readJson(langPath);
      const missing = [];
      collectMissing(enData, langData, '', missing);
      if(missing.length){ perLang[file] = missing; count += missing.length; }
    }
    const outPath = path.join(outRoot, `missing-translations-${lang}.json`);
    fs.writeFileSync(outPath, JSON.stringify(perLang, null, 2)+'\n','utf8');
    summary[lang] = { filesWithMissing: Object.keys(perLang).length, totalMissing: count, output: outPath };
  }
  const summaryPath = path.join(outRoot, 'missing-translations-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2)+'\n','utf8');
  console.log(JSON.stringify({ ok:true, summaryPath, summary }, null, 2));
}

main();
