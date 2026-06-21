"use server";

import { prisma } from "@/lib/prisma";
import {
  isExpectedAccessDeniedError,
  requireUserContext,
  getCurrentUser,
} from "@/lib/auth";
import {
  getTemplate,
  getAllTemplates,
  type DecisionTemplate,
} from "@/lib/decision/decision-templates";
import { logAudit } from "@/lib/decision/decision-audit";

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
      console.error("Error fetching templates:", error);
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
      console.error("Error fetching template:", error);
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
    const user = await requireUserContext("OPERATOR");

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

    for (const desc of objectives) {
      if (desc.trim()) {
        await prisma.objective.create({
          data: { decisionId: decision.id, description: desc.trim() },
        });
      }
    }

    for (const desc of constraints) {
      if (desc.trim()) {
        await prisma.constraint.create({
          data: { decisionId: decision.id, description: desc.trim() },
        });
      }
    }

    for (const desc of assumptions) {
      if (desc.trim()) {
        await prisma.assumption.create({
          data: { decisionId: decision.id, description: desc.trim() },
        });
      }
    }

    for (const desc of alternatives) {
      if (desc.trim()) {
        await prisma.alternative.create({
          data: { decisionId: decision.id, description: desc.trim() },
        });
      }
    }

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
      console.error("Error creating decision from template:", error);
    }
    return { success: false, error: "Failed to create decision from template" };
  }
}
