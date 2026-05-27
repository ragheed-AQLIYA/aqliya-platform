import type {
  SunbulUserRole as WorkflowUserRole,
  SunbulRecordStatus as WorkflowRecordStatus,
  SunbulReviewStatus as WorkflowReviewStatus,
  SunbulAuditAction as WorkflowAuditAction,
  SunbulClient as WorkflowClient,
  SunbulUserMembership as WorkflowMembership,
  SunbulRecord as WorkflowRecord,
  SunbulDocument as WorkflowDocument,
  SunbulReview as WorkflowReview,
  SunbulAuditEvent as WorkflowAuditEvent,
} from "@prisma/client";

export type {
  WorkflowUserRole,
  WorkflowRecordStatus,
  WorkflowReviewStatus,
  WorkflowAuditAction,
  WorkflowClient,
  WorkflowMembership,
  WorkflowRecord,
  WorkflowDocument,
  WorkflowReview,
  WorkflowAuditEvent,
};

export interface CreateWorkflowRecordInput {
  title: string;
  description?: string;
  type?: string;
  priority?: string;
}

export interface UpdateWorkflowRecordInput {
  title?: string;
  description?: string;
  priority?: string;
}

export interface CreateWorkflowDocumentInput {
  fileName: string;
  fileType: string;
  fileSize: number;
  storageKey: string;
}

export interface CreateWorkflowReviewInput {
  status: "Approved" | "Returned";
  notes?: string;
}

export interface CreateWorkflowClientInput {
  name: string;
  slug: string;
}

export interface WorkflowSession {
  clientId: string;
  userId: string;
  role: WorkflowUserRole;
}

export function isPlatformAdmin(role: WorkflowUserRole): boolean {
  return role === "PlatformAdmin";
}

export function isOperator(role: WorkflowUserRole): boolean {
  return role === "Operator" || role === "PlatformAdmin";
}

export function isReviewer(role: WorkflowUserRole): boolean {
  return role === "Reviewer" || role === "PlatformAdmin";
}
