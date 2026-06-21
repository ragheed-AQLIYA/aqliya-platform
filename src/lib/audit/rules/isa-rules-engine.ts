import "server-only";

import { prisma } from "@/lib/prisma";
import { isEnabled } from "@/lib/platform/feature-flags/registry";
import { recordAuditOsAuditEvent } from "@/lib/audit/audit-events";
import { evaluateIsaRule, type IsaEvaluationContext } from "./isa-rule-checks";
import { loadIsaKnowledgeRules } from "./isa-rules-loader";
import type { IsaRulesRunResult } from "./types";

function parseTeamMembers(team: unknown): Array<{ role?: string }> {
  if (!team) return [];
  if (Array.isArray(team)) return team as Array<{ role?: string }>;
  if (typeof team === "object" && team !== null) {
    const members = (team as { members?: unknown }).members;
    if (Array.isArray(members)) return members as Array<{ role?: string }>;
  }
  return [];
}

async function loadIsaEvaluationContext(
  engagementId: string,
): Promise<IsaEvaluationContext> {
  const [engagement, mappingCount, tb, materialityCount, findingCount] =
    await Promise.all([
      prisma.auditEngagement.findUnique({
        where: { id: engagementId },
        select: {
          status: true,
          organizationId: true,
          team: true,
          createdById: true,
        },
      }),
      prisma.auditAccountMapping.count({ where: { engagementId } }),
      prisma.auditTrialBalance.findFirst({
        where: { engagementId },
        orderBy: { createdAt: "desc" },
        include: { lines: true },
      }),
      prisma.planningMateriality.count({ where: { engagementId } }),
      prisma.auditFinding.count({ where: { engagementId } }),
    ]);

  const teamMembers = parseTeamMembers(engagement?.team);
  const hasEngagementPartner =
    teamMembers.some((member) =>
      String(member.role ?? "")
        .toLowerCase()
        .includes("partner"),
    ) || Boolean(engagement?.createdById);

  return {
    engagementId,
    engagementStatus: engagement?.status ?? "draft",
    organizationId: engagement?.organizationId,
    teamMemberCount: Math.max(teamMembers.length, engagement?.createdById ? 1 : 0),
    hasEngagementPartner,
    mappingCount,
    tbLineCount: tb?.lines.length ?? 0,
    materialityCount,
    findingCount,
  };
}

export async function runIsaRulesForEngagement(
  engagementId: string,
): Promise<IsaRulesRunResult> {
  const rules = loadIsaKnowledgeRules();
  const ctx = await loadIsaEvaluationContext(engagementId);
  const evaluations = rules.map((rule) => evaluateIsaRule(rule, ctx));

  const failedCount = evaluations.filter((item) => item.status === "fail").length;
  const warningCount = evaluations.filter((item) =>
    ["warning", "advisory"].includes(item.status),
  ).length;

  const result: IsaRulesRunResult = {
    engagementId,
    passed: failedCount === 0,
    ruleCount: evaluations.length,
    failedCount,
    warningCount,
    evaluations,
    runAt: new Date().toISOString(),
  };

  await recordAuditOsAuditEvent({
    engagementId,
    eventType: "isa.rules.evaluated",
    actorId: "system",
    actorName: "ISA Rules Engine",
    actorRole: "system",
    targetType: "engagement",
    targetId: engagementId,
    description: `ISA rules evaluated: ${evaluations.length} rules, ${failedCount} failed, ${warningCount} warnings`,
    metadata: {
      ruleCount: result.ruleCount,
      failedCount: result.failedCount,
      warningCount: result.warningCount,
      passed: result.passed,
    },
  }).catch(() => {});

  return result;
}

export function isIsaRulesEnabled(): boolean {
  return isEnabled("audit.isa-rules");
}

export async function maybeRunIsaRulesAfterFsRebuild(
  engagementId: string,
): Promise<void> {
  if (!isIsaRulesEnabled()) return;
  try {
    await runIsaRulesForEngagement(engagementId);
  } catch (err) {
    console.error(`[ISA Rules] post-FS hook failed for ${engagementId}`, err);
  }
}
