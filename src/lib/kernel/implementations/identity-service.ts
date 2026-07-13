import type { IIdentityService, CurrentUserInfo } from "../contracts/identity";
import type { Principal, KernelResult } from "../types";

export class IdentityService implements IIdentityService {
  async getCurrentUser(): Promise<CurrentUserInfo | null> {
    const { getCurrentUser } = await import("@/lib/auth");
    try {
      const user = await getCurrentUser();
      return {
        id: user.id,
        email: user.email,
        name: user.name ?? "",
        role: user.role,
        organizationId: user.organizationId,
        platformOrganizationId: user.platformOrganizationId,
        organization: user.organization,
      };
    } catch {
      return null;
    }
  }

  async validateSession(): Promise<KernelResult<Principal>> {
    const user = await this.getCurrentUser();
    if (!user) {
      return { success: false, error: "No active session", code: "UNAUTHORIZED" };
    }
    return {
      success: true,
      data: {
        id: user.id,
        userId: user.id,
        organizationId: user.organizationId,
        role: user.role.toLowerCase() as Principal["role"],
      },
    };
  }

  async getUserById(id: string): Promise<KernelResult<CurrentUserInfo>> {
    const { prisma } = await import("@/lib/prisma");
    const user = await prisma.user.findUnique({
      where: { id },
      include: { organization: { select: { id: true, name: true } } },
    });
    if (!user) {
      return { success: false, error: "User not found", code: "NOT_FOUND" };
    }
    return {
      success: true,
      data: {
        id: user.id,
        email: user.email,
        name: user.name ?? "",
        role: user.role,
        organizationId: user.organizationId,
        organization: user.organization,
      },
    };
  }
}
