import "server-only";
import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

export interface AgentMemoryInput {
  agentId: string;
  agentType?: string;
  memoryKey: string;
  memoryValue: unknown;
  context?: Record<string, unknown>;
  ttl?: Date;
  tags?: string[];
  createdById?: string;
}

export interface AgentMemoryQuery {
  agentId?: string;
  agentType?: string;
  memoryKey?: string;
  memoryKeyPrefix?: string;
  tags?: string[];
  includeExpired?: boolean;
  limit?: number;
}

export async function setAgentMemory(
  organizationId: string,
  input: AgentMemoryInput,
): Promise<void> {
  await prisma.agentMemory.upsert({
    where: {
      organizationId_agentId_memoryKey: {
        organizationId,
        agentId: input.agentId,
        memoryKey: input.memoryKey,
      },
    },
    update: {
      memoryValue: input.memoryValue as Prisma.InputJsonValue,
      context: (input.context ?? {}) as Prisma.InputJsonValue,
      ttl: input.ttl,
      tags: (input.tags ?? []) as Prisma.InputJsonValue,
      updatedAt: new Date(),
    },
    create: {
      organizationId,
      agentId: input.agentId,
      agentType: input.agentType ?? "assistant",
      memoryKey: input.memoryKey,
      memoryValue: input.memoryValue as Prisma.InputJsonValue,
      context: (input.context ?? {}) as Prisma.InputJsonValue,
      ttl: input.ttl,
      tags: (input.tags ?? []) as Prisma.InputJsonValue,
      createdById: input.createdById,
    },
  });
}

export async function getAgentMemory<T = unknown>(
  organizationId: string,
  agentId: string,
  memoryKey: string,
): Promise<T | null> {
  const record = await prisma.agentMemory.findFirst({
    where: { organizationId, agentId, memoryKey },
  });
  if (!record) return null;
  if (record.ttl && record.ttl < new Date()) {
    await prisma.agentMemory.delete({ where: { id: record.id } });
    return null;
  }
  return record.memoryValue as T;
}

export async function queryAgentMemory<T = unknown>(
  organizationId: string,
  query: AgentMemoryQuery,
): Promise<Array<{ key: string; value: T; agentId: string; agentType: string; tags: string[]; createdAt: Date }>> {
  const where: Prisma.AgentMemoryWhereInput = { organizationId };
  if (query.agentId) where.agentId = query.agentId;
  if (query.agentType) where.agentType = query.agentType;
  if (query.memoryKey) where.memoryKey = query.memoryKey;
  if (query.memoryKeyPrefix) where.memoryKey = { startsWith: query.memoryKeyPrefix };
  if (query.tags && query.tags.length > 0) where.tags = { array_contains: query.tags };
  if (!query.includeExpired) where.OR = [{ ttl: null }, { ttl: { gte: new Date() } }];

  const records = await prisma.agentMemory.findMany({
    where,
    orderBy: { updatedAt: "desc" },
    take: query.limit ?? 50,
  });

  return records.map((r) => ({
    key: r.memoryKey,
    value: r.memoryValue as unknown as T,
    agentId: r.agentId,
    agentType: r.agentType,
    tags: (r.tags as string[]) ?? [],
    createdAt: r.createdAt,
  }));
}

export async function deleteAgentMemory(
  organizationId: string,
  agentId: string,
  memoryKey: string,
): Promise<void> {
  await prisma.agentMemory.deleteMany({
    where: { organizationId, agentId, memoryKey },
  });
}

export async function cleanExpiredMemory(): Promise<number> {
  const result = await prisma.agentMemory.deleteMany({
    where: { ttl: { lt: new Date(), not: null } },
  });
  return result.count;
}
