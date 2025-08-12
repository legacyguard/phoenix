const fs=require('fs'), path=require('path');

const BASE='scripts/ci/secrets-baseline.json';
const args=new Set(process.argv.slice(2));
const WRITE=args.has('--write-baseline');
const STRICT=args.has('--strict');

const ROOT=process.cwd();
const SRC_DIRS=['src','public','server','functions'].filter(d=>fs.existsSync(d));
const DIST_DIRS=['dist','build'].filter(d=>fs.existsSync(d));

const FILE_RX=/\.(t|j)sx?$|\.json$|\.env(\.local|\.example|\.test)?$|\.md$|\.yml$|\.yaml$/i;
const IGNORE=/node_modules|^\.git\/|^\.cleanup_/;

const PATTERNS=[
  {name:'supabase service role key', re:/SUPABASE_SERVICE_ROLE_KEY|service_role/gi},
  {name:'openai secret (sk-*)',      re:/\bsk-[a-zA-Z0-9_-]{8,}\b/g},
  {name:'clerk secret (sk_*)',       re:/\bsk_(test|live)_[A-Za-z0-9]{20,}\b/g},
  {name:'resend api key',            re:/\bre_[A-Za-z0-9_-]{20,}\b/g},
  {name:'webhook secret',            re:/WEBHOOK_SECRET|SECRET=.*[A-Fa-f0-9]{16,}/g},
  {name:'will encryption key',       re:/WILL_ENCRYPTION_KEY|AES|crypto/gi},
  // zákaz VITE_* pre tajomstvá
  {name:'vite openai key referenced',re:/import\.meta\.env\.VITE_OPENAI_API_KEY/g},
];

function walk(dir){
  const out=[];
  (function rec(d){
    for (const n of fs.readdirSync(d)){
      const p=path.join(d,n);
      if (IGNORE.test(p)) continue;
      const st=fs.statSync(p);
      if (st.isDirectory()) rec(p);
      else if (FILE_RX.test(n)) out.push(p);
    }
  })(dir);
  return out;
}

function scanFiles(files,label){
  const hits=[];
  for (const f of files){
    let s; try { s=fs.readFileSync(f,'utf8'); } catch { continue; }
    for (const p of PATTERNS){
      const m=[...s.matchAll(p.re)].map(mm=>({index: mm.index, match: mm[0]}));
      if (m.length) hits.push({file:path.relative(ROOT,f), pattern:p.name, count:m.length});
    }
  }
  return hits;
}

const srcFiles=[]; for (const d of SRC_DIRS) srcFiles.push(...walk(d));
let distFiles=[]; for (const d of DIST_DIRS) distFiles.push(...walk(d));

const srcHits=scanFiles(srcFiles,'src');
const distHits=scanFiles(distFiles,'dist');

const summary={ srcHits, distHits, totals:{ src:srcHits.length, dist:distHits.length } };

if (WRITE || !fs.existsSync(BASE)){
  fs.mkdirSync(path.dirname(BASE),{recursive:true});
  fs.writeFileSync(BASE, JSON.stringify(summary,null,2));
  console.log('secrets-guard: baseline written');
  process.exit(0);
}

const base=JSON.parse(fs.readFileSync(BASE,'utf8'));
function cmp(now,prev){ // vráť nové záznamy
  const key=(h)=>`${h.file}|${h.pattern}`;
  const prevSet=new Set((prev||[]).map(key));
  return now.filter(h=>!prevSet.has(key(h)));
}

const newSrc=cmp(srcHits, base.srcHits);
const newDist=cmp(distHits, base.distHits);

let notes=[];
if (STRICT){
  if (srcHits.length || distHits.length) notes.push(`STRICT: found ${srcHits.length}+${distHits.length} hits`);
} else {
  if (newSrc.length) notes.push(`new src hits: ${newSrc.length}`);
  if (newDist.length) notes.push(`new dist hits: ${newDist.length}`);
}

// „neprípustná kombinácia": ak sa v src objaví import.meta.env.VITE_OPENAI_API_KEY, failni vždy
const hardBan = srcHits.some(h=>h.pattern==='vite openai key referenced');
if (hardBan) notes.push('VITE_OPENAI_API_KEY referenced in client code — move to server proxy.');

if (notes.length){
  console.error('secrets-guard: FAIL\n', JSON.stringify({newSrc,newDist}, null, 2));
  process.exit(1);
}

console.log('secrets-guard: OK');
console.log(JSON.stringify(summary, null, 2));
