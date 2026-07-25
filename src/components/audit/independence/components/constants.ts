const STATUS_COLORS: Record<string, string> = {
  active: "bg-green-100 text-green-700",
  inactive: "bg-gray-100 text-gray-600",
  suspended: "bg-red-100 text-red-700",
  pending: "bg-amber-100 text-amber-700",
  completed: "bg-green-100 text-green-700",
  flagged: "bg-red-100 text-red-700",
  identified: "bg-red-100 text-red-700",
  assessed: "bg-amber-100 text-amber-700",
  mitigated: "bg-blue-100 text-blue-700",
  accepted: "bg-gray-100 text-gray-600",
  resolved: "bg-green-100 text-green-700",
  passed: "bg-green-100 text-green-700",
};

export function statusColor(s: string): string {
  return STATUS_COLORS[s] ?? "bg-gray-100 text-gray-600";
}

export function threatLevelColor(l: string): string {
  if (l === "significant") return "bg-red-100 text-red-700";
  if (l === "moderate") return "bg-amber-100 text-amber-700";
  return "bg-gray-100 text-gray-600";
}
