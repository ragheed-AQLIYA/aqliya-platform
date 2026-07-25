import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import type {
  Engagement,
  DashboardSummary,
  WorkflowStatus,
} from "@/types/audit";
import {
  toEngagement,
  toAuditEvent,
  emptyDashboardSummary,
  protectedAuditReadUnavailable,
} from "../types";
import { recordAuditOsAuditEvent } from "@/lib/audit/audit-events";

const statusTransitions: Record<string, string[]> = {
  draft: ["setup"],
  setup: ["in_progress"],
  in_progress: ["under_review", "awaiting_client"],
  under_review: ["ready_for_approval", "awaiting_client"],
  awaiting_client: ["in_progress", "under_review"],
  ready_for_approval: ["approved"],
  approved: ["published"],
  published: [],
  archived: [],
};

const eligibleApprovalStatuses = [
  "in_progress",
  "under_review",
  "ready_for_approval",
];

const safePublishStatuses = [
  "approved",
  "in_progress",
  "under_review",
  "ready_for_approval",
];

export {
  prisma,
  toEngagement,
  toAuditEvent,
  emptyDashboardSummary,
  protectedAuditReadUnavailable,
  recordAuditOsAuditEvent,
  statusTransitions,
  eligibleApprovalStatuses,
  safePublishStatuses,
};
export type { Prisma, Engagement, DashboardSummary, WorkflowStatus };
