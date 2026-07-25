import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { ProofLinkageSummary } from "@/lib/sales/proof-linkage-service";

interface OpportunityProofLinkageCardProps {
  proofLinkage: ProofLinkageSummary;
}

export function OpportunityProofLinkageCard({
  proofLinkage,
}: OpportunityProofLinkageCardProps) {
  return (
    <EnterpriseCard module="sales" className="border-dashed">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>أصول الإثبات (proof linkage)</EnterpriseCardTitle>
        <p className="text-xs text-muted-foreground">
          تغطية أدلة: {proofLinkage.evidenceCoverage.coveragePct}%
          — مسودة توصيات
        </p>
      </EnterpriseCardHeader>
      <EnterpriseCardContent className="space-y-3 text-sm">
        {proofLinkage.linkedAssets.length > 0 ? (
          <ul className="space-y-1">
            {proofLinkage.linkedAssets.map((a) => (
              <li key={a.id}>
                {a.title}{" "}
                <span className="text-muted-foreground">({a.assetType})</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-muted-foreground">لا أصول إثبات مرتبطة بعد</p>
        )}
        {proofLinkage.missingAssetTypes.length > 0 && (
          <p className="text-xs text-amber-700 dark:text-amber-400">
            أنواع ناقصة للمرحلة: {proofLinkage.missingAssetTypes.join("، ")}
          </p>
        )}
        {proofLinkage.recommendations.map((rec) => (
          <p key={rec} className="text-xs text-muted-foreground">
            {rec}
          </p>
        ))}
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
