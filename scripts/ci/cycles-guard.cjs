const {execSync} = require('child_process');
try {
  const out = execSync('npx -y madge --circular --extensions ts,tsx,js,jsx src', {stdio:'pipe'}).toString();
  if (/Found\s+\d+\s+circular/.test(out) && !/Found 0 circular/.test(out)) {
    console.error(out.trim()); process.exit(1);
  }
  console.log('cycles-guard: OK');
} catch (e) {
  const s = e.stdout?.toString() || e.message || '';
  if (/Found\s+\d+\s+circular/.test(s) && !/Found 0 circular/.test(s)) {
    console.error(s.trim()); process.exit(1);
  }
  console.error('cycles-guard: error'); console.error(s.trim()); process.exit(2);
}
