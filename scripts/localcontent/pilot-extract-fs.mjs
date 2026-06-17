/**
 * Pilot Validation — Extract Audited Financial Statements
 * Usage: node scripts/pilot-extract-fs.mjs
 * Output: C:\Users\PC\Documents\Aqliya\docs\review\localcontent\FS_ANALYSIS.json
 */

import fs from "fs";
import path from "path";
import pdf from "pdf-parse";

const PDF_PATH = "C:\\Users\\PC\\Documents\\Aqliya\\Audited FSs 31-12-2025.pdf";
const OUT_DIR = "C:\\Users\\PC\\Documents\\Aqliya\\docs\\review\\localcontent";
const OUT_PATH = path.join(OUT_DIR, "FS_ANALYSIS.json");

async function main() {
  console.log("Reading PDF...");
  const buf = fs.readFileSync(PDF_PATH);
  const data = await pdf(buf);

  const text = data.text;
  const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
  console.log(`Extracted ${lines.length} non-empty lines.`);
  console.log(`Total characters: ${text.length}`);

  // Write raw text for reference
  const rawPath = path.join(OUT_DIR, "FS_RAW_TEXT.txt");
  fs.writeFileSync(rawPath, text, "utf-8");
  console.log(`Raw text saved to ${rawPath}`);

  // Parse statement sections
  const analysis = {
    metadata: {
      source: "Audited FSs 31-12-2025.pdf",
      extractedAt: new Date().toISOString(),
      totalLines: lines.length,
      totalChars: text.length,
    },
    statementOfProfitOrLoss: [],
    statementOfFinancialPosition: [],
    cashFlowStatement: [],
    notes: [],
    relatedPartyDisclosures: [],
    supplierDisclosures: [],
    accountingPolicies: [],
    rawText: text.substring(0, 15000), // first 15k chars summary
  };

  // Save
  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(OUT_PATH, JSON.stringify(analysis, null, 2), "utf-8");
  console.log(`FS Analysis saved to ${OUT_PATH}`);
}

main().catch((e) => {
  console.error("Extraction failed:", e);
  process.exit(1);
});
