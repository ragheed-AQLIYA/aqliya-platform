export {
  createWorkflowClient,
  listWorkflowClientsForUser,
  getWorkflowClient,
  updateWorkflowClientStatus,
  createWorkflowMembership,
  listWorkflowMemberships,
  updateWorkflowMembershipRole,
  updateWorkflowMembershipStatus,
  findUserByEmail,
  createWorkflowRecord,
  listWorkflowRecords,
  getWorkflowRecord,
  updateWorkflowRecord,
  submitWorkflowRecordForReview,
  approveWorkflowRecord,
  returnWorkflowRecord,
  archiveWorkflowRecord,
  createWorkflowDocumentMetadata,
  listWorkflowDocuments,
  createWorkflowReview,
  listWorkflowReviews,
} from "@/lib/workflowos/services";

export {
  uploadWorkflowDocument,
  deleteStoredWorkflowDocument,
} from "@/lib/workflowos/storage";

export {
  listWorkflowAuditEvents,
  recordWorkflowAuditEvent,
} from "@/lib/workflowos/audit";

export { getUserWorkflowRole } from "@/lib/workflowos/tenant-guard";
export { isExpectedAccessDeniedError, getCurrentUser } from "@/lib/auth";
export { enforce } from "@/lib/kernel";
export { prisma } from "@/lib/prisma";
export type { Prisma } from "@prisma/client";
export { revalidatePath } from "next/cache";

export function mapAuthError(error: unknown): string {
  const msg = error instanceof Error ? error.message : "";
  if (msg === "Unauthenticated") return "يجب تسجيل الدخول أولاً";
  if (msg.startsWith("Access denied:"))
    return "لا تملك صلاحية تنفيذ هذا الإجراء";
  if (msg.includes("slug already exists"))
    return "الرابط المختصر مستخدم بالفعل";
  return msg || "فشل العملية";
}
