export const statusLabels: Record<string, string> = {
  lead: "عميل محتمل",
  qualified: "مؤهل",
  kyc_in_progress: "قيد التحقق",
  declined: "مرفوض",
  accepted: "مقبول",
};

export const statusColors: Record<string, string> = {
  lead: "bg-slate-100 text-slate-700",
  qualified: "bg-blue-100 text-blue-700",
  kyc_in_progress: "bg-amber-100 text-amber-700",
  declined: "bg-red-100 text-red-700",
  accepted: "bg-green-100 text-green-700",
};

export const riskColors: Record<string, string> = {
  low: "bg-green-100 text-green-700",
  medium: "bg-amber-100 text-amber-700",
  high: "bg-red-100 text-red-700",
  decline: "bg-red-100 text-red-700",
};
