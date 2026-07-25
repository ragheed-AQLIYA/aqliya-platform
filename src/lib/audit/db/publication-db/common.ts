import { prisma } from "@/lib/prisma";
import type {
  PublicationPackage,
  AuditEvent,
  FinancialStatement,
  FinancialStatementLine,
  Finding,
  Recommendation,
  ReviewComment,
  ApprovalRecord,
  EvidenceObject,
} from "@/types/audit";
import {
  toFinding,
  toRecommendation,
  toReviewComment,
  toApprovalRecord,
  toAccountMapping,
  toFinancialStatementLine,
  toDisclosureNote,
  toAuditEvent,
  toAuditEventFromPlatformLog,
  toEvidenceObject,
  protectedAuditReadUnavailable,
} from "../types";
import { recordAuditOsAuditEvent } from "@/lib/audit/audit-events";

export {
  prisma,
  toFinding,
  toRecommendation,
  toReviewComment,
  toApprovalRecord,
  toAccountMapping,
  toFinancialStatementLine,
  toDisclosureNote,
  toAuditEvent,
  toAuditEventFromPlatformLog,
  toEvidenceObject,
  protectedAuditReadUnavailable,
  recordAuditOsAuditEvent,
};
export type {
  PublicationPackage,
  AuditEvent,
  FinancialStatement,
  FinancialStatementLine,
  Finding,
  Recommendation,
  ReviewComment,
  ApprovalRecord,
  EvidenceObject,
};
