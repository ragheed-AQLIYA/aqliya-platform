"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PresentationPolicyRules } from "@/lib/audit/presentation/presentation-policy-types";

interface PresentationPolicyViewerProps {
  policy: PresentationPolicyRules;
  policyId?: string | null;
}

export function PresentationPolicyViewer({
  policy,
  policyId,
}: PresentationPolicyViewerProps) {
  return (
    <Card dir="rtl">
      <CardHeader className="pb-2">
        <CardTitle className="text-base">سياسة العرض المرتبطة</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        <div>
          <p className="font-medium">{policy.name}</p>
          <p className="text-xs text-muted-foreground font-mono">
            {policy.slug} · {policy.version}
            {policyId ? ` · ${policyId}` : ""}
          </p>
        </div>
        <dl className="grid gap-2 text-xs">
          <div>
            <dt className="text-muted-foreground">استثناءات الإيراد التشغيلي</dt>
            <dd className="font-mono">
              {policy.revenue.operatingExclusionGlCodes.length
                ? policy.revenue.operatingExclusionGlCodes.join(", ")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">استثناءات تكلفة الإيراد</dt>
            <dd className="font-mono">
              {[
                ...policy.costOfRevenue.exclusionGlCodes,
                ...policy.costOfRevenue.exclusionPrefixPatterns.map(
                  (p) => `${p}*`,
                ),
              ].join(", ") || "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">صافي الدخل الآخر (هدف)</dt>
            <dd>
              {policy.otherIncome.targetNet != null
                ? policy.otherIncome.targetNet.toLocaleString("en-SA")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">تسوية تكلفة التمويل</dt>
            <dd>
              {policy.finance.netOffset != null
                ? policy.finance.netOffset.toLocaleString("en-SA")
                : "—"}
            </dd>
          </div>
        </dl>
      </CardContent>
    </Card>
  );
}
