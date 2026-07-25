import { prisma } from "@/lib/prisma";
import { createLogger } from "@/lib/observability/logger";
import { isExpectedAccessDeniedError, getCurrentUser } from "@/lib/auth";
import { enforce } from "@/lib/kernel";
import { logAudit } from "@/lib/decision/decision-audit";

const logger = createLogger({ product: "platform", action: "unknown" });

export { prisma, isExpectedAccessDeniedError, getCurrentUser, enforce, logAudit };

export async function lookupDecisionOrg(id: string) {
  const decisionLookup = await prisma.decision.findUnique({
    where: { id },
    select: { organizationId: true },
  });
  return decisionLookup;
}

export type ActionOk<T> = { success: true; data: T };
export type ActionErr = { success: false; error: string };
export type ActionResult<T> = ActionOk<T> | ActionErr;

export function ok<T>(data: T): ActionOk<T> {
  return { success: true, data };
}

export function fail(error: string): ActionErr {
  return { success: false, error };
}

export function handleError(error: unknown, context: string): ActionErr {
  if (!isExpectedAccessDeniedError(error)) {
    logger.error(`Error ${context}:`, error instanceof Error ? error : undefined);
  }
  return fail(`Failed to ${context}`);
}
