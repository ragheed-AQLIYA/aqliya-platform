"use server";

import { prisma } from "@/lib/prisma";
import type { DecisionStatus } from "@prisma/client";
import {
  evaluateIntake,
  evaluateFramework,
  evaluateScenarios,
  evaluateRisks,
} from "@/lib/decision";

import { isExpectedAccessDeniedError } from "@/lib/auth";
import {
  getCurrentUser,
} from "@/lib/auth";
import { enforce } from "@/lib/authorization";
import { logAudit, toAuditJson } from "@/lib/decision/decision-audit";
import { invalidateDashboardCaches } from "@/lib/platform/cache-strategy";

// --- Decision List ---
export async function getDecisions({ take = 20, skip = 0 }: { take?: number; skip?: number } = {}) {
  try {
    const user = await getCurrentUser();
    const [decisions, total] = await Promise.all([
      prisma.decision.findMany({
        where: { organizationId: user.organizationId },
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          priority: true,
          description: true,
          targetDate: true,
          createdAt: true,
          updatedAt: true,
          organizationId: true,
          ownerId: true,
          reviewerId: true,
          approverId: true,
          sectorId: true,
          owner: {
            select: {
              name: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      prisma.decision.count({
        where: { organizationId: user.organizationId },
      }),
    ]);
    return { success: true, data: decisions, total };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching decisions:", error);
    }
    return { success: false, error: "Failed to fetch decisions" };
  }
}

// --- Decision by ID ---
export async function getDecisionById(id: string) {
  try {
    const user = await getCurrentUser();
    const decision = await prisma.decision.findUnique({
      where: { id },
      include: {
        organization: true,
        owner: true,
        reviewer: true,
        approver: true,
        objectives: true,
        constraints: true,
        assumptions: true,
        alternatives: true,
        risks: true,
        tenderProfile: true,
        scenarios: {
          include: { simulation: true },
        },
        framework: true,
        decisionScenarios: true,
        riskAnalyses: true,
        recommendation: true,
        approvals: {
          include: { approver: true },
        },
        auditLogs: {
          include: { user: true },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!decision) {
      return { success: false, error: "Decision not found" };
    }

    await enforce(user, { type: "decision", id, tenantId: decision.organizationId }, "read");

    return { success: true, data: decision };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching decision:", error);
    }
    return { success: false, error: "Failed to fetch decision" };
  }
}

const VALID_DECISION_TYPES = [
  "TENDER",
  "INVESTMENT",
  "EXPANSION",
  "PROCUREMENT",
  "HIRING",
  "PARTNERSHIP",
  "PRICING",
  "STRATEGIC",
  "OPERATIONS",
  "CUSTOM",
] as const;
type ValidDecisionType = (typeof VALID_DECISION_TYPES)[number];

function isValidDecisionType(type: string): type is ValidDecisionType {
  return (VALID_DECISION_TYPES as readonly string[]).includes(type);
}

// --- Create Decision ---
export async function createDecision(data: {
  title: string;
  type?: string;
  description?: string;
  priority?: string;
  targetDate?: string;
  objectives?: string;
  constraints?: string;
  assumptions?: string;
  alternatives?: string;
  risks?: string;
}) {
  try {
    const user = await getCurrentUser();
    await enforce(user, { type: "decision", id: "new", tenantId: user.organizationId }, "create");

    if (!data.title || data.title.trim().length === 0) {
      return { success: false, error: "Decision title is required" };
    }

    const decisionType = data.type || "TENDER";
    if (!isValidDecisionType(decisionType)) {
      return { success: false, error: `Invalid decision type: ${data.type}` };
    }

    const targetDate = data.targetDate ? new Date(data.targetDate) : undefined;

    const decision = await prisma.decision.create({
      data: {
        title: data.title.trim(),
        type: decisionType,
        description: data.description?.trim() || null,
        priority: data.priority || "MEDIUM",
        targetDate,
        ownerId: user.id,
        organizationId: user.organizationId,
        status: "DRAFT",
      },
    });

    await logAudit(
      user.id,
      decision.id,
      "DECISION_CREATED",
      "Decision",
      undefined,
      JSON.stringify({ title: decision.title, type: decision.type }),
      user.organizationId,
    );

    await invalidateDashboardCaches(user.organizationId);

    return { success: true, data: decision };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error creating decision:", error);
    }
    return { success: false, error: "Failed to create decision" };
  }
}

// --- Update Decision Status ---
export async function updateDecisionStatus(id: string, status: string) {
  try {
    const user = await getCurrentUser();
    const decisionLookup = await prisma.decision.findUnique({
      where: { id },
      select: { organizationId: true },
    });
    if (!decisionLookup) {
      return { success: false, error: "Decision not found" };
    }
    await enforce(user, { type: "decision", id, tenantId: decisionLookup.organizationId }, "update");

    // Evidence review gate: require all evidence reviewed before approval
    if (status === "APPROVED" || status === "IMPLEMENTED") {
      const allEvidence = await prisma.decisionEvidence.findMany({
        where: { decisionId: id },
        select: { metadata: true },
      });
      if (allEvidence.length > 0) {
        const unreviewed = allEvidence.filter((e) => {
          const meta = e.metadata as Record<string, unknown> | null;
          return !meta?.reviewedAt;
        });
        if (unreviewed.length > 0) {
          return {
            success: false,
            error: `لا يمكن ${status === "APPROVED" ? "الموافقة" : "التنفيذ"} على القرار قبل مراجعة جميع مستندات الدعم. العدد غير المراجع: ${unreviewed.length}`,
          };
        }
      }
    }

    const decision = await prisma.decision.update({
      where: { id },
      data: { status: status as DecisionStatus },
    });
    await invalidateDashboardCaches(user.organizationId);
    return { success: true, data: decision };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error updating decision status:", error);
    }
    return { success: false, error: "Failed to update decision status" };
  }
}

// --- Decision Framework ---
export async function getDecisionFramework(id: string) {
  try {
    const user = await getCurrentUser();
    const decision = await prisma.decision.findUnique({
      where: { id },
      select: {
        title: true,
        type: true,
        objectives: true,
        alternatives: true,
        risks: true,
        framework: true,
        organizationId: true,
      },
    });
    if (!decision) return { success: false, error: "Decision not found" };
    await enforce(user, { type: "decision", id, tenantId: decision.organizationId }, "read");
    const intake = evaluateIntake({
      title: decision.title,
      objectives: decision.objectives,
      alternatives: decision.alternatives,
      risks: decision.risks,
    });
    const frameworkState = evaluateFramework(decision.framework);
    return {
      success: true,
      data: {
        type: decision.type,
        framework: decision.framework,
        intake,
        frameworkState,
      },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching framework:", error);
    }
    return { success: false, error: "Failed to fetch framework" };
  }
}

export async function updateDecisionFramework(
  id: string,
  form: {
    context: string;
    purpose: string;
    options: string;
    criteria: string;
    values: string;
    informationGaps: string;
    certainty: string;
    assumptions: string;
  },
) {
  try {
    const user = await getCurrentUser();
    const decisionLookup = await prisma.decision.findUnique({
      where: { id },
      select: { organizationId: true },
    });
    if (!decisionLookup) {
      return { success: false, error: "Decision not found" };
    }
    await enforce(user, { type: "decision", id, tenantId: decisionLookup.organizationId }, "update");
    await prisma.decision.update({
      where: { id },
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      data: { framework: form as any },
    });
    await invalidateDashboardCaches(decisionLookup.organizationId);
    const frameworkState = evaluateFramework(form);
    return { success: true, data: { framework: form, frameworkState } };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error updating framework:", error);
    }
    return { success: false, error: "Failed to update framework" };
  }
}

// --- Decision Intake ---
export async function getDecisionIntake(id: string) {
  try {
    const user = await getCurrentUser();
    const decision = await prisma.decision.findUnique({
      where: { id },
      select: {
        title: true,
        type: true,
        objectives: true,
        constraints: true,
        assumptions: true,
        alternatives: true,
        risks: true,
        organizationId: true,
      },
    });
    if (!decision) return { success: false, error: "Decision not found" };
    await enforce(user, { type: "decision", id, tenantId: decision.organizationId }, "read");
    const intake = evaluateIntake({
      title: decision.title,
      objectives: decision.objectives,
      alternatives: decision.alternatives,
      risks: decision.risks,
    });
    return { success: true, data: { ...decision, intake } };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching intake:", error);
    }
    return { success: false, error: "Failed to fetch intake" };
  }
}

export async function updateDecisionIntake(
  id: string,
  data: {
    objectives?: string;
    constraints?: string;
    assumptions?: string;
    alternatives?: string;
    risks?: string;
  },
) {
  try {
    const user = await getCurrentUser();
    const decisionLookup = await prisma.decision.findUnique({
      where: { id },
      select: { organizationId: true },
    });
    if (!decisionLookup) {
      return { success: false, error: "Decision not found" };
    }
    await enforce(user, { type: "decision", id, tenantId: decisionLookup.organizationId }, "update");
    await prisma.decision.update({
      where: { id },
      data: {
        objectives: data.objectives
          ? { set: { description: data.objectives } }
          : undefined,
        constraints: data.constraints
          ? { set: { description: data.constraints } }
          : undefined,
        assumptions: data.assumptions
          ? { set: { description: data.assumptions } }
          : undefined,
        alternatives: data.alternatives
          ? { set: { description: data.alternatives } }
          : undefined,
        risks: data.risks ? { set: { description: data.risks } } : undefined,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any,
    });
    const result = await prisma.decision.findUnique({
      where: { id },
      select: {
        title: true,
        objectives: true,
        alternatives: true,
        risks: true,
      },
    });
    const intake = result
      ? evaluateIntake({
          title: result.title,
          objectives: result.objectives,
          alternatives: result.alternatives,
          risks: result.risks,
        })
      : {
          status: "reframe_required" as const,
          readyForFramework: false,
          reasonCodes: [],
          reasons: [],
          requiredNextSteps: [],
        };
    await invalidateDashboardCaches(decisionLookup.organizationId);
    await invalidateDashboardCaches(decisionLookup.organizationId);
    return { success: true, data: { ...result, intake } };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error updating intake:", error);
    }
    return { success: false, error: "Failed to update intake" };
  }
}

// --- Decision Scenarios ---
export async function getDecisionScenarios(id: string) {
  try {
    const user = await getCurrentUser();
    const decision = await prisma.decision.findUnique({
      where: { id },
      select: {
        title: true,
        type: true,
        objectives: true,
        alternatives: true,
        risks: true,
        framework: true,
        decisionScenarios: true,
        scenarios: { include: { simulation: true } },
        organizationId: true,
      },
    });
    if (!decision) return { success: false, error: "Decision not found" };
    await enforce(user, { type: "decision", id, tenantId: decision.organizationId }, "read");

    const intake = evaluateIntake({
      title: decision.title,
      objectives: decision.objectives,
      alternatives: decision.alternatives,
      risks: decision.risks,
    });
    const frameworkState = evaluateFramework(decision.framework);
    const scenarioDrafts = decision.decisionScenarios.map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      assumptions: s.assumptions,
      expectedOutcome: s.expectedOutcome,
      affectedStakeholders: s.affectedStakeholders,
      requiredConditions: s.requiredConditions,
    }));
    const scenarioState = evaluateScenarios(decision.decisionScenarios);

    return {
      success: true,
      data: {
        type: decision.type,
        intake,
        frameworkState,
        scenarioState,
        scenarioDrafts,
      },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching scenarios:", error);
    }
    return { success: false, error: "Failed to fetch scenarios" };
  }
}

export async function updateDecisionScenarios(
  id: string,
  _input: {
    scenarios: {
      id?: string;
      name: string;
      description: string;
      assumptions: string;
      expectedOutcome: string;
      affectedStakeholders: string;
      requiredConditions: string;
    }[];
  },
) {
  try {
    const user = await getCurrentUser();
    const decision = await prisma.decision.findUnique({
      where: { id },
      select: { decisionScenarios: { select: { id: true } }, organizationId: true },
    });
    if (!decision) return { success: false, error: "Decision not found" };
    await enforce(user, { type: "decision", id, tenantId: decision.organizationId }, "update");
    const existingIds = new Set(
      decision.decisionScenarios.map((s) => s.id) || [],
    );
    const operations = _input.scenarios.map((scenario) => {
      const baseData = {
        name: scenario.name,
        description: scenario.description,
        assumptions: scenario.assumptions,
        expectedOutcome: scenario.expectedOutcome,
        affectedStakeholders: scenario.affectedStakeholders,
        requiredConditions: scenario.requiredConditions,
      };
      if (scenario.id && existingIds.has(scenario.id)) {
        return prisma.decisionScenario.update({
          where: { id: scenario.id },
          data: baseData,
        });
      }
      return prisma.decisionScenario.create({
        data: { decisionId: id, ...baseData },
      });
    });
    await prisma.$transaction(operations);
    await invalidateDashboardCaches(decision.organizationId);
    const updatedScenarios = await prisma.decisionScenario.findMany({
      where: { decisionId: id },
    });
    const scenarioState = evaluateScenarios(updatedScenarios);
    return {
      success: true,
      data: { decisionScenarios: updatedScenarios, scenarioState },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error updating scenarios:", error);
    }
    return { success: false, error: "Failed to update scenarios" };
  }
}

// --- Decision Risk Analysis ---
export async function getDecisionRiskAnalysis(id: string) {
  try {
    const user = await getCurrentUser();
    const decision = await prisma.decision.findUnique({
      where: { id },
      select: {
        title: true,
        type: true,
        objectives: true,
        alternatives: true,
        risks: true,
        framework: true,
        decisionScenarios: { select: { id: true, name: true } },
        riskAnalyses: true,
        scenarios: { include: { simulation: true } },
        organizationId: true,
      },
    });
    if (!decision) return { success: false, error: "Decision not found" };
    await enforce(user, { type: "decision", id, tenantId: decision.organizationId }, "read");

    const intake = evaluateIntake({
      title: decision.title,
      objectives: decision.objectives,
      alternatives: decision.alternatives,
      risks: decision.risks,
    });
    const frameworkState = evaluateFramework(decision.framework);
    const scenarioState = evaluateScenarios(decision.decisionScenarios);
    const riskAnalysisState = evaluateRisks(
      decision.decisionScenarios,
      decision.riskAnalyses,
    );
    const analysisDrafts = decision.riskAnalyses.map((r) => ({
      id: r.id,
      scenarioId: r.scenarioId,
      risks: r.risks,
      tradeoffs: r.tradeoffs,
      sacrifices: r.sacrifices,
      opportunityCosts: r.opportunityCosts,
      stakeholderRisks: r.stakeholderRisks,
      operationalRisks: r.operationalRisks,
      strategicRisks: r.strategicRisks,
      knowledgeRisks: r.knowledgeRisks,
      uncertaintyLevel: r.uncertaintyLevel,
    }));

    return {
      success: true,
      data: {
        type: decision.type,
        intake,
        frameworkState,
        scenarioState,
        riskAnalysisState,
        decisionScenarios: decision.decisionScenarios as {
          id: string;
          name: string;
        }[],
        analysisDrafts,
      },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error fetching risks:", error);
    }
    return { success: false, error: "Failed to fetch risks" };
  }
}

export async function updateDecisionRiskAnalysis(
  id: string,
  _input: {
    analyses: {
      scenarioId: string;
      risks: string;
      tradeoffs: string;
      sacrifices: string;
      opportunityCosts: string;
      stakeholderRisks: string;
      operationalRisks: string;
      strategicRisks: string;
      knowledgeRisks: string;
      uncertaintyLevel: string;
    }[];
  },
) {
  try {
    const user = await getCurrentUser();
    const decisionLookup = await prisma.decision.findUnique({
      where: { id },
      select: { organizationId: true },
    });
    if (!decisionLookup) return { success: false, error: "Decision not found" };
    await enforce(user, { type: "decision", id, tenantId: decisionLookup.organizationId }, "update");
    // Batch-read existing analyses to avoid N+1
    const scenarioIds = _input.analyses.map((a) => a.scenarioId);
    const existingAnalyses = await prisma.decisionRiskAnalysis.findMany({
      where: { decisionId: id, scenarioId: { in: scenarioIds } },
      select: { id: true, scenarioId: true },
    });
    const existingMap = new Map(existingAnalyses.map((a) => [a.scenarioId, a.id]));

    const operations = _input.analyses.map((analysis) => {
      const analysisData = {
        risks: analysis.risks,
        tradeoffs: analysis.tradeoffs,
        sacrifices: analysis.sacrifices,
        opportunityCosts: analysis.opportunityCosts,
        stakeholderRisks: analysis.stakeholderRisks,
        operationalRisks: analysis.operationalRisks,
        strategicRisks: analysis.strategicRisks,
        knowledgeRisks: analysis.knowledgeRisks,
        uncertaintyLevel: analysis.uncertaintyLevel,
      };
      const existingId = existingMap.get(analysis.scenarioId);
      if (existingId) {
        return prisma.decisionRiskAnalysis.update({
          where: { id: existingId },
          data: analysisData,
        });
      }
      return prisma.decisionRiskAnalysis.create({
        data: { decisionId: id, scenarioId: analysis.scenarioId, ...analysisData },
      });
    });
    await prisma.$transaction(operations);
    await invalidateDashboardCaches(decisionLookup.organizationId);
    const updatedAnalyses = await prisma.decisionRiskAnalysis.findMany({
      where: { decisionId: id },
      include: { scenario: true },
    });
    const scenarios = await prisma.decisionScenario.findMany({
      where: { decisionId: id },
    });
    const riskAnalysisState = evaluateRisks(scenarios, updatedAnalyses);
    return {
      success: true,
      data: { riskAnalyses: updatedAnalyses, riskAnalysisState },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      console.error("Error updating risks:", error);
    }
    return { success: false, error: "Failed to update risks" };
  }
}
