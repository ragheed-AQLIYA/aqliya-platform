import "server-only";

import { getDisclosureNotes, updateDisclosureNote, createAIOutput } from "@/lib/audit/db/index";
import { extractRuleCitations } from "@/lib/audit/notes/disclosure-types";
import { runInference } from "@/lib/ai/runtime";
import { resolveAuditAIContext } from "@/lib/audit/audit-ai-bridge";
import {
  buildDeterministicEnrichmentSection,
  parseEnrichmentFromHandlerOutput,
} from "./enrichment-builder";
import {
  hasIntelligenceEnrichment,
  type AuditIntelligenceRunResult,
  type DisclosureEnrichmentInput,
} from "./types";
import { writePlatformAuditLog } from "@/lib/platform/audit-log";
import { appendToAuditChain } from "@/lib/platform/audit/audit-store";

export async function enrichDisclosureNote(
  engagementId: string,
  noteId: string,
  organizationId?: string,
): Promise<AuditIntelligenceRunResult["enrichments"][0] | null> {
  const notes = await getDisclosureNotes(engagementId);
  const note = notes.find((n) => n.id === noteId);
  if (!note) return null;

  const citations = extractRuleCitations(note.missingInformation);
  if (citations.length === 0) return null;
  if (hasIntelligenceEnrichment(note.content)) return null;
  if (note.status === "approved" || note.status === "reviewed") return null;

  const ctx = await resolveAuditAIContext(engagementId);
  const input: DisclosureEnrichmentInput = {
    noteId: note.id,
    noteTitle: note.title,
    noteType: note.noteType,
    existingContent: note.content,
    citations,
    engagementLabel: ctx.engagementLabel,
  };

  let enrichedSection: string;
  let providerId = "deterministic";
  let modelVersion = "audit-intelligence-v1";
  let confidence = 0.75;
  let warnings: string[] = [];

  try {
    const inference = await runInference({
      taskType: "disclosure_enrichment",
      taskInput: {
        ...input,
        engagementId,
        query: `Enrich disclosure note "${note.title}" with governed assistive draft`,
      },
      engagementId,
      organizationId: organizationId ?? ctx.platformOrganizationId,
    });

    providerId = inference.providerId;
    modelVersion = inference.response.modelVersion ?? modelVersion;
    confidence = inference.response.confidence ?? confidence;
    warnings = inference.warnings;
    enrichedSection = parseEnrichmentFromHandlerOutput(
      inference.response.output,
      input,
      modelVersion,
    );
  } catch {
    enrichedSection = buildDeterministicEnrichmentSection(input);
    warnings = ["Inference unavailable — deterministic enrichment applied"];
  }

  await updateDisclosureNote(note.id, {
    content: `${note.content.trim()}\n\n${enrichedSection}`,
    status: "needs_info",
    aiDrafted: true,
  });

  await createAIOutput({
    engagementId,
    suggestionType: "note_enrichment",
    inputContext: `Enrichment for note ${note.noteNumber}: ${note.title}. Citations: ${citations.map((c) => c.ruleId).join(", ")}`,
    outputContent: JSON.stringify({
      noteId: note.id,
      enrichedSection,
      citations,
      providerId,
    }),
    confidence,
    modelVersion,
    sourceEntityType: "disclosure_note",
    sourceEntityId: note.id,
    metadata: { intelligenceLayer: "audit_v1", reviewRequired: true },
  });

  return {
    noteId: note.id,
    noteTitle: note.title,
    enrichedSection,
    providerId,
    modelVersion,
    confidence,
    warnings,
  };
}

export async function runAuditIntelligenceForEngagement(
  engagementId: string,
  organizationId?: string,
): Promise<AuditIntelligenceRunResult> {
  const notes = await getDisclosureNotes(engagementId);
  const candidates = notes.filter(
    (n) =>
      extractRuleCitations(n.missingInformation).length > 0 &&
      (n.status === "draft" || n.status === "needs_info") &&
      !hasIntelligenceEnrichment(n.content),
  );

  const enrichments: AuditIntelligenceRunResult["enrichments"] = [];
  let notesSkipped = notes.length - candidates.length;

  for (const note of candidates) {
    const result = await enrichDisclosureNote(
      engagementId,
      note.id,
      organizationId,
    );
    if (result) {
      enrichments.push(result);
    } else {
      notesSkipped += 1;
    }
  }

  return {
    engagementId,
    notesScanned: notes.length,
    notesEnriched: enrichments.length,
    notesSkipped,
    enrichments,
    checkedAt: new Date().toISOString(),
  };
}

export async function runAuditIntelligenceWithAuditLog(
  engagementId: string,
  organizationId?: string,
): Promise<AuditIntelligenceRunResult> {
  const result = await runAuditIntelligenceForEngagement(
    engagementId,
    organizationId,
  );

  const platformResult = await writePlatformAuditLog({
    productKey: "auditos",
    action: "audit_intelligence.enriched",
    targetType: "disclosure_notes",
    targetId: engagementId,
    severity: "info",
    status: "recorded",
    sourceSystem: "audit_intelligence_layer",
    sourceModel: "intelligence_v1",
    metadata: {
      organizationId,
      notesScanned: result.notesScanned,
      notesEnriched: result.notesEnriched,
      notesSkipped: result.notesSkipped,
    } as Record<string, unknown>,
  });
  if (platformResult?.ok && platformResult?.id) {
    await appendToAuditChain(
      platformResult.id,
      "audit_intelligence.enriched",
      "system",
      new Date(),
    );
  }

  return result;
}
