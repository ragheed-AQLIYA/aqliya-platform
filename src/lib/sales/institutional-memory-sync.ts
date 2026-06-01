import "server-only";

import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";
import {
  appendInstitutionalMemoryMetadata,
  readInstitutionalMemory,
  type InstitutionalMemoryEntry,
} from "./institutional-memory-shared";
import { collectInstitutionalMemoryCandidates } from "./institutional-memory";
import type { SalesOrgScope } from "./services";

function parseMetadata(value: unknown): Record<string, unknown> {
  if (value && typeof value === "object" && !Array.isArray(value)) {
    return value as Record<string, unknown>;
  }
  return {};
}

export async function syncInstitutionalMemoryForAccount(
  accountId: string,
  scope: SalesOrgScope,
): Promise<InstitutionalMemoryEntry[]> {
  const account = await prisma.salesAccount.findFirst({
    where: { id: accountId, organizationId: scope.organizationId },
    select: { id: true, metadata: true },
  });

  if (!account) {
    throw new Error("SalesOS: account not found");
  }

  const existingMeta = parseMetadata(account.metadata);
  const prior = readInstitutionalMemory(existingMeta);
  const candidates = await collectInstitutionalMemoryCandidates(
    accountId,
    scope,
  );

  const knownRefs = new Set(prior.map((e) => e.sourceRef));
  const toAppend = candidates.filter((c) => !knownRefs.has(c.sourceRef));

  if (toAppend.length === 0) {
    return prior;
  }

  const nextMeta = appendInstitutionalMemoryMetadata(existingMeta, toAppend);

  await prisma.salesAccount.update({
    where: { id: accountId },
    data: { metadata: nextMeta as Prisma.InputJsonValue },
  });

  return readInstitutionalMemory(nextMeta);
}
