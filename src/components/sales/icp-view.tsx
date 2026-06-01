import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import type { SalesICPHypothesis } from "@/lib/sales/types";

interface ICPViewProps {
  hypotheses: SalesICPHypothesis[];
  disclaimerAr: string;
  icpFit: { labelAr: string; count: number; pct: number }[];
}

export function ICPView({ hypotheses, disclaimerAr, icpFit }: ICPViewProps) {
  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-h2 font-black">ملف العميل المثالي (ICP)</h1>
        <p className="mt-1 text-sm text-muted-foreground">{disclaimerAr}</p>
      </div>

      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>توزيع الملاءمة</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          <ul className="space-y-2">
            {icpFit.map((f) => (
              <li key={f.labelAr} className="flex items-center gap-2 text-sm">
                <div className="h-2 flex-1 rounded bg-muted overflow-hidden">
                  <div
                    className="h-full bg-primary/60"
                    style={{ width: `${f.pct}%` }}
                  />
                </div>
                <span className="w-28">{f.labelAr}</span>
                <span className="text-muted-foreground">{f.pct}%</span>
              </li>
            ))}
          </ul>
        </EnterpriseCardContent>
      </EnterpriseCard>

      {hypotheses.map((h) => (
        <EnterpriseCard key={h.id} module="sales">
          <EnterpriseCardHeader>
            <EnterpriseCardTitle className="flex items-center justify-between gap-2">
              <span>{h.segmentAr}</span>
              <span className="text-xs font-normal text-muted-foreground">
                ثقة {Math.round(h.confidence * 100)}%
              </span>
            </EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent className="space-y-4">
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                الفرضية
              </p>
              <p className="text-sm">{h.hypothesisAr}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                الأدلة
              </p>
              <ul className="list-inside list-disc text-sm">
                {h.evidenceAr.map((e) => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="text-xs font-semibold text-muted-foreground mb-1">
                تعديلات مقترحة (ليست حقيقة نهائية)
              </p>
              <ul className="list-inside list-disc text-sm text-amber-800 dark:text-amber-200">
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
