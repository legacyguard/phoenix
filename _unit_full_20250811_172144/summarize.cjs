const fs=require('fs'); 
let j={}; 
try{ 
  j=JSON.parse(fs.readFileSync(process.argv[2],'utf8')); 
}catch{}

let total=0, failed=0, top=[];

if (Array.isArray(j)) {
  for (const t of j) {
    const st = t.result?.state || '';
    total++;
    if (st==='fail'){
      failed++; 
      top.push(`${t.name||t.file||''} :: ${(t.result?.error?.message||t.result?.error?.name||'fail')}`); 
    }
  }
}

fs.writeFileSync(process.argv[3], `Unit total: ${total}\nUnit failed: ${failed}\n`);
fs.writeFileSync(process.argv[4], top.slice(0,30).join('\n')+'\n');
console.log(`Unit total: ${total}  failed: ${failed}`);
