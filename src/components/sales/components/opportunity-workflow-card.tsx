"use client";

import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { Button } from "@/components/ui/button";
import type { ReviewApprovalPackage } from "@/components/sales/components/opportunity-types";
import type { SalesOpportunity } from "@/lib/sales/types";

interface OpportunityWorkflowCardProps {
  opportunity: SalesOpportunity;
  reviewPackage: ReviewApprovalPackage;
  evidenceCount: number;
  pending: boolean;
  onSubmitReview: () => void;
  onApprove: () => void;
  onLinkEvidence: () => void;
}

export function OpportunityWorkflowCard({
  opportunity,
  reviewPackage,
  evidenceCount,
  pending,
  onSubmitReview,
  onApprove,
  onLinkEvidence,
}: OpportunityWorkflowCardProps) {
  return (
    <EnterpriseCard module="sales">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle>حالة سير العمل</EnterpriseCardTitle>
      </EnterpriseCardHeader>
      <EnterpriseCardContent className="space-y-3">
        <p className="text-sm">
          مراجعة: {opportunity.reviewStatus ?? "Draft"}
        </p>
        <p className="text-sm">
          اعتماد: {opportunity.approvalStatus ?? "Draft"}
        </p>
        <p className="text-sm">
          أدلة مكتملة: {reviewPackage.evidenceComplete ? "نعم" : "لا"}
        </p>
        <div className="flex flex-wrap gap-2">
          {(opportunity.reviewStatus === "Draft" ||
            opportunity.reviewStatus === "Returned") && (
            <Button
              size="sm"
              disabled={pending || !reviewPackage.evidenceComplete}
              onClick={onSubmitReview}
            >
              إرسال للمراجعة
            </Button>
          )}
          {opportunity.reviewStatus === "InReview" && (
            <Button size="sm" disabled={pending} onClick={onApprove}>
              اعتماد
            </Button>
          )}
          {evidenceCount === 0 && (
            <Button
              size="sm"
              variant="outline"
              disabled={pending}
              onClick={onLinkEvidence}
            >
              ربط دليل تأهيل
            </Button>
          )}
        </div>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
