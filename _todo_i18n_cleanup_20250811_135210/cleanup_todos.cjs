const fs=require('fs'), path=require('path');
const args = process.argv.slice(2);
const bdir = args[args.length-2];
const out = args[args.length-1];
const files = args.slice(0,-2);

const reTodoI18nLine = /^\s*\/\/.*\b(TODO|FIXME)\b.*\b(i18n|translat|i18next|t\(|i18nKey|namespace)\b.*$/i;
const reCommentedTransLine = /^\s*\/\/.*\b(t\(|i18n\.t\(|i18next\.t\(|<Trans\b)/;
const reBlockStart = /\/\*/g, reBlockEnd = /\*\//g;

let totalRemoved=0, changed=0;
const perFile=[];

for (const f of files){
  let src=''; try { src = fs.readFileSync(f,'utf8'); } catch { continue; }
  const before = src;

  // 1) odstráň jednoradkové i18n TODO/FIXME
  let removed=0;
  src = src.split('\n').filter(line=>{
    if (reTodoI18nLine.test(line)) { removed++; return false; }
    if (reCommentedTransLine.test(line)) { removed++; return false; }
    return true;
  }).join('\n');

  // 2) odstráň blokové komentáre s i18n TODO/FIXME
  // (len komentár, žiadny kód)
  let outTxt='', i=0;
  while (i < src.length){
    const sIdx = src.indexOf('/*', i);
    if (sIdx === -1){ outTxt += src.slice(i); break; }
    const eIdx = src.indexOf('*/', sIdx+2);
    if (eIdx === -1){ outTxt += src.slice(i); break; }
    const block = src.slice(sIdx, eIdx+2);
    const header = src.slice(i, sIdx);
    const body = block.replace(/^\/\*+|\*+\/$/g,'');
    const isI18nTodo = /\b(TODO|FIXME)\b/i.test(body) && /\b(i18n|translat|i18next|t\(|i18nKey|namespace)\b/i.test(body);
    if (isI18nTodo){
      outTxt += header; // drop block
      removed++;
    } else {
      outTxt += header + block;
    }
    i = eIdx+2;
  }
  src = outTxt;

  // 3) skráť viac ako 2 prázdne riadky na max 2
  src = src.replace(/\n{3,}/g, '\n\n');

  if (removed>0 && src !== before){
    // backup
    const bak = path.join(bdir,'files',f);
    fs.mkdirSync(path.dirname(bak),{recursive:true});
    fs.writeFileSync(bak, before);
    fs.writeFileSync(f, src);
    changed++; totalRemoved += removed;
    perFile.push({file:f, removed});
  }
}

fs.writeFileSync(path.join(out,'_summary.json'), JSON.stringify({changed, totalRemoved}, null, 2));
fs.writeFileSync(path.join(out,'changed_files.json'), JSON.stringify(perFile, null, 2));
console.log("== TODO I18N CLEANUP ==");
console.log(JSON.stringify({changed, totalRemoved}, null, 2));
