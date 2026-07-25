export function getModelLabel(modelName: string): string {
  const labels: Record<string, string> = {
    PlatformAuditLog: "سجل التدقيق",
    ScimProvisioningEvent: "أحداث SCIM",
    CrmSyncLog: "سجل مزامنة CRM",
    ErpSyncLog: "سجل مزامنة ERP",
    PlatformNotification: "الإشعارات",
    Session: "جلسات المستخدم",
    IngestionDocument: "مستندات الاستيراد",
    IngestionBatch: "دفعات الاستيراد",
    IntelligenceQuery: "استعلامات الذكاء",
    Decision: "القرارات",
    AuditEngagement: "مهام المراجعة",
    User: "المستخدمين",
    PlatformSecret: "أسرار المنصة",
  };
  return labels[modelName] ?? modelName;
}

export function actionLabel(action: string): string {
  const map: Record<string, string> = {
    delete: "حذف",
    archive: "أرشفة",
    anonymize: "إخفاء الهوية",
  };
  return map[action] ?? action;
}

export function actionVariant(action: string): "default" | "destructive" | "secondary" {
  const map: Record<string, "default" | "destructive" | "secondary"> = {
    delete: "destructive",
    archive: "secondary",
    anonymize: "default",
  };
  return map[action] ?? "default";
}

export function daysLabel(days: number): string {
  if (days <= 0) return "أبداً";
  if (days < 30) return `${days} يوم`;
  if (days < 365) return `${Math.round(days / 30)} شهر`;
  return `${Math.round(days / 365)} سنة`;
}
