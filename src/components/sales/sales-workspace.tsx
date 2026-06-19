"use client";

import Link from "next/link";
import { StatusBadge } from "@/components/enterprise/status-badge";
import {
  EnterpriseCard,
  EnterpriseCardContent,
  EnterpriseCardHeader,
  EnterpriseCardTitle,
} from "@/components/enterprise/enterprise-card";
import { SectionHeader } from "@/components/enterprise/section-header";
import type {
  SalesAccount,
  SalesOpportunity,
} from "@/lib/sales/types";

interface SalesWorkspaceProps {
  accounts: SalesAccount[];
  opportunities: SalesOpportunity[];
  pipelineValue: number;
  byStage: Record<string, number>;
}

export function SalesWorkspace({
  accounts,
  opportunities,
  pipelineValue,
  byStage,
}: SalesWorkspaceProps) {
  return (
    <div className="space-y-6" dir="rtl">
      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-200">
        SalesOS L5 — النسخة الحالية تعمل بذاكرة التشغيل (in-memory) مع دعم
        كامل للحوكمة والأدلة والمراجعة والتدقيق. سيتم الانتقال إلى طبقة
        البيانات المستمرة (Prisma) في التحديث القادم.
      </div>

      <div>
        <h1 className="text-h2 font-black text-foreground">SalesOS</h1>
        <p className="mt-1 text-body-sm text-muted-foreground">
          ذكاء الإيرادات المحكوم — نسخة تشغيلية داخلية (ذاكرة مؤقتة)
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="pt-6">
            <div className="text-2xl font-bold">
              {pipelineValue.toLocaleString("ar-SA")} SAR
            </div>
            <div className="text-sm text-muted-foreground">إجمالي المسار</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="pt-6">
            <div className="text-2xl font-bold">{opportunities.length}</div>
            <div className="text-sm text-muted-foreground">الفرص النشطة</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
        <EnterpriseCard module="sales">
          <EnterpriseCardContent className="pt-6">
            <div className="text-2xl font-bold">{accounts.length}</div>
            <div className="text-sm text-muted-foreground">الحسابات</div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      </div>

      <SectionHeader
        eyebrow="الحسابات"
        title="الحسابات المؤسسية"
        description="حسابات مرتبطة بسير عمل Core"
        module="sales"
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {accounts.map((account) => (
          <Link key={account.id} href={`/sales/accounts/${account.id}`}>
            <EnterpriseCard module="sales" className="hover:border-primary/50">
              <EnterpriseCardHeader>
                <EnterpriseCardTitle>{account.nameAr ?? account.name}</EnterpriseCardTitle>
              </EnterpriseCardHeader>
              <EnterpriseCardContent>
                <StatusBadge status={account.status} size="sm" />
                {account.industry && (
                  <p className="mt-2 text-xs text-muted-foreground">
                    {account.industry}
                  </p>
                )}
              </EnterpriseCardContent>
            </EnterpriseCard>
          </Link>
        ))}
      </div>

      <SectionHeader
        eyebrow="مسار البيع"
        title="الفرص حسب المرحلة"
        module="sales"
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {opportunities.map((opp) => (
          <Link key={opp.id} href={`/sales/opportunities/${opp.id}`}>
            <EnterpriseCard module="sales" className="hover:border-primary/50">
              <EnterpriseCardHeader>
                <EnterpriseCardTitle>{opp.name}</EnterpriseCardTitle>
              </EnterpriseCardHeader>
              <EnterpriseCardContent>
                <div className="flex items-center justify-between">
                  <StatusBadge status={opp.stage} size="sm" />
                  {opp.valueEstimate != null && (
                    <span className="text-sm font-medium">
                      {opp.valueEstimate.toLocaleString("ar-SA")} {opp.currency}
                    </span>
                  )}
                </div>
                <p className="mt-2 text-xs text-muted-foreground">
                  مراجعة: {opp.reviewStatus ?? "Draft"}
                </p>
              </EnterpriseCardContent>
            </EnterpriseCard>
          </Link>
        ))}
      </div>

      {Object.keys(byStage).length > 0 && (
        <EnterpriseCard>
          <EnterpriseCardHeader>
            <EnterpriseCardTitle>توزيع المراحل</EnterpriseCardTitle>
          </EnterpriseCardHeader>
          <EnterpriseCardContent>
            <div className="flex flex-wrap gap-3">
              {Object.entries(byStage).map(([stage, count]) => (
                <span
                  key={stage}
                  className="rounded-full bg-muted px-3 py-1 text-xs"
                >
                  {stage}: {count}
                </span>
              ))}
            </div>
          </EnterpriseCardContent>
        </EnterpriseCard>
      )}
    </div>
  );
}
