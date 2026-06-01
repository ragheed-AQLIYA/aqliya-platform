/**
 * SalesOS vNext — v0.4 learning loop facade (candidate stub).
 * Documents closed-loop stages for pilot review; not L5_READY.
 */

import "server-only";

export const LEARNING_LOOP_V04_DISCLAIMER_EN =
  "SalesOS v0.4 learning loop candidate — read/analyze/recommend only. Tier B overlay persist; not sole source of truth. Human review required before operational decisions.";

export const LEARNING_LOOP_V04_DISCLAIMER_AR =
  "مرشح حلقة تعلّم v0.4 — قراءة/تحليل/توصية فقط. طبقة Tier B overlay؛ ليست مصدر الحقيقة الوحيد. المراجعة البشرية مطلوبة قبل القرارات التشغيلية.";

export const LEARNING_LOOP_V04_STATUS_TOKEN = "V04_LEARNING_LOOP_CANDIDATE" as const;

export type LearningLoopStageId =
  | "capture"
  | "synthesize"
  | "relate"
  | "recommend"
  | "cross_product";

export interface LearningLoopStageStatus {
  id: LearningLoopStageId;
  labelEn: string;
  labelAr: string;
  wired: boolean;
  noteEn: string;
  noteAr: string;
}

export interface LearningLoopV04CandidateView {
  organizationId: string;
  aggregatedAt: string;
  stages: LearningLoopStageStatus[];
  wiredStageCount: number;
  disclaimerEn: string;
  disclaimerAr: string;
  statusToken: typeof LEARNING_LOOP_V04_STATUS_TOKEN;
}

const STAGE_DEFINITIONS: Omit<LearningLoopStageStatus, "wired">[] = [
  {
    id: "capture",
    labelEn: "Capture",
    labelAr: "التقاط",
    noteEn: "OrgStore accounts, opportunities, proof, win/loss, signals",
    noteAr: "OrgStore — حسابات، فرص، إثبات، فوز/خسارة، إشارات",
  },
  {
    id: "synthesize",
    labelEn: "Synthesize",
    labelAr: "تركيب",
    noteEn: "institutional-learning-service + icp-learning on seed/Tier B2",
    noteAr: "institutional-learning-service + icp-learning على seed/Tier B2",
  },
  {
    id: "relate",
    labelEn: "Relate",
    labelAr: "ربط",
    noteEn: "v02 knowledge-graph queries + vNext snapshot (in-memory per request)",
    noteAr: "استعلامات v02 knowledge-graph + لقطة vNext (ذاكرة لكل طلب)",
  },
  {
    id: "recommend",
    labelEn: "Recommend",
    labelAr: "توصية",
    noteEn: "commercial-recommendations + ICP hypothesis — DRAFT advisory labels",
    noteAr: "commercial-recommendations + فرضية ICP — تسميات DRAFT استشارية",
  },
  {
    id: "cross_product",
    labelEn: "Cross-product bus",
    labelAr: "حافلة cross-product",
    noteEn: "cross-product-signals aggregator + platform collector",
    noteAr: "مجمّع cross-product-signals + جامع المنصة",
  },
];

/** Read-only v0.4 loop status for integrator docs and future UI shells. */
export function buildLearningLoopV04CandidateView(
  organizationId: string,
  aggregatedAt = new Date().toISOString(),
): LearningLoopV04CandidateView {
  const stages: LearningLoopStageStatus[] = STAGE_DEFINITIONS.map((stage) => ({
    ...stage,
    wired: true,
  }));

  return {
    organizationId,
    aggregatedAt,
    stages,
    wiredStageCount: stages.filter((row) => row.wired).length,
    disclaimerEn: LEARNING_LOOP_V04_DISCLAIMER_EN,
    disclaimerAr: LEARNING_LOOP_V04_DISCLAIMER_AR,
    statusToken: LEARNING_LOOP_V04_STATUS_TOKEN,
  };
}
