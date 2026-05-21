import type {
  SunbulUserRole,
  SunbulRecordStatus,
  SunbulReviewStatus,
  SunbulAuditAction,
  SunbulClient,
  SunbulUserMembership,
  SunbulRecord,
  SunbulDocument,
  SunbulReview,
  SunbulAuditEvent,
} from "@prisma/client";

export type {
  SunbulUserRole,
  SunbulRecordStatus,
  SunbulReviewStatus,
  SunbulAuditAction,
  SunbulClient,
  SunbulUserMembership,
  SunbulRecord,
  SunbulDocument,
  SunbulReview,
  SunbulAuditEvent,
};

export interface CreateSunbulRecordInput {
  title: string;
  description?: string;
  type?: string;
  priority?: string;
}

export interface UpdateSunbulRecordInput {
  title?: string;
  description?: string;
  priority?: string;
}

export interface CreateSunbulDocumentInput {
  fileName: string;
  fileType: string;
  fileSize: number;
  storageKey: string;
}

export interface CreateSunbulReviewInput {
  status: "Approved" | "Returned";
  notes?: string;
}

export interface CreateSunbulClientInput {
  name: string;
  slug: string;
}

export interface SunbulSession {
  clientId: string;
  userId: string;
  role: SunbulUserRole;
}

export function isPlatformAdmin(role: SunbulUserRole): boolean {
  return role === "PlatformAdmin";
}

export function isOperator(role: SunbulUserRole): boolean {
  return role === "Operator" || role === "PlatformAdmin";
}

export function isReviewer(role: SunbulUserRole): boolean {
  return role === "Reviewer" || role === "PlatformAdmin";
}
