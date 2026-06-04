/**
 * A1-10 — engagement archival lifecycle rules (deterministic).
 */

export const ARCHIVABLE_ENGAGEMENT_STATUSES = [
  "published",
  "approved",
] as const;

export type ArchivalEligibility = {
  canArchive: boolean;
  canRestore: boolean;
  reasonAr: string;
};

export function evaluateEngagementArchival(
  status: string,
): ArchivalEligibility {
  if (status === "archived") {
    return {
      canArchive: false,
      canRestore: true,
      reasonAr: "التكليف مؤرشف — يمكن استعادته من سجل الأرشيف.",
    };
  }
  if (
    ARCHIVABLE_ENGAGEMENT_STATUSES.includes(
      status as (typeof ARCHIVABLE_ENGAGEMENT_STATUSES)[number],
    )
  ) {
    return {
      canArchive: true,
      canRestore: false,
      reasonAr: "جاهز للأرشفة بعد الاعتماد/النشر.",
    };
  }
  return {
    canArchive: false,
    canRestore: false,
    reasonAr:
      "الأرشفة متاحة بعد اعتماد التكليف أو نشره (حالة: معتمد أو منشور).",
  };
}

export type ArchivedEngagementRow = {
  engagementId: string;
  clientName: string;
  fiscalPeriod: string;
  previousStatus: string;
  archivedAt: string | null;
  archivedBy: string | null;
};
