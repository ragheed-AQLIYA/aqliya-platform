"use server";

import { createLogger } from "@/lib/observability/logger";

import { prisma } from "@/lib/prisma";
import {
  isExpectedAccessDeniedError,
  getCurrentUser,
  hasRequiredRole,
} from "@/lib/auth";
import { enforce } from "@/lib/kernel";
import {
  getTemplate,
  getAllTemplates,
  type DecisionTemplate,
} from "@/lib/decision/decision-templates";
import { logAudit } from "@/lib/decision/decision-audit";


const logger = createLogger({ product: "platform", action: "unknown" });

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

export async function getAvailableTemplates() {
  try {
    await getCurrentUser();
    const templates = getAllTemplates();
    return { success: true, data: templates };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      logger.error("Error fetching templates:", error instanceof Error ? error : undefined);
    }
    return { success: false, error: "Failed to fetch templates" };
  }
}

export async function getTemplateById(templateId: string) {
  try {
    await getCurrentUser();
    const template = getTemplate(templateId);
    if (!template) {
      return { success: false, error: "Template not found" };
    }
    return { success: true, data: template };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      logger.error("Error fetching template:", error instanceof Error ? error : undefined);
    }
    return { success: false, error: "Failed to fetch template" };
  }
}

export async function createDecisionFromTemplate(data: {
  templateId: string;
  title: string;
  description?: string;
  priority?: string;
  targetDate?: string;
  objectives?: string[];
  constraints?: string[];
  assumptions?: string[];
  alternatives?: string[];
}) {
  try {
    const user = await getCurrentUser();
    if (!hasRequiredRole(user, "OPERATOR")) {
      throw new Error("Access denied: OPERATOR role required");
    }
    await enforce(user, { type: "decision", id: user.organizationId, tenantId: user.organizationId }, "create");

    const template = getTemplate(data.templateId);
    if (!template) {
      return { success: false, error: "Template not found" };
    }

    if (!data.title || data.title.trim().length === 0) {
      return { success: false, error: "Decision title is required" };
    }

    if (!isValidDecisionType(template.type)) {
      return {
        success: false,
        error: `Invalid decision type: ${template.type}`,
      };
    }

    const targetDate = data.targetDate ? new Date(data.targetDate) : undefined;

    const decision = await prisma.decision.create({
      data: {
        title: data.title.trim(),
        type: template.type as ValidDecisionType,
        description: data.description?.trim() || null,
        priority: data.priority || template.priority,
        targetDate,
        ownerId: user.id,
        organizationId: user.organizationId,
        status: "DRAFT",
      },
    });

    const objectives = data.objectives || template.suggestedObjectives;
    const constraints = data.constraints || template.suggestedConstraints;
    const assumptions = data.assumptions || template.suggestedAssumptions;
    const alternatives = data.alternatives || template.suggestedAlternatives;

    const objectiveData = objectives.filter((d: string) => d.trim()).map((d: string) => ({ decisionId: decision.id, description: d.trim() }));
    const constraintData = constraints.filter((d: string) => d.trim()).map((d: string) => ({ decisionId: decision.id, description: d.trim() }));
    const assumptionData = assumptions.filter((d: string) => d.trim()).map((d: string) => ({ decisionId: decision.id, description: d.trim() }));
    const alternativeData = alternatives.filter((d: string) => d.trim()).map((d: string) => ({ decisionId: decision.id, description: d.trim() }));

    await Promise.all([
      objectiveData.length > 0 ? prisma.objective.createMany({ data: objectiveData }) : null,
      constraintData.length > 0 ? prisma.constraint.createMany({ data: constraintData }) : null,
      assumptionData.length > 0 ? prisma.assumption.createMany({ data: assumptionData }) : null,
      alternativeData.length > 0 ? prisma.alternative.createMany({ data: alternativeData }) : null,
    ]);

    await logAudit(
      user.id,
      decision.id,
      "DECISION_CREATED",
      "Decision",
      undefined,
      JSON.stringify({
        title: decision.title,
        type: decision.type,
        templateId: template.id,
      }),
      user.organizationId,
    );

    return {
      success: true,
      data: {
        decision,
        template: {
          id: template.id,
          label: template.label,
          frameworkGuidance: template.frameworkGuidance,
          scenarioSuggestions: template.scenarioSuggestions,
          commonRisks: template.commonRisks,
          recommendedNextStep: template.recommendedNextStep,
        },
      },
    };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      logger.error("Error creating decision from template:", error instanceof Error ? error : undefined);
    }
    return { success: false, error: "Failed to create decision from template" };
  }
}
