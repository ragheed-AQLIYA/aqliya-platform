import { listProofAssets } from "@/lib/sales/store";
import { salesGetProofEffectivenessWidget } from "@/lib/sales/services/proof-effectiveness-service";
import type { ExecutiveCommercialProof } from "./types";
import type { ExecutiveCommercialSection } from "./common";

export function buildProofSection(orgId: string): ExecutiveCommercialSection<ExecutiveCommercialProof> {
  try {
    const assets = listProofAssets(orgId).filter((a) => a.status === "active");
    const widget = salesGetProofEffectivenessWidget(orgId, 3);

    if (assets.length === 0) {
      return {
        status: "empty",
        fallbackMessageAr: "لا توجد أصول إثبات نشطة.",
        data: null,
      };
    }

    const typeCounts = new Map<string, number>();
    const linkedOppIds = new Set<string>();
    for (const asset of assets) {
      typeCounts.set(asset.assetType, (typeCounts.get(asset.assetType) ?? 0) + 1);
      for (const oppId of asset.linkedOpportunityIds ?? []) {
        linkedOppIds.add(oppId);
      }
    }

    const assetTypes = [...typeCounts.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([type, count]) => ({ type, count }));

    const coverageGapHintAr =
      linkedOppIds.size === 0
        ? "أصول الإثبات غير مربوطة بفرص — راجع الربط في SalesOS."
        : null;

    return {
      status: "ok",
      data: {
        activeAssetCount: assets.length,
        linkedOpportunityCount: linkedOppIds.size,
        assetTypes,
        coverageGapHintAr,
        topEffectiveAssets: widget.topAssets.map((row: { title: string; effectivenessScore: number; linkedOpportunityCount: number }) => ({
          title: row.title,
          score: row.effectivenessScore,
          linkedCount: row.linkedOpportunityCount,
        })),
      },
    };
  } catch {
    return {
      status: "fallback",
      fallbackMessageAr: "تعذر تحميل شبكة الإثبات.",
      data: null,
    };
  }
}
