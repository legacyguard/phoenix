const fs=require('fs'), path=require('path');
const { Project } = require('ts-morph');
const OUT = process.argv[2];

function norm(p){ return p.split(path.sep).join('/'); }
function resolveIndex(p){
  // ak importuje priečinok, hľadaj index.{ts,tsx,js,jsx}
  const exts=['.ts','.tsx','.js','.jsx'];
  for (const e of exts){
    const f = p.endsWith(e) ? p : path.join(p, 'index'+e);
    if (fs.existsSync(f)) return f;
  }
  return null;
}
function mapBarrelExports(indexFile){
  // vráti mapu: exportName -> relativePath (bez ext)
  const src = fs.readFileSync(indexFile,'utf8');
  const reNamed = /export\s*\{\s*([^}]+)\s*\}\s*from\s*['"](.+?)['"]/g;
  const reAll   = /export\s*\*\s*from\s*['"](.+?)['"]/g;
  const m = new Map();
  let mm;
  while ((mm=reNamed.exec(src))){
    const names = mm[1].split(',').map(s=>s.trim().split(/\s+as\s+/)[1]||s.trim().split(/\s+as\s+/)[0]).filter(Boolean);
    const from = mm[2];
    for (const n of names) m.set(n, from);
  }
  // pri export * nevieme mená; necháme na neskôr
  const star = [];
  while ((mm=reAll.exec(src))) star.push(mm[1]);
  return {named:m, star};
}

// Načítaj projekt
const project = new Project({
  tsConfigFilePath: fs.existsSync('tsconfig.json') ? 'tsconfig.json' : undefined,
  skipAddingFilesFromTsConfig: !fs.existsSync('tsconfig.json'),
});
project.addSourceFilesAtPaths('src/**/*.{ts,tsx,js,jsx}');

let filesChanged=0, importsRewritten=0, typeOnlySet=0;

for (const sf of project.getSourceFiles()){
  const dir = path.dirname(sf.getFilePath());
  for (const imp of sf.getImportDeclarations()){
    const spec = imp.getModuleSpecifierValue();
    if (!spec.startsWith('.')) continue; // len relatívne
    const target = path.resolve(dir, spec);
    const idx = resolveIndex(target);
    if (idx){
      // BARREL IMPORT → prepíš na konkrétny súbor podľa mena
      const {named, star} = mapBarrelExports(idx);
      const namedImps = imp.getNamedImports();
      let rewritten = false;

      if (namedImps.length>0 && named.size>0){
        // ak všetky mená vieme zmapovať do rovnakého zdroja, prepíš na tento zdroj
        const names = namedImps.map(n=> (n.getAliasNode()?.getText() || n.getName()));
        const targets = new Set(names.map(n=> named.get(n)));
        if (targets.size===1 && targets.has(undefined)===false){
          const rel = [...targets][0]; // napr. './AssistantMessage'
          imp.setModuleSpecifier(path.posix.normalize(path.posix.join(spec, rel)));
          importsRewritten++; rewritten = true;
        }
      }
      // inak nechaj tak (nevieme spoľahlivo rozhodnúť)
      if (rewritten) filesChanged++;
    }
  }
}

// Druhé kolo: type-only ak sa symboly používajú len v typových pozíciách
for (const sf of project.getSourceFiles()){
  let changed=false;
  for (const imp of sf.getImportDeclarations()){
    if (imp.isTypeOnly()) continue;
    const namedImps = imp.getNamedImports();
    if (namedImps.length===0) continue;
    // heuristika: ak žiadny z importovaných identifikátorov nie je použitý v hodnotovej pozícii
    const all = namedImps.every(n=>{
      const name = n.getAliasNode()?.getText() || n.getName();
      const refs = sf.getDescendants().filter(nd => nd.getText()===name);
      // ak sa identifikátor vyskytuje len v type anotáciách (má TypeNode predka), označ type-only
      return refs.length>0 && refs.every(nd=>{
        let cur=nd.getParent();
        while (cur){
          const k = cur.getKindName();
          if (/Type|Interface|Heritage|ImportType/.test(k)) return true;
          if (/CallExpression|NewExpression|Jsx/.test(k)) return false;
          cur = cur.getParent();
        }
        return true;
      });
    });
    if (all){ imp.setIsTypeOnly(true); changed=true; typeOnlySet += namedImps.length; }
  }
  if (changed) filesChanged++;
}

project.saveSync();
fs.writeFileSync(path.join(OUT,'_summary.json'), JSON.stringify({filesChanged, importsRewritten, typeOnlySet}, null, 2));
console.log("== CYCLES HARDFIX ==");
console.log(JSON.stringify({filesChanged, importsRewritten, typeOnlySet}, null, 2));
