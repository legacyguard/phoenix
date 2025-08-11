const fs=require('fs'), path=require('path'), zlib=require('zlib'), cp=require('child_process');
const args=new Set(process.argv.slice(2));
const WRITE=args.has('--write-baseline');
const STRICT=args.has('--strict');
const BASE_FILE=path.join('scripts','ci','size-baseline.json');
const DIST='dist';
const PCT=Number(process.env.SIZE_GUARD_MAX_PCT||'3');     // max +3% default
const KB =Number(process.env.SIZE_GUARD_MAX_KB ||'30');    // max +30 KB default

function buildIfMissing(){
  if (!fs.existsSync(DIST) || !fs.readdirSync(DIST).length){
    try{
      cp.execSync('npm run -s build', {stdio:'inherit'});
    }catch(e){ console.error('build failed'); process.exit(2); }
    }
  }
function listAssets(){
  const exts=new Set(['.js','.css']);
  const out=[];
  (function walk(d){
    for (const n of fs.readdirSync(d)){
      const p=path.join(d,n); const st=fs.statSync(p);
      if (st.isDirectory()) walk(p);
      else if (exts.has(path.extname(n))) out.push(p);
    }
  })(DIST);
  return out.sort();
}
function statFiles(files){
  let raw=0, gz=0; const items=[];
  for (const f of files){
    const buf=fs.readFileSync(f);
    const gzbuf=zlib.gzipSync(buf);
    const r=buf.length, g=gzbuf.length;
    raw+=r; gz+=g; items.push({file:f, raw:r, gzip:g});
  }
  return {raw, gzip:gz, items};
}
buildIfMissing();
const files=listAssets();
if (!files.length){ console.error('size-guard: no assets (dist empty)'); process.exit(2); }
const cur=statFiles(files);

if (WRITE || !fs.existsSync(BASE_FILE)){
  fs.mkdirSync(path.dirname(BASE_FILE),{recursive:true});
  fs.writeFileSync(BASE_FILE, JSON.stringify({raw:cur.raw, gzip:cur.gzip, ts:Date.now()}, null, 2));
  console.log(`size-guard: baseline written → ${BASE_FILE}`);
  process.exit(0);
}

const base=JSON.parse(fs.readFileSync(BASE_FILE,'utf8'));
const deltaRaw=cur.raw - base.raw;
const deltaGz =cur.gzip - base.gzip;
const pctRaw = base.raw ? (deltaRaw/base.raw*100) : 0;
const pctGz  = base.gzip? (deltaGz/base.gzip*100): 0;

function fmtB(n){ return `${(n/1024).toFixed(1)} KB`; }
const limitKb = KB*1024;
const overRaw = deltaRaw>limitKb || pctRaw>PCT;
const overGz  = deltaGz>limitKb || pctGz>PCT;

const summary=[
  `RAW:   ${fmtB(base.raw)} → ${fmtB(cur.raw)}  (Δ ${fmtB(deltaRaw)}, ${pctRaw.toFixed(2)}%)`,
  `GZIP:  ${fmtB(base.gzip)} → ${fmtB(cur.gzip)} (Δ ${fmtB(deltaGz)}, ${pctGz.toFixed(2)}%)`,
  `Limits: +${KB} KB or +${PCT}% (whichever first)`,
].join('\n');

if (STRICT){
  if (deltaRaw>0 || deltaGz>0){ console.error('size-guard STRICT: regression\n'+summary); process.exit(1); }
  console.log('size-guard STRICT: OK\n'+summary); process.exit(0);
}

if (overRaw || overGz){
  console.error('size-guard: regression beyond limits\n'+summary);
  process.exit(1);
}
console.log('size-guard: OK\n'+summary);
