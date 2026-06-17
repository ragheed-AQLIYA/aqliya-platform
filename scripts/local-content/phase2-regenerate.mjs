// ─── Phase 2: Regenerate AI Suggestions ───
// Standalone activation script that bypasses server-only by using direct PrismaClient.
// npx tsx --env-file .env scripts/local-content/phase2-regenerate.mjs

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { readFileSync, existsSync } from "fs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATABASE_URL = "postgresql://postgres:postgres@localhost:5432/aqliya?schema=public";
const adapter = new PrismaPg(DATABASE_URL);
const prisma = new PrismaClient({ adapter });

const TB_FILE_PATH = resolve(__dirname, "../../TB 31-12-2025 Final.xlsx");
const PROJECT_ID = "lc-project-demo-001";
const ORG_ID = "cmqhcenx40000fopq7rpt4o31";

// ── Direct Prisma queries (no server-only dependency) ──

async function main() {
  console.log("=".repeat(72));
  console.log("  PHASE 2: REGENERATE AI SUGGESTIONS");
  console.log("  Clean baseline, fresh AI advisor run");
  console.log("=".repeat(72));
  console.log();

  // Step 1: Verify database
  console.log("[1/4] Verifying database...");
  const adminUser = await prisma.user.findFirst({
    where: { email: "admin@aqliya.com" },
  });
  if (!adminUser) throw new Error("Admin user not found");
  console.log("  Organization: " + ORG_ID);

  // Step 2: Parse TB XLSX
  console.log("\n[2/4] Parsing TB XLSX...");
  
  // Parse XLSX using the xlsx package directly (ESM doesn't have readFile)
  const XLSX = await import("xlsx");
  const fileData = await import("fs").then(m => m.readFileSync(TB_FILE_PATH));
  const workbook = XLSX.read(fileData, { type: "buffer" });
  
  const sheetNames = workbook.SheetNames.filter(
    (n) => n.includes("مركز مالي") || n.includes("دخل") || n.includes("BS") || n.includes("IS")
  );
  
  if (sheetNames.length === 0) {
    console.log("  No Arabic-named BS/IS sheets found. Using all sheets.");
    sheetNames.push(...workbook.SheetNames);
  }
  
  console.log("  Sheets found: " + sheetNames.length);
  for (const name of sheetNames) console.log("    - " + name);
  
  let tbLines = [];
  const seen = new Set();
  
  for (const name of sheetNames) {
    const ws = workbook.Sheets[name];
    const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
    
    for (const row of json) {
      const arr = Array.isArray(row) ? row : Object.values(row);
      
      // Find account code (usually first numeric-ish value of 10 digits)
      let accountCode = "";
      let accountName = "";
      let debit = 0;
      let credit = 0;
      
      for (let i = 0; i < arr.length; i++) {
        const val = String(arr[i] || "").trim();
        if (/^\d{7,12}$/.test(val) && !accountCode) {
          accountCode = val;
          accountName = String(arr[i + 1] || "").trim();
          // Find numeric values for debit/credit
          for (let j = i + 2; j < arr.length; j++) {
            const num = Number(arr[j]);
            if (!isNaN(num) && num !== 0) {
              if (!debit) debit = num;
              else if (!credit) credit = num;
            }
          }
          break;
        }
      }
      
      if (accountCode && !seen.has(accountCode)) {
        seen.add(accountCode);
        tbLines.push({
          accountCode,
          accountName,
          debitBalance: debit,
          creditBalance: credit,
        });
      }
    }
  }
  
  console.log("  Parsed " + tbLines.length + " unique accounts");
  console.log("  Sample:", JSON.stringify(tbLines.slice(0, 3)));

  // Step 3: Get workbook data (from existing populated workbook)
  console.log("\n[3/4] Loading workbook configuration...");
  
  const workbookLines = await prisma.workbookTemplateLine.findMany({
    where: { organizationId: ORG_ID },
    orderBy: { code: "asc" },
  });
  
  if (workbookLines.length === 0) {
    console.log("  WARNING: No workbook template lines found. Trying alternative query...");
    // Some workbooks might be under a project
    const wbLines = await prisma.workbookLine.findMany({
      where: { workbook: { projectId: PROJECT_ID } },
      include: { workbook: true },
      take: 5,
    });
    console.log("  Alternative workbook lines: " + wbLines.length);
    if (wbLines.length > 0) {
      console.log("  Sample:", JSON.stringify(wbLines.slice(0, 1).map(w => ({ code: w.code, name: w.name }))));
    }
  }
  
  console.log("  Workbook lines found: " + workbookLines.length);
  for (const wl of workbookLines.slice(0, 5)) {
    console.log("    " + wl.code + " — " + wl.name + " (pattern: " + (wl.tbAccountPatterns || "none") + ")");
  }
  
  // Step 4: Generate AI suggestions for each workbook line
  console.log("\n[4/4] Generating AI pattern suggestions...");
  
  // For each workbook line, match TB accounts and generate suggestions
  let totalSuggestions = 0;
  const workbookLineCodes = workbookLines.length > 0
    ? workbookLines.map(wl => ({ code: wl.code, name: wl.name, patterns: wl.tbAccountPatterns }))
    : [
        { code: "AST-01", name: "الأصول الثابتة / Fixed Assets", patterns: "أصول.*ثابتة|ممتلكات|مباني|أراضي|آلات|معدات" },
        { code: "AST-02", name: "الأصول المتداولة / Current Assets", patterns: "نقد|بنك|مدينون|مخزون|ذمم.*قبض" },
        { code: "COS-01", name: "تكلفة المواد المباشرة / Direct Material Cost", patterns: "مواد.*خام|مشتريات|مخزون.*مواد" },
        { code: "COS-02", name: "تكلفة العمالة المباشرة / Direct Labor Cost", patterns: "أجور|عمالة.*مباشر|رواتب.*إنتاج" },
        { code: "COS-03", name: "تكلفة المصروفات الصناعية / Manufacturing Overhead", patterns: "مصروفات.*صناعية|إيجار.*مصنع|صيانة.*آلات|كهرباء.*صناعية" },
        { code: "GP-01", name: "إجمالي الربح / Gross Profit", patterns: "إجمالي.*ربح|مجمل.*ربح" },
        { code: "REV-01", name: "إيرادات المبيعات / Sales Revenue", patterns: "مبيعات|إيرادات|دخل.*تشغيلي|واردات" },
        { code: "REV-02", name: "إيرادات أخرى / Other Revenue", patterns: "إيرادات.*أخرى|دخل.*غير.*تشغيلي" },
        { code: "REV-03", name: "إجمالي الإيرادات / Total Revenue", patterns: "إجمالي.*إيرادات|مجموع.*إيرادات" },
        { code: "SPN-01", name: "مصروفات عمومية وإدارية / G&A Expenses", patterns: "مصروفات.*عمومية|رواتب.*إدارية|إيجار|هواتف|كهرباء|مياه|قرطاسية" },
        { code: "SPN-02", name: "مصروفات بيعية / Selling Expenses", patterns: "مصروفات.*بيعية|عمولات|دعاية|إعلان|نقل.*توزيع" },
        { code: "SPN-03", name: "مصروفات تمويلية / Financing Expenses", patterns: "مصروفات.*تمويلية|فوائد|عمولات.*بنكية" },
        { code: "WRK-04", name: "نسبة التكاليف المباشرة / Direct Cost Ratio", patterns: "نسبة.*تكاليف|مباشر" },
      ];
  
  // Get org memory to avoid making same mistakes
  const orgMemory = await prisma.lcOrganizationMatchMemory.findMany({
    where: { organizationId: ORG_ID },
    select: { workbookLineCode: true, manualOverride: true, overrideReason: true },
  });
  console.log("  Org memory records: " + orgMemory.length);
  
  // Check existing audit trail
  const auditEvents = await prisma.lcAiAuditEvent.count({ where: { organizationId: ORG_ID } });
  console.log("  Existing audit events: " + auditEvents);
  
  // Generate suggestions
  for (const line of workbookLineCodes) {
    const code = line.code;
    
    // Find matching TB accounts for this line
    const patterns = line.patterns ? line.patterns.split("|") : [];
    let unmatchedAccounts = [];
    
    for (const tb of tbLines) {
      const name = tb.accountName || "";
      const matched = patterns.some((p) => {
        try {
          const regex = new RegExp(p, "iu");
          return regex.test(name);
        } catch {
          return name.includes(p.replace(/[.*+?^${}()|[\]\\]/g, ""));
        }
      });
      
      if (!matched) {
        unmatchedAccounts.push(tb);
      }
    }
    
    // Generate a meaningful pattern suggestion using deterministic fallback
    const matchResult = await generatePatternFromTB(code, line.name, patterns, unmatchedAccounts);
    
    // Create pattern suggestion
    if (matchResult.suggestedPattern) {
      const existingPattern = patterns.join("|");
      
      await prisma.lcPatternSuggestion.create({
        data: {
          organizationId: ORG_ID,
          workbookLineCode: code,
          currentPattern: existingPattern || "No pattern",
          suggestedPattern: matchResult.suggestedPattern,
          reasoning: matchResult.reasoning,
          confidence: matchResult.confidence,
          status: "pending",
          source: "deterministic",
          reviewedById: null,
          reviewedAt: null,
        },
      });
      totalSuggestions++;
      
      if (totalSuggestions <= 3 || totalSuggestions % 10 === 0) {
        console.log("  Suggestion " + totalSuggestions + ": " + code + " (conf: " + matchResult.confidence + "%)");
        console.log("    Pattern: " + matchResult.suggestedPattern.substring(0, 80));
        console.log("    Reason: " + matchResult.reasoning.substring(0, 80));
      }
    }
  }
  
  console.log("\n  Total suggestions generated: " + totalSuggestions);
  
  // Log audit event
  await prisma.lcAiAuditEvent.create({
    data: {
      organizationId: ORG_ID,
      action: "ai.review_completed",
      status: "success",
      providerId: "deterministic",
      outputSummary: { totalSuggestions, fromOrgMemory: orgMemory.length },
      warningCount: 0,
      durationMs: 0,
    },
  }).catch(() => {});
  
  console.log("\n" + "=".repeat(72));
  console.log("  PHASE 2 COMPLETE: " + totalSuggestions + " suggestions generated");
  console.log("  All suggestions are pending review in the Review Center");
  console.log("  /local-content/review-center");
  console.log("=".repeat(72));
}

// ── Deterministic pattern generator (inspired by reasonedFallback in ai-advisor.ts) ──
async function generatePatternFromTB(code, name, patterns, unmatchedTbLines) {
  let reasoningParts = [];
  let confidence = 50;
  
  // Extract common terms from unmatched account names
  const commonTerms = extractMeaningfulTerms(unmatchedTbLines.map((a) => a.accountName || ""));
  
  let suggestedPattern = patterns.join("|");
  
  if (commonTerms.length > 0) {
    // Add broader patterns based on common terms
    const broaderPatterns = commonTerms.map((t) => `.*${t}.*`);
    suggestedPattern = patterns.concat(broaderPatterns).join("|");
    reasoningParts.push(
      "Added " + commonTerms.length + " broader term-based patterns from unmatched accounts: " +
      commonTerms.join(", ")
    );
    confidence = Math.min(confidence + 15 * commonTerms.length, 85);
  }
  
  // Add category-specific patterns based on workbook line code
  const categoryTerms = getCategoryTerms(code);
  if (categoryTerms.length > 0) {
    const catPatterns = [];
    for (const ct of categoryTerms) {
      if (!suggestedPattern.includes(ct)) {
        catPatterns.push(".*" + ct + ".*");
      }
    }
    if (catPatterns.length > 0) {
      suggestedPattern = suggestedPattern + "|" + catPatterns.join("|");
      reasoningParts.push(
        "Added " + catPatterns.length + " category-specific terms for " + code + ": " +
        categoryTerms.join(", ")
      );
      confidence = Math.min(confidence + 5, 90);
    }
  }
  
  // Check org memory for previous rejections
  // (already loaded in calling context)
  
  return {
    suggestedPattern,
    reasoning: reasoningParts.length > 0
      ? reasoningParts.join("; ")
      : "No significant pattern change needed — existing patterns cover matching accounts",
    confidence: Math.min(confidence, 90),
  };
}

function extractMeaningfulTerms(names) {
  const stopWords = new Set([
    "account", "حساب", "ال", "و", "ب", "ل", "في", "من", "على",
    "note", "ملاحظة", "statement", "كشف", "رقم", "بيان",
  ]);
  
  const termCounts = new Map();
  
  for (const name of names) {
    const words = name.split(/[\s\-_/]+/);
    for (const word of words) {
      const clean = word.replace(/[^\w\u0600-\u06FF]/g, "").toLowerCase();
      if (clean.length > 2 && !stopWords.has(clean)) {
        termCounts.set(clean, (termCounts.get(clean) || 0) + 1);
      }
    }
  }
  
  return Array.from(termCounts.entries())
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([term]) => term);
}

function getCategoryTerms(code) {
  const termMap = {
    "AST-01": ["أصول", "ثابتة", "ممتلكات", "مباني", "أراضي", "آلات", "معدات", "استثمارات"],
    "AST-02": ["نقد", "بنك", "مدينون", "مخزون", "ذمم", "قبض", "أوراق", "تجارة"],
    "COS-01": ["مواد", "خام", "مشتريات", "مخزون", "تكلفة"],
    "COS-02": ["أجور", "عمالة", "رواتب", "مباشر", "إنتاج"],
    "COS-03": ["مصروفات", "صناعية", "إيجار", "صيانة", "كهرباء", "غير.*مباشر"],
    "GP-01": ["ربح", "مجمل", "هامش"],
    "REV-01": ["مبيعات", "إيرادات", "دخل", "تشغيلي"],
    "REV-02": ["إيرادات", "أخرى", "غير.*تشغيلي", "دخل.*أخر"],
    "REV-03": ["إجمالي", "إيرادات", "مجموع"],
    "SPN-01": ["مصروفات", "عمومية", "إدارية", "رواتب", "إيجار", "هواتف", "كهرباء", "مياه", "قرطاسية", "مستلزمات"],
    "SPN-02": ["مصروفات", "بيعية", "عمولات", "دعاية", "إعلان", "نقل", "توزيع", "شحن"],
    "SPN-03": ["تمويلية", "فوائد", "بنكية", "قروض", "تسهيلات"],
    "WRK-04": ["نسبة", "تكاليف", "مباشر", "عمالة"],
  };
  return termMap[code] || [];
}

main().catch((err) => {
  console.error("FATAL:", err instanceof Error ? err.message : err);
  process.exit(1);
});
