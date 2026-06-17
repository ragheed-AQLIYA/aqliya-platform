// ─── LocalContentContextBuilder — V3.5 Knowledge Retrieval Layer ───
// Constructs a grounded context package from all available knowledge sources
// before every AI execution. This is Phase 1 of V3.5.
// Every AI call must receive this context to produce grounded results.

import { prisma } from "@/lib/prisma";

// ─── Types ───

export interface IndustryInsight {
  industry: string;
  workbookLineCode: string;
  pattern: string;
  effectivenessPct: number;
  totalMatches: number;
  correctMatches: number;
  falsePositives: number;
}

export interface OrganizationInsight {
  workbookLineCode: string;
  accountCode: string;
  accountName: string;
  previousResult: string;
  currentPattern: string | null;
  manualOverride: boolean;
}

export interface PatternHistoryEntry {
  workbookLineCode: string;
  currentPattern: string;
  suggestedPattern: string;
  status: string; // approved, rejected
  confidence: number;
  acceptanceScore: number | null;
  successScore: number | null;
  falsePositiveRate: number | null;
}

export interface FalsePositiveEntry {
  workbookLineCode: string;
  accountCode: string;
  accountName: string;
  patternUsed: string | null;
  riskLevel: string;
  riskReason: string | null;
}

export interface WorkbookHistoryEntry {
  workbookId: string;
  title: string;
  reportingPeriod: string;
  status: string;
  completionPct: number;
  lcScore: number | null;
  totalLines: number;
  missingLines: number;
}

export interface BenchmarkInsight {
  industry: string;
  benchmarkType: string;
  metricName: string;
  metricValue: number | null;
  sampleSize: number | null;
  source: string | null;
}

export interface KnowledgeReference {
  id: string;
  type: string; // intelligence_graph_node, document_chunk, etc.
  name: string;
  relevance: string;
}

export interface LocalContentContext {
  organizationId: string;
  industryInsights: IndustryInsight[];
  organizationInsights: OrganizationInsight[];
  patternHistory: PatternHistoryEntry[];
  falsePositiveHistory: FalsePositiveEntry[];
  workbookHistory: WorkbookHistoryEntry[];
  benchmarkInsights: BenchmarkInsight[];
  knowledgeReferences: KnowledgeReference[];
  totalSources: number;
  builtAt: string;
}

// ─── Context Builder ───

/**
 * Build a grounded context package for AI execution.
 * Queries all available memory/knowledge sources to enrich AI prompts.
 * P0: Always returns a context — empty arrays if no data found.
 */
export async function buildLocalContentContext(
  organizationId: string,
  industry?: string,
  workbookId?: string,
): Promise<LocalContentContext> {
  const startedAt = Date.now();

  const [
    industryInsights,
    organizationInsights,
    patternHistory,
    falsePositiveHistory,
    workbookHistory,
    benchmarkInsights,
    knowledgeReferences,
  ] = await Promise.all([
    fetchIndustryInsights(organizationId, industry),
    fetchOrganizationInsights(organizationId),
    fetchPatternHistory(organizationId),
    fetchFalsePositiveHistory(organizationId),
    fetchWorkbookHistory(organizationId, workbookId),
    fetchBenchmarkInsights(organizationId, industry),
    fetchKnowledgeReferences(organizationId),
  ]);

  const context: LocalContentContext = {
    organizationId,
    industryInsights,
    organizationInsights,
    patternHistory,
    falsePositiveHistory,
    workbookHistory,
    benchmarkInsights,
    knowledgeReferences,
    totalSources:
      industryInsights.length +
      organizationInsights.length +
      patternHistory.length +
      falsePositiveHistory.length +
      workbookHistory.length +
      benchmarkInsights.length +
      knowledgeReferences.length,
    builtAt: new Date().toISOString(),
  };

  return context;
}

// ─── Source Getters ───

async function fetchIndustryInsights(
  organizationId: string,
  industry?: string,
): Promise<IndustryInsight[]> {
  // LcIndustryPatternMemory is cross-organization (indexed by industry, not org)
  const industryWhere: Record<string, unknown> = {};
  if (industry) {
    industryWhere.industry = industry;
  }

  const records = await prisma.lcIndustryPatternMemory.findMany({
    where: industryWhere as any,
    orderBy: { effectivenessPct: "desc" },
    take: 50,
  });

  // Extend to also query IndustryBenchmark for cross-client data
  const benchmarks = await prisma.industryBenchmark.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });

  // Merge benchmark data as additional insights
  const benchmarkInsights: IndustryInsight[] = benchmarks
    .filter((b) => b.industry && b.metricValue !== null)
    .map((b) => ({
      industry: b.industry ?? "unknown",
      workbookLineCode: b.metricName,
      pattern: `${b.benchmarkType}:${b.metricName}`,
      effectivenessPct: b.metricValue ?? 0,
      totalMatches: b.sampleSize ?? 0,
      correctMatches: Math.round((b.sampleSize ?? 0) * ((b.metricValue ?? 0) / 100)),
      falsePositives: 0,
    }));

  return [
    ...records.map((r) => ({
      industry: r.industry,
      workbookLineCode: r.workbookLineCode,
      pattern: r.pattern,
      effectivenessPct: r.effectivenessPct,
      totalMatches: r.totalMatches,
      correctMatches: r.correctMatches,
      falsePositives: r.falsePositives,
    })),
    ...benchmarkInsights,
  ];
}

async function fetchOrganizationInsights(
  organizationId: string,
): Promise<OrganizationInsight[]> {
  const records = await prisma.lcOrganizationMatchMemory.findMany({
    where: { organizationId },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return records.map((r) => ({
    workbookLineCode: r.workbookLineCode,
    accountCode: r.accountCode,
    accountName: r.accountName,
    previousResult: r.previousResult,
    currentPattern: r.currentPattern,
    manualOverride: r.manualOverride,
  }));
}

async function fetchPatternHistory(
  organizationId: string,
): Promise<PatternHistoryEntry[]> {
  const [accepted, rejected] = await Promise.all([
    prisma.lcPatternSuggestion.findMany({
      where: { organizationId, status: "approved" },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
    prisma.lcPatternSuggestion.findMany({
      where: { organizationId, status: "rejected" },
      orderBy: { createdAt: "desc" },
      take: 50,
    }),
  ]);

  const all = [...accepted, ...rejected];
  return all.map((s) => ({
    workbookLineCode: s.workbookLineCode,
    currentPattern: s.currentPattern,
    suggestedPattern: s.suggestedPattern,
    status: s.status,
    confidence: s.confidence,
    acceptanceScore: s.acceptanceScore,
    successScore: s.successScore,
    falsePositiveRate: s.falsePositiveRate,
  }));
}

async function fetchFalsePositiveHistory(
  organizationId: string,
): Promise<FalsePositiveEntry[]> {
  const records = await prisma.lcMatchReview.findMany({
    where: { organizationId, isFalsePositive: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return records.map((r) => ({
    workbookLineCode: r.workbookLineCode,
    accountCode: r.accountCode,
    accountName: r.accountName,
    patternUsed: r.patternUsed,
    riskLevel: r.riskLevel,
    riskReason: r.riskReason,
  }));
}

async function fetchWorkbookHistory(
  organizationId: string,
  workbookId?: string,
): Promise<WorkbookHistoryEntry[]> {
  const where: Record<string, unknown> = {
    project: { organizationId },
  };
  if (workbookId) {
    where.id = { not: workbookId };
  }

  const records = await prisma.lcWorkbook.findMany({
    where: where as any,
    orderBy: { createdAt: "desc" },
    take: 20,
    include: {
      project: { select: { organizationId: true } },
    },
  });

  return records.map((w) => ({
    workbookId: w.id,
    title: w.title,
    reportingPeriod: w.reportingPeriod,
    status: w.status,
    completionPct: w.completionPct,
    lcScore: w.lcScore,
    totalLines: w.totalLines,
    missingLines: w.missingLines,
  }));
}

async function fetchBenchmarkInsights(
  organizationId: string,
  industry?: string,
): Promise<BenchmarkInsight[]> {
  const where: Record<string, unknown> = { organizationId };
  if (industry) {
    where.industry = industry;
  }

  const records = await prisma.industryBenchmark.findMany({
    where: where as any,
    orderBy: { createdAt: "desc" },
    take: 30,
  });

  return records.map((b) => ({
    industry: b.industry,
    benchmarkType: b.benchmarkType,
    metricName: b.metricName,
    metricValue: b.metricValue,
    sampleSize: b.sampleSize,
    source: b.source,
  }));
}

async function fetchKnowledgeReferences(
  organizationId: string,
): Promise<KnowledgeReference[]> {
  const [graphNodes, chunks] = await Promise.all([
    prisma.intelligenceGraphNode.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
    prisma.documentChunk.findMany({
      where: { organizationId },
      orderBy: { createdAt: "desc" },
      take: 30,
    }),
  ]);

  const refs: KnowledgeReference[] = [
    ...graphNodes.map((n) => ({
      id: n.id,
      type: "intelligence_graph_node" as const,
      name: n.name,
      relevance: n.type,
    })),
    ...chunks.map((c) => ({
      id: c.id,
      type: "document_chunk" as const,
      name: `Chunk ${c.chunkIndex} — ${c.content.slice(0, 80)}...`,
      relevance: (c.metadata as { source?: string })?.source ?? "embedding",
    })),
  ];

  return refs.slice(0, 50);
}

// ─── Context Formatting for Prompts ───

/**
 * Format context as a plain-text block for prompt injection.
 * Respects AI token limits.
 */
export function formatLocalContentContext(
  context: LocalContentContext,
  maxSources = 10,
): string {
  const parts: string[] = [];

  if (context.industryInsights.length > 0) {
    const top = context.industryInsights.slice(0, maxSources);
    parts.push("=== Industry Memory ===");
    top.forEach((i) => {
      parts.push(
        `- ${i.industry}/${i.workbookLineCode}: ${i.pattern} (${i.effectivenessPct.toFixed(1)}% effective, ${i.totalMatches} matches)`,
      );
    });
  }

  if (context.organizationInsights.length > 0) {
    const top = context.organizationInsights.slice(0, maxSources);
    parts.push("=== Organization Memory ===");
    top.forEach((o) => {
      parts.push(
        `- ${o.workbookLineCode}/${o.accountCode} ${o.accountName}: ${o.previousResult}${o.manualOverride ? " (manual override)" : ""}`,
      );
    });
  }

  if (context.patternHistory.length > 0) {
    const top = context.patternHistory.slice(0, maxSources);
    parts.push("=== Pattern History ===");
    top.forEach((p) => {
      parts.push(
        `- ${p.workbookLineCode}: suggested "${p.suggestedPattern}" → ${p.status} (confidence: ${p.confidence})`,
      );
    });
  }

  if (context.falsePositiveHistory.length > 0) {
    const top = context.falsePositiveHistory.slice(0, maxSources);
    parts.push("=== False Positive History ===");
    top.forEach((f) => {
      parts.push(
        `- ${f.workbookLineCode}/${f.accountCode}: ${f.riskLevel} risk — ${f.riskReason ?? "no reason"}`,
      );
    });
  }

  if (context.workbookHistory.length > 0) {
    const top = context.workbookHistory.slice(0, maxSources);
    parts.push("=== Historical Workbook Scores ===");
    top.forEach((w) => {
      parts.push(
        `- ${w.title} (${w.reportingPeriod}): score=${w.lcScore ?? "N/A"}, completion=${w.completionPct.toFixed(1)}%, missing=${w.missingLines}/${w.totalLines}`,
      );
    });
  }

  if (context.benchmarkInsights.length > 0) {
    const top = context.benchmarkInsights.slice(0, maxSources);
    parts.push("=== Industry Benchmarks ===");
    top.forEach((b) => {
      parts.push(
        `- ${b.industry}/${b.metricName}: ${b.metricValue ?? "N/A"} ${b.source ? `(source: ${b.source})` : ""}`,
      );
    });
  }

  if (context.knowledgeReferences.length > 0) {
    const top = context.knowledgeReferences.slice(0, maxSources);
    parts.push("=== Knowledge References ===");
    top.forEach((k) => {
      parts.push(`- [${k.type}] ${k.name}`);
    });
  }

  if (parts.length === 0) {
    return "No contextual data available for this organization.";
  }

  parts.push("");
  parts.push(`--- Context built from ${context.totalSources} sources ---`);

  return parts.join("\n");
}

/**
 * Format context as a summary JSON object for prompt injection.
 */
export function formatLocalContentContextSummary(context: LocalContentContext): string {
  return JSON.stringify({
    totalSources: context.totalSources,
    industryInsights: context.industryInsights.length,
    organizationInsights: context.organizationInsights.length,
    patternHistory: context.patternHistory.length,
    falsePositiveHistory: context.falsePositiveHistory.length,
    workbookHistory: context.workbookHistory.length,
    benchmarkInsights: context.benchmarkInsights.length,
    knowledgeReferences: context.knowledgeReferences.length,
    builtAt: context.builtAt,
  });
}
