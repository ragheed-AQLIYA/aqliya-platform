/**
 * Upload a Saudi Arabic TB XLSX to AuditOS engagement (demo / pilot).
 *
 * Usage:
 *   npx tsx -r ./scripts/mock-server-only.cjs scripts/tb-upload-demo.ts "C:\path\TB.xlsx" [engagementId]
 */
process.env.DATABASE_URL =
  process.env.DATABASE_URL ??
  "postgresql://postgres:postgres@localhost:5434/aqliya?schema=public";

import * as fs from "node:fs";
import * as path from "node:path";
import * as XLSX from "xlsx";

function parseAmount(value: unknown): number {
  if (typeof value === "number") return value;
  const n = Number(String(value ?? "").replace(/,/g, "").trim());
  return Number.isFinite(n) ? n : 0;
}

function parseTbRows(filePath: string) {
  const wb = XLSX.readFile(filePath);
  const sheet = wb.Sheets[wb.SheetNames[0]!]!;
  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: "",
  }) as Array<Record<string, unknown>>;

  const codeKey =
    Object.keys(rows[0] ?? {}).find((k) => k.includes("رقم الحساب")) ??
    "Account Code";
  const nameKey =
    Object.keys(rows[0] ?? {}).find((k) => k.includes("اسم الحساب")) ??
    "Account Name";
  const debitKey =
    Object.keys(rows[0] ?? {}).find((k) => k.includes("حركة الفترة مدين")) ??
    "Debit";
  const creditKey =
    Object.keys(rows[0] ?? {}).find((k) => k.includes("حركة الفترة دائن")) ??
    "Credit";
  const closeDebitKey =
    Object.keys(rows[0] ?? {}).find((k) => k.includes("الرصيد الحالي مدين")) ??
    null;
  const closeCreditKey =
    Object.keys(rows[0] ?? {}).find((k) => k.includes("الرصيد الحالي دائن")) ??
    null;
  const netBalanceKey =
    Object.keys(rows[0] ?? {}).find(
      (k) =>
        k.includes("صافي الرصيد الحالي") &&
        !k.includes("الافتتاحي"),
    ) ?? null;
  const hintKeys = Object.keys(rows[0] ?? {}).filter((k) =>
    /^mapping\s*\d/i.test(k.trim()),
  );

  type AmountMode = "closing" | "net" | "movement" | "movement_first";

  const resolveRowWithMode = (
    r: Record<string, unknown>,
    mode: AmountMode,
  ): { debit: number; credit: number } => {
    const movD = parseAmount(r[debitKey]);
    const movC = parseAmount(r[creditKey]);
    const closeD =
      closeDebitKey && closeCreditKey ? parseAmount(r[closeDebitKey]) : 0;
    const closeC =
      closeDebitKey && closeCreditKey ? parseAmount(r[closeCreditKey]) : 0;
    const netBal = netBalanceKey ? parseAmount(r[netBalanceKey]) : 0;

    if (mode === "closing") {
      if (closeD !== 0 || closeC !== 0) {
        return { debit: closeD, credit: closeC };
      }
      if (netBal !== 0) {
        return netBal >= 0
          ? { debit: netBal, credit: 0 }
          : { debit: 0, credit: Math.abs(netBal) };
      }
      return { debit: 0, credit: 0 };
    }

    if (mode === "net") {
      if (netBal !== 0) {
        return netBal >= 0
          ? { debit: netBal, credit: 0 }
          : { debit: 0, credit: Math.abs(netBal) };
      }
      if (closeD !== 0 || closeC !== 0) {
        return { debit: closeD, credit: closeC };
      }
      return { debit: 0, credit: 0 };
    }

    if (mode === "movement") {
      return { debit: movD, credit: movC };
    }

    // movement_first — UI default
    if (movD !== 0 || movC !== 0) {
      return { debit: movD, credit: movC };
    }
    if (closeD !== 0 || closeC !== 0) {
      return { debit: closeD, credit: closeC };
    }
    if (netBal !== 0) {
      return netBal >= 0
        ? { debit: netBal, credit: 0 }
        : { debit: 0, credit: Math.abs(netBal) };
    }
    return { debit: 0, credit: 0 };
  };

  const dataRows = rows.filter((r) => {
    const accountCode = String(r[codeKey] ?? "").trim();
    const accountName = String(r[nameKey] ?? "").trim();
    return Boolean(accountCode && accountName);
  });

  const modePreference: Record<AmountMode, number> = {
    closing: 0,
    net: 1,
    movement: 2,
    movement_first: 3,
  };

  const candidateModes: AmountMode[] = ["closing", "net", "movement", "movement_first"];
  let amountMode: AmountMode = "movement_first";
  let bestVariance = Number.POSITIVE_INFINITY;

  const modeTotals = new Map<AmountMode, { debits: number; credits: number; variance: number }>();

  for (const mode of candidateModes) {
    if (mode === "closing" && !(closeDebitKey && closeCreditKey)) continue;
    if (mode === "net" && !netBalanceKey) continue;
    let debits = 0;
    let credits = 0;
    for (const r of dataRows) {
      const { debit, credit } = resolveRowWithMode(r, mode);
      debits += debit;
      credits += credit;
    }
    const variance = Math.abs(debits - credits);
    modeTotals.set(mode, { debits, credits, variance });
    if (
      variance < bestVariance ||
      (variance === bestVariance &&
        modePreference[mode] < modePreference[amountMode])
    ) {
      bestVariance = variance;
      amountMode = mode;
    }
  }

  const BALANCE_TOLERANCE = 1;
  const closingVariance = modeTotals.get("closing")?.variance;
  if (
    closeDebitKey &&
    closeCreditKey &&
    closingVariance !== undefined &&
    closingVariance <= BALANCE_TOLERANCE
  ) {
    amountMode = "closing";
    bestVariance = closingVariance;
  } else if (
    netBalanceKey &&
    (modeTotals.get("net")?.variance ?? Infinity) <= BALANCE_TOLERANCE
  ) {
    amountMode = "net";
    bestVariance = modeTotals.get("net")!.variance;
  }

  const parsed = dataRows
    .map((r) => {
      const accountCode = String(r[codeKey] ?? "").trim();
      const accountName = String(r[nameKey] ?? "").trim();
      const { debit, credit } = resolveRowWithMode(r, amountMode);
      const classificationHints = hintKeys
        .map((k) => String(r[k] ?? "").trim())
        .filter(Boolean);
      return {
        accountCode,
        accountName,
        debit,
        credit,
        classificationHints,
      };
    })
    .filter(Boolean) as Array<{
    accountCode: string;
    accountName: string;
    debit: number;
    credit: number;
    classificationHints: string[];
  }>;

  return {
    parsed,
    sheetName: wb.SheetNames[0]!,
    amountMode,
    balanceVariance: bestVariance,
    modeTotals: Object.fromEntries(modeTotals),
  };
}

async function main() {
  const filePath = process.argv[2];
  const engagementId = process.argv[3] ?? "eng-gulf-2025";

  if (!filePath) {
    console.error(
      "Usage: npx tsx scripts/tb-upload-demo.ts <TB.xlsx> [engagementId]",
    );
    process.exit(1);
  }

  const resolved = path.resolve(filePath);
  if (!fs.existsSync(resolved)) {
    console.error(`File not found: ${resolved}`);
    process.exit(1);
  }

  const { prisma } = await import("@/lib/prisma");
  const engagement = await prisma.auditEngagement.findUnique({
    where: { id: engagementId },
    select: { id: true, organizationId: true },
  });

  if (!engagement) {
    console.error(`Engagement not found: ${engagementId}`);
    console.error("Run: npm run seed:audit");
    process.exit(1);
  }

  const auditOrg = await prisma.auditOrganization.findUnique({
    where: { id: engagement.organizationId },
    select: { platformOrganizationId: true, name: true },
  });

  if (!auditOrg?.platformOrganizationId) {
    console.warn(
      "Warning: audit org missing platformOrganizationId — Firm Memory may not persist.",
    );
  }

  const { parsed, sheetName, amountMode, balanceVariance, modeTotals } =
    parseTbRows(resolved);
  const totalDebits = parsed.reduce((s, r) => s + r.debit, 0);
  const totalCredits = parsed.reduce((s, r) => s + r.credit, 0);
  const variance = totalDebits - totalCredits;
  console.log(`File: ${path.basename(resolved)} (${sheetName})`);
  console.log(`Engagement: ${engagementId}`);
  console.log(`Amount mode: ${amountMode} (|variance|=${balanceVariance.toLocaleString()})`);
  console.log("Mode totals:", JSON.stringify(modeTotals));
  console.log(`Rows to upload: ${parsed.length}`);
  console.log(
    `Parsed totals — debit: ${totalDebits.toLocaleString()} credit: ${totalCredits.toLocaleString()} variance: ${variance.toLocaleString()}`,
  );
  if (Math.abs(variance) >= 0.01) {
    console.warn(
      "Warning: trial balance is not balanced. Upload will proceed with trustState=conditional.",
    );
  }

  const { uploadTrialBalance } = await import("@/lib/audit/services");
  const result = await uploadTrialBalance(
    engagementId,
    path.basename(resolved),
    parsed,
    "demo-uploader",
    "TB Demo Upload",
  );

  const mappings = await prisma.auditAccountMapping.findMany({
    where: { engagementId },
    select: { id: true, status: true, confidence: true, sourceAccountCode: true },
  });

  const history = await prisma.tBClassificationHistory.count({
    where: { engagementId },
  });

  console.log("\nUpload complete");
  console.log(`Trial balance id: ${result.trialBalance.id}`);
  console.log(`TB lines: ${result.trialBalance.lines.length}`);
  console.log(`Suggested mappings: ${mappings.length}`);
  console.log(`Classification history rows: ${history}`);
  console.log(
    `Mapping URL: /audit/engagements/${engagementId}/mapping`,
  );

  await prisma.$disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
