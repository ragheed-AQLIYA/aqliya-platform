import "server-only";

export type PlatformHealth = {
  healthScore: number;
  aiRunsToday: number;
  pendingReviews: number;
  failedWorkflows: number;
  activeUsersToday: number;
  auditEventsToday: number;
  status: "healthy" | "warning" | "critical";
};

export type PlatformNotification = {
  id: string;
  productKey: string;
  severity: "critical" | "warning" | "info";
  title: string;
  description: string;
  href: string;
  createdAt: Date;
};
