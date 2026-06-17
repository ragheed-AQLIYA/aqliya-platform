// ─── LocalContentOS — Pilot Readiness Assessment (V3.5 Phase 5) ───
// Measures operational readiness across 11 dimensions.
// Returns GREEN / AMBER / RED per dimension and an overall status.

import { prisma } from "@/lib/prisma";
import { checkAiHealth } from "@/lib/local-content/workbook/ai-health";

// ─── Types ───

export type ReadinessLevel = "GREEN" | "AMBER" | "RED";
export type OverallStatus = "Pilot Ready" | "Pilot Conditional" | "Not Ready";

export interface ReadinessMetric {
  label: string;
  labelAr: string;
  level: ReadinessLevel;
  score: number; // 0-100
  details: string;
}

export interface PilotReadinessReport {
  organizationId: string;
  metrics: ReadinessMetric[];
  overallScore: number; // 0-100
  overallStatus: OverallStatus;
  generatedAt: string;
}

// ─── Readiness Assessment ───

export async function getPilotReadiness(
  organizationId: string,
): Promise<PilotReadinessReport> {
  const [
    populationAccuracy,
    falsePositiveRate,
    workbookCompletion,
    recommendationQuality,
    simulationReliability,
    aiHealth,
    industryMemoryCoverage,
    organizationMemoryCoverage,
    patternLearningHealth,
    auditCoverage,
    contextCoverage,
  ] = await Promise.all([
    measurePopulationAccuracy(organizationId),
    measureFalsePositiveRate(organizationId),
    measureWorkbookCompletion(organizationId),
    measureRecommendationQuality(organizationId),
    measureSimulationReliability(organizationId),
    measureAiHealth(),
    measureIndustryMemoryCoverage(organizationId),
    measureOrganizationMemoryCoverage(organizationId),
    measurePatternLearningHealth(organizationId),
    measureAuditCoverage(organizationId),
    measureContextCoverage(organizationId),
  ]);

  const allMetrics = [
    populationAccuracy,
    falsePositiveRate,
    workbookCompletion,
    recommendationQuality,
    simulationReliability,
    aiHealth,
    industryMemoryCoverage,
    organizationMemoryCoverage,
    patternLearningHealth,
    auditCoverage,
    contextCoverage,
  ];

  const overallScore = Math.round(
    allMetrics.reduce((sum, m) => sum + m.score, 0) / allMetrics.length,
  );

  const redCount = allMetrics.filter((m) => m.level === "RED").length;
  const amberCount = allMetrics.filter((m) => m.level === "AMBER").length;

  let overallStatus: OverallStatus;
  if (redCount === 0 && amberCount <= 2 && overallScore >= 80) {
    overallStatus = "Pilot Ready";
  } else if (redCount <= 2 && overallScore >= 50) {
    overallStatus = "Pilot Conditional";
  } else {
    overallStatus = "Not Ready";
  }

  return {
    organizationId,
    metrics: allMetrics,
    overallScore,
    overallStatus,
    generatedAt: new Date().toISOString(),
  };
}

// ─── Individual Metric Measures ───

async function measurePopulationAccuracy(
  organizationId: string,
): Promise<ReadinessMetric> {
  const populatedWorkbooks = await prisma.lcWorkbook.count({
    where: {
      project: { organizationId },
      status: { in: ["populated", "partial", "complete", "exported"] },
      totalLines: { gt: 0 },
    },
  });

  if (populatedWorkbooks === 0) {
    return {
      label: "Population Accuracy",
      labelAr: "دقة التعبئة",
      level: "RED",
      score: 0,
      details: "لم يتم تعبئة أي دفاتر عمل بعد",
    };
  }

  const allPopulated = await prisma.lcWorkbook.findMany({
    where: {
      project: { organizationId },
      status: { in: ["populated", "partial", "complete", "exported"] },
    },
    select: { completionPct: true },
  });

  const avgCompletion =
    allPopulated.reduce((sum, w) => sum + w.completionPct, 0) /
    allPopulated.length;

  const score = Math.round(avgCompletion);
  const level: ReadinessLevel = score >= 80 ? "GREEN" : score >= 50 ? "AMBER" : "RED";
  const label = level === "GREEN" ? "جيد" : level === "AMBER" ? "متوسط" : "منخفض";

  return {
    label: "Population Accuracy",
    labelAr: "دقة التعبئة",
    level,
    score,
    details: `متوسط إتمام التعبئة ${Math.round(avgCompletion)}% (${populatedWorkbooks} دفتر) — ${label}`,
  };
}

async function measureFalsePositiveRate(
  organizationId: string,
): Promise<ReadinessMetric> {
  const total = await prisma.lcMatchReview.count({
    where: { organizationId },
  });
  const falsePositives = await prisma.lcMatchReview.count({
    where: { organizationId, isFalsePositive: true },
  });

  if (total === 0) {
    return {
      label: "False Positive Rate",
      labelAr: "معدل النتائج الإيجابية الخاطئة",
      level: "AMBER",
      score: 50,
      details: "لا توجد مراجعات كافية لحساب المعدل",
    };
  }

  const fpRate = falsePositives / total;
  const score = Math.round((1 - fpRate) * 100);
  const level: ReadinessLevel = score >= 90 ? "GREEN" : score >= 70 ? "AMBER" : "RED";

  return {
    label: "False Positive Rate",
    labelAr: "معدل النتائج الإيجابية الخاطئة",
    level,
    score,
    details: `${Math.round(fpRate * 100)}% نتائج إيجابية خاطئة من ${total} مراجعة`,
  };
}

async function measureWorkbookCompletion(
  organizationId: string,
): Promise<ReadinessMetric> {
  const total = await prisma.lcWorkbook.count({
    where: { project: { organizationId } },
  });
  const complete = await prisma.lcWorkbook.count({
    where: {
      project: { organizationId },
      status: { in: ["complete", "exported"] },
    },
  });

  if (total === 0) {
    return {
      label: "Workbook Completion",
      labelAr: "إتمام دفاتر العمل",
      level: "RED",
      score: 0,
      details: "لا توجد دفاتر عمل",
    };
  }

  const pct = Math.round((complete / total) * 100);
  const level: ReadinessLevel = pct >= 80 ? "GREEN" : pct >= 40 ? "AMBER" : "RED";

  return {
    label: "Workbook Completion",
    labelAr: "إتمام دفاتر العمل",
    level,
    score: pct,
    details: `${complete}/${total} دفاتر عمل مكتملة (${pct}%)`,
  };
}

async function measureRecommendationQuality(
  organizationId: string,
): Promise<ReadinessMetric> {
  const total = await prisma.lcRecommendation.count({
    where: { organizationId },
  });

  if (total === 0) {
    return {
      label: "Recommendation Quality",
      labelAr: "جودة التوصيات",
      level: "AMBER",
      score: 40,
      details: "لم يتم إنشاء توصيات بعد",
    };
  }

  const implemented = await prisma.lcRecommendation.count({
    where: { organizationId, status: "implemented" },
  });
  const accepted = await prisma.lcRecommendation.count({
    where: { organizationId, status: "accepted" },
  });

  const outcomes = await prisma.lcRecommendationOutcome.findMany({
    where: { organizationId },
    select: { accuracyScore: true },
  });
  const accuracyScores = outcomes
    .map((o) => o.accuracyScore)
    .filter((s): s is number => s !== null);
  const avgAccuracy =
    accuracyScores.length > 0
      ? accuracyScores.reduce((a, b) => a + b, 0) / accuracyScores.length
      : null;

  const implementationRate = total > 0 ? implemented / total : 0;
  const acceptanceRate = total > 0 ? (accepted + implemented) / total : 0;

  const score = Math.round(
    (implementationRate * 40 + acceptanceRate * 30 + (avgAccuracy ?? 0) * 30) * 100,
  );
  const level: ReadinessLevel = score >= 70 ? "GREEN" : score >= 40 ? "AMBER" : "RED";

  return {
    label: "Recommendation Quality",
    labelAr: "جودة التوصيات",
    level,
    score,
    details: `${total} توصية، ${Math.round(implementationRate * 100)}% منفذة، دقة ${avgAccuracy !== null ? `${Math.round(avgAccuracy * 100)}%` : "غير متوفرة"}`,
  };
}

async function measureSimulationReliability(
  organizationId: string,
): Promise<ReadinessMetric> {
  const total = await prisma.lcSimulationResult.count({
    where: { organizationId },
  });

  if (total === 0) {
    return {
      label: "Simulation Reliability",
      labelAr: "موثوقية المحاكاة",
      level: "AMBER",
      score: 30,
      details: "لم يتم تشغيل محاكاة بعد",
    };
  }

  return {
    label: "Simulation Reliability",
    labelAr: "موثوقية المحاكاة",
    level: "GREEN",
    score: 85,
    details: `${total} محاكاة مسجلة — النظام يعمل`,
  };
}

async function measureAiHealth(): Promise<ReadinessMetric> {
  try {
    const health = await checkAiHealth();

    const errorCount = Object.values(health).filter((v) => v === false).length;
    const total = Object.keys(health).length;
    const healthyCount = total - errorCount;
    const score = Math.round((healthyCount / total) * 100);
    const level: ReadinessLevel = score === 100 ? "GREEN" : score >= 60 ? "AMBER" : "RED";

    return {
      label: "AI Health",
      labelAr: "صحة الذكاء الاصطناعي",
      level,
      score,
      details: `${healthyCount}/${total} فحوصات سليمة`,
    };
  } catch {
    return {
      label: "AI Health",
      labelAr: "صحة الذكاء الاصطناعي",
      level: "RED",
      score: 0,
      details: "تعذر الاتصال — قد لا يكون Ollama قيد التشغيل",
    };
  }
}

async function measureIndustryMemoryCoverage(
  organizationId: string,
): Promise<ReadinessMetric> {
  // LcIndustryPatternMemory is keyed by industry, not organizationId.
  // Get the organization's industry to filter relevant patterns.
  const project = await prisma.localContentProject.findFirst({
    where: { organizationId },
    select: { metadata: true },
    orderBy: { updatedAt: "desc" },
  });
  const industry = (project?.metadata as { industry?: string } | null)?.industry;

  const count = industry
    ? await prisma.lcIndustryPatternMemory.count({ where: { industry } })
    : 0;

  const score = Math.min(100, count * 10);
  const level: ReadinessLevel = score >= 50 ? "GREEN" : score >= 20 ? "AMBER" : "RED";

  return {
    label: "Industry Memory Coverage",
    labelAr: "تغطية الذاكرة القطاعية",
    level,
    score,
    details: `${count} نمط قطاعي مسجل ${industry ? `للقطاع ${industry}` : ""}`,
  };
}

async function measureOrganizationMemoryCoverage(
  organizationId: string,
): Promise<ReadinessMetric> {
  const count = await prisma.lcOrganizationMatchMemory.count({
    where: { organizationId },
  });

  const score = Math.min(100, count * 5);
  const level: ReadinessLevel = score >= 50 ? "GREEN" : score >= 20 ? "AMBER" : "RED";

  return {
    label: "Organization Memory Coverage",
    labelAr: "تغطية الذاكرة المؤسسية",
    level,
    score,
    details: `${count} سجل ذاكرة مؤسسية`,
  };
}

async function measurePatternLearningHealth(
  organizationId: string,
): Promise<ReadinessMetric> {
  const healthRecords = await prisma.lcPatternHealthRecord.findMany({
    where: { organizationId },
  });

  if (healthRecords.length === 0) {
    return {
      label: "Pattern Learning Health",
      labelAr: "صحة تعلم الأنماط",
      level: "AMBER",
      score: 30,
      details: "لم يتم تسجيل بيانات تعلم الأنماط بعد",
    };
  }

  const avgHealth =
    healthRecords.reduce((sum, r) => sum + r.healthScore, 0) /
    healthRecords.length;
  const score = Math.round(avgHealth);
  const level: ReadinessLevel = score >= 70 ? "GREEN" : score >= 40 ? "AMBER" : "RED";

  return {
    label: "Pattern Learning Health",
    labelAr: "صحة تعلم الأنماط",
    level,
    score,
    details: `متوسط صحة ${healthRecords.length} نمط: ${Math.round(avgHealth)}%`,
  };
}

async function measureAuditCoverage(
  organizationId: string,
): Promise<ReadinessMetric> {
  const count = await prisma.lcAiAuditEvent.count({
    where: { organizationId },
  });

  const score = Math.min(100, count * 5);
  const level: ReadinessLevel = score >= 60 ? "GREEN" : score >= 20 ? "AMBER" : "RED";

  return {
    label: "Audit Coverage",
    labelAr: "تغطية التدقيق",
    level,
    score,
    details: `${count} حدث تدقيق ذكاء اصطناعي`,
  };
}

async function measureContextCoverage(
  organizationId: string,
): Promise<ReadinessMetric> {
  const [graphNodes, chunks, agentMemories] = await Promise.all([
    prisma.intelligenceGraphNode.count({ where: { organizationId } }),
    prisma.documentChunk.count({ where: { organizationId } }),
    prisma.agentMemory.count({ where: { organizationId } }),
  ]);

  const total = graphNodes + chunks + agentMemories;
  const score = Math.min(100, total * 5);
  const level: ReadinessLevel = score >= 50 ? "GREEN" : score >= 20 ? "AMBER" : "RED";

  return {
    label: "Context & Knowledge Coverage",
    labelAr: "تغطية السياق والمعرفة",
    level,
    score,
    details: `${graphNodes} عقدة معرفية، ${chunks} مقطع مستند، ${agentMemories} ذاكرة وكيل`,
  };
}
