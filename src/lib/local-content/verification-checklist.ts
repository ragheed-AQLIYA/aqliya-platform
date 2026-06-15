/**
 * LC verification audit matrix — loaded from knowledge JSON (import script).
 * Human review only; checklist state stored in project.metadata.verificationChecklist.
 */

import * as fs from "node:fs";
import * as path from "node:path";

export interface VerificationMatrixItem {
  id: string;
  section: string;
  criteria: string;
  action: string;
  document: string;
  scale: string;
  workingPaperRef: string;
}

export interface VerificationMatrixPayload {
  version: string;
  source: string;
  importedAt: string;
  itemCount: number;
  items: VerificationMatrixItem[];
}

export interface VerificationChecklistEntry {
  scale: string;
  workingPaperRef?: string;
  updatedAt?: string;
  updatedBy?: string;
}

export interface VerificationChecklistItem extends VerificationMatrixItem {
  status: string;
  workingPaperRefResolved: string;
}

export interface VerificationChecklistReport {
  version: string;
  source: string;
  itemCount: number;
  completedCount: number;
  pendingCount: number;
  bySection: Record<
    string,
    { labelAr: string; total: number; completed: number }
  >;
  items: VerificationChecklistItem[];
}

export const SECTION_LABELS_AR: Record<string, string> = {
  workforce: "القوى العاملة",
  supply_chain: "سلسلة التوريد",
  capex_capacity: "الاستثمار والطاقة والأصول",
  closeout: "إغلاق التحقق",
};

const MATRIX_PATH = path.join(
  process.cwd(),
  "knowledge",
  "local-content",
  "verification-audit-matrix-v1.json",
);

let cachedMatrix: VerificationMatrixPayload | null = null;

export function loadVerificationMatrix(): VerificationMatrixPayload {
  if (cachedMatrix) return cachedMatrix;
  if (!fs.existsSync(MATRIX_PATH)) {
    throw new Error(
      `Verification matrix not found at ${MATRIX_PATH}. Run: npm run lc:matrix:import`,
    );
  }
  const raw = fs.readFileSync(MATRIX_PATH, "utf8");
  cachedMatrix = JSON.parse(raw) as VerificationMatrixPayload;
  return cachedMatrix;
}

export function parseVerificationChecklistFromMetadata(
  metadata: unknown,
): Record<string, VerificationChecklistEntry> {
  if (!metadata || typeof metadata !== "object") return {};
  const checklist = (metadata as { verificationChecklist?: unknown })
    .verificationChecklist;
  if (!checklist || typeof checklist !== "object") return {};
  return checklist as Record<string, VerificationChecklistEntry>;
}

function isCompletedScale(scale: string): boolean {
  const s = scale.trim().toLowerCase();
  return s === "verified" || s === "complete" || s === "done" || s === "مكتمل";
}

export function buildVerificationChecklistReport(
  metadata?: unknown,
): VerificationChecklistReport {
  const matrix = loadVerificationMatrix();
  const saved = parseVerificationChecklistFromMetadata(metadata);

  const items: VerificationChecklistItem[] = matrix.items.map((item) => {
    const entry = saved[item.id];
    const status = entry?.scale?.trim() || item.scale || "Pending";
    return {
      ...item,
      status,
      workingPaperRefResolved:
        entry?.workingPaperRef?.trim() || item.workingPaperRef || "",
    };
  });

  const bySection: VerificationChecklistReport["bySection"] = {};
  let completedCount = 0;

  for (const item of items) {
    if (!bySection[item.section]) {
      bySection[item.section] = {
        labelAr: SECTION_LABELS_AR[item.section] ?? item.section,
        total: 0,
        completed: 0,
      };
    }
    bySection[item.section].total++;
    if (isCompletedScale(item.status)) {
      bySection[item.section].completed++;
      completedCount++;
    }
  }

  return {
    version: matrix.version,
    source: matrix.source,
    itemCount: items.length,
    completedCount,
    pendingCount: items.length - completedCount,
    bySection,
    items,
  };
}

export function mergeVerificationChecklistUpdate(
  metadata: unknown,
  itemId: string,
  update: VerificationChecklistEntry,
): Record<string, unknown> {
  const base =
    metadata && typeof metadata === "object"
      ? { ...(metadata as Record<string, unknown>) }
      : {};
  const existing = parseVerificationChecklistFromMetadata(base);
  return {
    ...base,
    verificationChecklist: {
      ...existing,
      [itemId]: update,
    },
  };
}
