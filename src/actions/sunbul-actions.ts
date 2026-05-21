"use server";

import {
  createSunbulClient,
  listSunbulClientsForUser,
  getSunbulClient,
  updateSunbulClientStatus,
  createSunbulMembership,
  listSunbulMemberships,
  updateSunbulMembershipRole,
  updateSunbulMembershipStatus,
  findUserByEmail,
  createSunbulRecord,
  listSunbulRecords,
  getSunbulRecord,
  updateSunbulRecord,
  submitSunbulRecordForReview,
  approveSunbulRecord,
  returnSunbulRecord,
  archiveSunbulRecord,
  createSunbulDocumentMetadata,
  listSunbulDocuments,
  deleteSunbulDocument,
  createSunbulReview,
  listSunbulReviews,
} from "@/lib/sunbul/services";
import {
  uploadSunbulDocument,
  deleteStoredSunbulDocument,
} from "@/lib/sunbul/storage";
import { listSunbulAuditEvents } from "@/lib/sunbul/audit";
import { getUserSunbulRole } from "@/lib/sunbul/tenant-guard";
import { isExpectedAccessDeniedError } from "@/lib/auth";

function mapAuthError(error: unknown): string {
  const msg = error instanceof Error ? error.message : "";
  if (msg === "Unauthenticated") return "يجب تسجيل الدخول أولاً";
  if (msg.startsWith("Access denied:"))
    return "لا تملك صلاحية تنفيذ هذا الإجراء";
  if (msg.includes("slug already exists"))
    return "الرابط المختصر مستخدم بالفعل";
  return msg || "فشل العملية";
}

// ─── Clients ───────────────────────────────────────────

export async function sunbul_createClient(data: {
  name: string;
  slug: string;
}) {
  try {
    const client = await createSunbulClient(data);
    return { success: true, data: client };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error creating Sunbul client:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function sunbul_listClients() {
  try {
    const clients = await listSunbulClientsForUser();
    return { success: true, data: clients };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error listing Sunbul clients:", error);
    return { success: false, error: "Failed to list clients" };
  }
}

export async function sunbul_getClient(clientId: string) {
  try {
    const client = await getSunbulClient(clientId);
    return { success: true, data: client };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error getting Sunbul client:", error);
    return { success: false, error: "Failed to get client" };
  }
}

export async function sunbul_updateClientStatus(
  clientId: string,
  status: string,
) {
  try {
    const client = await updateSunbulClientStatus(clientId, status);
    return { success: true, data: client };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error updating Sunbul client status:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

// ─── Memberships ───────────────────────────────────────

export async function sunbul_createMembership(data: {
  clientId: string;
  userId: string;
  role: string;
}) {
  try {
    const membership = await createSunbulMembership(data);
    return { success: true, data: membership };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error creating Sunbul membership:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function sunbul_listMemberships(clientId: string) {
  try {
    const memberships = await listSunbulMemberships(clientId);
    return { success: true, data: memberships };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error listing Sunbul memberships:", error);
    return { success: false, error: "Failed to list memberships" };
  }
}

export async function sunbul_addMembershipByEmail(data: {
  clientId: string;
  email: string;
  role: string;
}) {
  try {
    const user = await findUserByEmail(data.email);
    if (!user) {
      return { success: false, error: "المستخدم غير موجود حالياً" };
    }
    const membership = await createSunbulMembership({
      clientId: data.clientId,
      userId: user.id,
      role: data.role,
    });
    return { success: true, data: membership };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error adding Sunbul membership:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function sunbul_updateMembershipRole(
  membershipId: string,
  role: string,
) {
  try {
    const membership = await updateSunbulMembershipRole(membershipId, role);
    return { success: true, data: membership };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error updating Sunbul membership role:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

export async function sunbul_updateMembershipStatus(
  membershipId: string,
  status: string,
) {
  try {
    const membership = await updateSunbulMembershipStatus(membershipId, status);
    return { success: true, data: membership };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error updating Sunbul membership status:", error);
    return { success: false, error: mapAuthError(error) };
  }
}

// ─── Records ───────────────────────────────────────────

export async function sunbul_createRecord(
  clientId: string,
  data: {
    title: string;
    description?: string;
    type?: string;
    priority?: string;
  },
) {
  try {
    const record = await createSunbulRecord(clientId, data);
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error creating Sunbul record:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create record",
    };
  }
}

export async function sunbul_listRecords(clientId: string) {
  try {
    const records = await listSunbulRecords(clientId);
    return { success: true, data: records };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error listing Sunbul records:", error);
    return { success: false, error: "Failed to list records" };
  }
}

export async function sunbul_getRecord(clientId: string, recordId: string) {
  try {
    const record = await getSunbulRecord(clientId, recordId);
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error getting Sunbul record:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to get record",
    };
  }
}

export async function sunbul_updateRecord(
  clientId: string,
  recordId: string,
  data: { title?: string; description?: string; priority?: string },
) {
  try {
    const record = await updateSunbulRecord(clientId, recordId, data);
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error updating Sunbul record:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to update record",
    };
  }
}

// ─── Workflow ──────────────────────────────────────────

export async function sunbul_submitRecord(clientId: string, recordId: string) {
  try {
    const record = await submitSunbulRecordForReview(clientId, recordId);
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error submitting Sunbul record:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to submit record",
    };
  }
}

export async function sunbul_approveRecord(clientId: string, recordId: string) {
  try {
    const record = await approveSunbulRecord(clientId, recordId);
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error approving Sunbul record:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to approve record",
    };
  }
}

export async function sunbul_returnRecord(
  clientId: string,
  recordId: string,
  notes?: string,
) {
  try {
    const record = await returnSunbulRecord(clientId, recordId, notes);
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error returning Sunbul record:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to return record",
    };
  }
}

export async function sunbul_archiveRecord(clientId: string, recordId: string) {
  try {
    const record = await archiveSunbulRecord(clientId, recordId);
    return { success: true, data: record };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error archiving Sunbul record:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to archive record",
    };
  }
}

// ─── Documents ─────────────────────────────────────────

export async function sunbul_createDocumentMetadata(
  clientId: string,
  recordId: string,
  data: {
    fileName: string;
    fileType: string;
    fileSize: number;
    storageKey: string;
  },
) {
  try {
    const doc = await createSunbulDocumentMetadata(clientId, recordId, data);
    return { success: true, data: doc };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error creating Sunbul document metadata:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to create document metadata",
    };
  }
}

export async function sunbul_listDocuments(clientId: string, recordId: string) {
  try {
    const docs = await listSunbulDocuments(clientId, recordId);
    return { success: true, data: docs };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error listing Sunbul documents:", error);
    return { success: false, error: "Failed to list documents" };
  }
}

export async function sunbul_uploadDocument(
  clientId: string,
  recordId: string,
  data: { fileName: string; fileType: string; contentBase64: string },
) {
  try {
    const content = Buffer.from(data.contentBase64, "base64");
    const doc = await uploadSunbulDocument({
      clientId,
      recordId,
      fileName: data.fileName,
      fileType: data.fileType,
      content,
    });
    return { success: true, data: doc };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error uploading Sunbul document:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to upload document",
    };
  }
}

export async function sunbul_deleteDocument(
  clientId: string,
  recordId: string,
  documentId: string,
) {
  try {
    await deleteStoredSunbulDocument(clientId, recordId, documentId);
    return { success: true, data: null };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error deleting Sunbul document:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to delete document",
    };
  }
}

// ─── Reviews ───────────────────────────────────────────

export async function sunbul_createReview(
  clientId: string,
  recordId: string,
  data: { status: "Approved" | "Returned"; notes?: string },
) {
  try {
    const review = await createSunbulReview(clientId, recordId, data);
    return { success: true, data: review };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error creating Sunbul review:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create review",
    };
  }
}

export async function sunbul_listReviews(clientId: string, recordId: string) {
  try {
    const reviews = await listSunbulReviews(clientId, recordId);
    return { success: true, data: reviews };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error listing Sunbul reviews:", error);
    return { success: false, error: "Failed to list reviews" };
  }
}

// ─── Audit ─────────────────────────────────────────────

export async function sunbul_getUserRole(clientId: string) {
  try {
    const role = await getUserSunbulRole(clientId);
    return { success: true, data: role };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error getting Sunbul user role:", error);
    return { success: false, error: "Failed to get user role" };
  }
}

export async function sunbul_listAuditEvents(
  clientId: string,
  options?: { recordId?: string; limit?: number; offset?: number },
) {
  try {
    const result = await listSunbulAuditEvents({
      clientId,
      ...(options ?? {}),
    });
    return { success: true, data: result };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error))
      console.error("Error listing Sunbul audit events:", error);
    return { success: false, error: "Failed to list audit events" };
  }
}
