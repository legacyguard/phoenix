#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const projectRoot = '/Users/luborfedak/Documents/Github/phoenix';
const localesRoot = path.join(projectRoot, 'src/i18n/locales');
const missingFile = path.join(projectRoot, 'scripts/i18n-sync/output/missing-translations-bg.json');
const saFile = path.join(projectRoot, 'norse-wavelet-468619-s1-d1c9ea290fa3.json');

function readJson(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }
function writeJson(p, obj){ fs.writeFileSync(p, JSON.stringify(obj, null, 2)+'\n','utf8'); }
function ensureDir(p){ if(!fs.existsSync(p)) fs.mkdirSync(p,{recursive:true}); }
function timestamp(){ const d=new Date(); const pad=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`; }

const enDir = path.join(localesRoot, 'en');
const bgDir = path.join(localesRoot, 'bg');

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
      const next = segs[i+1];
      if(/^\d+$/.test(next)) cur[s] = [];
      else cur[s] = {};
    }
    cur = cur[s];
  }
  const last = segs[segs.length-1];
  cur[last] = value;
}

function createJwt(sa, scope){
  const header = { alg: 'RS256', typ: 'JWT' };
  const now = Math.floor(Date.now()/1000);
  const claims = {
    iss: sa.client_email,
    scope,
    aud: 'https://oauth2.googleapis.com/token',
    exp: now + 3600,
    iat: now,
  };
  const b64 = (obj)=> Buffer.from(JSON.stringify(obj)).toString('base64url');
  const data = `${b64(header)}.${b64(claims)}`;
  const sign = crypto.createSign('RSA-SHA256');
  sign.update(data);
  const signature = sign.sign(sa.private_key, 'base64url');
  return `${data}.${signature}`;
}

async function getAccessToken(sa, scope){
  const assertion = createJwt(sa, scope);
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion,
    }),
  });
  if(!resp.ok){
    const text = await resp.text();
    throw new Error(`Token exchange failed: ${resp.status} ${text}`);
  }
  const json = await resp.json();
  return json.access_token;
}

async function translateBatch(accessToken, projectId, texts){
  const url = `https://translation.googleapis.com/v3/projects/${projectId}/locations/global:translateText`;
  const body = {
    contents: texts,
    targetLanguageCode: 'bg',
    sourceLanguageCode: 'en',
    mimeType: 'text/plain',
  };
  const resp = await fetch(url, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if(!resp.ok){
    const t = await resp.text();
    throw new Error(`Translate failed: ${resp.status} ${t}`);
  }
  const json = await resp.json();
  const translations = (json.translations||[]).map(t=>t.translatedText||'');
  return translations;
}

function chunkArray(arr, size){ const out=[]; for(let i=0;i<arr.length;i+=size) out.push(arr.slice(i,i+size)); return out; }

async function main(){
  if(!fs.existsSync(missingFile)){
    console.error('Missing missing-translations file:', missingFile);
    process.exit(1);
  }
  if(!fs.existsSync(saFile)){
    console.error('Service account file not found');
    process.exit(1);
  }
  const sa = readJson(saFile);
  const projectId = sa.project_id;
  // Acquire token with Cloud Translation scope
  const accessToken = await getAccessToken(sa, 'https://www.googleapis.com/auth/cloud-translation');

  const missingPerFile = readJson(missingFile);

  // Build jobs list
  const jobs = [];
  for(const [file, paths] of Object.entries(missingPerFile)){
    const enPath = path.join(enDir, file);
    if(!fs.existsSync(enPath)) continue;
    const enData = readJson(enPath);
    for(const p of paths){
      const enVal = getAtPath(enData, p);
      if(typeof enVal === 'string' && enVal.trim()){
        jobs.push({ file, path: p, text: enVal });
      }
    }
  }

  // Translate in batches (e.g., 50 texts per request)
  const BATCH_SIZE = 50;
  const batches = chunkArray(jobs, BATCH_SIZE);
  let idx=0, filled=0;

  for(const batch of batches){
    const texts = batch.map(j=>j.text);
    const translations = await translateBatch(accessToken, projectId, texts);
    // Apply translations
    const perFileEdits = new Map();
    for(let i=0;i<batch.length;i++){
      const j = batch[i];
      const tr = translations[i] || '';
      if(!perFileEdits.has(j.file)) perFileEdits.set(j.file, []);
      perFileEdits.get(j.file).push({ path: j.path, value: tr });
    }
    for(const [file, edits] of perFileEdits.entries()){
      const bgPath = path.join(bgDir, file);
      if(!fs.existsSync(bgPath)) continue;
      const bgData = readJson(bgPath);
      const backupDir = path.join(bgDir, `.backup-gtranslate-${timestamp()}`);
      if(!fs.existsSync(backupDir)) fs.mkdirSync(backupDir, { recursive:true });
      const before = fs.readFileSync(bgPath,'utf8');
      for(const e of edits){ setAtPath(bgData, e.path, e.value); filled++; }
      writeJson(bgPath, bgData);
      fs.writeFileSync(path.join(backupDir, file), before, 'utf8');
    }
    idx += batch.length;
  }

  console.log(JSON.stringify({ ok:true, translated: filled }, null, 2));
}

// Node18+ fetch polyfill if needed
if (typeof fetch === 'undefined'){
  global.fetch = (...args)=> import('node-fetch').then(({default: fetch})=> fetch(...args));
}

main().catch(e=>{ console.error('ERROR:', e.message); process.exit(1); });
