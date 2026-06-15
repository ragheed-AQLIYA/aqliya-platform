/**
 * Local Content Intelligence — TB/GL signal extraction (Cycle 3).
 * Uses ERP LC Mapping hints from TBClassificationHistory when available.
 */

import { prisma } from "@/lib/prisma";

export interface LocalContentSignal {
  category: "payroll" | "suppliers" | "assets" | "subcontractors";
  accountCode: string;
  accountName: string;
  amount: number;
  localContentRelevant: boolean;
  lcMappingHint?: string;
}

const PAYROLL_KEYWORDS = [
  "payroll",
  "salary",
  "salaries",
  "wages",
  "overtime",
  "vacation",
  "eos",
  "tickets",
  "رواتب",
  "أجور",
  "بدل",
  "ترك الخدمة",
];
const SUPPLIER_KEYWORDS = [
  "supplier",
  "vendor",
  "purchase",
  "purchases",
  "consumables",
  "spare parts",
  "مورد",
  "موردين",
  "مشتريات",
];
const SUBCONTRACTOR_KEYWORDS = ["subcontract", "مقاول", "باطن"];
const ASSET_KEYWORDS = [
  "depreciation",
  "capex",
  "capacity",
  "asset",
  "equipment",
  "إهلاك",
  "أصول",
];

function matchesKeywords(name: string, keywords: string[]): boolean {
  const n = name.toLowerCase();
  return keywords.some((k) => n.includes(k.toLowerCase()));
}

export function categorizeFromLcHint(
  hint: string,
): LocalContentSignal["category"] | null {
  const h = hint.toLowerCase().trim();
  if (!h) return null;
  if (matchesKeywords(h, PAYROLL_KEYWORDS)) return "payroll";
  if (matchesKeywords(h, SUBCONTRACTOR_KEYWORDS)) return "subcontractors";
  if (matchesKeywords(h, SUPPLIER_KEYWORDS)) return "suppliers";
  if (matchesKeywords(h, ASSET_KEYWORDS)) return "assets";
  return null;
}

function categorizeLine(
  accountName: string,
  accountType: string | null | undefined,
  lcHints: string[],
): LocalContentSignal["category"] | null {
  for (const hint of lcHints) {
    const fromHint = categorizeFromLcHint(hint);
    if (fromHint) return fromHint;
  }
  if (matchesKeywords(accountName, PAYROLL_KEYWORDS)) return "payroll";
  if (matchesKeywords(accountName, SUBCONTRACTOR_KEYWORDS)) return "subcontractors";
  if (matchesKeywords(accountName, SUPPLIER_KEYWORDS)) return "suppliers";
  if (accountType === "asset" || accountType === "non-current-asset") {
    return "assets";
  }
  if (matchesKeywords(accountName, ASSET_KEYWORDS)) return "assets";
  return null;
}

export async function extractLocalContentSignalsFromEngagement(
  engagementId: string,
): Promise<LocalContentSignal[]> {
  const tb = await prisma.auditTrialBalance.findFirst({
    where: { engagementId },
    include: { lines: true },
    orderBy: { createdAt: "desc" },
  });

  if (!tb?.lines?.length) return [];

  const history = await prisma.tBClassificationHistory.findMany({
    where: { engagementId },
    select: { accountCode: true, mappingHints: true },
    orderBy: { createdAt: "desc" },
  });

  const hintsByCode = new Map<string, string[]>();
  for (const row of history) {
    if (hintsByCode.has(row.accountCode)) continue;
    const hints = Array.isArray(row.mappingHints)
      ? (row.mappingHints as string[])
      : [];
    if (hints.length > 0) hintsByCode.set(row.accountCode, hints);
  }

  const signals: LocalContentSignal[] = [];

  for (const line of tb.lines) {
    const lcHints = hintsByCode.get(line.accountCode) ?? [];
    const category = categorizeLine(
      line.accountName,
      line.accountType,
      lcHints,
    );
    if (!category) continue;

    const primaryHint = lcHints.find((h) => categorizeFromLcHint(h)) ?? lcHints[0];

    signals.push({
      category,
      accountCode: line.accountCode,
      accountName: line.accountName,
      amount: Math.abs(line.balance),
      localContentRelevant: true,
      lcMappingHint: primaryHint,
    });
  }

  return signals;
}

export function estimateLocalContentPercent(
  signals: LocalContentSignal[],
  localSpendRatio = 0.65,
): number {
  if (signals.length === 0) return 0;
  const total = signals.reduce((s, x) => s + x.amount, 0);
  if (total <= 0) return 0;
  return Math.min(100, Math.round(localSpendRatio * 100));
}

export function summarizeLocalContentSignals(signals: LocalContentSignal[]): {
  totalAmount: number;
  byCategory: Record<string, { count: number; amount: number }>;
} {
  const byCategory: Record<string, { count: number; amount: number }> = {};
  let totalAmount = 0;
  for (const s of signals) {
    totalAmount += s.amount;
    if (!byCategory[s.category]) byCategory[s.category] = { count: 0, amount: 0 };
    byCategory[s.category].count++;
    byCategory[s.category].amount += s.amount;
  }
  return { totalAmount, byCategory };
}
