// ─── LocalContentOS Workbook — Population Engine: Common Utilities ───
// Pure functions and shared helpers with no Prisma dependency.

import { WORKBOOK_TEMPLATE, getTemplateLineByCode } from "../template";
import type { AccountCodeRange } from "../types";

// ─── Types ───

export interface LineValueMap {
  [code: string]: number | null;
}

export interface LineDataInput {
  section: string;
  code: string;
  name: string;
  autoFillable: boolean;
  formula?: string | null;
  evidenceRequired: boolean;
  evidenceTypes?: string[] | null;
  displayOrder: number;
}

// ─── Account Code Range Matching ───

export function isAccountInCodeRange(
  accountCode: string,
  codeRanges?: AccountCodeRange[],
): boolean {
  if (!codeRanges || codeRanges.length === 0) return true;

  for (const range of codeRanges) {
    if (accountCode.startsWith(range.prefix)) {
      if (range.excludePrefixes) {
        for (const exPrefix of range.excludePrefixes) {
          if (accountCode.startsWith(exPrefix)) return false;
        }
      }
      return true;
    }
  }
  return false;
}

// ─── TB Account Deduplication ───

export function deduplicateTbAccounts(
  tbLines: Array<{ accountCode: string; accountName: string; debit: number; credit: number }>,
): Array<{ accountCode: string; accountName: string; debit: number; credit: number }> {
  const seen = new Map<string, { accountCode: string; accountName: string; debit: number; credit: number }>();

  for (const line of tbLines) {
    const existing = seen.get(line.accountCode);
    if (!existing) {
      seen.set(line.accountCode, line);
    } else {
      const existingAbs = Math.abs(existing.debit - existing.credit);
      const newAbs = Math.abs(line.debit - line.credit);
      if (newAbs > existingAbs) {
        seen.set(line.accountCode, line);
      }
    }
  }

  return Array.from(seen.values());
}

// ─── TB Value Aggregation ───

function matchTbLineToTemplate(
  tbName: string,
  tbCode: string,
  _debit: number,
  _credit: number,
): { matched: boolean; score: number; templateCode: string | null } {
  let bestMatch: { code: string; score: number } | null = null;

  for (const tmpl of WORKBOOK_TEMPLATE.lines) {
    if (!tmpl.autoFillable || !tmpl.tbAccountPatterns) continue;

    if (!isAccountInCodeRange(tbCode, tmpl.accountCodeRanges)) continue;

    for (const pattern of tmpl.tbAccountPatterns) {
      try {
        const regex = new RegExp(pattern, "iu");
        if (regex.test(tbName) || regex.test(tbCode)) {
          const score = pattern.length;
          if (!bestMatch || score > bestMatch.score) {
            bestMatch = { code: tmpl.code, score };
          }
        }
      } catch {
        continue;
      }
    }
  }

  if (bestMatch) {
    return { matched: true, score: bestMatch.score, templateCode: bestMatch.code };
  }
  return { matched: false, score: 0, templateCode: null };
}

export function aggregateTbValues(
  tbLines: Array<{ accountCode: string; accountName: string; debit: number; credit: number }>,
  templateCode: string,
): number | null {
  const tmpl = getTemplateLineByCode(templateCode);
  if (!tmpl || !tmpl.tbAccountPatterns) return null;

  let total = 0;
  let matched = false;

  for (const tb of tbLines) {
    if (!isAccountInCodeRange(tb.accountCode, tmpl.accountCodeRanges)) continue;

    for (const pattern of tmpl.tbAccountPatterns) {
      try {
        const regex = new RegExp(pattern, "iu");
        if (regex.test(tb.accountName) || regex.test(tb.accountCode)) {
          total += tb.debit - tb.credit;
          matched = true;
          break;
        }
      } catch {
        continue;
      }
    }
  }

  return matched ? Math.abs(total) : null;
}

// ─── Safe Formula Evaluator ───

function safeEvaluateExpression(expr: string): number | null {
  const s = expr.replace(/\s+/g, "");
  if (s.length === 0) return null;
  let pos = 0;
  function peek(): string { return pos < s.length ? s[pos] : ""; }
  function consume(): string { return s[pos++]; }
  function parseNumber(): number | null {
    const start = pos;
    if (peek() === "-" || peek() === "+") consume();
    if (pos >= s.length || !/[\d.]/.test(peek())) { pos = start; return null; }
    let hasDot = false;
    while (pos < s.length) {
      const ch = peek();
      if (ch >= "0" && ch <= "9") consume();
      else if (ch === "." && !hasDot) { hasDot = true; consume(); }
      else break;
    }
    const v = Number(s.slice(start, pos));
    return isNaN(v) ? null : v;
  }
  function parseFactor(): number | null {
    if (peek() === "(") { consume(); const v = parseExpression(); if (v === null) return null; if (peek() !== ")") return null; consume(); return v; }
    if (peek() === "-") { consume(); if (peek() === "(") { consume(); const v = parseExpression(); if (v === null) return null; if (peek() !== ")") return null; consume(); return -v; } const n = parseNumber(); return n !== null ? -n : null; }
    if (peek() === "+") consume();
    return parseNumber();
  }
  function parseTerm(): number | null {
    let left = parseFactor(); if (left === null) return null;
    while (peek() === "*" || peek() === "/") {
      const op = consume(); const right = parseFactor(); if (right === null) return null;
      if (op === "*") left = left * right; else { if (right === 0) return null; left = left / right; }
    }
    return left;
  }
  function parseExpression(): number | null {
    let left = parseTerm(); if (left === null) return null;
    while (peek() === "+" || peek() === "-") {
      const op = consume(); const right = parseTerm(); if (right === null) return null;
      if (op === "+") left = left + right; else left = left - right;
    }
    return left;
  }
  const result = parseExpression();
  if (result === null || pos !== s.length) return null;
  return isFinite(result) ? result : null;
}

export function evaluateFormula(
  formula: string,
  lineValues: LineValueMap,
): number | null {
  try {
    let expression = formula;

    for (const [code, value] of Object.entries(lineValues)) {
      if (!formula.includes(code)) continue;

      if (value === null || value === undefined) {
        return null;
      }
      const escaped = code.replace(/[.*+?^${}()|[\]\\-]/g, '\\$&');
      expression = expression.replace(new RegExp(escaped, 'g'), String(value));
    }

    if (!/^[\d\s+\-*/().]+$/.test(expression)) {
      return null;
    }

    const result = safeEvaluateExpression(expression);
    return result !== null ? Math.abs(result) : null;
  } catch {
    return null;
  }
}

// ─── Shared Line Data Builder ───

export interface BuildLinesDataResult {
  linesData: Array<{
    workbookId: string;
    section: string;
    code: string;
    name: string;
    autoFillable: boolean;
    autoFilled: boolean;
    autoFillValue: number | null;
    autoFillSource: string | null;
    manualValue: null;
    source: "tb" | "formula" | "manual";
    confidence: "high" | "medium" | "low";
    evidenceRequired: boolean;
    evidenceTypes: string | null;
    displayOrder: number;
  }>;
  autoFilledCount: number;
}

export function buildLinesData(
  tbValues: LineValueMap,
  workbookId: string,
): BuildLinesDataResult {
  let autoFilledCount = 0;
  const linesData = WORKBOOK_TEMPLATE.lines.map((tmpl) => {
    let autoFillValue: number | null = null;
    let autoFillSource: string | null = null;
    let autoFilled = false;
    let source: "tb" | "formula" | "manual" = "tb";
    let confidence: "high" | "medium" | "low" = "high";

    const computedValue = tbValues[tmpl.code];

    if (tmpl.autoFillable && computedValue !== null) {
      autoFillValue = computedValue;
      autoFilled = true;
      autoFilledCount++;
      source = (tmpl.formula ? "formula" : "tb") as "formula" | "tb";
      confidence = (tmpl.formula ? "high" : "medium") as "high" | "medium";
      autoFillSource = tmpl.formula ? `formula:${tmpl.formula}` : `tb:${tmpl.code}`;
    }

    return {
      workbookId,
      section: tmpl.section,
      code: tmpl.code,
      name: tmpl.name,
      autoFillable: tmpl.autoFillable,
      autoFilled,
      autoFillValue,
      autoFillSource,
      manualValue: null as null,
      source,
      confidence,
      evidenceRequired: tmpl.evidenceRequired,
      evidenceTypes: tmpl.evidenceTypes ? JSON.stringify(tmpl.evidenceTypes) : null,
      displayOrder: tmpl.displayOrder,
    };
  });

  return { linesData, autoFilledCount };
}

// ─── Shared Section Stats Computation ───

export interface SectionStatInput {
  section: string;
  autoFilled: boolean;
  manualValue: number | null;
}

export function computeSectionStatsFromLines(
  lines: SectionStatInput[],
): Record<string, { total: number; filled: number; pct: number }> {
  const sectionStats: Record<string, { total: number; filled: number; pct: number }> = {};
  for (const line of lines) {
    if (!sectionStats[line.section]) {
      sectionStats[line.section] = { total: 0, filled: 0, pct: 0 };
    }
    sectionStats[line.section].total++;
    if (line.autoFilled || line.manualValue !== null) {
      sectionStats[line.section].filled++;
    }
  }
  for (const [key, stat] of Object.entries(sectionStats)) {
    stat.pct = stat.total > 0 ? Math.round((stat.filled / stat.total) * 100) : 0;
  }
  return sectionStats;
}
