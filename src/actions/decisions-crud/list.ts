"use server";

import {
  prisma,
  getCurrentUser,
  isExpectedAccessDeniedError,
  createLogger,
  ok,
  fail
} from "./common";

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
    return { success: true as const, data: decisions, total };
  } catch (error) {
    if (!isExpectedAccessDeniedError(error)) {
      const logger = createLogger({ product: "decisions", action: "getDecisions" });
      logger.error("Error fetching decisions", error as Error);
      logger.error("Error fetching decisions:", error instanceof Error ? error : undefined);
    }

const logger = createLogger({ product: "platform", action: "unknown" });

    return fail("Failed to fetch decisions");
  }
}
