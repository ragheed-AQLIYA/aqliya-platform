import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { StatusBadge } from "@/components/enterprise/status-badge";
import type { SalesAccount, SalesOpportunity, SalesContact } from "@/lib/sales/types";
import { PIPELINE_STAGE_LABELS } from "@/lib/sales/types";

interface PipelineItem {
  opportunity: SalesOpportunity;
  account?: SalesAccount;
  probability: number;
  risks: string[];
  nextAction: string;
  linkedContacts: SalesContact[];
  proofCount: number;
  winLossReason?: string;
}

interface PipelineViewProps {
  pipeline: PipelineItem[];
}

const BOARD_STAGES = [
  "Draft",
  "Qualification",
  "InReview",
  "Approved",
  "ClosedWon",
  "ClosedLost",
] as const;

export function PipelineView({ pipeline }: PipelineViewProps) {
  const byStage = BOARD_STAGES.reduce(
    (acc, stage) => {
      acc[stage] = pipeline.filter((p) => p.opportunity.stage === stage);
      return acc;
    },
    {} as Record<string, PipelineItem[]>,
  );

  return (
    <div className="space-y-6" dir="rtl">
      <div>
        <h1 className="text-h2 font-black">مسار الفرص</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          من جديد إلى مغلق — بيانات من المتجر التشغيلي
        </p>
      </div>

      {/* Board view */}
      <div className="overflow-x-auto pb-4">
        <div className="flex gap-3 min-w-max">
          {BOARD_STAGES.map((stage) => (
            <div
              key={stage}
              className="w-56 shrink-0 rounded-xl border bg-muted/20 p-2"
            >
              <p className="mb-2 text-xs font-semibold px-1">
                {PIPELINE_STAGE_LABELS[stage]?.ar ?? stage} ({byStage[stage]?.length ?? 0})
              </p>
              <ul className="space-y-2">
                {(byStage[stage] ?? []).map((item) => (
                  <li key={item.opportunity.id}>
                    <Link
                      href={`/sales/opportunities/${item.opportunity.id}`}
                      className="block rounded-lg border bg-background p-2 hover:border-primary/50 text-sm"
                    >
                      <p className="font-medium truncate">{item.opportunity.name}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {item.account?.nameAr ?? item.account?.name ?? "—"}
                      </p>
                      {item.opportunity.valueEstimate != null && (
                        <p className="text-xs mt-1">
                          {item.opportunity.valueEstimate.toLocaleString("ar-SA")} ر.س
                        </p>
                      )}
                      <p className="text-xs text-primary mt-0.5">
                        {item.probability}% احتمال
                      </p>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      {/* Table view */}
      <EnterpriseCard module="sales">
        <EnterpriseCardHeader>
          <EnterpriseCardTitle>جدول الفرص</EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b text-right text-muted-foreground">
                  <th className="py-2 px-2">الفرصة</th>
                  <th className="py-2 px-2">الحساب</th>
                  <th className="py-2 px-2">القيمة</th>
                  <th className="py-2 px-2">الاحتمال</th>
                  <th className="py-2 px-2">المرحلة</th>
                  <th className="py-2 px-2">المخاطر</th>
                  <th className="py-2 px-2">الإجراء التالي</th>
                  <th className="py-2 px-2">الأدلة</th>
                </tr>
              </thead>
              <tbody>
                {pipeline.map((item) => (
                  <tr key={item.opportunity.id} className="border-b">
                    <td className="py-2 px-2">
                      <Link
                        href={`/sales/opportunities/${item.opportunity.id}`}
                        className="text-primary hover:underline"
                      >
                        {item.opportunity.name}
                      </Link>
                    </td>
                    <td className="py-2 px-2">
                      {item.account ? (
                        <Link
                          href={`/sales/accounts/${item.account.id}`}
                          className="hover:underline"
                        >
                          {item.account.nameAr ?? item.account.name}
                        </Link>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td className="py-2 px-2">
                      {item.opportunity.valueEstimate?.toLocaleString("ar-SA") ?? "—"}
                    </td>
                    <td className="py-2 px-2">{item.probability}%</td>
                    <td className="py-2 px-2">
                      <StatusBadge status={item.opportunity.stage} size="sm" />
                    </td>
                    <td className="py-2 px-2 text-xs text-muted-foreground max-w-[120px] truncate">
                      {item.risks.join(", ") || "—"}
                    </td>
                    <td className="py-2 px-2 text-xs">{item.nextAction}</td>
                    <td className="py-2 px-2">{item.proofCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </EnterpriseCardContent>
      </EnterpriseCard>
    </div>
  );
}
