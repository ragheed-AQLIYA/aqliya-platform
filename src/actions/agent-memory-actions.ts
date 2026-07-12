"use server";

import { getCurrentUser, hasRequiredRole } from "@/lib/auth";
import {
  setAgentMemory,
  getAgentMemory,
  queryAgentMemory as svcQueryAgentMemory,
  deleteAgentMemory as svcDeleteAgentMemory,
  cleanExpiredMemory,
} from "@/lib/platform/agent-memory";
import { prisma } from "@/lib/prisma";

export async function storeAgentMemoryAction(
  agentId: string,
  memoryKey: string,
  memoryValue: unknown,
  agentType?: string,
  ttl?: Date,
  tags?: string[],
) {
  const user = await getCurrentUser();
  if (!hasRequiredRole(user, "OPERATOR")) { throw new Error("Access denied: OPERATOR role required"); }

  await setAgentMemory(user.organizationId, {
    agentId,
    memoryKey,
    memoryValue,
    agentType,
    ttl,
    tags,
    createdById: user.id,
  });

  return { success: true };
}

export async function recallAgentMemoryAction(agentId: string, memoryKey: string) {
  const user = await getCurrentUser();
  if (!hasRequiredRole(user, "VIEWER")) { throw new Error("Access denied: VIEWER role required"); }

  const value = await getAgentMemory(user.organizationId, agentId, memoryKey);
  return { success: true, data: value };
}

export async function queryAgentMemoryAction(
  agentId?: string,
  agentType?: string,
  memoryKeyPrefix?: string,
  tags?: string[],
) {
  const user = await getCurrentUser();
  if (!hasRequiredRole(user, "VIEWER")) { throw new Error("Access denied: VIEWER role required"); }

  const results = await svcQueryAgentMemory(user.organizationId, {
    agentId,
    agentType,
    memoryKeyPrefix,
    tags,
  });

  return { success: true, data: results };
}

export async function forgetAgentMemoryAction(agentId: string, memoryKey: string) {
  const user = await getCurrentUser();
  if (!hasRequiredRole(user, "OPERATOR")) { throw new Error("Access denied: OPERATOR role required"); }

  await svcDeleteAgentMemory(user.organizationId, agentId, memoryKey);
  return { success: true };
}

export async function getAgentMemoryStatsAction(agentId?: string, offset?: number) {
  const user = await getCurrentUser();
  if (!hasRequiredRole(user, "VIEWER")) { throw new Error("Access denied: VIEWER role required"); }

  const where: { organizationId: string; agentId?: string } = {
    organizationId: user.organizationId,
  };
  if (agentId) where.agentId = agentId;

  const PAGE_SIZE = 50;
  const skip = offset || 0;
  const [allItems, totalCount] = await Promise.all([
    prisma.agentMemory.findMany({ where, select: { agentId: true, agentType: true }, take: PAGE_SIZE, skip }),
    prisma.agentMemory.count({ where }),
  ]);
  const groups: Record<string, number> = {};
  for (const item of allItems) {
    const key = (item.agentId as string) + "|" + (item.agentType as string);
    groups[key] = (groups[key] ?? 0) + 1;
  }
  const stats = Object.entries(groups).map(([key, count]) => {
    const sep = key.indexOf("|");
    return { agentId: key.slice(0, sep), agentType: key.slice(sep + 1), count };
  });

  return { success: true, data: stats, totalCount, hasMore: skip + PAGE_SIZE < totalCount };
}

export async function cleanExpiredMemoryAction() {
  const user = await getCurrentUser();
  if (!hasRequiredRole(user, "ADMIN")) { throw new Error("Access denied: ADMIN role required"); }

  const count = await cleanExpiredMemory();
  return { success: true, data: { cleaned: count } };
}
