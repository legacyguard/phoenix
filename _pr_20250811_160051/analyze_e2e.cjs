const fs=require('fs'); 
let j={}; 
try{ j=JSON.parse(fs.readFileSync(process.argv[2],'utf8')); }catch{}
let total=0, failed=0;
if (Array.isArray(j?.runs)) {
  for (const r of j.runs) {
    for (const t of (r.tests||[])) {
      total++; 
      const f = t.displayError || (t.attempts||[]).some(a=>a.state==='failed'); 
      if (f) failed++;
    }
  }
}
fs.writeFileSync(process.argv[3], `total=${total}\nfailed=${failed}\n`);
console.log(`E2E: ${total} total, ${failed} failed`);
