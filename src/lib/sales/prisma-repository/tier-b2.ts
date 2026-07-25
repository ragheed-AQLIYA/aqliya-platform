// ─── Tier B2 intelligence (institutional learning insights) ───

import { getPrismaAny } from "./common";

export function isTierB2PrismaReady(): boolean {
  const db = getPrismaAny();
  return !!(db.salesInstitutionalLearningInsight?.findMany);
}

export async function prismaLoadTierB2Intelligence(
  organizationId: string,
): Promise<{
  institutionalLearningInsights: Map<string, unknown>;
} | null> {
  try {
    const db = getPrismaAny();
    const rows = await db.salesInstitutionalLearningInsight.findMany({
      where: { organizationId },
      take: 10000,
    });
    return {
      institutionalLearningInsights: new Map(rows.map((r: { id: string } & Record<string, unknown>) => [r.id, r])),
    };
  } catch {
    return null;
  }
}

export async function prismaCreateInstitutionalLearningInsight(
  data: Record<string, unknown>,
): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesInstitutionalLearningInsight.create({ data });
  } catch {
    // fail-soft
  }
}

export async function prismaUpdateInstitutionalLearningInsight(
  organizationId: string,
  id: string,
  data: Record<string, unknown>,
): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesInstitutionalLearningInsight.updateMany({ where: { id, organizationId }, data });
  } catch {
    // fail-soft
  }
}

export async function prismaDeleteInstitutionalLearningInsight(
  organizationId: string,
  id: string,
): Promise<void> {
  try {
    const db = getPrismaAny();
    await db.salesInstitutionalLearningInsight.deleteMany({ where: { id, organizationId } });
  } catch {
    // fail-soft
  }
}
