"use client";

import { KanbanSquare, ShieldCheck, Brain, TrendingUp } from "lucide-react";

export interface OrgData {
  orgId?: string;
  name: string;
  nameAr: string;
  userCounts: {
    admin: number;
    operator: number;
    viewer: number;
    total: number;
  };
  platformOrgId?: string;
  sunbulClientCount: number;
  sunbulMembershipCount: number;
  sunbulRecordCount: number;
  sunbulStatus: string;
}

export interface ProductInfo {
  name: string;
  nameAr: string;
  icon: React.ComponentType<{ className?: string }>;
  status: string;
  statusColor: string;
  statusBg: string;
  href: string;
  adminHref: string | null;
  note: string;
  routeNote: string | null;
}

export function useOrganizationWorkspace(data: OrgData) {
  const products: ProductInfo[] = [
    {
      name: "Sunbul",
      nameAr: "سنبل",
      icon: KanbanSquare,
      status: data.sunbulStatus,
      statusColor: "text-status-success",
      statusBg: "bg-status-success/10",
      href: "/sunbul",
      adminHref: "/sunbul/admin",
      note:
        data.sunbulRecordCount > 0
          ? `${data.sunbulClientCount} عملاء، ${data.sunbulRecordCount} قضية`
          : "جاهز للتفعيل — شغّل البذرة التجريبية أولاً",
      routeNote:
        "المسار الرسمي هو /sunbul بينما /workflowos محفوظ كـ alias داخلي.",
    },
    {
      name: "AuditOS",
      nameAr: "نظام التدقيق المالي",
      icon: ShieldCheck,
      status: "متاح",
      statusColor: "text-module-audit",
      statusBg: "bg-module-audit/10",
      href: "/audit",
      adminHref: null,
      note: "بوابة التدقيق المالي مع سير عمل الحوكمة",
      routeNote: null,
    },
    {
      name: "DecisionOS",
      nameAr: "نظام القرارات",
      icon: Brain,
      status: "متاح",
      statusColor: "text-module-decision",
      statusBg: "bg-module-decision/10",
      href: "/decisions",
      adminHref: null,
      note: "منصة حوكمة القرارات مع التحليل والتوصيات",
      routeNote: null,
    },
    {
      name: "SalesOS",
      nameAr: "نظام المبيعات",
      icon: TrendingUp,
      status: "نموذج أولي",
      statusColor: "text-module-sales",
      statusBg: "bg-module-sales/10",
      href: "/sales",
      adminHref: null,
      note: "لوحة المبيعات — قيد التطوير",
      routeNote: null,
    },
  ];

  return { products };
}
