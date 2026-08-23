"use server";

import type { IfrsRagCitation } from "@/lib/audit/rules/types";

export interface FindingCitationsInput {
  title: string;
  description: string;
}

export async function getFindingIfrsCitations(
  input: FindingCitationsInput,
): Promise<IfrsRagCitation[]> {
  try {
    const query = `${input.title} ${input.description}`
      .replace(/\s+/g, " ")
      .trim()
      .slice(0, 400);

    if (!query) return [];

    const { searchIfrsKnowledge, formatIfrsCitations } = await import(
      "@/lib/core/knowledge/rag/ifrs-search"
    );

    const results = await searchIfrsKnowledge(query, {
      limit: 3,
      organizationId: "platform",
      // Per-finding lookups are machine-triggered enrichment — wide budget.
      purpose: "enrich",
    });

    return formatIfrsCitations(results);
  } catch {
    return [];
  }
}
