import "server-only";

export type GovernanceItem = {
  id: string;
  productKey: string;
  productLabel: string;
  type: string;
  title: string;
  description: string | null;
  status: string;
  priority: "high" | "medium" | "low";
  createdBy: string | null;
  createdAt: Date;
  deadline: Date | null;
  href: string;
};

export type GovernanceDashboard = {
  items: GovernanceItem[];
  stats: {
    totalPending: number;
    criticalCount: number;
    byProduct: Record<string, number>;
    averageAge: number;
  };
};

export function daysBetween(d1: Date, d2: Date): number {
  const ms = d2.getTime() - d1.getTime();
  return Math.max(0, Math.floor(ms / (1000 * 60 * 60 * 24)));
}

export function isOverdue(item: { deadline: Date | null; priority: string }): boolean {
  if (item.deadline && new Date() > item.deadline) return true;
  if (item.priority === "high") return true;
  return false;
}
