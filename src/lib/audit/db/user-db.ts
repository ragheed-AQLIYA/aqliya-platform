import { prisma } from "@/lib/prisma";
import type { AuditUser } from "@/types/audit";
import {
  toAuditUser,
  protectedAuditReadUnavailable,
} from "./types";

export async function getAuditUsers(
  organizationId?: string,
): Promise<AuditUser[]> {
  try {
    const users = await prisma.auditUser.findMany({
      where: organizationId ? { organizationId } : {},
      orderBy: { name: "asc" },
    });
    if (users.length === 0) return [];
    return users.map(toAuditUser);
  } catch (error) {
    protectedAuditReadUnavailable("getAuditUsers", error);
  }
}
