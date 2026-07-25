import { prisma } from "./common";
import {
  toTrialBalance,
  toTrialBalanceLine,
  protectedAuditReadUnavailable,
} from "./common";
import type { TrialBalance, TrialBalanceLine } from "./common";

export async function getTrialBalance(
  engagementId: string,
): Promise<TrialBalance | null> {
  try {
    const tb = await prisma.auditTrialBalance.findFirst({
      where: { engagementId },
      include: { lines: true },
      orderBy: { createdAt: "desc" },
    });
    if (!tb) return null;
    return toTrialBalance(tb);
  } catch (error) {
    protectedAuditReadUnavailable(`getTrialBalance(${engagementId})`, error);
  }
}

export async function getTrialBalanceLines(
  engagementId: string,
): Promise<TrialBalanceLine[]> {
  try {
    const tb = await prisma.auditTrialBalance.findFirst({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
      include: { lines: true },
    });
    if (!tb || tb.lines.length === 0) return [];
    return tb.lines.map(toTrialBalanceLine);
  } catch (error) {
    protectedAuditReadUnavailable(
      `getTrialBalanceLines(${engagementId})`,
      error,
    );
  }
}

export async function saveTrialBalance(
  engagementId: string,
  sourceFile: string,
  rows: Array<{
    accountCode: string;
    accountName: string;
    debitAmount: number;
    creditAmount: number;
    balance: number;
    accountType?: string;
  }>,
): Promise<TrialBalance> {
  const engagement = await prisma.auditEngagement.findUnique({
    where: { id: engagementId },
    select: { client: { select: { currencyCode: true } } },
  });
  const currency = engagement?.client?.currencyCode ?? "SAR";

  const totalDebits = rows.reduce((s, r) => s + r.debitAmount, 0);
  const totalCredits = rows.reduce((s, r) => s + r.creditAmount, 0);
  const variance = totalDebits - totalCredits;
  const tb = await prisma.auditTrialBalance.create({
    data: {
      engagementId,
      sourceFile,
      trustState: Math.abs(variance) < 1 ? "trusted" : "conditional",
      totalDebits,
      totalCredits,
      variance,
      lines: {
        create: rows.map((r) => ({
          accountCode: r.accountCode,
          accountName: r.accountName,
          debitAmount: r.debitAmount,
          creditAmount: r.creditAmount,
          balance: r.balance,
          accountType: r.accountType ?? null,
          currency,
        })),
      },
    },
    include: { lines: true },
  });
  return toTrialBalance(tb);
}
