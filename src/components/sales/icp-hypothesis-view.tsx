import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { Badge } from "@/components/ui/badge";
import type { SalesICPHypothesis } from "@/lib/sales/types";

interface ICPViewProps {
  hypotheses: SalesICPHypothesis[];
  disclaimerAr: string;
  icpFit: Array<{ labelAr: string; count: number; pct: number }>;
}

export function ICPHypothesisView({
  hypotheses,
  disclaimerAr,
  icpFit,
}: ICPViewProps) {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-h2 font-black">فرضية ICP</h1>
        <p className="mt-1 text-sm text-amber-700 dark:text-amber-400">
          {disclaimerAr}
        </p>
      </div>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle className="text-base">توزيع الملاءمة</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          <ul className="space-y-2 text-sm">
            {icpFit.map((b) => (
              <li key={b.labelAr} className="flex justify-between">
                <span>{b.labelAr}</span>
                <span>
                  {b.count} ({b.pct}%)
                </span>
              </li>
            ))}
          </ul>
        </EnterpriseCardContent>
      </EnterpriseCard>

      {hypotheses.map((h) => (
        <EnterpriseCard key={h.id} module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle className="flex flex-wrap items-center gap-2 text-base">
              {h.segmentAr}
              <Badge variant="outline">
                ثقة {Math.round(h.confidence * 100)}%
              </Badge>
            </EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent className="space-y-3 text-sm">
            <div>
              <p className="font-medium">الفرضية</p>
              <p className="text-muted-foreground">{h.hypothesisAr}</p>
            </div>
            <div>
              <p className="font-medium">الأدلة</p>
              <ul className="list-inside list-disc text-muted-foreground">
                {h.evidenceAr.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium">تعديلات مقترحة (ليست حقيقة نهائية)</p>
              <ul className="list-inside list-disc text-muted-foreground">
                {h.recommendedAdjustmentsAr.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      ))}
    </div>
  );
}
