/**
 * S7-08 — in-memory sales territories (org-scoped, no schema migration).
 */

import type { SalesEntityStatus } from "./types";

export interface SalesTerritory {
  id: string;
  organizationId: string;
  code: string;
  nameAr: string;
  regionLabel: string;
  ownerName?: string;
  status: SalesEntityStatus;
  createdAt: string;
  updatedAt: string;
}

const stores = new Map<string, Map<string, SalesTerritory>>();

function ensureOrg(orgId: string): Map<string, SalesTerritory> {
  let map = stores.get(orgId);
  if (!map) {
    map = new Map();
    stores.set(orgId, map);
    const now = new Date().toISOString();
    for (const seed of [
      { code: "KSA-CENTRAL", nameAr: "الوسطى", regionLabel: "السعودية — الوسطى" },
      { code: "KSA-WEST", nameAr: "الغربية", regionLabel: "السعودية — الغربية" },
      { code: "GCC", nameAr: "الخليج", regionLabel: "دول الخليج" },
    ]) {
      const id = `territory-${seed.code.toLowerCase()}`;
      map.set(id, {
        id,
        organizationId: orgId,
        code: seed.code,
        nameAr: seed.nameAr,
        regionLabel: seed.regionLabel,
        status: "active",
        createdAt: now,
        updatedAt: now,
      });
    }
  }
  return map;
}

export function listTerritories(organizationId: string): SalesTerritory[] {
  return [...ensureOrg(organizationId).values()].sort((a, b) =>
    a.code.localeCompare(b.code),
  );
}

export function createTerritory(input: {
  organizationId: string;
  code: string;
  nameAr: string;
  regionLabel: string;
  ownerName?: string;
}): SalesTerritory {
  const map = ensureOrg(input.organizationId);
  const now = new Date().toISOString();
  const id = `territory-${Date.now()}`;
  const row: SalesTerritory = {
    id,
    organizationId: input.organizationId,
    code: input.code.trim().toUpperCase(),
    nameAr: input.nameAr.trim(),
    regionLabel: input.regionLabel.trim(),
    ownerName: input.ownerName?.trim(),
    status: "active",
    createdAt: now,
    updatedAt: now,
  };
  map.set(id, row);
  return row;
}

export function updateTerritory(
  organizationId: string,
  territoryId: string,
  patch: Partial<
    Pick<SalesTerritory, "code" | "nameAr" | "regionLabel" | "ownerName" | "status">
  >,
): SalesTerritory | undefined {
  const map = ensureOrg(organizationId);
  const existing = map.get(territoryId);
  if (!existing) return undefined;
  const updated: SalesTerritory = {
    ...existing,
    ...patch,
    code: patch.code?.trim().toUpperCase() ?? existing.code,
    updatedAt: new Date().toISOString(),
  };
  map.set(territoryId, updated);
  return updated;
}

export function deleteTerritory(
  organizationId: string,
  territoryId: string,
): boolean {
  return ensureOrg(organizationId).delete(territoryId);
}
