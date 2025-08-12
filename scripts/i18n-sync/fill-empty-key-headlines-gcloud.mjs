#!/usr/bin/env node
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

const projectRoot = '/Users/luborfedak/Documents/Github/phoenix';
const localesRoot = path.join(projectRoot, 'src/i18n/locales');
const outputRoot = path.join(projectRoot, 'scripts/i18n-sync/output');
const saFile = path.join(projectRoot, 'norse-wavelet-468619-s1-d1c9ea290fa3.json');

function readJson(p){ return JSON.parse(fs.readFileSync(p,'utf8')); }
function writeJson(p, obj){ fs.writeFileSync(p, JSON.stringify(obj, null, 2)+'\n','utf8'); }
function exists(p){ try{ fs.accessSync(p); return true; } catch{ return false; } }
function listLangs(){ return fs.readdirSync(localesRoot).filter(f=> fs.statSync(path.join(localesRoot,f)).isDirectory()); }
function timestamp(){ const d=new Date(); const pad=n=>String(n).padStart(2,'0'); return `${d.getFullYear()}${pad(d.getMonth()+1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`; }

function getNodeAt(obj, pathStr){ if(!pathStr) return obj; const segs = pathStr.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean); let cur=obj; for(const s of segs){ if(cur==null) return undefined; cur = cur[s]; } return cur; }
function ensureObjectAt(obj, pathStr){ const segs = pathStr.replace(/\[(\d+)\]/g, '.$1').split('.').filter(Boolean); let cur=obj; for(const s of segs){ if(!(s in cur) || typeof cur[s] !== 'object' || cur[s]===null){ cur[s] = {}; } cur = cur[s]; } return cur; }

function createJwt(sa, scope){ const header={alg:'RS256',typ:'JWT'}; const now=Math.floor(Date.now()/1000); const claims={ iss:sa.client_email, scope, aud:'https://oauth2.googleapis.com/token', exp:now+3600, iat:now }; const b64=obj=>Buffer.from(JSON.stringify(obj)).toString('base64url'); const data=`${b64(header)}.${b64(claims)}`; const sign=crypto.createSign('RSA-SHA256'); sign.update(data); const signature=sign.sign(sa.private_key,'base64url'); return `${data}.${signature}`; }
async function getAccessToken(sa, scope){ const assertion=createJwt(sa, scope); const resp=await fetch('https://oauth2.googleapis.com/token',{ method:'POST', headers:{'Content-Type':'application/x-www-form-urlencoded'}, body:new URLSearchParams({ grant_type:'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion })}); if(!resp.ok){ const text=await resp.text(); throw new Error(`Token exchange failed: ${resp.status} ${text}`);} const json=await resp.json(); return json.access_token; }
function mapTargetLang(lang){
  // Google Cloud Translate does not support 'me' (Montenegrin). Use Serbian 'sr' as the closest fallback.
  if(lang === 'me') return 'sr';
  return lang;
}
async function translateOne(accessToken, projectId, text, target){ const url=`https://translation.googleapis.com/v3/projects/${projectId}/locations/global:translateText`; const body={ contents:[text], targetLanguageCode: mapTargetLang(target), sourceLanguageCode:'en', mimeType:'text/plain' }; const resp=await fetch(url,{ method:'POST', headers:{ 'Authorization':`Bearer ${accessToken}`,'Content-Type':'application/json'}, body: JSON.stringify(body)}); if(!resp.ok){ const t=await resp.text(); throw new Error(`Translate failed: ${resp.status} ${t}`);} const json=await resp.json(); return (json.translations&&json.translations[0]&&json.translations[0].translatedText)||''; }

async function main(){
  if(!exists(saFile)){ console.error('Service account file not found'); process.exit(1); }
  const sa = readJson(saFile); const projectId = sa.project_id; const accessToken = await getAccessToken(sa, 'https://www.googleapis.com/auth/cloud-translation');

  const enDir = path.join(localesRoot, 'en');
  // Exclude 'me' to avoid any unintended replacement via API; handle ME manually if needed
  const langs = listLangs().filter(l=> l!=='en' && l!=='me');
  const targetKeyGroups = [
    'respectful.landing.understanding.',
    'respectful.landing.process.',
    'respectful.landing.benefits.',
    'respectful.landing.testimonials.',
    'respectful.landing.security.'
  ];

  const results = {};
  for(const lang of langs){
    const missingPath = path.join(outputRoot, `missing-translations-${lang}.json`);
    if(!exists(missingPath)) continue;
    const missing = readJson(missingPath);
    const langDir = path.join(localesRoot, lang);
    const file = 'onboarding.json';
    if(!missing[file]){ results[lang]={updated:0}; continue; }

    // Filter to the 5 specific paths
    const paths = missing[file].filter(p=> targetKeyGroups.includes(p));
    if(paths.length===0){ results[lang]={updated:0}; continue; }

    const enData = readJson(path.join(enDir, file));
    const langPath = path.join(langDir, file);
    if(!exists(langPath)) continue;
    const lgData = readJson(langPath);

    let updated=0; const backupDir = path.join(langDir, `.backup-gtranslate-${timestamp()}`); if(!exists(backupDir)) fs.mkdirSync(backupDir,{recursive:true}); const before = fs.readFileSync(langPath,'utf8');
    for(const base of paths){
      const enNode = getNodeAt(enData, base);
      if(enNode && typeof enNode === 'object' && typeof enNode[''] === 'string' && enNode[''].trim()){
        const enText = enNode[''];
        const tr = await translateOne(accessToken, projectId, enText, lang);
        const lgNode = ensureObjectAt(lgData, base);
        if(!lgNode[''] || lgNode[''].trim() === ''){ lgNode[''] = tr; updated++; }
      }
    }
    if(updated>0){ fs.writeFileSync(path.join(backupDir, file), before, 'utf8'); writeJson(langPath, lgData); }
    results[lang] = { updated };
  }

  console.log(JSON.stringify({ ok:true, results }, null, 2));
}

if (typeof fetch === 'undefined'){
  global.fetch = (...args)=> import('node-fetch').then(({default: fetch})=> fetch(...args));
}

main().catch(e=>{ console.error('ERROR:', e.message); process.exit(1); });
