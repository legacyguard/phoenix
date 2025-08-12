const fs = require('fs');
const path = require('path');

// Asset extensions to scan
const assetExts = ['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.ico', '.mp4', '.webm', '.mp3', '.wav', '.pdf', '.txt', '.csv', '.docx', '.xlsx', '.ttf', '.otf', '.woff', '.woff2'];

// Code extensions to scan
const codeExts = ['.ts', '.tsx', '.js', '.jsx', '.css', '.scss', '.md', '.html', '.json', '.yml', '.yaml', '.vue'];

function scanDirectory(dir, extensions, baseDir = '') {
  const files = [];
  
  try {
    const items = fs.readdirSync(dir);
    for (const item of items) {
      if (item === 'node_modules' || item === 'coverage' || item.startsWith('.cleanup_') || item === '.git') {
        continue;
      }
      
      const fullPath = path.join(dir, item);
      const stat = fs.statSync(fullPath);
      
      if (stat.isDirectory()) {
        const subDir = baseDir ? path.join(baseDir, item) : item;
        files.push(...scanDirectory(fullPath, extensions, subDir));
      } else if (extensions.includes(path.extname(item).toLowerCase())) {
        const relPath = baseDir ? path.join(baseDir, item) : item;
        files.push(relPath.replace(/\\/g, '/'));
      }
    }
  } catch (err) {
    console.warn(`Warning: Could not scan ${dir}:`, err.message);
  }
  
  return files;
}

function findAssetReferences(assets, codeFiles) {
  const referenced = [];
  const unreferenced = [];
  
  for (const asset of assets) {
    let found = false;
    
    // Search patterns: webPath, relPath, basename
    const searchPatterns = [asset.webPath, asset.relPath, asset.basename];
    
    for (const codeFile of codeFiles) {
      try {
        const content = fs.readFileSync(codeFile, 'utf8');
        if (searchPatterns.some(pattern => content.includes(pattern))) {
          found = true;
          break;
        }
      } catch (err) {
        // Skip files we can't read
        continue;
      }
    }
    
    if (found) {
      referenced.push(asset);
    } else {
      unreferenced.push(asset);
    }
  }
  
  return { referenced, unreferenced };
}

// Main execution
console.log('Starting assets audit...');

// Scan for assets
console.log('Scanning for assets...');
const assets = [];
const publicAssets = scanDirectory('public', assetExts, 'public');
const srcAssets = scanDirectory('src', assetExts, 'src');

for (const assetPath of [...publicAssets, ...srcAssets]) {
  const fullPath = assetPath.startsWith('public/') ? assetPath : `src/${assetPath}`;
  try {
    const stat = fs.statSync(fullPath);
    const sizeKB = +(stat.size / 1024).toFixed(1);
    const inPublic = assetPath.startsWith('public/');
    const webPath = inPublic ? '/' + assetPath.slice('public/'.length) : assetPath;
    
    assets.push({
      relPath: assetPath,
      webPath: webPath,
      basename: path.basename(assetPath),
      sizeKB: sizeKB
    });
  } catch (err) {
    console.warn(`Warning: Could not stat ${fullPath}:`, err.message);
  }
}

console.log(`Found ${assets.length} assets`);

// Scan for code files
console.log('Scanning for code files...');
const codeFiles = [];
if (fs.existsSync('src')) {
  codeFiles.push(...scanDirectory('src', codeExts, 'src'));
}
if (fs.existsSync('public')) {
  codeFiles.push(...scanDirectory('public', codeExts, 'public'));
}

console.log(`Found ${codeFiles.length} code files`);

// Find references
console.log('Analyzing references...');
const { referenced, unreferenced } = findAssetReferences(assets, codeFiles);

// Sort results
referenced.sort((a, b) => a.relPath.localeCompare(b.relPath));
unreferenced.sort((a, b) => b.sizeKB - a.sizeKB);

// Generate summary
const summary = {
  scannedAssets: assets.length,
  referenced: referenced.length,
  unreferenced: unreferenced.length,
  totalSizeKB: assets.reduce((sum, a) => sum + a.sizeKB, 0),
  unreferencedSizeKB: unreferenced.reduce((sum, a) => sum + a.sizeKB, 0)
};

// Write output files
const outputDir = process.argv[2] || '.';
fs.writeFileSync(path.join(outputDir, 'referenced.txt'), referenced.map(a => a.relPath).join('\n') + '\n');
fs.writeFileSync(path.join(outputDir, 'unused.txt'), unreferenced.map(a => `${a.relPath}\t${a.sizeKB}KB`).join('\n') + '\n');
fs.writeFileSync(path.join(outputDir, '_summary.json'), JSON.stringify(summary, null, 2));

console.log('Audit completed successfully!');
console.log(JSON.stringify(summary, null, 2));
