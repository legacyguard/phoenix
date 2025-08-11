#!/usr/bin/env node

const fs = require("fs");
const path = require("path");
const glob = require("glob");

// Konfigurácia
const config = {
  srcPath: path.join(__dirname, "../src"),
  filePatterns: ["**/*.tsx", "**/*.ts"],
  excludePatterns: ["node_modules/**", "dist/**", "build/**"],
  backupDir: path.join(__dirname, "../backup-before-catch-improvement"),
};

// Mapovanie súborov na ich kontexty pre lepšie error správy
const fileContextMap = {
  InviteAcceptance: {
    context: "Pozvánka strážcu",
    operations: {
      loadInvitation: "načítanie pozvánky",
      handleAccept: "prijatie pozvánky",
      handleDecline: "odmietnutie pozvánky",
    },
  },
  Manual: {
    context: "Manuál a kontakty",
    operations: {
      loadContacts: "načítanie kontaktov",
      handleSaveContact: "uloženie kontaktu",
      handleDeleteContact: "odstránenie kontaktu",
      loadKeyDocuments: "načítanie kľúčových dokumentov",
      loadInstructions: "načítanie inštrukcií",
    },
  },
  GuardianUpload: {
    context: "Správa strážcov",
    operations: {
      handleSubmit: "uloženie strážcu",
    },
  },
  AssetDetail: {
    context: "Detail majetku",
    operations: {
      loadAsset: "načítanie majetku",
      handleSave: "uloženie majetku",
    },
  },
  Will: {
    context: "Testament",
    operations: {
      loadWill: "načítanie testamentu",
      loadContacts: "načítanie kontaktov",
      handleSave: "uloženie testamentu",
    },
  },
  GuardianView: {
    context: "Pohľad strážcu",
    operations: {
      loadGuardianData: "načítanie dát pre strážcu",
    },
  },
};

// Funkcia na vytvorenie vylepšenej catch sekcie
function generateImprovedCatch(fileName, functionName, indentLevel = 2) {
  const indent = "  ".repeat(indentLevel);
  const fileKey = Object.keys(fileContextMap).find((key) =>
    fileName.includes(key),
  );
  const fileContext = fileContextMap[fileKey] || {
    context: "Aplikácia",
    operations: {},
  };
  const operation = fileContext.operations[functionName] || "operácia";

  return `${indent}} catch (error: any) {
${indent}  const timestamp = new Date().toISOString();
${indent}  const errorMessage = error?.message || 'Neznáma chyba';
${indent}  const errorCode = error?.code || 'UNKNOWN_ERROR';
${indent}  
${indent}  // Detailné logovanie pre debugging
${indent}  console.error('[${fileContext.context}] Chyba pri ${operation}:', {
${indent}    timestamp,
${indent}    operation: '${functionName}',
${indent}    errorCode,
${indent}    errorMessage,
${indent}    errorDetails: error,
${indent}    stack: error?.stack
${indent}  });
${indent}  
${indent}  // Používateľsky prívetivá správa
${indent}  let userMessage = 'Nastala chyba pri ${operation}.';
${indent}  
${indent}  // Špecifické správy podľa typu chyby
${indent}  if (error?.code === 'PGRST116') {
${indent}    userMessage = 'Požadované dáta neboli nájdené.';
${indent}  } else if (error?.message?.includes('network')) {
${indent}    userMessage = 'Chyba pripojenia. Skontrolujte internetové pripojenie.';
${indent}  } else if (error?.message?.includes('permission')) {
${indent}    userMessage = 'Nemáte oprávnenie na túto akciu.';
${indent}  } else if (error?.message?.includes('duplicate')) {
${indent}    userMessage = 'Takýto záznam už existuje.';
${indent}  }
${indent}  
${indent}  toast.error(userMessage);`;
}

// Funkcia na nájdenie a vylepšenie catch blokov
function improveCatchBlocks(filePath) {
  const content = fs.readFileSync(filePath, "utf8");
  const fileName = path.basename(filePath);

  // Regulárny výraz na nájdenie catch blokov
  const catchRegex =
    /} catch \((error|e|err)\s*(:?\s*any)?\)\s*{\s*([^}]*(?:toast\.error\([^)]+\)|console\.(error|log)\([^)]+\))?\s*[^}]*)?}/g;

  let improved = content;
  let changesMade = false;

  // Nájdeme názvy funkcií pre kontext
  const functionMatches = content.matchAll(
    /(?:const|function)\s+(\w+)\s*=?\s*(?:async)?\s*(?:\([^)]*\)|function\s*\([^)]*\))\s*(?:=>|{)/g,
  );
  const functions = Array.from(functionMatches).map((match) => ({
    name: match[1],
    index: match.index,
  }));

  // Pre každý catch blok
  let match;
  while ((match = catchRegex.exec(content)) !== null) {
    const catchBlock = match[0];
    const catchContent = match[3] || "";

    // Skontrolujeme, či catch blok už má dobré error handling
    const hasDetailedLogging =
      catchContent.includes("console.error") &&
      catchContent.includes("timestamp") &&
      catchContent.includes("errorDetails");
    const hasToastError = catchContent.includes("toast.error");

    if (!hasDetailedLogging || !hasToastError) {
      // Nájdeme funkciu, v ktorej sa catch nachádza
      const catchIndex = match.index;
      const containingFunction = functions
        .filter((f) => f.index < catchIndex)
        .sort((a, b) => b.index - a.index)[0];

      const functionName = containingFunction?.name || "unknown";

      // Získame úroveň odsadenia
      const lines = content.substring(0, catchIndex).split("\n");
      const lastLine = lines[lines.length - 1];
      const indentMatch = lastLine.match(/^(\s*)/);
      const baseIndent = indentMatch ? indentMatch[1].length / 2 : 2;

      // Vytvoríme vylepšený catch blok
      const improvedCatch = generateImprovedCatch(
        fileName,
        functionName,
        baseIndent,
      );

      // Nahradíme starý catch blok novým
      improved = improved.replace(
        catchBlock,
        improvedCatch + "\n" + " ".repeat(baseIndent * 2) + "}",
      );
      changesMade = true;
    }
  }

  return { content: improved, changesMade };
}

// Hlavná funkcia
async function main() {
  console.log("🔍 Hľadám súbory s catch blokmi...\n");

  // Vytvoríme backup adresár
  if (!fs.existsSync(config.backupDir)) {
    fs.mkdirSync(config.backupDir, { recursive: true });
  }

  // Nájdeme všetky TypeScript súbory
  const files = [];
  config.filePatterns.forEach((pattern) => {
    const matchedFiles = glob.sync(path.join(config.srcPath, pattern), {
      ignore: config.excludePatterns,
    });
    files.push(...matchedFiles);
  });

  console.log(`Nájdených ${files.length} súborov na kontrolu.\n`);

  let improvedFiles = 0;
  const improvements = [];

  // Spracujeme každý súbor
  for (const file of files) {
    const { content, changesMade } = improveCatchBlocks(file);

    if (changesMade) {
      // Vytvoríme backup
      const backupPath = path.join(
        config.backupDir,
        path.relative(config.srcPath, file),
      );
      const backupDir = path.dirname(backupPath);

      if (!fs.existsSync(backupDir)) {
        fs.mkdirSync(backupDir, { recursive: true });
      }

      fs.copyFileSync(file, backupPath);

      // Zapíšeme vylepšený súbor
      fs.writeFileSync(file, content);

      improvedFiles++;
      improvements.push(path.relative(process.cwd(), file));
      console.log(`✅ Vylepšený: ${path.relative(process.cwd(), file)}`);
    }
  }

  console.log("\n📊 Súhrn:");
  console.log(`- Skontrolovaných súborov: ${files.length}`);
  console.log(`- Vylepšených súborov: ${improvedFiles}`);

  if (improvements.length > 0) {
    console.log("\n📝 Vylepšené súbory:");
    improvements.forEach((file) => console.log(`   - ${file}`));
    console.log(
      `\n💾 Backup pôvodných súborov: ${path.relative(process.cwd(), config.backupDir)}`,
    );
  }

  console.log("\n✨ Hotovo!");
}

// Spustíme skript
main().catch(console.error);
