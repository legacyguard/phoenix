const d=require(process.argv[1]); 
console.log((d.deps||[]).join('\n'));
console.log('---DEV---');
console.log((d.dev||[]).join('\n'));
