import type { RetentionHold } from "./types";

const HOLD_STORE: RetentionHold[] = [];

export async function addHold(params: {
  recordType: string;
  recordId: string;
  reason: string;
  userId?: string;
  organizationId?: string;
}): Promise<RetentionHold> {
  const existing = HOLD_STORE.find(
    (h) => h.recordType === params.recordType && h.recordId === params.recordId,
  );
  if (existing) {
    return existing;
  }

  const hold: RetentionHold = {
    id: crypto.randomUUID(),
    recordType: params.recordType,
    recordId: params.recordId,
    reason: params.reason,
    createdById: params.userId,
    createdAt: new Date(),
    organizationId: params.organizationId,
  };

  HOLD_STORE.push(hold);
  return hold;
}

export async function removeHold(holdId: string): Promise<boolean> {
  const index = HOLD_STORE.findIndex((h) => h.id === holdId);
  if (index >= 0) {
    HOLD_STORE.splice(index, 1);
    return true;
  }
  return false;
}

export async function listHolds(organizationId?: string): Promise<RetentionHold[]> {
  if (organizationId) {
    return HOLD_STORE.filter((h) => h.organizationId === organizationId);
  }
  return [...HOLD_STORE];
}

export async function checkHold(recordType: string, recordId: string): Promise<RetentionHold | undefined> {
  return HOLD_STORE.find((h) => h.recordType === recordType && h.recordId === recordId);
}

export async function isRecordOnHold(recordType: string, recordId: string): Promise<boolean> {
  const hold = await checkHold(recordType, recordId);
  return hold !== undefined;
}
