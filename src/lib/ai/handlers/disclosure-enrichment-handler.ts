/**
 * Phase 9 — Deterministic handler for governed disclosure note enrichment.
 * Uses rule citations as evidence anchors; never auto-approves notes.
 */

import type { DeterministicTaskHandler, AIResponse } from "../types";
import type { RuleCitation } from "@/lib/audit/notes/disclosure-types";
import {
  buildDeterministicEnrichmentSection,
} from "@/lib/audit/intelligence/enrichment-builder";
import type { DisclosureEnrichmentInput } from "@/lib/audit/intelligence/types";

export const disclosureEnrichmentHandler: DeterministicTaskHandler = async (
  request,
): Promise<AIResponse> => {
  const taskInput = request.taskInput ?? {};
  const citations = (taskInput.citations as RuleCitation[]) ?? [];

  const input: DisclosureEnrichmentInput = {
    noteId: String(taskInput.noteId ?? ""),
    noteTitle: String(taskInput.noteTitle ?? "Disclosure Note"),
    noteType: String(taskInput.noteType ?? "other"),
    existingContent: String(taskInput.existingContent ?? ""),
    citations,
    engagementLabel: String(taskInput.engagementLabel ?? taskInput.contextSummary ?? ""),
  };

  const enrichedSection = buildDeterministicEnrichmentSection(input);

  return {
    output: JSON.stringify({ enrichedSection, noteId: input.noteId }),
    confidence: citations.length > 0 ? 0.78 : 0.55,
    providerId: "deterministic",
    modelVersion: "audit-intelligence-v1",
    warnings: [
      "Assistive enrichment only — human review required before approval",
    ],
    metadata: {
      reviewRequired: true,
      citationCount: citations.length,
    },
  };
};
