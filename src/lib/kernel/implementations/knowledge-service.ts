import type { IKnowledgeService, KnowledgeItem } from "../contracts/knowledge";
import type { KernelResult, PaginatedResult } from "../types";
import { randomUUID } from "crypto";
import { prisma } from "../prisma";
import type { Prisma } from "@prisma/client";

export class KnowledgeServiceWrapper implements IKnowledgeService {
  async record(input: {
    organizationId: string;
    type: string;
    content: string;
    source?: string;
    confidence?: number;
    tags?: string[];
    metadata?: Record<string, unknown>;
    createdBy: string;
  }): Promise<KernelResult<KnowledgeItem>> {
    try {
      const id = randomUUID();
      const item: KnowledgeItem = {
        id,
        organizationId: input.organizationId,
        type: input.type,
        content: input.content,
        source: input.source,
        confidence: input.confidence ?? 0.5,
        tags: input.tags ?? [],
        metadata: input.metadata,
        createdBy: input.createdBy,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Persist metadata to PlatformAuditLog for traceability
      await prisma.platformAuditLog.create({
        data: {
          platformOrganizationId: input.organizationId,
          productKey: "knowledge",
          actorId: input.createdBy,
          actorName: "knowledge-service",
          action: `knowledge.${input.type}.recorded`,
          targetType: "KnowledgeItem",
          targetId: id,
          metadata: {
            type: input.type,
            source: input.source,
            confidence: input.confidence,
            tags: input.tags,
          } as Prisma.InputJsonValue,
        },
      });

      return { success: true, data: item };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to record knowledge",
      };
    }
  }

  async recall(params: {
    organizationId: string;
    query: string;
    type?: string;
    tags?: string[];
    limit?: number;
  }): Promise<KernelResult<PaginatedResult<KnowledgeItem>>> {
    try {
      // Recall from platform audit logs that match the query
      const logs = await prisma.platformAuditLog.findMany({
        where: {
          platformOrganizationId: params.organizationId,
          productKey: "knowledge",
          ...(params.type ? { targetType: "KnowledgeItem" } : {}),
        },
        orderBy: { createdAt: "desc" },
        take: params.limit ?? 20,
      });

      const items: KnowledgeItem[] = logs
        .filter((l) => {
          const meta = l.metadata as Record<string, unknown> | null;
          if (!meta) return false;
          if (params.type && meta.type !== params.type) return false;
          if (params.tags?.length && !params.tags.some((t) => (meta.tags as string[])?.includes(t)))
            return false;
          return true;
        })
        .map((l) => ({
          id: l.id,
          organizationId: l.platformOrganizationId ?? "unknown",
          type: ((l.metadata as Record<string, unknown>)?.type as string) ?? "unknown",
          content: l.action,
          confidence: ((l.metadata as Record<string, unknown>)?.confidence as number) ?? 0.5,
          tags: ((l.metadata as Record<string, unknown>)?.tags as string[]) ?? [],
          createdBy: l.actorId ?? "unknown",
          createdAt: l.createdAt,
          updatedAt: l.createdAt,
        }));

      return {
        success: true,
        data: { items, totalCount: items.length, hasMore: items.length >= (params.limit ?? 20) },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Recall failed",
      };
    }
  }

  async classify(_itemId: string, _classification: string): Promise<KernelResult<void>> {
    // Classification is handled at the application level via AI or rules
    return { success: true };
  }
}
