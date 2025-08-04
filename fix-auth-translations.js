import fs from 'fs';
import path from 'path';

const authPath = path.join(process.cwd(), 'src/i18n/locales/fr/auth.json');

try {
  // Read the current file
  const content = fs.readFileSync(authPath, 'utf8');
  
  // Make the specific replacements
  let updatedContent = content
    .replace(/"title": "Marketing"/g, '"title": "Publicité"')
    .replace(/"partnersList": "Google Ads, Facebook"/g, '"partnersList": "Google Ads, Facebook"');
  
  // Write back to file
  fs.writeFileSync(authPath, updatedContent, 'utf8');
  
  console.log('✅ Successfully updated auth.json translations');
  console.log('Changes made:');
  console.log('- "Marketing" -> "Publicité"');
  console.log('- "Google Ads, Facebook" -> "Google Ads, Facebook"');
  
} catch (error) {
  console.error('❌ Error updating auth.json:', error.message);
} 