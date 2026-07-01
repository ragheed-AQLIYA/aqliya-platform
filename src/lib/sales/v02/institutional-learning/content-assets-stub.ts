// v0.2 stub — content asset refs until cross-product ingest ships

import type { ContentAssetRef } from "./types";

/** Placeholder refs for institutional learning; replace with platform/CMS adapter later. */
export function stubContentAssetRefs(
  organizationId: string,
): ContentAssetRef[] {
  return [
    {
      id: `content-stub-${organizationId}-playbook`,
      title: "Commercial playbook (stub)",
      category: "playbook",
    },
    {
      id: `content-stub-${organizationId}-case-index`,
      title: "Case study index (stub)",
      category: "case_study",
    },
  ];
}
