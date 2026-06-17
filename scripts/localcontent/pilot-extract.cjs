/**
 * Pilot Validation — Extract TB + FS from PDF and Excel
 * Usage: node scripts/pilot-extract.cjs
 */

const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const PDF_PATH = "C:\\Users\\PC\\Documents\\Aqliya\\Audited FSs 31-12-2025.pdf";
const XLSX_PATH = "C:\\Users\\PC\\Documents\\Aqliya\\TB 31-12-2025 Final.xlsx";
const OUT_DIR = "C:\\Users\\PC\\Documents\\Aqliya\\docs\\review\\localcontent";

// ——— STEP 1: Extract TB ———
function extractTB() {
  console.log("\n=== STEP 1: TB Analysis ===");
  const wb = XLSX.readFile(XLSX_PATH, { cellDates: true, cellText: false });
  const sheetNames = wb.SheetNames;
  console.log(`Sheets: ${sheetNames.join(", ")}`);

  let allRows = [];
  for (const name of sheetNames) {
    const ws = wb.Sheets[name];
    const rows = XLSX.utils.sheet_to_json(ws, { header: 1, defval: "" });
    allRows.push({ sheet: name, rows });
  }

  // Parse account structure
  const accounts = [];
  for (const { sheet, rows } of allRows) {
    for (const row of rows) {
      if (!row || row.length < 2) continue;
      const code = String(row[0] || "").trim();
      const name = String(row[1] || "").trim();
      let balance = 0;
      // Find numeric columns
      for (let i = 2; i < row.length; i++) {
        const v = parseFloat(String(row[i]).replace(/[^\d.-]/g, ""));
        if (!isNaN(v) && v !== 0) { balance = v; break; }
      }
      if (code && name) {
        accounts.push({
          code,
          name,
          balance,
          sheet,
          row: row.slice(0, 8),
        });
      }
    }
  }

  // Classify accounts
  const revenueAccounts = accounts.filter(
    (a) =>
      a.code.match(/^(4\d|5)/) ||
      a.name.match(/إيراد|مبيعات|revenue|sales|income/i)
  );
  const expenseAccounts = accounts.filter(
    (a) =>
      (a.code.match(/^6/) || a.name.match(/مصروف|expense|cost|تكلفة/i)) &&
      !a.name.match(/إيراد|revenue|income/i)
  );
  const supplierAccounts = accounts.filter(
    (a) =>
      a.name.match(/مورد|مشتريات|supplier|purchase|procurement/i) ||
      a.code.match(/^20[12]/)
  );
  const payrollAccounts = accounts.filter(
    (a) =>
      a.name.match(/رواتب|أجور|payroll|salary|wage/i)
  );
  const capexAccounts = accounts.filter(
    (a) =>
      a.name.match(/أصول|أصل|عقار|معدات|asset|property|equipment|capex|ممتلكات|آلات/i) ||
      a.code.match(/^1[56]|^1[89]/)
  );
  const opexAccounts = accounts.filter(
    (a) =>
      a.name.match(/إيجار|كهرباء|هاتف|صيانة|مكتب|سفر|استشارات|rent|utility|maintenance|office|travel|consulting|depreciation|إهلاك/i)
  );

  const analysis = {
    metadata: {
      source: "TB 31-12-2025 Final.xlsx",
      extractedAt: new Date().toISOString(),
      sheets: sheetNames,
      totalRows: accounts.length,
    },
    totalAccounts: accounts.length,
    revenueAccounts: {
      count: revenueAccounts.length,
      list: revenueAccounts.map((a) => ({ code: a.code, name: a.name, balance: a.balance })),
    },
    expenseAccounts: {
      count: expenseAccounts.length,
      list: expenseAccounts.map((a) => ({ code: a.code, name: a.name, balance: a.balance })),
    },
    supplierAccounts: {
      count: supplierAccounts.length,
      list: supplierAccounts.map((a) => ({ code: a.code, name: a.name, balance: a.balance })),
    },
    payrollAccounts: {
      count: payrollAccounts.length,
      list: payrollAccounts.map((a) => ({ code: a.code, name: a.name, balance: a.balance })),
    },
    capexAccounts: {
      count: capexAccounts.length,
      list: capexAccounts.map((a) => ({ code: a.code, name: a.name, balance: a.balance })),
    },
    otherOperatingCosts: {
      count: opexAccounts.length,
      list: opexAccounts.map((a) => ({ code: a.code, name: a.name, balance: a.balance })),
    },
    rawFirstSheet: allRows[0]?.rows.slice(0, 50),
  };

  fs.mkdirSync(OUT_DIR, { recursive: true });
  fs.writeFileSync(path.join(OUT_DIR, "TB_ANALYSIS.json"), JSON.stringify(analysis, null, 2), "utf-8");
  console.log(`Accounts: ${accounts.length}`);
  console.log(`Revenue: ${revenueAccounts.length}`);
  console.log(`Expenses: ${expenseAccounts.length}`);
  console.log(`Supplier: ${supplierAccounts.length}`);
  console.log(`Payroll: ${payrollAccounts.length}`);
  console.log(`Capex: ${capexAccounts.length}`);
  console.log(`Other Opex: ${opexAccounts.length}`);
  console.log(`TB_ANALYSIS.json saved.`);
  return accounts;
}

// ——— STEP 2: Extract FS ———
async function extractFS() {
  console.log("\n=== STEP 2: FS Analysis ===");
  
  const buf = fs.readFileSync(PDF_PATH);
  
  // Import pdf-parse dynamically (it's a named export)
  const { PDFParse } = require("pdf-parse");
  const parser = new PDFParse({ data: buf });
  
  console.log("Loading PDF...");
  const info = await parser.getInfo();
  console.log(`Pages: ${info.total}`);
  console.log(`Info: ${JSON.stringify(info.info)}`);

  const text = await parser.getText({});
  
  const fullText = text.text;
  const lines = fullText.split("\n").map(l => l.trim()).filter(Boolean);
  
  console.log(`Lines extracted: ${lines.length}`);
  console.log(`Total chars: ${fullText.length}`);

  // Save raw text
  fs.writeFileSync(path.join(OUT_DIR, "FS_RAW_TEXT.txt"), fullText, "utf-8");
  console.log("Raw text saved.");

  // Save analysis
  const analysis = {
    metadata: {
      source: "Audited FSs 31-12-2025.pdf",
      extractedAt: new Date().toISOString(),
      pages: info.total,
      info: info.info,
    },
    totalLines: lines.length,
    totalChars: fullText.length,
    sampleLines: lines.slice(0, 200), // enough for analysis
  };

  fs.writeFileSync(path.join(OUT_DIR, "FS_ANALYSIS.json"), JSON.stringify(analysis, null, 2), "utf-8");
  console.log("FS_ANALYSIS.json saved.");
  return { fullText, lines };
}

// ——— Main ———
async function main() {
  console.log("=== LOCALCONTENTOS PILOT VALIDATION ===");
  console.log("Extracting input files...");

  const accounts = extractTB();
  const fsResult = await extractFS();

  // Print sample text for analysis
  console.log("\n=== FS Raw Text Sample (first 3000 chars) ===");
  console.log(fsResult.fullText.substring(0, 3000));

  console.log("\n=== Extraction Complete ===");
}

main().catch((e) => {
  console.error("Fatal:", e);
  process.exit(1);
});
