import type { Badge } from "@/components/ui/badge";

export function trendArrow(
  direction: "up" | "down" | "stable" | "insufficient_data",
): string {
  if (direction === "up") return "\u2191";
  if (direction === "down") return "\u2193";
  if (direction === "insufficient_data") return "?";
  return "\u2192";
}

export function severityVariant(severity: "high" | "medium" | "low") {
  if (severity === "high") return "destructive" as const;
  if (severity === "medium") return "secondary" as const;
  return "outline" as const;
}
