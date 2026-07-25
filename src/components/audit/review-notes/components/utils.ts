export const statusColor = (s: string) => {
  const colors: Record<string, string> = {
    raised: "bg-slate-100 text-slate-700",
    assigned: "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700",
    responded: "bg-violet-100 text-violet-700",
    evidenced: "bg-cyan-100 text-cyan-700",
    reviewed: "bg-indigo-100 text-indigo-700",
    closed: "bg-green-100 text-green-700",
  };
  return colors[s] ?? "bg-gray-100 text-gray-600";
};

export const priorityColor = (p: string) => {
  const colors: Record<string, string> = {
    critical: "bg-red-100 text-red-700",
    high: "bg-orange-100 text-orange-700",
    medium: "bg-amber-100 text-amber-700",
    low: "bg-slate-100 text-slate-600",
  };
  return colors[p] ?? "bg-gray-100 text-gray-600";
};

export const statusLabel = (s: string) => {
  const labels: Record<string, string> = {
    raised: "مرفوعة",
    assigned: "مكلف",
    in_progress: "قيد التنفيذ",
    responded: "تم الرد",
    evidenced: "معززة بدليل",
    reviewed: "تمت المراجعة",
    closed: "مغلقة",
  };
  return labels[s] ?? s;
};

export const priorityLabel = (p: string) => {
  const labels: Record<string, string> = {
    critical: "حرج",
    high: "عالي",
    medium: "متوسط",
    low: "منخفض",
  };
  return labels[p] ?? p;
};
