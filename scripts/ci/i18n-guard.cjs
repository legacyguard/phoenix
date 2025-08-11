const fs=require('fs'), path=require('path');
const SRC_DIR='src';
const files=[];
(function walk(d){ for (const n of fs.readdirSync(d)){ const p=path.join(d,n);
  if (n==='node_modules'||n.startsWith('.cleanup_')||n==='coverage') continue;
  const st=fs.statSync(p); if (st.isDirectory()) walk(p);
  else if (/\.(t|j)sx?$/.test(n)) files.push(p);
}})(SRC_DIR);

const bad=[];
const REs = [
  /(?:^|[^a-zA-Z0-9_])t\s*\(\s*['"]([^'"]+)['"]\s*[\),]/g,
  /i18n(?:ext)?\.t\s*\(\s*['"]([^'"]+)['"]\s*[\),]/g,
  /i18nKey\s*=\s*['"]([^'"]+)['"]/g,
];
for (const f of files){
  const txt=fs.readFileSync(f,'utf8');
  const lines=txt.split('\n');
  for (const re of REs){
    re.lastIndex=0; let m;
    while ((m=re.exec(txt))){
      const key=m[1];
      if (!key.includes(':')) {
        const before=txt.slice(0,m.index).split('\n').length;
        bad.push({file:f, line:before, key});
      }
    }
  }
}
if (bad.length){
  console.error(`i18n-guard: found ${bad.length} un-namespaced keys`);
  for (const b of bad.slice(0,100)) console.error(`${b.file}:${b.line}  ${b.key}`);
  process.exit(1);
}
console.log('i18n-guard: OK');
