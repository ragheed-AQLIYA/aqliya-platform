export function statusColor(s: string) {
  const colors: Record<string, string> = {
    active: "bg-green-100 text-green-800",
    archived: "bg-gray-100 text-gray-600",
    identified: "bg-red-100 text-red-800",
    assessed: "bg-amber-100 text-amber-800",
    mitigated: "bg-green-100 text-green-800",
    planned: "bg-blue-100 text-blue-800",
    in_progress: "bg-amber-100 text-amber-800",
    completed: "bg-green-100 text-green-800",
    overdue: "bg-red-100 text-red-800",
    remediating: "bg-amber-100 text-amber-800",
    verified: "bg-blue-100 text-blue-800",
    closed: "bg-green-100 text-green-800",
    minor: "bg-gray-100 text-gray-600",
    significant: "bg-amber-100 text-amber-800",
    material: "bg-red-100 text-red-800",
  };
  return colors[s] || "bg-gray-100 text-gray-600";
}

export function severityColor(s: string) {
  if (s === "high" || s === "material") return "bg-red-100 text-red-800";
  if (s === "medium" || s === "significant") return "bg-amber-100 text-amber-800";
  return "bg-gray-100 text-gray-600";
}
