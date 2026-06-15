// ─── Sales Intelligence Bilingual Strings ───

export const intl = {
  en: {
    service: {
      name: "Sales Pipeline Intelligence",
      description: "Deal scoring, health monitoring, forecasting, and pipeline analytics",
    },
    healthLevels: {
      HEALTHY: "Healthy",
      WATCH: "Watch",
      AT_RISK: "At Risk",
    },
    healthDescriptions: {
      HEALTHY: "Deal is on track based on stage, value, recency, and probability",
      WATCH: "Deal shows moderate risk indicators and needs attention",
      AT_RISK: "Deal has significant risk factors and requires intervention",
    },
    stages: {
      drafting: "Drafting",
      qualifying: "Qualifying",
      proposal: "Proposal",
      negotiation: "Negotiation",
      closing: "Closing",
      closed_won: "Closed Won",
      closed_lost: "Closed Lost",
    },
    forecastPeriods: {
      MONTHLY: "Monthly",
      QUARTERLY: "Quarterly",
      YEARLY: "Yearly",
    },
    forecastStatuses: {
      DRAFT: "Draft",
      FINALIZED: "Finalized",
      ARCHIVED: "Archived",
    },
    metrics: {
      totalDeals: "Total Deals",
      totalValue: "Total Value",
      weightedValue: "Weighted Value",
      avgDealSize: "Average Deal Size",
      avgAge: "Average Age (Days)",
      avgProbability: "Average Probability",
      conversionRate: "Conversion Rate",
      winRate: "Win Rate",
      avgDaysToClose: "Average Days to Close",
    },
    healthBreakdown: {
      healthy: "Healthy Deals",
      watch: "Watch Deals",
      atRisk: "At Risk Deals",
    },
    errors: {
      dealNotFound: "Deal not found",
      forecastNotFound: "Forecast not found",
      invalidPeriod: "Invalid forecast period",
      orgRequired: "Organization ID is required",
      dealIdRequired: "Deal ID is required",
    },
    audit: {
      dealScored: "Deal intelligence score calculated",
      forecastCreated: "Sales forecast created",
      forecastCalculated: "Sales forecast calculated from pipeline",
      forecastListed: "Sales forecasts listed",
      analyticsGenerated: "Pipeline analytics generated",
      winRateAnalyzed: "Win rate analysis generated",
      velocityMetricsGenerated: "Velocity metrics generated",
    },
  },
  ar: {
    service: {
      name: "ذكاء مسار المبيعات",
      description: "تسعير الصفقات، مراقبة الصحة، التنبؤ، وتحليلات مسار المبيعات",
    },
    healthLevels: {
      HEALTHY: "صحي",
      WATCH: "مراقبة",
      AT_RISK: "في خطر",
    },
    healthDescriptions: {
      HEALTHY: "الصفقة تسير بشكل جيد بناءً على المرحلة والقيمة والحداثة والاحتمالية",
      WATCH: "الصفقة تظهر مؤشرات خطر معتدلة وتحتاج إلى اهتمام",
      AT_RISK: "الصفقة تعاني من عوامل خطر كبيرة وتتطلب تدخلاً",
    },
    stages: {
      drafting: "مسودة",
      qualifying: "تأهيل",
      proposal: "عرض",
      negotiation: "تفاوض",
      closing: "إغلاق",
      closed_won: "تم الإغلاق بنجاح",
      closed_lost: "تم الإغلاق بخسارة",
    },
    forecastPeriods: {
      MONTHLY: "شهري",
      QUARTERLY: "ربعي",
      YEARLY: "سنوي",
    },
    forecastStatuses: {
      DRAFT: "مسودة",
      FINALIZED: "نهائي",
      ARCHIVED: "مؤرشف",
    },
    metrics: {
      totalDeals: "إجمالي الصفقات",
      totalValue: "إجمالي القيمة",
      weightedValue: "القيمة المرجحة",
      avgDealSize: "متوسط حجم الصفقة",
      avgAge: "متوسط العمر (أيام)",
      avgProbability: "متوسط الاحتمالية",
      conversionRate: "معدل التحويل",
      winRate: "معدل الفوز",
      avgDaysToClose: "متوسط أيام الإغلاق",
    },
    healthBreakdown: {
      healthy: "صفقات صحية",
      watch: "صفقات مراقبة",
      atRisk: "صفقات في خطر",
    },
    errors: {
      dealNotFound: "الصفقة غير موجودة",
      forecastNotFound: "التنبؤ غير موجود",
      invalidPeriod: "فترة تنبؤ غير صالحة",
      orgRequired: "معرف المؤسسة مطلوب",
      dealIdRequired: "معرف الصفقة مطلوب",
    },
    audit: {
      dealScored: "تم حساب درجة ذكاء الصفقة",
      forecastCreated: "تم إنشاء تنبؤ المبيعات",
      forecastCalculated: "تم حساب تنبؤ المبيعات من مسار الصفقات",
      forecastListed: "تم عرض تنبؤات المبيعات",
      analyticsGenerated: "تم إنشاء تحليلات مسار المبيعات",
      winRateAnalyzed: "تم إنشاء تحليل معدل الفوز",
      velocityMetricsGenerated: "تم إنشاء مقاييس السرعة",
    },
  },
} as const

export type Locale = keyof typeof intl

export function t(locale: Locale, path: string): string {
  const keys = path.split(".")
  let result: unknown = intl[locale]
  for (const key of keys) {
    if (result && typeof result === "object" && key in result) {
      result = (result as Record<string, unknown>)[key]
    } else {
      return path
    }
  }
  return typeof result === "string" ? result : path
}
