#!/usr/bin/env node
/*
  img-autofix.cjs
  - Reads a list of file paths from stdin (one per line) or from argv
  - For each TSX/JSX file, adds loading="lazy" and decoding="async" to <img> tags if missing
  - Skips files whose basename includes Landing|Hero|Header|Nav|Logo via the caller's filter, not here
  - Writes a summary JSON to OUT/_autofix.json if OUT is provided via env
*/
const fs = require('fs');
const path = require('path');
const { Project, SyntaxKind } = require('ts-morph');

function readTargets() {
  const args = process.argv.slice(2).filter(Boolean);
  let files = [];
  if (args.length) {
    files = args;
  } else if (!process.stdin.isTTY) {
    const input = fs.readFileSync(0, 'utf8');
    files = input.split(/\r?\n/).map(s => s.trim()).filter(Boolean);
  }
  return Array.from(new Set(files));
}

function backup(p, bdir) {
  const b = path.join(bdir, 'files', p);
  fs.mkdirSync(path.dirname(b), { recursive: true });
  if (fs.existsSync(p)) fs.copyFileSync(p, b);
}

function main() {
  const OUT = process.env.OUT || `_img_fix_${new Date().toISOString().replace(/[-:TZ.]/g,'').slice(0,14)}`;
  const BDIR = process.env.BDIR || `.cleanup_trash/${Date.now()}_img_fix`;
  fs.mkdirSync(OUT, { recursive: true });
  fs.mkdirSync(path.join(BDIR, 'files'), { recursive: true });

  const files = readTargets();
  const project = new Project({
    tsConfigFilePath: fs.existsSync('tsconfig.json') ? 'tsconfig.json' : undefined,
    skipAddingFilesFromTsConfig: !fs.existsSync('tsconfig.json'),
  });
  if (files.length) project.addSourceFilesAtPaths(files);

  let changed = 0, patched = 0;
  const details = [];

  for (const sf of project.getSourceFiles()) {
    let fileChanged = false;
    sf.forEachDescendant(n => {
      const kind = n.getKind();
      if (kind === SyntaxKind.JsxSelfClosingElement || kind === SyntaxKind.JsxOpeningElement) {
        const tag = n.getTagNameNode();
        if (!tag || tag.getText() !== 'img') return;
        const attrs = n.getAttributes();
        const hasAttr = (name) => attrs.some(a => a.getKind() === SyntaxKind.JsxAttribute && a.getNameNode().getText() === name);
        const addAttr = (name, val) => { n.addAttribute({ name, initializer: `"${val}"` }); patched++; fileChanged = true; };
        if (!hasAttr('loading')) addAttr('loading', 'lazy');
        if (!hasAttr('decoding')) addAttr('decoding', 'async');
      }
    });
    if (fileChanged) {
      backup(sf.getFilePath(), BDIR);
      changed++;
      details.push(sf.getFilePath());
    }
  }

  project.saveSync();
  const summary = { filesChanged: changed, attrsPatched: patched, files: details };
  fs.writeFileSync(path.join(OUT, '_autofix.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify({ filesChanged: changed, attrsPatched: patched }, null, 2));
}

main();

