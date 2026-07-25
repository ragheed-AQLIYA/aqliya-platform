export const STATUS_LABELS: Record<string, string> = {
  draft: "مسودة",
  populated: "تم التعبئة",
  partial: "مكتمل جزئياً",
  complete: "مكتمل",
  exported: "تم التصدير",
};

export const SECTION_LABELS: Record<string, string> = {
  company_info: "معلومات المنشأة",
  revenue: "الإيرادات",
  cost_of_sales: "تكلفة المبيعات",
  gross_profit: "إجمالي الربح",
  supplier_spend: "المشتريات",
  workforce: "الموظفين",
  assets: "الأصول",
  declarations: "الإقرارات",
};

export const CONFIDENCE_BADGES: Record<string, "default" | "secondary" | "outline"> = {
  high: "default",
  medium: "secondary",
  low: "outline",
};

export const CATEGORY_LABELS: Record<string, string> = {
  financial_data: "بيانات مالية",
  evidence: "مستندات الإثبات",
  classification: "تصنيف",
  narrative: "إيضاحات",
};
