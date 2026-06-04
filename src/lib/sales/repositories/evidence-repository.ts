import "server-only";
import { prisma } from "@/lib/prisma";
import type { SalesEvidenceRef } from "../store";
import {
  prismaEvidenceToDomain,
  domainEvidenceToPrisma,
} from "./entity-mappers";

export const evidenceRepository = {
  async findByOpportunity(
    organizationId: string,
    dealId: string,
  ): Promise<SalesEvidenceRef[]> {
    const rows = await prisma.salesEvidenceLink.findMany({
      where: { organizationId, dealId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(prismaEvidenceToDomain);
  },

  async findByOrganization(
    organizationId: string,
  ): Promise<SalesEvidenceRef[]> {
    const rows = await prisma.salesEvidenceLink.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
    });
    return rows.map(prismaEvidenceToDomain);
  },

  async create(ref: SalesEvidenceRef): Promise<void> {
    const data = domainEvidenceToPrisma(ref);
    await prisma.salesEvidenceLink.create({ data });
  },

  async delete(
    organizationId: string,
    id: string,
  ): Promise<boolean> {
    const result = await prisma.salesEvidenceLink.deleteMany({
      where: { id, organizationId },
    });
    return result.count > 0;
  },
};
