// ─── Centralized AuditLogger ───
// Thin convenience layer over writePlatformAuditLog.
// Binds product/org/actor context once, reduces boilerplate.
// Does NOT replace writePlatformAuditLog — sits on top of it.

import { writePlatformAuditLog } from "./audit-log";
import type {
  PlatformAuditLogInput,
  PlatformAuditLogWriteResult,
} from "./audit-log";

// ─── Normalized product keys ───
// Use these constants to avoid inconsistency (e.g. "localcontent" vs "local_content").

export const Product = {
  AUDIT: "audit",
  AUDIT_OS: "audit_os",
  OFFICE_AI: "office_ai",
  OFFICE_AI_ASSISTANT: "office_ai_assistant",
  LOCAL_CONTENT: "local_content",
  SUNBUL: "sunbul",
  DECISION_OS: "decision_os",
  PLATFORM: "platform",
} as const;

export type ProductKey = (typeof Product)[keyof typeof Product];

// ─── Context types ───

export interface AuditLoggerActor {
  id?: string;
  name?: string;
  type?: string;
  email?: string;
}

export interface AuditLoggerOrg {
  platformOrganizationId?: string;
  clientWorkspaceId?: string;
  projectId?: string;
}

export interface AuditLoggerTarget {
  type: string;
  id: string;
  label?: string;
}

export interface AuditLoggerContext {
  productKey: ProductKey | string;
  sourceSystem?: string;
  organization?: AuditLoggerOrg;
  actor?: AuditLoggerActor;
}

// ─── Logger factory ───

export interface AuditLoggerInstance {
  record(
    action: string,
    target?: AuditLoggerTarget,
    extra?: Partial<PlatformAuditLogInput>,
  ): Promise<PlatformAuditLogWriteResult>;
}

export function auditLogger(context: AuditLoggerContext): AuditLoggerInstance {
  const sourceSystem = context.sourceSystem ?? context.productKey;

  return {
    async record(
      action: string,
      target?: AuditLoggerTarget,
      extra?: Partial<PlatformAuditLogInput>,
    ): Promise<PlatformAuditLogWriteResult> {
      return writePlatformAuditLog({
        productKey: context.productKey,
        sourceSystem,
        ...context.organization,
        ...(context.actor
          ? {
              actorId: context.actor.id,
              actorName: context.actor.name,
              actorType: context.actor.type,
              actorEmail: context.actor.email,
            }
          : {}),
        action,
        ...(target
          ? {
              targetType: target.type,
              targetId: target.id,
              targetLabel: target.label,
            }
          : {}),
        ...extra,
      });
    },
  };
}
