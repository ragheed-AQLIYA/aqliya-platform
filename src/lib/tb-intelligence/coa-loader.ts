import { prisma } from "@/lib/prisma";
import type { CanonicalCandidate } from "./types";
import ifrsMapping from "../../../knowledge/chart-of-accounts/ifrs-mapping.json";

export async function loadCanonicalCandidates(): Promise<CanonicalCandidate[]> {
  const fromDb = await prisma.auditCanonicalAccount.findMany({
    orderBy: { displayOrder: "asc" },
  });

  if (fromDb.length > 0) {
    return fromDb.map((a) => ({
      id: a.id,
      code: a.code,
      name: a.name,
      category: a.category,
      statementType: a.statementType,
    }));
  }

  return (ifrsMapping.accounts as CanonicalCandidate[]).map((a, i) => ({
    ...a,
    id: `kb-${a.code}-${i}`,
  }));
}

export function classifyByPrefix(accountCode: string): string | undefined {
  if (!accountCode || accountCode.length < 2) return undefined;
  const prefix = accountCode.substring(0, 2);
  if (["10", "11", "12"].includes(prefix)) return "asset";
  if (["13", "14"].includes(prefix)) return "non-current-asset";
  if (["20", "21"].includes(prefix)) return "liability";
  if (["30", "31"].includes(prefix)) return "equity";
  if (["40", "41"].includes(prefix)) return "revenue";
  if (
    ["50", "51", "52", "53", "54", "55", "56", "57", "58", "59"].includes(
      prefix,
    )
  )
    return "expense";
  return undefined;
}
