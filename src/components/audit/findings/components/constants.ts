export const severityColors: Record<string, string> = {
  low: "bg-green-100 text-green-700 border-green-300",
  medium: "bg-amber-100 text-amber-700 border-amber-300",
  high: "bg-orange-100 text-orange-700 border-orange-300",
  critical: "bg-red-100 text-red-700 border-red-300",
};

export const statusColors: Record<string, string> = {
  draft: "bg-gray-100 text-gray-600",
  open: "bg-blue-100 text-blue-700",
  in_review: "bg-purple-100 text-purple-700",
  accepted: "bg-green-100 text-green-700",
  resolved: "bg-teal-100 text-teal-700",
  dismissed: "bg-gray-100 text-gray-500",
};

export const typeColors: Record<string, string> = {
  material_misstatement: "bg-red-100 text-red-700",
  control_deficiency: "bg-amber-100 text-amber-700",
  disclosure_gap: "bg-purple-100 text-purple-700",
  observation: "bg-blue-100 text-blue-700",
};

export const severityValues: Record<string, number> = {
  low: 0,
  medium: 1,
  high: 2,
  critical: 3,
};
