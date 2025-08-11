const {spawn} = require('child_process');
const [cmd, outFile, errFile, timeoutMsStr] = process.argv.slice(2);
const timeoutMs = +timeoutMsStr || 600000;
const sh = process.platform === 'win32' ? 'cmd' : 'bash';
const flag = process.platform === 'win32' ? '/c' : '-lc';
const env = { ...process.env, CI: '1', VITEST_HIDE_SKIPPED_TESTS: '1' };
const child = spawn(sh, [flag, cmd], { env });
const fs = require('fs'); 
const out=fs.createWriteStream(outFile); 
const err=fs.createWriteStream(errFile);
child.stdout.pipe(out); 
child.stderr.pipe(err);
let killed=false;
const to=setTimeout(()=>{ killed=true; child.kill('SIGKILL'); }, timeoutMs);
child.on('exit',(code,signal)=>{
  clearTimeout(to);
  const summary = { code, signal, timedOut: killed, outFile: outFile, errFile: errFile };
  console.log(JSON.stringify(summary));
});
