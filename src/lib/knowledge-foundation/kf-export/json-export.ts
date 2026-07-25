import "server-only";
import type {
  KnowledgeFoundationExportInput,
  KnowledgeFoundationExportResult,
} from "./types";

export async function buildKnowledgeFoundationJSON(
  input: KnowledgeFoundationExportInput,
): Promise<KnowledgeFoundationExportResult> {
  const payload = {
    exportedAt: new Date().toISOString(),
    system: "AQLIYA Knowledge Foundation",
    version: {
      id: input.versionId,
      versionNumber: input.versionNumber,
      status: input.status,
      notes: input.notes,
      candidateCount: input.candidateCount,
      artifactPath: input.artifactPath,
      createdByName: input.createdByName,
      approvedByName: input.approvedByName,
      activatedAt: input.activatedAt,
      createdAt: input.createdAt,
      rollbackVersionId: input.rollbackVersionId,
      releases: (input.releases ?? []).map((r) => ({
        id: r.id,
        releaseNotes: r.releaseNotes,
        createdAt: r.createdAt,
        createdByName: r.createdByName,
      })),
      diffsAsFrom: (input.diffsAsFrom ?? []).map((d) => ({
        toVersion: d.toVersion,
        riskScore: d.riskScore,
        breakingChange: d.breakingChange,
        summary: d.summary,
        generatedAt: d.generatedAt,
      })),
      candidateBindings: (input.candidateBindings ?? []).map((c) => ({
        phrase: c.phrase,
        canonicalCode: c.canonicalCode,
        category: c.category,
        confidence: c.confidence,
      })),
    },
  };

  const content = Buffer.from(JSON.stringify(payload, null, 2), "utf-8");
  return {
    format: "json",
    filename: `knowledge-foundation-v${input.versionNumber}.json`,
    mimeType: "application/json",
    content,
  };
}
