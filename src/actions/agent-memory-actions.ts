"use server";

import { requireUserContext } from "@/lib/auth";
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
  const user = await requireUserContext("OPERATOR");

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
  const user = await requireUserContext("VIEWER");

  const value = await getAgentMemory(user.organizationId, agentId, memoryKey);
  return { success: true, data: value };
}

export async function queryAgentMemoryAction(
  agentId?: string,
  agentType?: string,
  memoryKeyPrefix?: string,
  tags?: string[],
) {
  const user = await requireUserContext("VIEWER");

  const results = await svcQueryAgentMemory(user.organizationId, {
    agentId,
    agentType,
    memoryKeyPrefix,
    tags,
  });

  return { success: true, data: results };
}

export async function forgetAgentMemoryAction(agentId: string, memoryKey: string) {
  const user = await requireUserContext("OPERATOR");

  await svcDeleteAgentMemory(user.organizationId, agentId, memoryKey);
  return { success: true };
}

export async function getAgentMemoryStatsAction(agentId?: string) {
  const user = await requireUserContext("VIEWER");

  const where: { organizationId: string; agentId?: string } = {
    organizationId: user.organizationId,
  };
  if (agentId) where.agentId = agentId;

  const allItems = await prisma.agentMemory.findMany({ where, select: { agentId: true, agentType: true } });
  const groups: Record<string, number> = {};
  for (const item of allItems) {
    const key = (item.agentId as string) + "|" + (item.agentType as string);
    groups[key] = (groups[key] ?? 0) + 1;
  }
  const stats = Object.entries(groups).map(([key, count]) => {
    const sep = key.indexOf("|");
    return { agentId: key.slice(0, sep), agentType: key.slice(sep + 1), count };
  });

  return { success: true, data: stats };
}

export async function cleanExpiredMemoryAction() {
  await requireUserContext("ADMIN");

  const count = await cleanExpiredMemory();
  return { success: true, data: { cleaned: count } };
}
