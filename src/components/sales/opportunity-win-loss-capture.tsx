"use client";

import { useTransition } from "react";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { Button } from "@/components/ui/button";
import type { SalesOpportunity } from "@/lib/sales/types";
import { isClosedOpportunityStage } from "@/lib/sales/types";

const WIN_LOSS_OPTIONS: { value: string; labelAr: string }[] = [
  { value: "budget_freeze", labelAr: "تجميد الميزانية" },
  { value: "no_executive_sponsor", labelAr: "لا راعٍ تنفيذي" },
  { value: "competitor", labelAr: "خسارة أمام منافس" },
  { value: "price_value", labelAr: "السعر / القيمة" },
  { value: "pilot_success", labelAr: "نجاح تجريبي" },
  { value: "governance_approved", labelAr: "اعتماد حوكمة" },
  { value: "other", labelAr: "سبب آخر (نص حر)" },
];

export function OpportunityWinLossCapture({
  opportunity,
}: {
  opportunity: SalesOpportunity;
}) {
  const [pending, startTransition] = useTransition();
  const isClosed = isClosedOpportunityStage(opportunity.stage);

  function handleSubmit(formData: FormData) {
    startTransition(async () => {
      const { captureOpportunityWinLossDraftAction } =
        await import("@/components/sales/opportunity-win-loss-actions");
      await captureOpportunityWinLossDraftAction(opportunity.id, formData);
      window.location.reload();
    });
  }

  return (
    <EnterpriseCard module="sales" className="border-dashed">
      <EnterpriseCardHeader>
        <EnterpriseCardTitle className="flex items-center gap-2">
          تسجيل فوز / خسارة
          <span className="rounded bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800 dark:bg-amber-900 dark:text-amber-200">
            DRAFT
          </span>
        </EnterpriseCardTitle>
        <p className="text-xs text-muted-foreground">
          مسودة لسبب الإغلاق — يغذي الذاكرة التجارية؛ المراجعة البشرية مطلوبة قبل
          ادعاءات حساسة.
        </p>
      </EnterpriseCardHeader>
      <EnterpriseCardContent className="space-y-3">
        {opportunity.winLossReason ? (
          <p className="text-sm">
            السبب المسجّل: <strong>{opportunity.winLossReason}</strong>
          </p>
        ) : isClosed ? (
          <p className="text-sm text-amber-700 dark:text-amber-400">
            فرصة مغلقة بدون سبب مسجّل — يُوصى بالتقاط السبب.
          </p>
        ) : null}

        <form action={handleSubmit} className="flex flex-col gap-2">
          <label className="text-xs text-muted-foreground" htmlFor="winLossReason">
            سبب الفوز / الخسارة
          </label>
          <select
            id="winLossReason"
            name="reasonKey"
            className="rounded-md border px-2 py-1 text-sm"
            defaultValue=""
            required
          >
            <option value="" disabled>
              اختر سبباً…
            </option>
            {WIN_LOSS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.labelAr}
              </option>
            ))}
          </select>
          <input
            name="reasonNotes"
            placeholder="ملاحظات إضافية (اختياري)"
            className="rounded-md border px-2 py-1 text-sm"
          />
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? "جاري الحفظ…" : "حفظ مسودة السبب"}
          </Button>
        </form>
      </EnterpriseCardContent>
    </EnterpriseCard>
  );
}
