#!/usr/bin/env node
import fs from 'fs';
import path from 'path';

const localesRoot = '/Users/luborfedak/Documents/Github/phoenix/src/i18n/locales';
const missingFile = '/Users/luborfedak/Documents/Github/phoenix/scripts/i18n-sync/output/missing-translations-bg.json';

function readJson(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }
function writeJson(p, obj){ fs.writeFileSync(p, JSON.stringify(obj, null, 2)+'\n','utf8'); }
function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true}); }
function timestamp(){ const d=new Date(); const pad=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`; }

const enDir = path.join(localesRoot, 'en');
const bgDir = path.join(localesRoot, 'bg');

function walkPairs(enNode, bgNode, dict){
  const et = Object.prototype.toString.call(enNode);
  const lt = Object.prototype.toString.call(bgNode);
  if(et !== lt) return;
  if(et === '[object Object]'){
    for(const k of Object.keys(enNode)) walkPairs(enNode[k], bgNode ? bgNode[k] : undefined, dict);
  } else if(et === '[object Array]'){
    for(let i=0;i<enNode.length;i++) walkPairs(enNode[i], (bgNode||[])[i], dict);
  } else if(et === '[object String]'){
    const enStr = (enNode||'').trim();
    const bgStr = typeof bgNode === 'string' ? bgNode.trim() : '';
    if(enStr && bgStr && enStr !== bgStr){
      if(!dict[enStr]) dict[enStr] = {};
      dict[enStr][bgStr] = (dict[enStr][bgStr]||0)+1;
    }
  }
}

function getAtPath(obj, pathStr){
  if(!pathStr) return obj;
  const segs = pathStr.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  let cur = obj;
  for(const s of segs){ if(cur==null) return undefined; cur = cur[s]; }
  return cur;
}
function setAtPath(obj, pathStr, value){
  const segs = pathStr.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean);
  let cur = obj;
  for(let i=0;i<segs.length-1;i++){
    const s = segs[i];
    if(!(s in cur) || typeof cur[s] !== 'object' || cur[s]===null){
      // decide if next is index
      const next = segs[i+1];
      if(/^\d+$/.test(next)) cur[s] = [];
      else cur[s] = {};
    }
    cur = cur[s];
  }
  const last = segs[segs.length-1];
  cur[last] = value;
}

function buildDictionary(){
  const dict = {}; // enStr -> { bgStr: count }
  const enFiles = fs.readdirSync(enDir).filter(f=>f.endsWith('.json'));
  for(const file of enFiles){
    const enData = readJson(path.join(enDir, file));
    const bgPath = path.join(bgDir, file);
    if(!fs.existsSync(bgPath)) continue;
    const bgData = readJson(bgPath);
    walkPairs(enData, bgData, dict);
  }
  // reduce to most frequent
  const best = {};
  for(const [enStr, options] of Object.entries(dict)){
    let max=-1, sel='';
    for(const [bgStr, cnt] of Object.entries(options)){
      if(cnt>max){ max=cnt; sel=bgStr; }
    }
    best[enStr] = sel;
  }
  return best;
}

function main(){
  if(!fs.existsSync(missingFile)){
    console.error('Missing file with missing keys:', missingFile);
    process.exit(1);
  }
  const missingPerFile = readJson(missingFile);
  const dict = buildDictionary();
  const backupDir = path.join(bgDir, `.backup-fill-${timestamp()}`);
  ensureDir(backupDir);
  const report = { filled: 0, unresolved: 0, items: [] };

  for(const [file, paths] of Object.entries(missingPerFile)){
    const enPath = path.join(enDir, file);
    const bgPath = path.join(bgDir, file);
    if(!fs.existsSync(enPath) || !fs.existsSync(bgPath)) continue;
    const enData = readJson(enPath);
    const bgData = readJson(bgPath);

    let changed = false;
    for(const p of paths){
      const enVal = getAtPath(enData, p);
      if(typeof enVal === 'string'){
        const suggestion = dict[enVal.trim()];
        if(suggestion){
          setAtPath(bgData, p, suggestion);
          changed = true;
          report.filled++;
          report.items.push({ file, path: p, en: enVal, bg: suggestion });
        } else {
          report.unresolved++;
          report.items.push({ file, path: p, en: enVal, bg: '' });
        }
      }
    }

    if(changed){
      const curr = fs.readFileSync(bgPath,'utf8');
      fs.writeFileSync(path.join(backupDir, file), curr, 'utf8');
      writeJson(bgPath, bgData);
    }
  }

  console.log(JSON.stringify({ ok:true, filled: report.filled, unresolved: report.unresolved }, null, 2));
}

main();
