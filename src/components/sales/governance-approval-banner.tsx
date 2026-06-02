import { SalesInlineNotice } from "@/components/sales/sales-shell";
import {
  dealNeedsGovernanceAttention,
  requiresApprovalForStageChange,
} from "@/lib/sales/governance";

export function GovernanceApprovalBanner({
  stageSlug,
  evidenceLinkCount,
  metadata,
}: {
  stageSlug: string | null | undefined;
  evidenceLinkCount: number;
  metadata: unknown;
}) {
  if (!requiresApprovalForStageChange(stageSlug)) {
    return null;
  }

  if (!dealNeedsGovernanceAttention({ stageSlug, evidenceLinkCount, metadata })) {
    return null;
  }

  return (
    <SalesInlineNotice
      variant="warning"
      title="مراجعة حوكمة مطلوبة"
      description="هذه المرحلة (عرض/تجريب/فوز) تتطلب دليلاً مرتبطاً على الصفقة، أو قرار مراجعة معتمد، أو سبب تجاوز صريح من مشغّل عند تغيير المرحلة (يُسجَّل في التدقيق)."
    />
  );
}
