const {execSync} = require('child_process');
try{
  const out = execSync('npx -y ts-prune', {stdio:'pipe'}).toString().trim();
  if (out && out.split('\n').filter(Boolean).length>0){
    console.error('exports-guard: unused exports found:');
    console.error(out.split('\n').slice(0,100).join('\n'));
    process.exit(1);
  }
  console.log('exports-guard: OK');
}catch(e){
  console.error('exports-guard error:', e.stdout?.toString()||e.message); process.exit(2);
}
