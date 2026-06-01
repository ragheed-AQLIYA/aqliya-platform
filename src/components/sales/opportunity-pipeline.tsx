"use client";

import { useState } from "react";
import Link from "next/link";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { StatusBadge } from "@/components/enterprise/status-badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { NextBestActionPanel } from "./next-best-action-panel";
import {
  normalizeOpportunityStage,
  SALES_OPPORTUNITY_STAGES_V01,
  type SalesNextBestActionItem,
  type SalesAccount,
  type SalesContact,
  type SalesOpportunity,
} from "@/lib/sales/types";

type PipelineItem = {
  opportunity: SalesOpportunity;
  account?: SalesAccount;
  probability: number;
  risks: string[];
  nextAction: string;
  linkedContacts: SalesContact[];
  proofCount: number;
  winLossReason?: string;
};

const STAGE_ORDER = [...SALES_OPPORTUNITY_STAGES_V01];

export function OpportunityPipeline({
  pipeline,
  nextActions,
}: {
  pipeline: PipelineItem[];
  nextActions: SalesNextBestActionItem[];
}) {
  const [view, setView] = useState<"board" | "table">("board");

  const byStage = STAGE_ORDER.map((stage) => ({
    stage,
    items: pipeline.filter(
      (p) => normalizeOpportunityStage(p.opportunity.stage) === stage,
    ),
  }));

  return (
    <div className="space-y-6" dir="rtl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h2 font-black">مسار الفرص</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {pipeline.length} فرصة — من جديد إلى مغلق
          </p>
        </div>
        <Tabs
          value={view}
          onValueChange={(v) => setView(v as "board" | "table")}
        >
          <TabsList>
            <TabsTrigger value="board">لوحة</TabsTrigger>
            <TabsTrigger value="table">جدول</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <NextBestActionPanel
        actions={nextActions.slice(0, 4)}
        title="إجراءات المسار"
        compact
      />

      {view === "board" ? (
        <div className="flex gap-4 overflow-x-auto pb-4">
          {byStage.map(({ stage, items }) => (
            <div
              key={stage}
              className="min-w-[240px] flex-shrink-0 rounded-xl border bg-muted/30 p-3"
            >
              <h3 className="mb-3 text-sm font-semibold">
                {stage}{" "}
                <span className="text-muted-foreground">({items.length})</span>
              </h3>
              <div className="space-y-2">
                {items.map((item) => (
                  <PipelineCard key={item.opportunity.id} item={item} />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="overflow-x-auto pt-6">
            <table className="w-full min-w-[800px] text-sm">
              <thead>
                <tr className="border-b text-right text-muted-foreground">
                  <th className="p-2">الفرصة</th>
                  <th className="p-2">الحساب</th>
                  <th className="p-2">المرحلة</th>
                  <th className="p-2">القيمة</th>
                  <th className="p-2">الاحتمال</th>
                  <th className="p-2">الإجراء التالي</th>
                  <th className="p-2">المخاطر</th>
                </tr>
              </thead>
              <tbody>
                {pipeline.map((item) => (
                  <tr key={item.opportunity.id} className="border-b">
                    <td className="p-2">
                      <Link
                        href={`/sales/opportunities/${item.opportunity.id}`}
                        className="text-primary hover:underline"
                      >
                        {item.opportunity.name}
                      </Link>
                    </td>
                    <td className="p-2">
                      {item.account?.nameAr ?? item.account?.name ?? "—"}
                    </td>
                    <td className="p-2">
                      <StatusBadge
                        status={normalizeOpportunityStage(item.opportunity.stage)}
                        size="sm"
                      />
                    </td>
                    <td className="p-2">
                      {item.opportunity.valueEstimate?.toLocaleString("ar-SA") ??
                        "—"}
                    </td>
                    <td className="p-2">{item.probability}%</td>
                    <td className="p-2">{item.nextAction}</td>
                    <td className="p-2 text-xs text-muted-foreground">
                      {item.risks.slice(0, 2).join(" · ") || "—"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}
    </div>
  );
}

function PipelineCard({ item }: { item: PipelineItem }) {
  const { opportunity, account, probability, nextAction, proofCount } = item;
  return (
    <Link href={`/sales/opportunities/${opportunity.id}`}>
      <EnterpriseCard module="sales" className="hover:border-primary/50">
        <EnterpriseCardHeader className="pb-2">
          <EnterpriseCardTitle className="text-sm leading-snug">
            {opportunity.name}
          </EnterpriseCardTitle>
        </EnterpriseCardHeader>
        <EnterpriseCardContent className="space-y-1 text-xs">
          <p className="text-muted-foreground">
            {account?.nameAr ?? account?.name}
          </p>
          {opportunity.valueEstimate != null && (
            <p className="font-medium">
              {opportunity.valueEstimate.toLocaleString("ar-SA")} ر.س
            </p>
          )}
          <p>احتمال: {probability}%</p>
          <p className="text-muted-foreground">التالي: {nextAction}</p>
          {proofCount > 0 && <p>أدلة: {proofCount}</p>}
          {item.winLossReason && (
            <p className="text-amber-700">{item.winLossReason}</p>
          )}
        </EnterpriseCardContent>
      </EnterpriseCard>
    </Link>
  );
}
