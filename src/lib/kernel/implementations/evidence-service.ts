import type { IEvidenceService, EvidenceItem, CreateEvidenceInput } from "../contracts/evidence";
import type { KernelResult, PaginatedResult } from "../types";
import { prisma } from "@/lib/prisma";

export class EvidenceServiceWrapper implements IEvidenceService {
  async create(input: CreateEvidenceInput): Promise<KernelResult<EvidenceItem>> {
    const item = await prisma.coreEvidence.create({
      data: {
        organizationId: input.organizationId,
        productSlug: "platform",
        productEvidenceId: "",
        resourceType: input.sourceType,
        resourceId: input.sourceId ?? "",
        evidenceType: input.category,
        filename: input.title,
        fileType: input.sourceType,
        uploadedById: input.createdBy,
        metadata: input.metadata as unknown as Record<string, string>,
      },
    });
    return {
      success: true,
      data: {
        id: item.id,
        organizationId: item.organizationId,
        title: item.filename ?? "",
        description: undefined,
        category: item.evidenceType ?? "",
        sourceType: item.fileType ?? "",
        fileKey: item.storageKey ?? undefined,
        checksum: item.fileHash ?? undefined,
        metadata: item.metadata as Record<string, unknown>,
        createdBy: item.uploadedById ?? "",
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    };
  }

  async getById(id: string, organizationId: string): Promise<KernelResult<EvidenceItem>> {
    const item = await prisma.coreEvidence.findFirst({
      where: { id, organizationId },
    });
    if (!item) {
      return { success: false, error: "Evidence not found", code: "NOT_FOUND" };
    }
    return {
      success: true,
      data: {
        id: item.id,
        organizationId: item.organizationId,
        title: item.filename ?? "",
        category: item.evidenceType ?? "",
        sourceType: item.fileType ?? "",
        createdBy: item.uploadedById ?? "",
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      },
    };
  }

  async list(params: {
    organizationId: string;
    engagementId?: string;
    category?: string;
    skip?: number;
    take?: number;
  }): Promise<KernelResult<PaginatedResult<EvidenceItem>>> {
    const where: Record<string, unknown> = { organizationId: params.organizationId };
    if (params.category) where.evidenceType = params.category;

    const [items, totalCount] = await Promise.all([
      prisma.coreEvidence.findMany({
        where,
        skip: params.skip ?? 0,
        take: params.take ?? 50,
        orderBy: { createdAt: "desc" },
      }),
      prisma.coreEvidence.count({ where }),
    ]);

    return {
      success: true,
      data: {
        items: items.map((e) => ({
          id: e.id,
          organizationId: e.organizationId,
          title: e.filename ?? "",
          category: e.evidenceType ?? "",
          sourceType: e.fileType ?? "",
          createdBy: e.uploadedById ?? "",
          createdAt: e.createdAt,
          updatedAt: e.updatedAt,
        })),
        totalCount,
        hasMore: (params.skip ?? 0) + items.length < totalCount,
      },
    };
  }

  async linkToOutput(evidenceId: string, outputType: string, outputId: string): Promise<KernelResult<void>> {
    return { success: true };
  }
}
