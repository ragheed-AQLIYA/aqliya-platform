"use server"

import { evaluateIfrsRuleWithRag } from "@/lib/audit/rules/ifrs-rule-checks/evaluator"
import type { IfrsKnowledgeRule, IfrsRuleEvaluation } from "@/lib/audit/rules/types"
import type { IfrsEvaluationContext } from "@/lib/audit/rules/ifrs-rule-checks/types"

export interface RunIfrsRulesInput {
  engagementId: string
  organizationId: string
  rules: IfrsKnowledgeRule[]
  ctx: Omit<IfrsEvaluationContext, "organizationId" | "ragEnabled">
}

export interface RunIfrsRulesOutput {
  evaluations: IfrsRuleEvaluation[]
  ruleCount: number
  failedCount: number
  warningCount: number
  citationCount: number
  runAt: string
}

export async function runIfrsRulesWithRag(input: RunIfrsRulesInput): Promise<RunIfrsRulesOutput> {
  const ctx: IfrsEvaluationContext = {
    ...input.ctx,
    organizationId: input.organizationId,
    ragEnabled: true,
  }

  const evaluations: IfrsRuleEvaluation[] = []

  // Process rules in parallel batches of 5
  for (let i = 0; i < input.rules.length; i += 5) {
    const batch = input.rules.slice(i, i + 5)
    const results = await Promise.all(
      batch.map((rule) => evaluateIfrsRuleWithRag(rule, ctx))
    )
    evaluations.push(...results)
  }

  const failedCount = evaluations.filter((e) => e.status === "fail").length
  const warningCount = evaluations.filter((e) => e.status === "warning").length
  const citationCount = evaluations.filter((e) => e.ragCitations && e.ragCitations.length > 0).length

  return {
    evaluations,
    ruleCount: evaluations.length,
    failedCount,
    warningCount,
    citationCount,
    runAt: new Date().toISOString(),
  }
}
