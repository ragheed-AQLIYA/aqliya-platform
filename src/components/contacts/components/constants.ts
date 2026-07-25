export const REVIEW_STATUS_LABELS: Record<string, string> = {
  pending: "قيد المراجعة",
  approved: "معتمد",
  changes_requested: "تعديلات مطلوبة",
  rejected: "مرفوض",
};

export const REVIEW_STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  approved: "bg-green-100 text-green-800",
  changes_requested: "bg-blue-100 text-blue-800",
  rejected: "bg-red-100 text-red-800",
};

export const REVIEW_TYPE_LABELS: Record<string, string> = {
  sensitivity: "مراجعة حساسية",
  accuracy: "مراجعة دقة",
  completeness: "مراجعة اكتمال",
  custom: "مخصص",
};
