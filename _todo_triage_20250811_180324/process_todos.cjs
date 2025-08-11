const fs = require('fs');
const path = require('path');

const inputFile = process.argv[2];
const outputFile = process.argv[3];

if (!inputFile || !outputFile) {
  console.error('Usage: node process_todos.cjs <input_file> <output_file>');
  process.exit(1);
}

const lines = fs.readFileSync(inputFile, 'utf8').split('\n').filter(line => line.trim());
const csvLines = [];

for (const line of lines) {
  const parts = line.split(':');
  if (parts.length < 3) continue;
  
  const file = parts[0];
  const lineNum = parts[1];
  const text = parts.slice(2).join(':');
  
  let tag = 'TODO';
  if (text.includes('FIXME')) tag = 'FIXME';
  else if (text.includes('HACK')) tag = 'HACK';
  else if (text.includes('XXX')) tag = 'XXX';
  
  // Extract summary text
  let summary = text.replace(/^.*?(TODO|FIXME|HACK|XXX)[: ]*/, '').trim();
  summary = summary.replace(/"/g, "'");
  
  csvLines.push(`"${file}",${lineNum},"${tag}","${summary}"`);
}

const csvContent = 'file,line,tag,summary\n' + csvLines.join('\n');
fs.writeFileSync(outputFile, csvContent);

console.log(`Processed ${csvLines.length} TODO comments`);
