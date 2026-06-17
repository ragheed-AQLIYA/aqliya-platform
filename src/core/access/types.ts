import type { UserRole } from "@prisma/client";
import type { RequiredRole } from "@/lib/auth";

export type AccessResource =
  | "organization"
  | "settings"
  | "user"
  | "platform"
  | string;

export type AccessAction =
  | "read"
  | "create"
  | "update"
  | "delete"
  | "admin"
  | "approve"
  | "reject"
  | "export";

export interface AccessRequest {
  userId: string;
  organizationId: string;
  resource: AccessResource;
  action: AccessAction;
  resourceId?: string;
  /** Session role — required for grant decisions */
  role?: UserRole | null;
  /** Override minimum role for this check */
  requiredRole?: RequiredRole;
}

export interface AccessResult {
  decision: "granted" | "denied";
  reason?: string;
}
