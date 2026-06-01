// ─── SalesOS file-backed persistence (no Prisma migration) ───
// Server-only JSON snapshots per organization under .data/sales/.

import "server-only";
import fs from "fs/promises";
import path from "path";
import type {
  SalesAccount,
  SalesActivity,
  SalesCompetitorMention,
  SalesContact,
  SalesICPInsight,
  SalesLead,
  SalesMeeting,
  SalesNextAction,
  SalesObjection,
  SalesOpportunity,
  SalesOutreach,
  SalesProofAsset,
  SalesSignal,
  SalesInteractionLog,
  SalesWinLossInsight,
} from "./types";
import type { SalesAuditEntry, SalesEvidenceRef } from "./store";

export interface SalesOrgSnapshot {
  accounts: SalesAccount[];
  contacts: SalesContact[];
  leads: SalesLead[];
  opportunities: SalesOpportunity[];
  interactions: SalesInteractionLog[];
  evidence: SalesEvidenceRef[];
  auditLog: SalesAuditEntry[];
  seeded: boolean;
  /** v0.1 intelligence maps — optional for backward-compatible snapshots */
  activities?: SalesActivity[];
  meetings?: SalesMeeting[];
  outreach?: SalesOutreach[];
  signals?: SalesSignal[];
  objections?: SalesObjection[];
  competitorMentions?: SalesCompetitorMention[];
  proofAssets?: SalesProofAsset[];
  icpInsights?: SalesICPInsight[];
  nextActions?: SalesNextAction[];
  winLossInsights?: SalesWinLossInsight[];
}

const DATA_DIR = path.join(process.cwd(), ".data", "sales");

function orgFilePath(organizationId: string): string {
  const safe = organizationId.replace(/[^a-zA-Z0-9_-]/g, "_");
  return path.join(DATA_DIR, `${safe}.json`);
}

export async function loadSalesOrgSnapshot(
  organizationId: string,
): Promise<SalesOrgSnapshot | null> {
  try {
    const raw = await fs.readFile(orgFilePath(organizationId), "utf8");
    return JSON.parse(raw) as SalesOrgSnapshot;
  } catch {
    return null;
  }
}

export async function saveSalesOrgSnapshot(
  organizationId: string,
  snapshot: SalesOrgSnapshot,
): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true });
  await fs.writeFile(
    orgFilePath(organizationId),
    JSON.stringify(snapshot, null, 2),
    "utf8",
  );
}

export function snapshotFromMaps(input: {
  accounts: Map<string, SalesAccount>;
  contacts: Map<string, SalesContact>;
  leads: Map<string, SalesLead>;
  opportunities: Map<string, SalesOpportunity>;
  interactions: Map<string, SalesInteractionLog>;
  evidence: Map<string, SalesEvidenceRef>;
  auditLog: SalesAuditEntry[];
  seeded: boolean;
  activities?: Map<string, SalesActivity>;
  meetings?: Map<string, SalesMeeting>;
  outreach?: Map<string, SalesOutreach>;
  signals?: Map<string, SalesSignal>;
  objections?: Map<string, SalesObjection>;
  competitorMentions?: Map<string, SalesCompetitorMention>;
  proofAssets?: Map<string, SalesProofAsset>;
  icpInsights?: Map<string, SalesICPInsight>;
  nextActions?: Map<string, SalesNextAction>;
  winLossInsights?: Map<string, SalesWinLossInsight>;
}): SalesOrgSnapshot {
  return {
    accounts: [...input.accounts.values()],
    contacts: [...input.contacts.values()],
    leads: [...input.leads.values()],
    opportunities: [...input.opportunities.values()],
    interactions: [...input.interactions.values()],
    evidence: [...input.evidence.values()],
    auditLog: input.auditLog,
    seeded: input.seeded,
    activities: input.activities ? [...input.activities.values()] : undefined,
    meetings: input.meetings ? [...input.meetings.values()] : undefined,
    outreach: input.outreach ? [...input.outreach.values()] : undefined,
    signals: input.signals ? [...input.signals.values()] : undefined,
    objections: input.objections ? [...input.objections.values()] : undefined,
    competitorMentions: input.competitorMentions
      ? [...input.competitorMentions.values()]
      : undefined,
    proofAssets: input.proofAssets ? [...input.proofAssets.values()] : undefined,
    icpInsights: input.icpInsights ? [...input.icpInsights.values()] : undefined,
    nextActions: input.nextActions ? [...input.nextActions.values()] : undefined,
    winLossInsights: input.winLossInsights
      ? [...input.winLossInsights.values()]
      : undefined,
  };
}

function mapFromArray<T extends { id: string }>(
  items: T[] | undefined,
): Map<string, T> | undefined {
  if (!items?.length) return undefined;
  return new Map(items.map((item) => [item.id, item]));
}

export function hydrateOrgMaps(snapshot: SalesOrgSnapshot): {
  accounts: Map<string, SalesAccount>;
  contacts: Map<string, SalesContact>;
  leads: Map<string, SalesLead>;
  opportunities: Map<string, SalesOpportunity>;
  interactions: Map<string, SalesInteractionLog>;
  evidence: Map<string, SalesEvidenceRef>;
  auditLog: SalesAuditEntry[];
  seeded: boolean;
  activities?: Map<string, SalesActivity>;
  meetings?: Map<string, SalesMeeting>;
  outreach?: Map<string, SalesOutreach>;
  signals?: Map<string, SalesSignal>;
  objections?: Map<string, SalesObjection>;
  competitorMentions?: Map<string, SalesCompetitorMention>;
  proofAssets?: Map<string, SalesProofAsset>;
  icpInsights?: Map<string, SalesICPInsight>;
  nextActions?: Map<string, SalesNextAction>;
  winLossInsights?: Map<string, SalesWinLossInsight>;
} {
  return {
    accounts: new Map(snapshot.accounts.map((a) => [a.id, a])),
    contacts: new Map(snapshot.contacts.map((c) => [c.id, c])),
    leads: new Map(snapshot.leads.map((l) => [l.id, l])),
    opportunities: new Map(snapshot.opportunities.map((o) => [o.id, o])),
    interactions: new Map(snapshot.interactions.map((i) => [i.id, i])),
    evidence: new Map(snapshot.evidence.map((e) => [e.id, e])),
    auditLog: snapshot.auditLog ?? [],
    seeded: snapshot.seeded,
    activities: mapFromArray(snapshot.activities),
    meetings: mapFromArray(snapshot.meetings),
    outreach: mapFromArray(snapshot.outreach),
    signals: mapFromArray(snapshot.signals),
    objections: mapFromArray(snapshot.objections),
    competitorMentions: mapFromArray(snapshot.competitorMentions),
    proofAssets: mapFromArray(snapshot.proofAssets),
    icpInsights: mapFromArray(snapshot.icpInsights),
    nextActions: mapFromArray(snapshot.nextActions),
    winLossInsights: mapFromArray(snapshot.winLossInsights),
  };
}
