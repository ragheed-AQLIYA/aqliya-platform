// ─── SalesOS NBA dismiss/snooze (org-level UI item map + file overlay) ───
// Suppresses SalesNextBestActionItem ids (heuristic + vNext rule ids). Fail-soft I/O.

import "server-only";
import fs from "fs/promises";
import path from "path";
import type { SalesNextBestActionItem } from "./types";

export type NbaSuppressionKind = "dismiss" | "snooze";

export interface NbaSuppressionRecord {
  actionId: string;
  organizationId: string;
  kind: NbaSuppressionKind;
  suppressedAt: string;
  /** ISO — snoozed items reappear after this instant */
  snoozeUntil?: string;
  actorId?: string;
}

export interface NbaSuppressionSnapshot {
  organizationId: string;
  suppressions: NbaSuppressionRecord[];
}

const DATA_DIR = path.join(process.cwd(), ".data", "sales");
const DEFAULT_SNOOZE_DAYS = 7;

const orgMaps = new Map<string, Map<string, NbaSuppressionRecord>>();
const loadPromises = new Map<string, Promise<void>>();

function isFilePersistenceEnabled(): boolean {
  return (
    process.env.SALESOS_FILE_PERSISTENCE === "1" ||
    process.env.SALESOS_FILE_PERSISTENCE === "true" ||
    process.env.SALESOS_PRISMA_PERSISTENCE === "1" ||
    process.env.SALESOS_PRISMA_PERSISTENCE === "true"
  );
}

function suppressionFilePath(organizationId: string): string {
  const safe = organizationId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(DATA_DIR, `${safe}-nba-suppressions.json`);
}

function assertTenant(
  organizationId: string,
  records: NbaSuppressionRecord[],
): NbaSuppressionRecord[] {
  return records.filter((r) => r.organizationId === organizationId);
}

export function isNbaSuppressionActive(
  record: NbaSuppressionRecord,
  now: Date = new Date(),
): boolean {
  if (record.kind === "dismiss") return true;
  if (!record.snoozeUntil) return false;
  return now.getTime() < new Date(record.snoozeUntil).getTime();
}

function getOrgMap(organizationId: string): Map<string, NbaSuppressionRecord> {
  let map = orgMaps.get(organizationId);
  if (!map) {
    map = new Map();
    orgMaps.set(organizationId, map);
  }
  return map;
}

export async function loadNbaSuppressionOverlay(
  organizationId: string,
): Promise<NbaSuppressionSnapshot | null> {
  const map = orgMaps.get(organizationId);
  if (map) {
    return { organizationId, suppressions: [...map.values()] };
  }
  try {
    const raw = await fs.readFile(suppressionFilePath(organizationId), "utf8");
    const parsed = JSON.parse(raw) as NbaSuppressionSnapshot;
    if (parsed.organizationId !== organizationId) return null;
    return {
      organizationId,
      suppressions: assertTenant(organizationId, parsed.suppressions ?? []),
    };
  } catch {
    return null;
  }
}

async function saveNbaSuppressionOverlay(
  organizationId: string,
): Promise<void> {
  if (!isFilePersistenceEnabled()) return;
  try {
    const map = getOrgMap(organizationId);
    const snapshot: NbaSuppressionSnapshot = {
      organizationId,
      suppressions: [...map.values()],
    };
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(
      suppressionFilePath(organizationId),
      JSON.stringify(snapshot, null, 2),
      "utf8",
    );
  } catch (error) {
    console.error(
      `[SalesOS NBA] suppression file save failed for org ${organizationId}:`,
      error instanceof Error ? error.message : error,
    );
  }
}

async function scheduleSuppressionPersist(organizationId: string): Promise<void> {
  if (!isFilePersistenceEnabled()) return;
  await saveNbaSuppressionOverlay(organizationId);
}

export async function ensureNbaSuppressionsLoaded(
  organizationId: string,
): Promise<void> {
  if (orgMaps.has(organizationId) && loadPromises.get(organizationId) === undefined) {
    return;
  }

  let pending = loadPromises.get(organizationId);
  if (!pending) {
    pending = (async () => {
      const overlay = await loadNbaSuppressionOverlay(organizationId);
      const map = getOrgMap(organizationId);
      if (overlay?.suppressions.length) {
        for (const row of overlay.suppressions) {
          map.set(row.actionId, row);
        }
      }
    })();
    loadPromises.set(organizationId, pending);
  }
  await pending;
}

export function filterVisibleNbaActionsSync(
  organizationId: string,
  actions: SalesNextBestActionItem[],
): SalesNextBestActionItem[] {
  const map = orgMaps.get(organizationId);
  if (!map || map.size === 0) return actions;
  const now = new Date();
  return actions.filter((action) => {
    const record = map.get(action.id);
    if (!record) return true;
    return !isNbaSuppressionActive(record, now);
  });
}

export async function filterVisibleNbaActions(
  organizationId: string,
  actions: SalesNextBestActionItem[],
): Promise<SalesNextBestActionItem[]> {
  await ensureNbaSuppressionsLoaded(organizationId);
  return filterVisibleNbaActionsSync(organizationId, actions);
}

export async function dismissNbaAction(
  organizationId: string,
  actionId: string,
  actorId?: string,
): Promise<NbaSuppressionRecord> {
  await ensureNbaSuppressionsLoaded(organizationId);
  const now = new Date().toISOString();
  const record: NbaSuppressionRecord = {
    actionId,
    organizationId,
    kind: "dismiss",
    suppressedAt: now,
    actorId,
  };
  getOrgMap(organizationId).set(actionId, record);
  await scheduleSuppressionPersist(organizationId);
  return record;
}

export async function snoozeNbaAction(
  organizationId: string,
  actionId: string,
  options?: { days?: number; actorId?: string },
): Promise<NbaSuppressionRecord> {
  await ensureNbaSuppressionsLoaded(organizationId);
  const days = options?.days ?? DEFAULT_SNOOZE_DAYS;
  const until = new Date();
  until.setDate(until.getDate() + days);
  const now = new Date().toISOString();
  const record: NbaSuppressionRecord = {
    actionId,
    organizationId,
    kind: "snooze",
    suppressedAt: now,
    snoozeUntil: until.toISOString(),
    actorId: options?.actorId,
  };
  getOrgMap(organizationId).set(actionId, record);
  await scheduleSuppressionPersist(organizationId);
  return record;
}

export function listNbaSuppressions(
  organizationId: string,
): NbaSuppressionRecord[] {
  const map = orgMaps.get(organizationId);
  if (!map) return [];
  return [...map.values()];
}

/** Test helper — clears in-memory NBA suppression maps. */
export function resetNbaSuppressionStoreForTests(): void {
  orgMaps.clear();
  loadPromises.clear();
}

export { DEFAULT_SNOOZE_DAYS, suppressionFilePath };
