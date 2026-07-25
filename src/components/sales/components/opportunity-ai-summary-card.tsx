"use client";

import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { Button } from "@/components/ui/button";

interface OpportunityAISummaryCardProps {
  exportGate: { allowed: boolean; reason?: string };
  pending: boolean;
  onAIReview: () => void;
}

export function OpportunityAISummaryCard({
  exportGate,
  pending,
  onAIReview,
}: OpportunityAISummaryCardProps) {
  return (
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
          onClick={onAIReview}
        >
          طلب مراجعة ادعاء (AI محكوم)
        </Button>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
