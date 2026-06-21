/**
 * Audit Engine facade — unified platform audit write + hash chain.
 */
export {
  AuditEngine,
  write as writeAudit,
  type AuditWriteInput,
  type AuditWriteOptions,
} from "./engine";

export type {
  PlatformAuditLogInput,
  PlatformAuditLogWriteOptions,
  PlatformAuditLogWriteResult,
} from "@/lib/platform/audit-log";

export {
  createPlatformAuditLogInputFromContext,
  normalizePlatformAuditSeverity,
  normalizePlatformAuditStatus,
  writePlatformAuditLog,
  writePlatformAuditLogStrict,
} from "@/lib/platform/audit-log";

export { auditLogger, Product } from "@/lib/platform/audit-logger";

export { appendToAuditChain, verifyAuditRange } from "@/lib/platform/audit/audit-store";

export type {
  ChainVerificationResult,
  HashChainProof,
} from "@/lib/platform/audit/types";
