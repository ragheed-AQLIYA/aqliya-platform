import type { Principal, TenantContext, KernelResult } from "../types";

export interface CurrentUserInfo {
  id: string;
  email: string;
  name: string;
  role: string;
  organizationId: string;
  platformOrganizationId?: string;
  organization: { id: string; name: string };
}

export interface IIdentityService {
  getCurrentUser(): Promise<CurrentUserInfo | null>;
  validateSession(): Promise<KernelResult<Principal>>;
  getUserById(id: string): Promise<KernelResult<CurrentUserInfo>>;
}
