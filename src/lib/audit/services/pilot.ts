/**
 * Audit Services — Pilot domain
 *
 * Pilot feedback, signoff checklist, production blockers.
 */

import type { PilotFeedback, ProductionBlocker, PilotSignoff } from "@/types/audit";
import * as mock from "../mock-data";
import { getDb, tryDb } from "./common";

// ─── Pilot Feedback ───

export async function createPilotFeedback(data: {
  engagementId: string;
  title: string;
  description: string;
  source: string;
  category: string;
  severity?: string;
  createdBy: string;
}): Promise<PilotFeedback> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.createPilotFeedback(data);
}

export async function updatePilotFeedbackStatus(
  id: string,
  status: string,
  decision?: string,
  owner?: string,
  nextAction?: string,
): Promise<PilotFeedback | null> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.updatePilotFeedbackStatus(id, status, decision, owner, nextAction);
}

export async function getPilotFeedback(
  engagementId: string,
): Promise<PilotFeedback[]> {
  return tryDb(
    () => Promise.resolve([]),
    (db) => db.getPilotFeedback(engagementId),
  );
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
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.createProductionBlocker(data);
}

export async function updateProductionBlockerStatus(
  id: string,
  status: string,
  owner?: string,
  resolutionPlan?: string,
): Promise<ProductionBlocker | null> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.updateProductionBlockerStatus(id, status, owner, resolutionPlan);
}

export async function getProductionBlockers(
  engagementId?: string,
): Promise<ProductionBlocker[]> {
  return tryDb(
    () => Promise.resolve([]),
    (db) => db.getProductionBlockers(engagementId),
  );
}

export async function createOrUpdatePilotSignoff(data: {
  engagementId: string;
  checklistItem: string;
  status: string;
  signedBy?: string;
  notes?: string;
}): Promise<PilotSignoff> {
  const db = await getDb().catch(() => {
    throw new Error("Database not available");
  });
  return db.createOrUpdatePilotSignoff(data);
}

export async function getPilotSignoffChecklist(
  engagementId: string,
): Promise<PilotSignoff[]> {
  return tryDb(
    () => Promise.resolve([]),
    (db) => db.getPilotSignoffChecklist(engagementId),
  );
}
