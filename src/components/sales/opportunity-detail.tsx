"use client";

import { useTransition } from "react";
import Link from "next/link";
import { StatusBadge } from "@/components/enterprise/status-badge";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { Button } from "@/components/ui/button";
import {
  submitOpportunityReviewAction,
  approveOpportunityAction,
  linkEvidenceAction,
  requestClaimReviewAction,
} from "@/actions/sales-actions";
import { OpportunityWinLossCapture } from "@/components/sales/opportunity-win-loss-capture";
import type { SalesAccount, SalesOpportunity } from "@/lib/sales/types";
import type { SalesEvidenceRef } from "@/lib/sales/store";
import type { ReviewApprovalPackage } from "@/lib/platform/contracts/review-approval-contract";
import type { ProofLinkageSummary } from "@/lib/sales/proof-linkage-service";

interface OpportunityDetailProps {
  opportunity: SalesOpportunity;
  account: SalesAccount | null | undefined;
  evidence: SalesEvidenceRef[];
  reviewPackage: ReviewApprovalPackage;
  exportGate: { allowed: boolean; reason?: string };
  proofLinkage?: ProofLinkageSummary;
  captureWinLossAction?: (
    formData: FormData,
  ) => Promise<{ ok: true; winLossReason: string }>;
}

export function OpportunityDetailView({
  opportunity,
  account,
  evidence,
  reviewPackage,
  exportGate,
  proofLinkage,
}: OpportunityDetailProps) {
  const [pending, startTransition] = useTransition();

  function handleSubmitReview() {
    startTransition(async () => {
      await submitOpportunityReviewAction(opportunity.id);
      window.location.reload();
    });
  }

  function handleApprove() {
    startTransition(async () => {
      await approveOpportunityAction(opportunity.id);
      window.location.reload();
    });
  }

  function handleLinkEvidence() {
    startTransition(async () => {
      await linkEvidenceAction(
        opportunity.id,
        "qualification_note",
        "Qualification evidence — v1 seed",
      );
      window.location.reload();
    });
  }

  function handleAIReview() {
    startTransition(async () => {
      await requestClaimReviewAction(opportunity.id);
      window.location.reload();
    });
  }

  const opportunityRisks = opportunity.risks ?? [];

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <Link
          href="/sales/opportunities"
          className="text-sm text-muted-foreground hover:underline"
        >
          ← المسار
        </Link>
        <h1 className="mt-2 text-h2 font-black">{opportunity.name}</h1>
        {account && (
          <p className="text-sm text-muted-foreground">
            الحساب:{" "}
            <Link
              href={`/sales/accounts/${account.id}`}
              className="text-primary hover:underline"
            >
              {account.nameAr ?? account.name}
            </Link>
          </p>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <StatusBadge status={opportunity.stage} />
        <StatusBadge status={reviewPackage.status} size="sm" />
      </div>

      {opportunityRisks.length > 0 && (
        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>مخاطر مسجّلة على الفرصة</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <ul className="list-inside list-disc text-sm">
              {opportunityRisks.map((r) => (
                <li key={r}>{r}</li>
              ))}
            </ul>
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}

      <div className="grid gap-4 md:grid-cols-2">
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
                  onClick={handleSubmitReview}
                >
                  إرسال للمراجعة
                </Button>
              )}
              {opportunity.reviewStatus === "InReview" && (
                <Button size="sm" disabled={pending} onClick={handleApprove}>
                  اعتماد
                </Button>
              )}
              {evidence.length === 0 && (
                <Button
                  size="sm"
                  variant="outline"
                  disabled={pending}
                  onClick={handleLinkEvidence}
                >
                  ربط دليل تأهيل
                </Button>
              )}
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>

        <EnterpriseCard module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>المخرجات والذكاء</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent className="space-y-3">
            <p className="text-sm">
              تصدير الملخص:{" "}
              {exportGate.allowed ? "مسموح" : (exportGate.reason ?? "محظور")}
            </p>
            <Button
              size="sm"
              variant="secondary"
              disabled={pending}
              onClick={handleAIReview}
            >
              طلب مراجعة ادعاء (AI محكوم)
            </Button>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      {proofLinkage && (
        <EnterpriseCard module="sales" className="border-dashed">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>أصول الإثبات (proof linkage)</EnterpriseCardTitle>
            <p className="text-xs text-muted-foreground">
              تغطية أدلة:{" "}
              {Math.round(proofLinkage.evidenceCoverage.coverageRatio * 100)}%
              — مسودة توصيات
            </p>
          </EnterpriseCardHeader>
          <EnterpriseCardContent className="space-y-3 text-sm">
            {proofLinkage.linkedAssets.length > 0 ? (
              <ul className="space-y-1">
                {proofLinkage.linkedAssets.map((a) => (
                  <li key={a.id}>
                    {a.title}{" "}
                    <span className="text-muted-foreground">
                      ({a.assetType})
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-muted-foreground">لا أصول إثبات مرتبطة بعد</p>
            )}
            {proofLinkage.missingAssetTypes.length > 0 && (
              <p className="text-xs text-amber-700 dark:text-amber-400">
                أنواع ناقصة للمرحلة:{" "}
                {proofLinkage.missingAssetTypes.join("، ")}
              </p>
            )}
            {proofLinkage.recommendations.map((rec) => (
              <p key={rec} className="text-xs text-muted-foreground">
                {rec}
              </p>
            ))}
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}

      <EnterpriseCard>
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>الأدلة التجارية المرتبطة</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          {evidence.length === 0 ? (
            <p className="text-sm text-muted-foreground">لا توجد أدلة بعد</p>
          ) : (
            <ul className="space-y-2">
              {evidence.map((e) => (
                <li key={e.id} className="text-sm">
                  {e.label} ({e.typeId})
                </li>
              ))}
            </ul>
          )}
        </EnterpriseCardContent>
      </EnterpriseCard>

      <OpportunityWinLossCapture opportunity={opportunity} />
    </div>
  );
}
