import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Define problematic terms and their replacements
const PROBLEMATIC_TERMS = {
  // Old military terminology
  fortress: "vault",
  armory: "vault",
  mission: "journey",
  "sentry mode": "preservation mode",
  "command roster": "trusted circle",
  operations: "activities",
  "fortress strength": "plan strength",
  "mission control": "dashboard",
  deployment: "activation",
  tactical: "strategic",
  combat: "protect",
  defense: "protection",
  commander: "guardian",
  soldier: "protector",
  battle: "challenge",
  weapon: "tool",
  arsenal: "collection",

  // Tone issues - too aggressive
  attack: "address",
  destroy: "remove",
  eliminate: "resolve",
  conquer: "overcome",

  // Technical jargon
  backend: "system",
  frontend: "interface",
  database: "storage",
  api: "service",
  cache: "temporary storage",
  endpoint: "connection point",

  // Brand inconsistencies
  legacyguard: "Heritage Vault",
  LegacyGuard: "Heritage Vault",
};

// Define file extensions to scan
const FILE_EXTENSIONS = [".tsx", ".ts", ".jsx", ".js", ".json"];

// Patterns to extract user-facing text
const TEXT_PATTERNS = [
  // JSX/TSX text content
  />([^<]+)</g,
  // String literals in quotes
  /"([^"]+)"/g,
  /'([^']+)'/g,
  // Template literals
  /`([^`]+)`/g,
  // JSON values
  /:\s*"([^"]+)"/g,
];

class ContentAuditor {
  constructor() {
    this.issues = [];
    this.scannedFiles = 0;
    this.totalTextBlocks = 0;
  }

  // Scan directory recursively
  scanDirectory(dir, baseDir = dir) {
    const files = fs.readdirSync(dir);

    files.forEach((file) => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);

      // Skip node_modules and build directories
      if (
        file === "node_modules" ||
        file === "build" ||
        file === "dist" ||
        file === ".git"
      ) {
        return;
      }

      if (stat.isDirectory()) {
        this.scanDirectory(filePath, baseDir);
      } else if (this.shouldScanFile(file)) {
        this.scanFile(filePath, baseDir);
      }
    });
  }

  shouldScanFile(filename) {
    return FILE_EXTENSIONS.some((ext) => filename.endsWith(ext));
  }

  scanFile(filePath, baseDir) {
    try {
      const content = fs.readFileSync(filePath, "utf-8");
      const relativePath = path.relative(baseDir, filePath);

      // Skip test files and stories
      if (
        relativePath.includes(".test.") ||
        relativePath.includes(".spec.") ||
        relativePath.includes(".stories.")
      ) {
        return;
      }

      this.scannedFiles++;

      // Extract text content
      const textBlocks = this.extractTextContent(content);
      this.totalTextBlocks += textBlocks.length;

      // Check each text block for issues
      textBlocks.forEach(({ text, line }) => {
        this.checkTextForIssues(text, relativePath, line);
      });
    } catch (error) {
      console.error(`Error reading file ${filePath}:`, error.message);
    }
  }

  extractTextContent(content) {
    const textBlocks = [];
    const lines = content.split("\n");

    lines.forEach((line, lineNumber) => {
      TEXT_PATTERNS.forEach((pattern) => {
        let match;
        while ((match = pattern.exec(line)) !== null) {
          const text = match[1];
          // Filter out code-like content
          if (
            text &&
            text.length > 3 &&
            !text.includes("{") &&
            !text.includes("}") &&
            !text.includes("(") &&
            !text.includes(")") &&
            !text.includes("=") &&
            !text.includes(";") &&
            !/^[A-Z_]+$/.test(text) && // Skip constants
            !/^[a-z]+([A-Z][a-z]+)*$/.test(text) && // Skip camelCase identifiers
            !text.startsWith("data-") &&
            !text.startsWith("aria-") &&
            !text.includes("className") &&
            !text.includes("onClick")
          ) {
            textBlocks.push({ text, line: lineNumber + 1 });
          }
        }
      });
    });

    return textBlocks;
  }

  checkTextForIssues(text, file, line) {
    const lowerText = text.toLowerCase();

    // Check for problematic terms
    Object.entries(PROBLEMATIC_TERMS).forEach(([problem, replacement]) => {
      if (lowerText.includes(problem.toLowerCase())) {
        this.addIssue({
          type: "INCONSISTENT_TERMINOLOGY",
          file,
          line,
          text,
          issue: `Contains old/problematic term: "${problem}"`,
          suggestion: text.replace(new RegExp(problem, "gi"), replacement),
        });
      }
    });

    // Check for tone issues
    this.checkToneIssues(text, file, line);

    // Check for clarity issues
    this.checkClarityIssues(text, file, line);

    // Check for grammar and typos
    this.checkGrammarIssues(text, file, line);
  }

  checkToneIssues(text, file, line) {
    // Too casual
    const casualTerms = [
      "hey",
      "cool",
      "awesome",
      "stuff",
      "things",
      "basically",
      "kinda",
      "sorta",
      "yeah",
    ];
    casualTerms.forEach((term) => {
      if (text.toLowerCase().includes(term)) {
        this.addIssue({
          type: "TONE_TOO_CASUAL",
          file,
          line,
          text,
          issue: `Too casual for professional tone: "${term}"`,
          suggestion: this.suggestProfessionalAlternative(text, term),
        });
      }
    });

    // Too alarmist
    const alarmistTerms = [
      "urgent",
      "critical",
      "emergency",
      "immediately",
      "now!",
      "asap",
    ];
    alarmistTerms.forEach((term) => {
      if (text.toLowerCase().includes(term)) {
        this.addIssue({
          type: "TONE_TOO_ALARMIST",
          file,
          line,
          text,
          issue: `Too alarmist tone: "${term}"`,
          suggestion: this.suggestCalmerAlternative(text, term),
        });
      }
    });
  }

  checkClarityIssues(text, file, line) {
    // Technical jargon
    const jargonTerms = [
      "API",
      "JSON",
      "URL",
      "HTTP",
      "SQL",
      "CSS",
      "HTML",
      "OAuth",
      "JWT",
      "UUID",
    ];
    jargonTerms.forEach((term) => {
      if (
        text.includes(term) &&
        !text.includes("error") &&
        !text.includes("Error")
      ) {
        this.addIssue({
          type: "UNCLEAR_JARGON",
          file,
          line,
          text,
          issue: `Technical jargon may confuse users: "${term}"`,
          suggestion: this.suggestClearerAlternative(text, term),
        });
      }
    });

    // Vague phrases
    const vagueTerms = ["various", "multiple", "several", "numerous", "some"];
    vagueTerms.forEach((term) => {
      if (text.toLowerCase().includes(term)) {
        this.addIssue({
          type: "UNCLEAR_VAGUE",
          file,
          line,
          text,
          issue: `Vague language: "${term}"`,
          suggestion: `Consider being more specific instead of using "${term}"`,
        });
      }
    });
  }

  checkGrammarIssues(text, file, line) {
    // Double spaces
    if (text.includes("  ")) {
      this.addIssue({
        type: "GRAMMAR_SPACING",
        file,
        line,
        text,
        issue: "Contains double spaces",
        suggestion: text.replace(/\s+/g, " "),
      });
    }

    // Missing punctuation at end (for complete sentences)
    if (text.length > 20 && /[a-z]$/.test(text) && !text.endsWith("...")) {
      this.addIssue({
        type: "GRAMMAR_PUNCTUATION",
        file,
        line,
        text,
        issue: "May be missing ending punctuation",
        suggestion: text + ".",
      });
    }

    // Common typos
    const typos = {
      teh: "the",
      recieve: "receive",
      occured: "occurred",
      seperate: "separate",
      definately: "definitely",
      untill: "until",
      transfered: "transferred",
    };

    Object.entries(typos).forEach(([typo, correct]) => {
      if (text.toLowerCase().includes(typo)) {
        this.addIssue({
          type: "TYPO",
          file,
          line,
          text,
          issue: `Typo found: "${typo}"`,
          suggestion: text.replace(new RegExp(typo, "gi"), correct),
        });
      }
    });
  }

  suggestProfessionalAlternative(text, casualTerm) {
    const alternatives = {
      hey: "Hello",
      cool: "excellent",
      awesome: "excellent",
      stuff: "items",
      things: "items",
      basically: "",
      kinda: "somewhat",
      sorta: "somewhat",
      yeah: "yes",
    };
    return text.replace(
      new RegExp(casualTerm, "gi"),
      alternatives[casualTerm] || casualTerm,
    );
  }

  suggestCalmerAlternative(text, alarmistTerm) {
    const alternatives = {
      urgent: "important",
      critical: "important",
      emergency: "priority",
      immediately: "promptly",
      "now!": "now",
      asap: "at your earliest convenience",
    };
    return text.replace(
      new RegExp(alarmistTerm, "gi"),
      alternatives[alarmistTerm] || alarmistTerm,
    );
  }

  suggestClearerAlternative(text, jargon) {
    const alternatives = {
      API: "service",
      JSON: "data format",
      URL: "web address",
      HTTP: "web protocol",
      SQL: "database query",
      CSS: "styling",
      HTML: "markup",
      OAuth: "authentication",
      JWT: "security token",
      UUID: "unique identifier",
    };
    return `Consider explaining or replacing "${jargon}" with "${alternatives[jargon] || "simpler terms"}"`;
  }

  addIssue(issue) {
    this.issues.push(issue);
  }

  generateReport() {
    console.log("\n🔍 HERITAGE VAULT CONTENT AUDIT REPORT\n");
    console.log("=".repeat(80));
    console.log(`Files scanned: ${this.scannedFiles}`);
    console.log(`Text blocks analyzed: ${this.totalTextBlocks}`);
    console.log(`Issues found: ${this.issues.length}`);
    console.log("=".repeat(80));

    if (this.issues.length === 0) {
      console.log(
        "\n✅ No content issues found! The Heritage Vault narrative is consistent.\n",
      );
      return;
    }

    // Group issues by type
    const issuesByType = {};
    this.issues.forEach((issue) => {
      if (!issuesByType[issue.type]) {
        issuesByType[issue.type] = [];
      }
      issuesByType[issue.type].push(issue);
    });

    // Display issues by type
    Object.entries(issuesByType).forEach(([type, issues]) => {
      console.log(
        `\n📋 ${type.replace(/_/g, " ")} (${issues.length} issues)\n`,
      );

      issues.slice(0, 10).forEach((issue, index) => {
        console.log(`${index + 1}. File: ${issue.file}:${issue.line}`);
        console.log(`   Text: "${issue.text}"`);
        console.log(`   Issue: ${issue.issue}`);
        console.log(`   Suggestion: ${issue.suggestion}`);
        console.log("");
      });

      if (issues.length > 10) {
        console.log(`   ... and ${issues.length - 10} more ${type} issues\n`);
      }
    });

    // Save full report to file
    const reportPath = path.join(__dirname, "..", "content-audit-report.json");
    fs.writeFileSync(reportPath, JSON.stringify(this.issues, null, 2));
    console.log(`\n📄 Full report saved to: ${reportPath}\n`);
  }
}

// Run the audit
console.log("🚀 Starting Heritage Vault Content Audit...\n");
const auditor = new ContentAuditor();
const projectRoot = path.join(__dirname, "..");
auditor.scanDirectory(path.join(projectRoot, "src"));
auditor.generateReport();
