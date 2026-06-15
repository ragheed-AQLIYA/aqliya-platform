import "server-only";

import { prisma } from "@/lib/prisma";
import type { MappingWithCanonical } from "@/lib/audit/db/statement-builder";

const MAP1_PATTERN =
  /revenue|cost|finance|zakat|administrative|other income|affiliate/i;

function pickMap1FromHints(hints: unknown): string | null {
  if (!Array.isArray(hints)) return null;
  const strings = hints
    .map((h) => (typeof h === "string" ? h.trim() : ""))
    .filter(Boolean);
  const matched = strings.find((h) => MAP1_PATTERN.test(h));
  return matched ?? strings[0] ?? null;
}

/**
 * Attach ERP Map1 labels from TBClassificationHistory for presentation layer.
 * Required for Phase 14 Map1 authority in live FS rebuild (not offline scripts only).
 */
export async function enrichMappingsWithErpMap1(
  engagementId: string,
  mappings: MappingWithCanonical[],
): Promise<MappingWithCanonical[]> {
  const history = await prisma.tBClassificationHistory.findMany({
    where: { engagementId },
    orderBy: { createdAt: "desc" },
    select: { accountCode: true, mappingHints: true },
  });

  const map1ByCode = new Map<string, string>();
  for (const row of history) {
    if (map1ByCode.has(row.accountCode)) continue;
    const map1 = pickMap1FromHints(row.mappingHints);
    if (map1) map1ByCode.set(row.accountCode, map1);
  }

  if (map1ByCode.size === 0) {
    return mappings;
  }

  return mappings.map((mapping) => {
    const erpMap1Label = map1ByCode.get(mapping.sourceAccountCode);
    if (!erpMap1Label) return mapping;
    return { ...mapping, erpMap1Label };
  });
}

export { pickMap1FromHints };
