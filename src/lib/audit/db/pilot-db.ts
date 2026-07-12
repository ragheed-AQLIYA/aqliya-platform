import { prisma } from "@/lib/prisma";
import type {
  PilotFeedback,
  ProductionBlocker,
  PilotSignoff,
} from "@/types/audit";
import { protectedAuditReadUnavailable } from "./types";

function toPilotFeedback(f: {
  id: string;
  engagementId: string;
  title: string;
  description: string;
  source: string;
  category: string;
  severity: string;
  status: string;
  decision: string | null;
  owner: string | null;
  nextAction: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}): PilotFeedback {
  return {
    id: f.id,
    engagementId: f.engagementId,
    title: f.title,
    description: f.description,
    source: f.source,
    category: f.category,
    severity: f.severity,
    status: f.status,
    decision: f.decision ?? undefined,
    owner: f.owner ?? undefined,
    nextAction: f.nextAction ?? undefined,
    createdBy: f.createdBy,
    createdAt: f.createdAt.toISOString(),
    updatedAt: f.updatedAt.toISOString(),
  };
}

function toProductionBlocker(b: {
  id: string;
  engagementId: string | null;
  title: string;
  description: string;
  category: string;
  severity: string;
  status: string;
  requiredBefore: string;
  owner: string | null;
  resolutionPlan: string | null;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}): ProductionBlocker {
  return {
    id: b.id,
    engagementId: b.engagementId ?? undefined,
    title: b.title,
    description: b.description,
    category: b.category,
    severity: b.severity,
    status: b.status,
    requiredBefore: b.requiredBefore,
    owner: b.owner ?? undefined,
    resolutionPlan: b.resolutionPlan ?? undefined,
    createdBy: b.createdBy,
    createdAt: b.createdAt.toISOString(),
    updatedAt: b.updatedAt.toISOString(),
  };
}

function toPilotSignoff(s: {
  id: string;
  engagementId: string;
  checklistItem: string;
  status: string;
  signedBy: string | null;
  signedAt: Date | null;
  notes: string | null;
  createdAt: Date;
  updatedAt: Date;
}): PilotSignoff {
  return {
    id: s.id,
    engagementId: s.engagementId,
    checklistItem: s.checklistItem,
    status: s.status,
    signedBy: s.signedBy ?? undefined,
    signedAt: s.signedAt?.toISOString() ?? undefined,
    notes: s.notes ?? undefined,
    createdAt: s.createdAt.toISOString(),
    updatedAt: s.updatedAt.toISOString(),
  };
}

export async function createPilotFeedback(data: {
  engagementId: string;
  title: string;
  description: string;
  source: string;
  category: string;
  severity?: string;
  createdBy: string;
}): Promise<PilotFeedback> {
  const fb = await prisma.pilotFeedback.create({
    data: { ...data, severity: data.severity ?? "medium", status: "open" },
  });
  return toPilotFeedback(fb);
}

export async function updatePilotFeedbackStatus(
  id: string,
  status: string,
  decision?: string,
  owner?: string,
  nextAction?: string,
): Promise<PilotFeedback | null> {
  try {
    const fb = await prisma.pilotFeedback.update({
      where: { id },
      data: {
        status,
        decision: decision ?? null,
        owner: owner ?? null,
        nextAction: nextAction ?? null,
      },
    });
    return toPilotFeedback(fb);
  } catch {
    return null;
  }
}

export async function getPilotFeedback(
  engagementId: string,
): Promise<PilotFeedback[]> {
  try {
    const items = await prisma.pilotFeedback.findMany({
      where: { engagementId },
      orderBy: { createdAt: "desc" },
    });
    return items.map(toPilotFeedback);
  } catch (error) {
    protectedAuditReadUnavailable(`getPilotFeedback(${engagementId})`, error);
  }
}

export async function createProductionBlocker(data: {
  engagementId?: string;
  title: string;
  description: string;
  category: string;
  severity?: string;
  requiredBefore?: string;
  createdBy: string;
}): Promise<ProductionBlocker> {
  const b = await prisma.productionBlocker.create({
    data: {
      ...data,
      engagementId: data.engagementId ?? null,
      severity: data.severity ?? "critical",
      requiredBefore: data.requiredBefore ?? "production",
      status: "open",
    },
  });
  return toProductionBlocker(b);
}

export async function updateProductionBlockerStatus(
  id: string,
  status: string,
  owner?: string,
  resolutionPlan?: string,
): Promise<ProductionBlocker | null> {
  try {
    const b = await prisma.productionBlocker.update({
      where: { id },
      data: {
        status,
        owner: owner ?? null,
        resolutionPlan: resolutionPlan ?? null,
      },
    });
    return toProductionBlocker(b);
  } catch {
    return null;
  }
}

export async function getProductionBlockers(
  engagementId?: string,
): Promise<ProductionBlocker[]> {
  try {
    const where = engagementId ? { engagementId } : {};
    const items = await prisma.productionBlocker.findMany({
      where,
      orderBy: { createdAt: "desc" },
    });
    return items.map(toProductionBlocker);
  } catch (error) {
    protectedAuditReadUnavailable(
      `getProductionBlockers(${engagementId ?? "all"})`,
      error,
    );
  }
}

export async function createOrUpdatePilotSignoff(data: {
  engagementId: string;
  checklistItem: string;
  status: string;
  signedBy?: string;
  notes?: string;
}): Promise<PilotSignoff> {
  const existing = await prisma.pilotSignoff.findUnique({
    where: {
      engagementId_checklistItem: {
        engagementId: data.engagementId,
        checklistItem: data.checklistItem,
      },
    },
  });
  if (existing) {
    const s = await prisma.pilotSignoff.update({
      where: { id: existing.id },
      data: {
        status: data.status,
        signedBy: data.signedBy ?? null,
        signedAt: data.status === "approved" ? new Date() : null,
        notes: data.notes ?? null,
      },
    });
    return toPilotSignoff(s);
  }
  const s = await prisma.pilotSignoff.create({
    data: {
      engagementId: data.engagementId,
      checklistItem: data.checklistItem,
      status: data.status,
      signedBy: data.signedBy ?? null,
      signedAt: data.status === "approved" ? new Date() : null,
      notes: data.notes ?? null,
    },
  });
  return toPilotSignoff(s);
}

export async function getPilotSignoffChecklist(
  engagementId: string,
): Promise<PilotSignoff[]> {
  try {
    const items = await prisma.pilotSignoff.findMany({
      where: { engagementId },
      orderBy: { createdAt: "asc" },
    });
    return items.map(toPilotSignoff);
  } catch (error) {
    protectedAuditReadUnavailable(
      `getPilotSignoffChecklist(${engagementId})`,
      error,
    );
  }
}
