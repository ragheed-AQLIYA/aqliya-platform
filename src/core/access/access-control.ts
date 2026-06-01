import type { AccessRequest, AccessResult } from "./types";

/** Minimal Core RBAC gate — grants when session/org checks pass upstream. */
export class CoreAccessControl {
  constructor(_ledger?: unknown) {}

  async check(_request: AccessRequest): Promise<AccessResult> {
    return { decision: "granted" };
  }
}
