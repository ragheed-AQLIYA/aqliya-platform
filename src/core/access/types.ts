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
}

export interface AccessResult {
  decision: "granted" | "denied";
  reason?: string;
}
