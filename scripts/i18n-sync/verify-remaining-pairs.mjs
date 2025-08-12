#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const projectRoot = '/Users/luborfedak/Documents/Github/phoenix';
const localesRoot = path.join(projectRoot, 'src/i18n/locales');
const outputRoot = path.join(projectRoot, 'scripts/i18n-sync/output');

function readJson(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }
function exists(p){ try{ fs.accessSync(p); return true; } catch{ return false; } }
function listLangs(){ return fs.readdirSync(localesRoot).filter(f => fs.statSync(path.join(localesRoot,f)).isDirectory()); }
function getAtPath(obj, pathStr){ if(!pathStr) return obj; const segs = pathStr.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean); let cur=obj; for(const s of segs){ if(cur==null) return undefined; cur = cur[s]; } return cur; }

function main(){
  const langs = listLangs().filter(l => l!=='en' && l!=='me');
  const summary = {};
  for(const lang of langs){
    const missPath = path.join(outputRoot, `missing-translations-${lang}.json`);
    if(!exists(missPath)) continue;
    const missingPerFile = readJson(missPath);
    const enDir = path.join(localesRoot, 'en');
    const langDir = path.join(localesRoot, lang);
    const pairs = [];
    for(const [file, paths] of Object.entries(missingPerFile)){
      const enPath = path.join(enDir, file);
      const langPath = path.join(langDir, file);
      if(!exists(enPath) || !exists(langPath)) continue;
      const enData = readJson(enPath);
      const lgData = readJson(langPath);
      for(const p of paths){
        const enVal = getAtPath(enData, p);
        const lgVal = getAtPath(lgData, p);
        pairs.push({ file, path: p, en: enVal, lang: lgVal });
      }
    }
    summary[lang] = { count: pairs.length, pairs };
  }
  console.log(JSON.stringify({ ok:true, summary }, null, 2));
}

main();
