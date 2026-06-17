// ─── LocalContentOS — Recommendation Engine ───
// Phase 2: Generates ranked recommendations for improving local content score.
// V3.5: Enhanced with evidence grounding via LocalContentContextBuilder.
// Every recommendation now includes source, evidence, rationale, and confidence.
// Uses workbook score, lines, supplier spend, missing data, pattern reviews,
// industry/organization memory, and local content context.
// Categories: Supplier Optimization, Workforce Localization, Asset Localization,
// Missing Data Resolution, Evidence Improvement.
// P0: Never auto-applied — always requires human review.

import "server-only";

import { prisma } from "@/lib/prisma";
import { runGovernedProductAI } from "@/lib/platform/product-ai-bridge";
import { createAiAuditEvent, AuditActions } from "@/lib/local-content/audit-events";
import { computeLcScore, getLineValue } from "./scoring";
import { isAccountInCodeRange } from "./population";
import { WORKBOOK_TEMPLATE, getTemplateLineByCode } from "./template";
import { buildLocalContentContext } from "./context-builder";
import type { LcWorkbookLine } from "@prisma/client";
import type { LocalContentContext } from "./context-builder";

// ─── Types ───

export interface Recommendation {
  category: RecommendationCategory;
  title: string;
  description: string;
  impactScore: number;       // 0-100
  priority: RecommendationPriority;
  estimatedValue: number | null; // Estimated LC score improvement
  effort: "low" | "medium" | "high";
  evidenceRefs: EvidenceRef[];
  /** Workbook line code this relates to, if any */
  relatedLineCode?: string;
  /** Specific action to take */
  suggestedAction: string;
  // V3.5 Grounding fields
  source?: string;            // industry_memory, organization_history, baseline_study, workbook_analysis, pattern_history, knowledge
  rationale?: string;         // Why this recommendation exists — grounded explanation
  groundingConfidence?: number; // 0-1: confidence in the evidence backing
}

export type RecommendationCategory =
  | "supplier_optimization"
  | "workforce_localization"
  | "asset_localization"
  | "missing_data_resolution"
  | "evidence_improvement";

export type RecommendationPriority = "critical" | "high" | "medium" | "low";

export interface EvidenceRef {
  type: "line" | "supplier" | "spend" | "metric" | "pattern" | "memory";
  id: string;
  label: string;
}

export interface RecommendationResult {
  workbookId: string;
  organizationId: string;
  currentScore: number | null;
  recommendations: Recommendation[];
  generatedAt: string;
}

const CATEGORY_WEIGHTS: Record<RecommendationCategory, number> = {
  supplier_optimization: 0.35,
  workforce_localization: 0.20,
  asset_localization: 0.10,
  missing_data_resolution: 0.25,
  evidence_improvement: 0.10,
};

const CATEGORY_LABELS_AR: Record<RecommendationCategory, string> = {
  supplier_optimization: "تحسين المشتريات",
  workforce_localization: "توطين الموارد البشرية",
  asset_localization: "توطين الأصول",
  missing_data_resolution: "تعبئة البيانات الناقصة",
  evidence_improvement: "تحسين الإثباتات",
};

// ─── Public API ───

/**
 * Generate ranked recommendations for improving the local content score.
 * Uses all available workbook data + AI analysis + grounded context.
 * V3.5: Every recommendation now includes source, evidence, rationale, and confidence.
 * P0: Results are suggestions — human review required before any action.
 */
export async function generateRecommendations(
  organizationId: string,
  workbookId: string,
): Promise<RecommendationResult> {
  const startedAt = Date.now();

  // Gather all data sources
  const workbook = await prisma.lcWorkbook.findUnique({
    where: { id: workbookId },
    include: { lines: { orderBy: { displayOrder: "asc" } } },
  });

  if (!workbook) {
    throw new Error("Workbook not found");
  }

  const lines = workbook.lines;

  // Get current score
  const scoreResult = computeLcScore(lines);
  const currentScore = scoreResult.overallScore;

  // V3.5: Build grounded context from all knowledge sources
  const context = await buildLocalContentContext(organizationId, undefined, workbookId);

  // Get project for supplier data
  const rawProject = await prisma.localContentProject.findUnique({
    where: { id: workbook.projectId },
    include: { suppliers: true, spendRecords: true, evidence: true },
  });

  // Map Prisma supplier shape to ProjectWithData expected shape
  const project: ProjectWithData | null = rawProject
    ? {
        suppliers: rawProject.suppliers.map((s) => ({
          id: s.id,
          name: s.name,
          isLocal: s.localityClassification === "local",
          localPct: s.localContentPercentage,
        })),
        spendRecords: rawProject.spendRecords.map((r) => ({
          id: r.id,
          supplierId: r.supplierId,
          amount: r.amount,
          category: r.category,
          isLocal: rawProject.suppliers.find((s) => s.id === r.supplierId)?.localityClassification === "local",
        })),
        evidence: rawProject.evidence.map((e) => ({
          id: e.id,
          fileName: e.filename,
        })),
      }
    : null;

  // Get pending pattern suggestions and false positives
  const pendingSuggestions = await prisma.lcPatternSuggestion.count({
    where: { organizationId, status: "pending" },
  });
  const pendingFPs = await prisma.lcMatchReview.count({
    where: { organizationId, isFalsePositive: true, status: "pending" },
  });

  // Build recommendations deterministically
  const recommendations: Recommendation[] = [];

  // --- Category 1: Supplier Optimization ---
  recommendations.push(
    ...(await buildSupplierRecommendations(lines, project, currentScore, context)),
  );

  // --- Category 2: Workforce Localization ---
  recommendations.push(
    ...(await buildWorkforceRecommendations(lines, currentScore, context)),
  );

  // --- Category 3: Asset Localization ---
  recommendations.push(
    ...(await buildAssetRecommendations(lines, currentScore, context)),
  );

  // --- Category 4: Missing Data Resolution ---
  recommendations.push(
    ...buildMissingDataRecommendations(lines, currentScore, pendingSuggestions, pendingFPs, context),
  );

  // --- Category 5: Evidence Improvement ---
  recommendations.push(
    ...(await buildEvidenceRecommendations(lines, project, context)),
  );

  // Rank by impactScore descending
  recommendations.sort((a, b) => b.impactScore - a.impactScore);

  const durationMs = Date.now() - startedAt;

  // Persist top recommendations with grounding
  for (const rec of recommendations.slice(0, 20)) {
    await prisma.lcRecommendation.create({
      data: {
        organizationId,
        workbookId,
        category: rec.category,
        title: rec.title,
        description: rec.description,
        impactScore: rec.impactScore,
        priority: rec.priority,
        estimatedValue: rec.estimatedValue,
        effort: rec.effort,
        evidenceRefs: JSON.parse(JSON.stringify(rec.evidenceRefs)),
        status: "pending",
        // V3.5 Grounding fields
        source: rec.source ?? "workbook_analysis",
        rationale: rec.rationale,
        groundingConfidence: rec.groundingConfidence,
      },
    }).catch(() => {});
  }

  // Audit event
  await createAiAuditEvent({
    organizationId,
    workbookId,
    action: AuditActions.AI_RECOMMENDATION_GENERATED,
    providerId: "deterministic",
    status: "success",
    inputSummary: {
      workbookId,
      lineCount: lines.length,
      contextSources: context.totalSources,
    },
    outputSummary: { recommendationCount: recommendations.length },
    durationMs,
  }).catch(() => {});

  return {
    workbookId,
    organizationId,
    currentScore,
    recommendations: recommendations.slice(0, 20),
    generatedAt: new Date().toISOString(),
  };
}

// ─── Category Builders ───

interface ProjectWithData {
  suppliers: Array<{ id: string; name: string; isLocal: boolean; localPct?: number | null }>;
  spendRecords: Array<{ id: string; supplierId: string | null; amount: number; category: string; isLocal?: boolean | null }>;
  evidence: Array<{ id: string; fileName: string }>;
}

async function buildSupplierRecommendations(
  lines: LcWorkbookLine[],
  project: ProjectWithData | null,
  currentScore: number | null,
  context: LocalContentContext,
): Promise<Recommendation[]> {
  const recs: Recommendation[] = [];

  // Determine grounding from context
  const hasIndustryMemory = context.industryInsights.some((i) =>
    i.workbookLineCode.startsWith("SPN"),
  );
  const hasOrgMemory = context.organizationInsights.some((o) =>
    o.workbookLineCode.startsWith("SPN"),
  );
  const hasBenchmarks = context.benchmarkInsights.some((b) =>
    b.metricName.startsWith("SPN"),
  );

  const source = hasIndustryMemory
    ? "industry_memory"
    : hasOrgMemory
      ? "organization_history"
      : hasBenchmarks
        ? "baseline_study"
        : "workbook_analysis";

  // Find supplier spend lines
  const localSpendLine = lines.find((l) => l.code === "SPN-01");
  const totalSpendLine = lines.find((l) => l.code === "SPN-03");

  const localSpend = localSpendLine ? getLineValue(localSpendLine) : null;
  const totalSpend = totalSpendLine ? getLineValue(totalSpendLine) : null;

  if (totalSpend && totalSpend > 0) {
    const localPct = localSpend !== null ? (localSpend / totalSpend) * 100 : 0;

    // Low local supplier spend
    if (localPct < 50) {
      const gap = Math.round(50 - localPct);
      const estimatedValue = currentScore !== null
        ? Math.round((gap / 100) * 0.35 * 100) / 100
        : null;

      // Build rationale from context
      const rationaleParts: string[] = [
        `نسبة المشتريات المحلية ${Math.round(localPct)}% أقل من الحد الأدنى 50%.`,
      ];
      if (hasBenchmarks) {
        rationaleParts.push("المعيار القطاعي يؤكد أهمية رفع المشتريات المحلية.");
      }
      if (hasIndustryMemory) {
        const top = context.industryInsights
          .filter((i) => i.workbookLineCode.startsWith("SPN"))
          .slice(0, 1);
        if (top.length > 0) {
          rationaleParts.push(`الذاكرة القطاعية: ${top[0].effectivenessPct.toFixed(0)}% فعالية.`);
        }
      }

      recs.push({
        category: "supplier_optimization",
        title: "زيادة المشتريات من الموردين المحليين",
        description: `نسبة المشتريات المحلية الحالية ${Math.round(localPct)}%. استهداف رفعها إلى 50% على الأقل يمكن أن يحسن درجة المحتوى المحلي.`,
        impactScore: Math.min(100, gap * 2),
        priority: gap > 40 ? "critical" : gap > 25 ? "high" : "medium",
        estimatedValue,
        effort: "medium",
        evidenceRefs: [
          { type: "line", id: "SPN-01", label: "المشتريات المحلية" },
          { type: "line", id: "SPN-03", label: "إجمالي المشتريات" },
        ],
        relatedLineCode: "SPN-01",
        suggestedAction: "تحديد موردين محليين جدد وزيادة حجم المشتريات من الموردين السعوديين",
        source,
        rationale: rationaleParts.join(" "),
        groundingConfidence: hasIndustryMemory || hasBenchmarks ? 0.85 : hasOrgMemory ? 0.75 : 0.65,
      });
    }

    // Check if there are known local suppliers not utilized
    if (project?.suppliers) {
      const localSuppliers = project.suppliers.filter((s) => s.isLocal);
      const nonLocalSpend = project.spendRecords.filter((s) => !s.isLocal);
      if (localSuppliers.length > 0 && nonLocalSpend.length > 0) {
        recs.push({
          category: "supplier_optimization",
          title: "تفعيل الموردين المحليين المسجلين",
          description: `لديك ${localSuppliers.length} مورد(ين) محلي(ين) مسجل(ين). يفضل توجيه المشتريات لهم لرفع نسبة المحتوى المحلي.`,
          impactScore: 40,
          priority: "medium",
          estimatedValue: currentScore !== null ? Math.round((5 / 100) * 0.35 * 100) / 100 : null,
          effort: "low",
          evidenceRefs: localSuppliers.slice(0, 5).map((s) => ({
            type: "supplier" as const,
            id: s.id,
            label: s.name,
          })),
          suggestedAction: "مراجعة عقود الموردين الحالية وإعادة توجيه المشتريات للموردين المحليين",
          source: "organization_history",
          rationale: `توجد ${localSuppliers.length} موردين محليين مسجلين ولكن المشتريات الحالية لا تستفيد منهم.`,
          groundingConfidence: 0.9,
        });
      }
    }
  }

  return recs;
}

async function buildWorkforceRecommendations(
  lines: LcWorkbookLine[],
  currentScore: number | null,
  context: LocalContentContext,
): Promise<Recommendation[]> {
  const recs: Recommendation[] = [];

  const hasIndustryMemory = context.industryInsights.some((i) =>
    i.workbookLineCode.startsWith("WRK"),
  );
  const source = hasIndustryMemory ? "industry_memory" : "workbook_analysis";

  const localWorkforceLine = lines.find((l) => l.code === "WRK-01");
  const totalWorkforceLine = lines.find((l) => l.code === "WRK-02");

  const localWorkforce = localWorkforceLine ? getLineValue(localWorkforceLine) : null;
  const totalWorkforce = totalWorkforceLine ? getLineValue(totalWorkforceLine) : null;

  if (totalWorkforce && totalWorkforce > 0) {
    const saudizationPct = localWorkforce !== null ? (localWorkforce / totalWorkforce) * 100 : 0;

    if (saudizationPct < 50) {
      const gap = Math.round(50 - saudizationPct);
      const rationaleParts: string[] = [
        `نسبة التوطين ${Math.round(saudizationPct)}% أقل من 50%.`,
      ];
      if (hasIndustryMemory) {
        rationaleParts.push("الذاكرة القطاعية تؤكد جدوى زيادة التوطين.");
      }
      recs.push({
        category: "workforce_localization",
        title: "زيادة نسبة التوطين",
        description: `نسبة التوطين الحالية ${Math.round(saudizationPct)}%. استهداف 50% كحد أدنى.`,
        impactScore: Math.min(100, gap * 1.5),
        priority: gap > 30 ? "critical" : gap > 15 ? "high" : "medium",
        estimatedValue: currentScore !== null
          ? Math.round((gap / 100) * 0.2 * 100) / 100
          : null,
        effort: "high",
        evidenceRefs: [
          { type: "line", id: "WRK-01", label: "الموظفون السعوديون" },
          { type: "line", id: "WRK-02", label: "إجمالي الموظفين" },
        ],
        relatedLineCode: "WRK-01",
        suggestedAction: "وضع خطة توطين لزيادة نسبة الموظفين السعوديين",
        source,
        rationale: rationaleParts.join(" "),
        groundingConfidence: hasIndustryMemory ? 0.85 : 0.6,
      });
    }
  }

  return recs;
}

async function buildAssetRecommendations(
  lines: LcWorkbookLine[],
  currentScore: number | null,
  context: LocalContentContext,
): Promise<Recommendation[]> {
  const recs: Recommendation[] = [];

  const hasIndustryMemory = context.industryInsights.some((i) =>
    i.workbookLineCode.startsWith("AST"),
  );
  const source = hasIndustryMemory ? "industry_memory" : "workbook_analysis";

  const localAssetLine = lines.find((l) => l.code === "AST-01");
  const totalAssetLine = lines.find((l) => l.code === "AST-02");

  const localAsset = localAssetLine ? getLineValue(localAssetLine) : null;
  const totalAsset = totalAssetLine ? getLineValue(totalAssetLine) : null;

  if (totalAsset && totalAsset > 0) {
    const assetPct = localAsset !== null ? (localAsset / totalAsset) * 100 : 0;

    if (assetPct < 50) {
      const gap = Math.round(50 - assetPct);
      recs.push({
        category: "asset_localization",
        title: "زيادة الأصول الثابتة المحلية",
        description: `نسبة الأصول المحلية ${Math.round(assetPct)}%. زيادة الاستثمار في الأصول المحلية يحسن النتيجة.`,
        impactScore: Math.min(80, gap),
        priority: gap > 30 ? "high" : "medium",
        estimatedValue: currentScore !== null
          ? Math.round((gap / 100) * 0.1 * 100) / 100
          : null,
        effort: "high",
        evidenceRefs: [
          { type: "line", id: "AST-01", label: "الأصول المحلية" },
          { type: "line", id: "AST-02", label: "إجمالي الأصول" },
        ],
        relatedLineCode: "AST-01",
        suggestedAction: "تقييم فرص الاستثمار في الأصول الثابتة محلياً",
        source,
        rationale: hasIndustryMemory
          ? "الذاكرة القطاعية تشير إلى أن زيادة الأصول المحلية تحسن درجة المحتوى المحلي."
          : "زيادة الأصول المحلية تساهم في رفع نسبة المحتوى المحلي.",
        groundingConfidence: hasIndustryMemory ? 0.8 : 0.6,
      });
    }
  }

  return recs;
}

function buildMissingDataRecommendations(
  lines: LcWorkbookLine[],
  currentScore: number | null,
  pendingSuggestions: number,
  pendingFPs: number,
  context: LocalContentContext,
): Recommendation[] {
  const recs: Recommendation[] = [];

  const hasPatternHistory = context.patternHistory.length > 0;
  const hasFPHistory = context.falsePositiveHistory.length > 0;
  const source = hasPatternHistory ? "pattern_history" : "workbook_analysis";

  // Count missing lines
  const missingLines = lines.filter(
    (l) => !l.autoFilled && l.manualValue === null,
  );

  if (missingLines.length > 0) {
    // Identify which metrics are affected
    const metricCodes = ["REV", "SPN", "WRK", "AST"];
    const affectedMetrics = metricCodes.filter((prefix) =>
      missingLines.some((l) => l.code.startsWith(prefix)),
    );

    const metricWeight = affectedMetrics.reduce((sum, m) => {
      if (m === "REV" || m === "SPN") return sum + 0.35;
      if (m === "WRK") return sum + 0.2;
      if (m === "AST") return sum + 0.1;
      return sum;
    }, 0);

    const rationaleParts: string[] = [
      `${missingLines.length} بند ناقص يؤثر على ${affectedMetrics.length} مؤشر.`,
    ];
    if (hasPatternHistory) {
      const acceptedPatterns = context.patternHistory.filter((p) => p.status === "approved");
      if (acceptedPatterns.length > 0) {
        rationaleParts.push(`توجد ${acceptedPatterns.length} أنماط معتمدة يمكن أن تساعد في التعبئة.`);
      }
    }

    recs.push({
      category: "missing_data_resolution",
      title: `تعبئة البيانات الناقصة (${missingLines.length} بند)`,
      description: `هناك ${missingLines.length} بند(اً) ناقص(اً) في ${affectedMetrics.length} مؤشر(اً). تعبئتها سيمكن من احتساب النتيجة بدقة.`,
      impactScore: Math.min(100, missingLines.length * 10 + (currentScore === null ? 50 : 0)),
      priority: currentScore === null ? "critical" : missingLines.length > 5 ? "high" : "medium",
      estimatedValue: currentScore === null ? metricWeight : null,
      effort: "medium",
      evidenceRefs: missingLines.slice(0, 5).map((l) => ({
        type: "line" as const,
        id: l.code,
        label: l.name,
      })),
      suggestedAction: "مراجعة البنود الناقصة وإدخال القيم يدوياً أو استيراد ميزان أكثر اكتمالاً",
      source,
      rationale: rationaleParts.join(" "),
      groundingConfidence: hasPatternHistory ? 0.8 : 0.6,
    });
  }

  // Pending AI review items
  if (pendingSuggestions > 0) {
    recs.push({
      category: "missing_data_resolution",
      title: `مراجعة تحسينات الأنماط المقترحة (${pendingSuggestions})`,
      description: `هناك ${pendingSuggestions} اقتراح(اً) لتحسين أنماط المطابقة بانتظار المراجعة.`,
      impactScore: pendingSuggestions * 5,
      priority: "medium",
      estimatedValue: null,
      effort: "low",
      evidenceRefs: [],
      suggestedAction: "مراجعة اقتراحات تحسين الأنماط في لوحة AI Advisor",
      source: "pattern_history",
      rationale: "الأنماط المقترحة يمكن أن تحسن دقة المطابقة وتعبئة البيانات.",
      groundingConfidence: 0.75,
    });
  }

  if (pendingFPs > 0) {
    recs.push({
      category: "missing_data_resolution",
      title: `مراجعة النتائج الإيجابية الخاطئة (${pendingFPs})`,
      description: `هناك ${pendingFPs} نتيجة إيجابية خاطئة تحتاج مراجعة.`,
      impactScore: pendingFPs * 3,
      priority: "low",
      estimatedValue: null,
      effort: "low",
      evidenceRefs: [],
      suggestedAction: "مراجعة النتائج الإيجابية الخاطئة في لوحة AI Advisor",
      source: hasFPHistory ? "pattern_history" : "workbook_analysis",
      rationale: "تصحيح النتائج الإيجابية الخاطئة يحسن دقة التصنيف والنتيجة.",
      groundingConfidence: 0.7,
    });
  }

  return recs;
}

async function buildEvidenceRecommendations(
  lines: LcWorkbookLine[],
  project: ProjectWithData | null,
  context: LocalContentContext,
): Promise<Recommendation[]> {
  const recs: Recommendation[] = [];

  const hasKnowledge = context.knowledgeReferences.length > 0;
  const source = hasKnowledge ? "knowledge" : "workbook_analysis";

  // Find lines requiring evidence but missing
  const linesNeedingEvidence = lines.filter(
    (l) => l.evidenceRequired && l.autoFilled,
  );

  if (linesNeedingEvidence.length > 0 && (!project?.evidence || project.evidence.length === 0)) {
    recs.push({
      category: "evidence_improvement",
      title: `إرفاق مستندات الإثبات (${linesNeedingEvidence.length} بند)`,
      description: `هناك ${linesNeedingEvidence.length} بند(اً) يتطلب مستندات إثبات. رفع المستندات يحسن موثوقية النتيجة.`,
      impactScore: 30,
      priority: "medium",
      estimatedValue: null,
      effort: "medium",
      evidenceRefs: linesNeedingEvidence.slice(0, 5).map((l) => ({
        type: "line" as const,
        id: l.code,
        label: l.name,
      })),
      suggestedAction: "رفع مستندات الإثبات للبنود المطلوبة (فواتير، عقود، شهادات)",
      source,
      rationale: hasKnowledge
        ? "قاعدة المعرفة تحتوي على مراجع تدعم أهمية إرفاق مستندات الإثبات لتحسين الموثوقية."
        : "إرفاق مستندات الإثبات ضروري لتحسين موثوقية النتيجة.",
      groundingConfidence: hasKnowledge ? 0.85 : 0.6,
    });
  }

  return recs;
}

// ─── Listing stored recommendations ───

export async function listWorkbookRecommendations(
  organizationId: string,
  workbookId: string,
  status?: string,
): Promise<Array<{
  id: string;
  category: string;
  title: string;
  impactScore: number;
  priority: string;
  status: string;
}>> {
  const where: Record<string, unknown> = { organizationId, workbookId };
  if (status) where.status = status;

  const recs = await prisma.lcRecommendation.findMany({
    where,
    orderBy: [{ impactScore: "desc" }, { createdAt: "desc" }],
    take: 50,
  });

  return recs.map((r) => ({
    id: r.id,
    category: r.category,
    title: r.title,
    impactScore: r.impactScore,
    priority: r.priority,
    status: r.status,
  }));
}

/**
 * Review a recommendation (accept/reject).
 * P0: Always requires human review.
 */
export async function reviewRecommendation(
  recommendationId: string,
  decision: "accepted" | "rejected" | "implemented",
  reviewNotes: string,
  reviewerId: string,
): Promise<void> {
  const rec = await prisma.lcRecommendation.findUnique({
    where: { id: recommendationId },
  });
  if (!rec) throw new Error("Recommendation not found");

  await prisma.lcRecommendation.update({
    where: { id: recommendationId },
    data: {
      status: decision,
      reviewedById: reviewerId,
      reviewedAt: new Date(),
      reviewNotes: reviewNotes || null,
    },
  });

  await createAiAuditEvent({
    organizationId: rec.organizationId,
    workbookId: rec.workbookId,
    action: AuditActions.AI_RECOMMENDATION_REVIEWED,
    actorId: reviewerId,
    status: "success",
    inputSummary: { recommendationId, decision },
    metadata: { reviewNotes },
  }).catch(() => {});
}
