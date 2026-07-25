"use client";

import { Shield } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { GovernanceTooltip, ProvenanceSummary } from "@/components/audit/governance";

interface GovernanceInfoProps {
  t: (key: string) => string;
  governanceCtx: {
    doctrineReferences: Array<{ documentId: string; principle: string }>;
    governanceReferences: Array<unknown>;
    humanApprovalRequired: boolean;
  };
  open: boolean;
  onToggle: () => void;
}

export function GovernanceInfo({
  t,
  governanceCtx,
  open,
  onToggle,
}: GovernanceInfoProps) {
  return (
    <>
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <GovernanceTooltip
          content={`المرجعية: ${governanceCtx.doctrineReferences.length} مرجع يوجه سير العمل. الحوكمة: ${governanceCtx.governanceReferences.length} قاعدة مطبقة. ${governanceCtx.humanApprovalRequired ? "المراجعة البشرية مطلوبة." : "لا تتطلب مراجعة بشرية."}`}
        >
          <button
            onClick={onToggle}
            className="flex items-center gap-1 hover:text-foreground transition-colors"
          >
            <Shield className="size-3.5" />
            {t("governanceContext")}
          </button>
        </GovernanceTooltip>
        <span className="text-muted-foreground/60">·</span>
        <span className="text-muted-foreground/80">
          {governanceCtx.humanApprovalRequired
            ? t("humanReviewRequired")
            : t("noHumanReviewRequired")}
        </span>
      </div>

      {open && (
        <Card className="border-dashed">
          <CardContent className="p-4 space-y-2 text-sm">
            <p className="font-medium">{t("whyGovernance")}</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              {governanceCtx.doctrineReferences.map((d) => (
                <li key={d.documentId}>
                  <strong>{d.documentId}:</strong> {d.principle}
                </li>
              ))}
            </ul>
            <div className="pt-2 border-t">
              <ProvenanceSummary
                taskType="Statement Drafting"
                doctrineCount={governanceCtx.doctrineReferences.length}
                governanceCount={governanceCtx.governanceReferences.length}
                evidenceStatus="partial"
                escalationLevel="notice"
                reviewRequired={governanceCtx.humanApprovalRequired}
              />
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}
