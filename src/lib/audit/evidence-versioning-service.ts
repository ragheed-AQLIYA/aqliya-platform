import "server-only";
import { prisma } from "@/lib/prisma";
import type { Prisma } from "@prisma/client";

export interface EvidenceVersion {
  id: string;
  evidenceId: string;
  versionNumber: number;
  changes: Record<string, unknown>;
  changeDescription: string | null;
  createdById: string | null;
  createdByName: string | null;
  createdAt: string;
}

export interface VersionDiff {
  field: string;
  oldValue: unknown;
  newValue: unknown;
  changed: boolean;
}

export async function createEvidenceVersion(
  evidenceId: string,
  changes: Record<string, unknown>,
  userId?: string,
  userName?: string,
  description?: string,
): Promise<EvidenceVersion> {
  const evidence = await prisma.auditEvidence.findUnique({
    where: { id: evidenceId },
    select: { id: true, filename: true, fileType: true, fileSize: true, fileHash: true, storageKey: true, state: true, uploadedBy: true },
  });
  if (!evidence) throw new Error("Evidence not found");

  const lastVersion = await prisma.auditEvidenceVersion.findFirst({
    where: { evidenceId },
    orderBy: { versionNumber: "desc" },
    select: { versionNumber: true },
  });

  const versionNumber = (lastVersion?.versionNumber ?? 0) + 1;

  const snapshot: Record<string, unknown> = {
    filename: evidence.filename,
    fileType: evidence.fileType,
    fileSize: evidence.fileSize,
    fileHash: evidence.fileHash,
    storageKey: evidence.storageKey,
    state: evidence.state,
    uploadedBy: evidence.uploadedBy,
    ...changes,
  };

  const version = await prisma.auditEvidenceVersion.create({
    data: {
      evidenceId,
      versionNumber,
      changes: snapshot as Prisma.InputJsonValue,
      changeDescription: description ?? null,
      createdById: userId ?? null,
      createdByName: userName ?? null,
    },
  });

  return {
    id: version.id,
    evidenceId: version.evidenceId,
    versionNumber: version.versionNumber,
    changes: version.changes as Record<string, unknown>,
    changeDescription: version.changeDescription,
    createdById: version.createdById,
    createdByName: version.createdByName,
    createdAt: version.createdAt.toISOString(),
  };
}

export async function getEvidenceVersions(evidenceId: string): Promise<EvidenceVersion[]> {
  const versions = await prisma.auditEvidenceVersion.findMany({
    where: { evidenceId },
    orderBy: { versionNumber: "desc" },
  });

  return versions.map((v) => ({
    id: v.id,
    evidenceId: v.evidenceId,
    versionNumber: v.versionNumber,
    changes: v.changes as Record<string, unknown>,
    changeDescription: v.changeDescription,
    createdById: v.createdById,
    createdByName: v.createdByName,
    createdAt: v.createdAt.toISOString(),
  }));
}

export async function getEvidenceVersion(
  evidenceId: string,
  versionNumber: number,
): Promise<EvidenceVersion | null> {
  const version = await prisma.auditEvidenceVersion.findUnique({
    where: { evidenceId_versionNumber: { evidenceId, versionNumber } },
  });

  if (!version) return null;

  return {
    id: version.id,
    evidenceId: version.evidenceId,
    versionNumber: version.versionNumber,
    changes: version.changes as Record<string, unknown>,
    changeDescription: version.changeDescription,
    createdById: version.createdById,
    createdByName: version.createdByName,
    createdAt: version.createdAt.toISOString(),
  };
}

export async function compareVersions(
  versionId1: string,
  versionId2: string,
): Promise<VersionDiff[]> {
  const [v1, v2] = await Promise.all([
    prisma.auditEvidenceVersion.findUnique({ where: { id: versionId1 } }),
    prisma.auditEvidenceVersion.findUnique({ where: { id: versionId2 } }),
  ]);

  if (!v1 || !v2) throw new Error("One or both versions not found");

  const changes1 = v1.changes as Record<string, unknown>;
  const changes2 = v2.changes as Record<string, unknown>;
  const allKeys = new Set([...Object.keys(changes1), ...Object.keys(changes2)]);
  const diffs: VersionDiff[] = [];

  for (const key of allKeys) {
    const oldVal = changes1[key];
    const newVal = changes2[key];
    if (JSON.stringify(oldVal) !== JSON.stringify(newVal)) {
      diffs.push({ field: key, oldValue: oldVal, newValue: newVal, changed: true });
    } else {
      diffs.push({ field: key, oldValue: oldVal, newValue: newVal, changed: false });
    }
  }

  return diffs;
}

export async function revertToVersion(
  evidenceId: string,
  versionNumber: number,
  userId?: string,
  userName?: string,
): Promise<EvidenceVersion> {
  const version = await getEvidenceVersion(evidenceId, versionNumber);
  if (!version) throw new Error(`Version ${versionNumber} not found`);

  const changes = version.changes as Record<string, unknown>;

  await prisma.auditEvidence.update({
    where: { id: evidenceId },
    data: {
      filename: (changes.filename as string) ?? undefined,
      fileType: (changes.fileType as string) ?? undefined,
      fileSize: (changes.fileSize as number) ?? undefined,
      fileHash: (changes.fileHash as string) ?? undefined,
      storageKey: (changes.storageKey as string) ?? undefined,
      state: (changes.state as string) ?? undefined,
    },
  });

  const newVersion = await createEvidenceVersion(
    evidenceId,
    { revertedFromVersion: versionNumber, ...changes },
    userId,
    userName,
    `Reverted to version ${versionNumber}`,
  );

  return newVersion;
}
