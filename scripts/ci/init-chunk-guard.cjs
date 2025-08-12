const fs=require('fs'), path=require('path'), zlib=require('zlib');

const DIST='dist';
const BASE='scripts/ci/init-chunk-baseline.json';
const args=new Set(process.argv.slice(2));
const WRITE=args.has('--write-baseline');
const STRICT=args.has('--strict');

function gz(bytes){ return zlib.gzipSync(bytes).length; }

function readInitial(){
  const htmlPath = path.join(DIST, 'index.html');
  if (!fs.existsSync(htmlPath)) { throw new Error('dist/index.html not found; run build'); }
  const html = fs.readFileSync(htmlPath,'utf8');
  const hrefs = [];
  const reScript=/\<script[^>]+type="module"[^>]+src="([^"]+)"[^>]*\>/g;
  const rePreload=/\<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"[^>]*\>/g;
  const reCss=/\<link[^>]+rel="stylesheet"[^>]+href="([^"]+)"[^>]*\>/g;
  for (const r of [reScript,rePreload,reCss]){
    let m; while ((m=r.exec(html))) hrefs.push(m[1]);
  }
  // norm paths -> absolute
  const files = hrefs
    .map(h => h.startsWith('/') ? path.join(DIST, h.replace(/^\//,'')) : path.join(DIST, h))
    .filter(p => fs.existsSync(p) && (p.endsWith('.js') || p.endsWith('.css')));
  // uniq
  return [...new Set(files)];
}

const files = readInitial();
const rows = files.map(p=>{
  const b=fs.readFileSync(p);
  return {
    file: p.replace(/^dist\//,''),
    rawKB: +(b.length/1024).toFixed(1),
    gzipKB: +(gz(b)/1024).toFixed(1)
  };
}).sort((a,b)=> b.gzipKB-a.gzipKB);

const total = rows.reduce((s,r)=>s+r.gzipKB,0);
const summary = { totalGzipKB:+total.toFixed(1), count: rows.length, rows };

if (WRITE || !fs.existsSync(BASE)){
  fs.mkdirSync(path.dirname(BASE),{recursive:true});
  fs.writeFileSync(BASE, JSON.stringify(summary,null,2));
  console.log('init-chunk-guard: baseline written');
  process.exit(0);
}

const base=JSON.parse(fs.readFileSync(BASE,'utf8'));

// thresholds
const maxPerFileKB=120;   // per-súbor gzip (realistické pre moderné web apps)
const maxDeltaKB=30;     // celkový rozdiel gzip
const maxDeltaPct=3;     // alebo %
let fail=false; const notes=[];

// 1) per-file limit
for (const r of rows){
  if (r.gzipKB>maxPerFileKB){
    notes.push(`oversize: ${r.file} ${r.gzipKB}KB > ${maxPerFileKB}KB`);
  }
}

// 2) total delta vs baseline
const baseTotal = base.totalGzipKB ?? 0;
const delta = summary.totalGzipKB - baseTotal;
const deltaPct = baseTotal ? (delta/baseTotal*100) : 0;
if (delta>maxDeltaKB || deltaPct>maxDeltaPct){
  notes.push(`total delta too high: +${delta.toFixed(1)}KB (${deltaPct.toFixed(2)}%)`);
}

// 3) ak STRICT: fail na akékoľvek zväčšenie a per-file >45KB
if (STRICT){
  for (const r of rows){
    if (r.gzipKB>45) notes.push(`strict oversize: ${r.file} ${r.gzipKB}KB > 45KB`);
  }
  if (summary.totalGzipKB>baseTotal) notes.push(`strict total increased: +${(summary.totalGzipKB-baseTotal).toFixed(1)}KB`);
}

if (notes.length){
  console.error('init-chunk-guard: FAIL');
  console.error('baseline total=', baseTotal,'KB, current total=', summary.totalGzipKB,'KB');
  notes.forEach(n=>console.error(' -',n));
  process.exit(1);
}

console.log('init-chunk-guard: OK');
console.log(JSON.stringify(summary));
