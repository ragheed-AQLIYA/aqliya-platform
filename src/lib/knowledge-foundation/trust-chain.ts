import "server-only";

import { prisma } from "@/lib/prisma";

export type ChainParentRelease = {
  id: string;
  manifestSha256: string;
};

/**
 * Resolve explicit trust-chain parent at release write time.
 *
 * Lineage rules (not "latest release globally"):
 * 1. If version has rollbackVersionId → parent = COMPLETE release of that version
 * 2. Else → parent = COMPLETE release of the currently ACTIVE version (if any, not self)
 * 3. Bootstrap → null
 */
export async function resolveChainParentRelease(
  versionId: string,
  rollbackVersionId: string | null,
): Promise<ChainParentRelease | null> {
  let parentVersionId: string | null = null;

  if (rollbackVersionId) {
    parentVersionId = rollbackVersionId;
  } else {
    const active = await prisma.knowledgeFoundationVersion.findFirst({
      where: { status: "ACTIVE" },
      select: { id: true },
    });
    if (active && active.id !== versionId) {
      parentVersionId = active.id;
    }
  }

  if (!parentVersionId) {
    return null;
  }

  const parentRelease = await prisma.knowledgeFoundationRelease.findFirst({
    where: {
      versionId: parentVersionId,
      artifactStatus: "COMPLETE",
      manifestSha256: { not: null },
    },
    orderBy: { createdAt: "desc" },
    select: { id: true, manifestSha256: true },
  });

  if (!parentRelease?.manifestSha256) {
    return null;
  }

  return {
    id: parentRelease.id,
    manifestSha256: parentRelease.manifestSha256,
  };
}
