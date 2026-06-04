import * as fs from "fs";
import * as path from "path";

const AUDIT_DIR = path.join(__dirname, "../../components/audit");

// ---------------------------------------------------------------------------
// Known data-driven / status values that are allowed to appear as English
// ---------------------------------------------------------------------------
const ALLOWED_ENGLISH = new Set([
  // -- Workflow / engagement statuses --
  "draft",
  "open",
  "closed",
  "pending",
  "resolved",
  "accepted",
  "rejected",
  "in_progress",
  "in_review",
  "suggested",
  "implemented",
  "under_review",
  "missing",
  "requested",
  "uploaded",
  "linked",
  "reviewed",
  "dismissed",
  "approved",
  "published",
  "archived",
  "setup",
  "awaiting_client",
  "ready_for_approval",
  "not_ready",
  "pending_approval",
  "blocked",
  "locked",
  "not_started",
  "changes_requested",
  "investigated",
  "conditional",
  "trusted",
  "sufficient",
  "partial",
  "conflicting",
  "weak",

  // -- Filter / sort / toggle values --
  "all",
  "mapped",
  "unmapped",

  // -- Severity --
  "low",
  "medium",
  "high",
  "critical",

  // -- Alert / validation types --
  "error",
  "warning",
  "info",
  "success",
  "neutral",

  // -- User status & roles --
  "active",
  "inactive",
  "admin",
  "operator",
  "reviewer",
  "partner",
  "viewer",

  // -- Account types --
  "asset",
  "liability",
  "equity",
  "revenue",
  "expense",
  "non-current-asset",

  // -- Engagement types --
  "full_audit",
  "agreed_upon_procedures",

  // -- UI variant tokens --
  "page",
  "inline",
  "card",
  "default",
  "destructive",
  "ghost",
  "link",
  "outline",
  "secondary",

  // -- Direction / trend --
  "up",
  "down",
  "rtl",
  "ltr",

  // -- Size tokens --
  "sm",
  "md",
  "lg",
  "xl",
  "xs",

  // -- Tab / step keys --
  "overview",
  "trial-balance",
  "mapping",
  "validation",
  "statements",
  "notes",
  "evidence",
  "findings",
  "recommendations",
  "review",
  "approval",
  "publication",
  "audit-trail",
  "pilot",

  // -- Entity types --
  "engagement",
  "evidence",
  "finding",
  "recommendation",
  "publication",
  "event",
  "ai_output",
  "source_data",
  "account",
  "statement",
  "note",

  // -- Review filter values --
  "resolved",

  // -- Finding types --
  "material_misstatement",
  "control_deficiency",
  "disclosure_gap",
  "observation",

  // -- File extensions --
  "pdf",
  "xlsx",
  "docx",
  "jpg",
  "png",
  "csv",

  // -- Common record keys --
  "id",
  "label",
  "value",
  "key",
  "type",
  "name",
  "title",
  "description",
  "status",
  "role",
  "email",
  "phone",
  "forward",
  "backward",

  // -- Boolean / sentinel --
  "true",
  "false",
  "null",
  "undefined",

  // -- Code / test identifiers --
  "string",
  "number",
  "boolean",
  "object",
  "array",
]);

// ---------------------------------------------------------------------------
// Intentional English UI terms allowed by design.
// These are currently limited to technical model names, bilingual labels,
// and canonical accounting taxonomy labels shown to audit users.
// ---------------------------------------------------------------------------
const ALLOWED_ENGLISH_EXACT = new Set([
  "ClientWorkspace",
  "PlatformOrganization",
  "Workspace:",
  "Project:",
  "Org:",
  "Workflow",
  "Cash and Cash Equivalents",
  "Trade Receivables",
  "Inventories",
  "Prepayments",
  "Accumulated Depreciation",
  "Trade Payables",
  "Accrued Expenses",
  "Tax and Zakat Payable",
  "Short-term Borrowings",
  "Share Capital",
  "Retained Earnings",
  "Revenue - Sale of Goods",
  "Revenue - Services",
  "Cost of Sales",
  "Employee Benefits",
  "Occupancy Expenses",
  "Utilities",
  "Other Income",
]);

const ALLOWED_ENGLISH_REGEXES: RegExp[] = [/^(Workspace|Project|Org):\s/];

// ---------------------------------------------------------------------------
// Lines matching any of these regexes are treated as code and skipped
// ---------------------------------------------------------------------------
const SKIP_LINE_REGEXES: RegExp[] = [
  /^\s*import\s/,
  /^\s*export\s+(type|interface|function|const|default|\{)/,
  /^\s*interface\s/,
  /^\s*type\s+\w/,
  /^\s*function\s/,
  /^\s*(const|let|var)\s+/,
  /^\s*\/\//,
  /^\s*\*/,
  /\bt\(\s*["']/,
  /^\s*\}\s*\)?\s*$/,
  /from\s+["']/,
  /Record</,
  /catch\s*\(/,
  /\bthen\s*\(/,
  /^\s*return\s/,
  /\.\s*(map|filter|sort|forEach|reduce|replace)\s*\(/,
  /new\s+\w+\(/,
  /:\s*(React\.|ElementType|ReactNode)/,
  /\b(statusConfig|colorClasses|typeMaps|severityColors|statusColors|typeColors|stateColors|stateIcons|fileIcons|eventColors|eventIcons|actionIcons|severityValues|riskColors|riskValues|nodeTypeConfig|severityIcons|checkIcons|trustColors|pubStatusColors|roleColors|alertConfig|statusLabels)\b/,
  /\.toLocale(Date|String)\(/,
  /Intl\./,
  /\bsar\s*\(/,
  /for\s*\(/,
  /while\s*\(/,
  /switch\s*\(/,
  /case\s+/,
  /^\s*default:/,
  /console\./,
  /process\./,
  /require\(/,
  /eslint-disable/,
  /@ts-/,
  /\bt\s*=\s*useTranslations/,
  /\/>/,
  /^\s*\)\s*$/,
  /^\s*\]\s*$/,
  /^\s*<T/,
];

// Regex that matches Tailwind / CSS class values (lowercase with hyphens, colons, brackets)
const CSS_CLASS_REGEX =
  /^[a-z][a-z0-9\-:/[\]&._%]+(\s+[a-z][a-z0-9\-:/[\]&._%]+)*$/;

// ---------------------------------------------------------------------------
// File traversal
// ---------------------------------------------------------------------------
function getAllTsxFiles(dir: string): string[] {
  const files: string[] = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...getAllTsxFiles(fullPath));
    } else if (entry.isFile() && entry.name.endsWith(".tsx")) {
      files.push(fullPath);
    }
  }
  return files.sort();
}

// ---------------------------------------------------------------------------
// English UI string detection
// ---------------------------------------------------------------------------
function isEnglishUIString(candidate: string): boolean {
  const trimmed = candidate.trim();
  if (!trimmed) return false;

  if (ALLOWED_ENGLISH_EXACT.has(trimmed)) return false;
  if (ALLOWED_ENGLISH_REGEXES.some((regex) => regex.test(trimmed)))
    return false;

  // Allow explicit bilingual labels where Arabic is primary and English is paired
  // for operator clarity during the current transition phase.
  if (trimmed.includes("/") && /[\u0600-\u06FF]/.test(trimmed)) return false;

  // Arabic-primary labels with internal roadmap refs e.g. (A1-08)
  if (
    /[\u0600-\u06FF]/.test(trimmed) &&
    /\(A\d+-\d+\)/.test(trimmed) &&
    !/\b(the|and|for|with|from|your|click|submit|error|loading)\b/i.test(trimmed)
  ) {
    return false;
  }

  // Must contain at least some English letters
  if (!/[A-Za-z]/.test(trimmed)) return false;

  // Pure numbers / currency symbols / punctuation
  if (/^[\d\s,.\-–—%$€£SAR/\\()+]+$/.test(trimmed)) return false;

  // Percentages
  if (/^\d+%$/.test(trimmed)) return false;

  // Contains attribute assignment (e.g., "variant=outline", "size=sm") - these are
  // parts of JSX attributes caught by our tag-content regex
  if (/^\w+\s*=/.test(trimmed)) return false;

  // Template literal expressions like `${errors.length}`
  if (/^\$\{.*\}$/.test(trimmed)) return false;

  // HTML entities like &ldquo;, &amp;, etc.
  if (/^&[a-zA-Z]+;$/.test(trimmed)) return false;

  // Starts with a number, dot, or slash — likely code, URL, or file extension
  if (/^[\d.\/]/.test(trimmed)) return false;

  // CSS / Tailwind class values (multi-word hyphenated lowercase)
  if (CSS_CLASS_REGEX.test(trimmed)) return false;

  const words = trimmed.split(/\s+/);

  // Single-word status / data values
  if (words.length === 1) {
    if (ALLOWED_ENGLISH.has(words[0].toLowerCase())) return false;
    // CSS-like class names (hyphenated lower-case)
    if (/^[a-z][a-z0-9-]+$/.test(trimmed)) return false;
    // camelCase identifiers
    if (/^[a-z][a-zA-Z0-9]*$/.test(trimmed)) return false;
    // PascalCase that looks like a component or type name
    if (
      /^[A-Z][a-z]+(?:[A-Z][a-z]+)*$/.test(trimmed) &&
      words[0].length > 1 &&
      !/[a-z]{2,}/.test(trimmed)
    ) {
      // Exclude known component-like names
      if (!ALLOWED_ENGLISH.has(words[0].toLowerCase())) return false;
    }
  }

  return true;
}

// ---------------------------------------------------------------------------
// Line-level candidate extraction
// ---------------------------------------------------------------------------
function extractTextCandidates(line: string): string[] {
  const results: string[] = [];

  // 1. Extract content between JSX tags: >...<
  const tagContentRegex = />([^<]+?)</g;
  let match: RegExpExecArray | null;
  while ((match = tagContentRegex.exec(line)) !== null) {
    const content = match[1].trim();
    if (!content) continue;

    // Skip if it contains attribute assignment (e.g., "className=...", "variant=...")
    if (/^\w+\s*=/.test(content)) continue;

    // If the whole content is an expression in {...}, dig out string literals
    if (content.startsWith("{") && content.endsWith("}")) {
      const quoted = content.match(/["']([^"']+)["']/g);
      if (quoted) {
        for (const q of quoted) {
          results.push(q.slice(1, -1));
        }
      }
      continue;
    }

    // Strip {…} interpolations and check remaining literal text
    const parts = content.split(/\{[^}]+\}/);
    for (const part of parts) {
      const p = part.trim();
      if (p) results.push(p);
    }
  }

  // 2. For lines in JSX context (contain { } with ternary expressions),
  //    extract quoted strings that start and end with an English letter
  //    (this avoids matching across adjacent empty-string quotes like "" , name: "")
  if (line.includes("{") && line.includes("}")) {
    const quotedStrings = line.match(/"([A-Za-z][^"]*[A-Za-z.!?])"/g);
    if (quotedStrings) {
      for (const qs of quotedStrings) {
        results.push(qs.slice(1, -1));
      }
    }
  }

  return results;
}

function isCodeLine(line: string): boolean {
  const trimmed = line.trim();
  if (!trimmed) return true;
  return SKIP_LINE_REGEXES.some((r) => r.test(trimmed));
}

// ---------------------------------------------------------------------------
// Scan result
// ---------------------------------------------------------------------------
interface Finding {
  file: string;
  line: number;
  text: string;
}

function scanFile(filePath: string): Finding[] {
  const findings: Finding[] = [];
  const lines = fs.readFileSync(filePath, "utf-8").split("\n");
  const relativePath = path.relative(path.join(__dirname, "../.."), filePath);

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (isCodeLine(line)) continue;

    const candidates = extractTextCandidates(line);
    for (const candidate of candidates) {
      if (isEnglishUIString(candidate)) {
        findings.push({
          file: relativePath.replace(/\\/g, "/"),
          line: i + 1,
          text: candidate,
        });
      }
    }
  }

  return findings;
}

// ---------------------------------------------------------------------------
// Tests
// ---------------------------------------------------------------------------
describe("audit components should not have untranslated English UI strings", () => {
  // Toggle this to true to allow the test to pass as a warning
  const ALLOW_WARNINGS = false;

  const tsxFiles = getAllTsxFiles(AUDIT_DIR);
  let allFindings: Finding[] = [];

  beforeAll(() => {
    for (const file of tsxFiles) {
      const fileFindings = scanFile(file);
      allFindings.push(...fileFindings);
    }
  });

  const runAssertions = () => {
    if (allFindings.length === 0) return;

    const report = allFindings
      .map((f) => `  • ${f.file}:${f.line}  →  "${f.text}"`)
      .join("\n");

    const message = [
      `Found ${allFindings.length} untranslated English UI string(s) in audit components:\n`,
      report,
      "",
      "These should be wrapped in t() calls or translated to Arabic.",
    ].join("\n");

    if (ALLOW_WARNINGS) {
      // eslint-disable-next-line no-console
      console.warn(message);
    }

    expect(allFindings).toEqual([]);
  };

  if (ALLOW_WARNINGS) {
    test.skip(
      "should have no untranslated English UI strings (warning mode)",
      runAssertions,
    );
  } else {
    test("should have no untranslated English UI strings", runAssertions);
  }
});
